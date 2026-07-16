import { useEffect, useState } from "react";
import { Card, Button, Tag, message, Input, Row, Col, Typography, Spin, Empty } from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { conversationService } from "../services/socialApi";

const { TextArea } = Input;
const { Title, Text } = Typography;

const PLATFORM_COLORS = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  whatsapp: "#25D366",
  tiktok: "#000000",
  google_ads: "#4285F4",
  amazon: "#FF9900",
  ebay: "#E53238",
  shopify: "#7AB55C",
  etsy: "#F56400",
  walmart: "#0071CE",
};

const UnifiedInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const conversationId = searchParams.get("conversation");

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await conversationService.getAll({ limit: 100 });
      setConversations(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      message.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await conversationService.getMessages(id, { limit: 100 });
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeConversation) return;

    try {
      setSending(true);
      await conversationService.sendReply(activeConversation, { text: replyText.trim() });
      setReplyText("");
      message.success("Reply sent");
      await fetchMessages(activeConversation);
      await fetchConversations();
    } catch (err) {
      message.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const getActiveConversationData = () => {
    return conversations.find((c) => c._id === activeConversation);
  };

  const activeConv = getActiveConversationData();

  return (
    <div style={{ padding: "20px", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <Card
        title="Unified Inbox"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        }
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
        bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
      >
        <Row style={{ flex: 1, overflow: "hidden" }}>
          {/* Conversation List */}
          <Col xs={24} md={8} style={{ borderRight: "1px solid #303030", overflow: "auto", height: "100%" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
            ) : conversations.length === 0 ? (
              <Empty description="No conversations" style={{ padding: 40 }} />
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => {
                    setActiveConversation(conv._id);
                    fetchMessages(conv._id);
                    navigate(`/unified-inbox?conversation=${conv._id}`, { replace: true });
                  }}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderBottom: "1px solid #303030",
                    background: activeConversation === conv._id ? "#1a1a2e" : "transparent",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a3e"}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = activeConversation === conv._id ? "#1a1a2e" : "transparent";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Tag color={PLATFORM_COLORS[conv.platform] || "default"} style={{ textTransform: "capitalize" }}>
                      {conv.platform}
                    </Tag>
                    {conv.unreadCount > 0 && <Tag color="red">{conv.unreadCount}</Tag>}
                  </div>
                  <div style={{ fontWeight: 500, marginTop: 4, color: "#fff" }}>
                    {conv.customerName || "Unknown"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.lastMessage || "No messages yet"}
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>
                    {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : "—"}
                  </div>
                </div>
              ))
            )}
          </Col>

          {/* Message Area */}
          <Col xs={24} md={16} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {activeConversation && activeConv ? (
              <>
                {/* Header */}
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #303030" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Tag color={PLATFORM_COLORS[activeConv.platform] || "default"}>
                      {activeConv.platform}
                    </Tag>
                    <Title level={5} style={{ margin: 0, color: "#fff" }}>
                      {activeConv.customerName || "Unknown"}
                    </Title>
                  </div>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>
                    {activeConv.customerId?.email || activeConv.platform} 
                    {activeConv.customerId?.mobileNo ? ` · ${activeConv.customerId.mobileNo}` : ""}
                  </Text>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflow: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {messages.length === 0 ? (
                    <Empty description="No messages yet" />
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={msg._id || idx}
                        style={{
                          alignSelf: msg.senderType === "agent" ? "flex-end" : "flex-start",
                          maxWidth: "80%",
                          background: msg.senderType === "agent" ? "#525BE5" : "#303030",
                          borderRadius: "12px",
                          padding: "8px 12px",
                          borderBottomRightRadius: msg.senderType === "agent" ? 4 : 12,
                          borderBottomLeftRadius: msg.senderType === "customer" ? 4 : 12,
                        }}
                      >
                        <div style={{ color: "#fff", fontSize: 13 }}>{msg.text}</div>
                        {msg.attachments?.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {msg.attachments.map((att, i) => (
                              <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd", fontSize: 12, display: "block" }}>
                                📎 {att.filename || "Attachment"}
                              </a>
                            ))}
                          </div>
                        )}
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, textAlign: "right" }}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ""}
                          {msg.senderType === "agent" && " · You"}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Input */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid #303030" }}>
                  <Row gutter={8} align="middle">
                    <Col flex="auto">
                      <TextArea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                        rows={2}
                        style={{ background: "#1F293D", border: "1px solid #303030", color: "#fff" }}
                      />
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendReply}
                        loading={sending}
                        disabled={!replyText.trim()}
                        style={{ height: 48 }}
                      >
                        Send
                      </Button>
                    </Col>
                  </Row>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Empty description="Select a conversation to view messages" />
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default UnifiedInbox;