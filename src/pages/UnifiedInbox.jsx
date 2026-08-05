import { useEffect, useState, useRef, useMemo, Fragment } from "react";
import { Card, Button, Tag, message, Input, Row, Col, Typography, Spin, Empty, Select, Drawer, Image, Grid } from "antd";
import {
  ArrowLeftOutlined,
  SendOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { conversationService } from "../services/socialApi";
import { ordersService } from "../services/ordersApi";
import { customerAPI } from "../utils/api";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const PLATFORM_COLORS = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  whatsapp: "#25D366",
  tiktok: "#000000",
  google_ads: "#4285F4",
  amazon: "#FF9900",
  ebay: "#E53238",
};

const STATUS_COLORS = {
  new: "blue",
  open: "green",
  in_progress: "gold",
  waiting_customer: "orange",
  waiting_internal: "purple",
  resolved: "cyan",
  closed: "default",
  archived: "default",
};

const DELIVERY_ICON = {
  sent: "✓",
  delivered: "✓✓",
  read: "✓✓",
  failed: "⚠",
};

const ORDER_LINKABLE_PLATFORMS = ["amazon", "ebay"];

/**
 * Resolve the authoritative time for a message, for sorting strictly
 * oldest -> newest — mirrors the backend's identical helper in
 * controllers/conversation.controller.js. `createdAt` already holds the
 * real timestamp for every message; this is a defensive second layer in
 * case any out-of-order data ever reaches the client (e.g. a socket event
 * for a backfilled historical message), never trusting array/insertion
 * order. Never throws on missing/malformed timestamps.
 */
function getMessageTime(message) {
  if (message?.createdAt) {
    const time = new Date(message.createdAt).getTime();
    if (!Number.isNaN(time)) return time;
  }
  return 0;
}

/** Renders one message attachment: image (native antd zoom), PDF (new-tab
 * link — no PDF.js dependency needed), or a generic download link. */
const AttachmentItem = ({ att }) => {
  const name = att.filename || att.url || "";
  const isImage = att.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(name);
  const isPdf = att.mimeType === "application/pdf" || /\.pdf$/i.test(name);

  if (isImage) {
    return (
      <Image
        src={att.thumbnailUrl || att.url}
        width={100}
        height={80}
        style={{ objectFit: "cover", borderRadius: 8 }}
      />
    );
  }

  if (isPdf) {
    return (
      <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd", fontSize: 12, display: "block" }}>
        📄 {att.filename || "PDF Document"}
      </a>
    );
  }

  return (
    <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd", fontSize: 12, display: "block" }}>
      📎 {att.filename || "Attachment"}
    </a>
  );
};

const UnifiedInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  // Defensive display-order guarantee: sort strictly oldest -> newest by
  // each message's own timestamp rather than trusting array/insertion
  // order (the backend already sorts, but this protects against any
  // out-of-order data arriving via a socket event too). Memoized so this
  // only recomputes when the messages array itself actually changes, not
  // on unrelated re-renders (typing a reply, resizing, etc.) — cheap even
  // for large conversations since it's O(n log n) once per update, not
  // per render.
  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => getMessageTime(a) - getMessageTime(b)),
    [messages]
  );
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ─── List search/filter (client-side — conversations are already fetched
  // in full via getAll({limit:100}); no new backend query params needed) ──
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  // ─── Collapsible list / mobile list↔thread layout (Gmail/Outlook style) ─
  const screens = Grid.useBreakpoint();
  const isDesktop = Boolean(screens.md);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // "list" | "thread"

  // ─── Scroll-position-aware auto-scroll ───────────────────────────────────
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevConversationRef = useRef(null);
  const justSentRef = useRef(false);
  const activeConversationRef = useRef(null);

  // ─── View Customer / View Related Order drawers ──────────────────────────
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [customerDrawerLoading, setCustomerDrawerLoading] = useState(false);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [orderDrawerLoading, setOrderDrawerLoading] = useState(false);
  const [relatedOrder, setRelatedOrder] = useState(null);

  const conversationId = searchParams.get("conversation");

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
      fetchMessages(conversationId);
      if (!isDesktop) setMobileView("thread");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

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
      justSentRef.current = true;
      await fetchMessages(activeConversation);
      await fetchConversations();
    } catch (err) {
      // Surface the backend's actual failure reason (e.g. which prerequisite
      // was missing, or the real marketplace error) instead of a generic
      // toast — falls back to the generic message only if the backend
      // didn't provide one.
      message.error(err.response?.data?.message || "Failed to send reply");
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

  // ─── Client-side filtering over the already-fetched conversation list ───
  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (platformFilter) list = list.filter((c) => c.platform === platformFilter);
    if (unreadOnly) list = list.filter((c) => (c.unreadCount || 0) > 0);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          (c.customerName || "").toLowerCase().includes(q) ||
          (c.lastMessage || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, platformFilter, unreadOnly, search]);

  const handleSelectConversation = (id) => {
    setActiveConversation(id);
    fetchMessages(id);
    navigate(`/unified-inbox?conversation=${id}`, { replace: true });
    if (!isDesktop) setMobileView("thread");
  };

  // ─── Scroll-position-aware auto-scroll ───────────────────────────────────
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleThreadScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 80;
    setIsAtBottom(atBottom);
    if (atBottom) setHasNewMessages(false);
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const conversationChanged = prevConversationRef.current !== activeConversation;
    prevConversationRef.current = activeConversation;

    // Always scroll on: opening/switching a conversation, or right after the
    // CRM user's own reply. Otherwise, only scroll if the user is already at
    // the bottom — never yank them away from messages they're reading.
    if (conversationChanged || justSentRef.current || isAtBottom) {
      justSentRef.current = false;
      setTimeout(() => scrollToBottom(conversationChanged ? "auto" : "smooth"), 100);
      setHasNewMessages(false);
      if (conversationChanged) setIsAtBottom(true);
    } else {
      setHasNewMessages(true);
    }
    // isAtBottom is intentionally excluded: this effect should only
    // re-evaluate when the message count or active conversation changes
    // (a new message arriving, or switching threads) — not every time the
    // user scrolls. The value read here is always current for that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, activeConversation]);

  // ─── Real-time: Socket.io (duplicates, not shares, Inbox.jsx's existing
  // self-contained connection pattern) + a polling backstop, since this is a
  // brand-new backend event without a production track record yet. ───────
  useEffect(() => {
    let socket;
    let cancelled = false;

    import("socket.io-client")
      .then(({ io }) => {
        if (cancelled) return;
        socket = io(import.meta.env.VITE_SOCKET_URL || "https://api.autohubexpress.us");

        // Fires on first connect AND automatically after a dropped
        // connection reconnects (socket.io-client's built-in behavior) — a
        // safety net for anything missed while disconnected.
        socket.on("connect", () => {
          fetchConversations();
          if (activeConversationRef.current) fetchMessages(activeConversationRef.current);
        });

        socket.on("new_message", ({ conversationId: incomingConvId, message: incomingMessage, conversation: convSummary }) => {
          setConversations((prev) => {
            const idx = prev.findIndex((c) => c._id === incomingConvId);
            if (idx === -1) return prev; // picked up by the next poll/reconnect refresh

            const isActive = activeConversationRef.current === incomingConvId;
            const existing = prev[idx];
            const merged = {
              ...existing,
              lastMessage: convSummary?.lastMessage ?? existing.lastMessage,
              lastMessageAt: convSummary?.lastMessageAt ?? existing.lastMessageAt,
              status: convSummary?.status ?? existing.status,
              unreadCount: isActive ? existing.unreadCount : convSummary?.unreadCount ?? (existing.unreadCount || 0) + 1,
            };

            // Move the just-updated conversation to the top — newest active first.
            const updated = [...prev];
            updated.splice(idx, 1);
            updated.unshift(merged);
            return updated;
          });

          if (activeConversationRef.current === incomingConvId && incomingMessage) {
            setMessages((prev) => (prev.some((m) => m._id === incomingMessage._id) ? prev : [...prev, incomingMessage]));
          }
        });
      })
      .catch(() => {
        // Socket connection failures are never surfaced as a UI error — the
        // polling backstop below keeps the inbox fresh regardless.
      });

    const pollInterval = setInterval(() => {
      fetchConversations();
      if (activeConversationRef.current) fetchMessages(activeConversationRef.current);
    }, 30000);

    return () => {
      cancelled = true;
      socket?.disconnect();
      clearInterval(pollInterval);
    };
  }, []);

  const openCustomerDrawer = async () => {
    if (!activeConv?.customerId?._id) return;
    setCustomerDrawerOpen(true);
    setCustomerDrawerLoading(true);
    setCustomerDetail(null);
    try {
      const res = await customerAPI.getById(activeConv.customerId._id);
      setCustomerDetail(res.data?.data || res.data || null);
    } catch (err) {
      console.error("Failed to load customer details:", err);
    } finally {
      setCustomerDrawerLoading(false);
    }
  };

  const openOrderDrawer = async () => {
    setOrderDrawerOpen(true);
    setOrderDrawerLoading(true);
    setRelatedOrder(null);
    try {
      const res = await ordersService.getAll({ conversationId: activeConversation });
      setRelatedOrder(res.data?.data?.[0] || null);
    } catch (err) {
      // Graceful empty state — no related order, or the Orders API isn't
      // deployed yet. Never surfaced as an error.
      console.error("Failed to load related order:", err);
      setRelatedOrder(null);
    } finally {
      setOrderDrawerLoading(false);
    }
  };

  const listSpan = isDesktop ? (isListCollapsed ? 0 : 8) : mobileView === "list" ? 24 : 0;
  const threadSpan = isDesktop ? (isListCollapsed ? 24 : 16) : mobileView === "thread" ? 24 : 0;

  return (
    <div style={{ padding: "20px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Card
        title="Marketplace Inbox"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        }
        style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
        bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
      >
        <Row style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          {/* Conversation List */}
          {listSpan > 0 && (
            <Col span={listSpan} style={{ borderRight: "1px solid #303030", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ flexShrink: 0, display: "flex", gap: 8, padding: "8px 12px", borderBottom: "1px solid #303030", flexWrap: "wrap" }}>
                <Input
                  placeholder="Search conversations..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                  style={{ flex: "1 1 160px" }}
                />
                <Select
                  placeholder="Platform"
                  value={platformFilter || undefined}
                  onChange={(val) => setPlatformFilter(val || "")}
                  allowClear
                  style={{ width: 130 }}
                >
                  {Object.keys(PLATFORM_COLORS).map((p) => (
                    <Option key={p} value={p} style={{ textTransform: "capitalize" }}>
                      {p}
                    </Option>
                  ))}
                </Select>
                <Button type={unreadOnly ? "primary" : "default"} onClick={() => setUnreadOnly((v) => !v)}>
                  Unread
                </Button>
              </div>

              <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
                ) : filteredConversations.length === 0 ? (
                  <Empty description="No conversations" style={{ padding: 40 }} />
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv._id)}
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
              </div>
            </Col>
          )}

          {/* Message Area */}
          {threadSpan > 0 && (
            <Col span={threadSpan} style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
              {activeConversation && activeConv ? (
                <>
                  {/* Header */}
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #303030" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {!isDesktop && (
                          <Button size="small" icon={<ArrowLeftOutlined />} onClick={() => setMobileView("list")}>
                            Back to Inbox
                          </Button>
                        )}
                        {isDesktop && (
                          <Button
                            size="small"
                            type="text"
                            icon={isListCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setIsListCollapsed((v) => !v)}
                          />
                        )}
                        <Tag color={PLATFORM_COLORS[activeConv.platform] || "default"} style={{ textTransform: "capitalize" }}>
                          {activeConv.platform}
                        </Tag>
                        <Title level={5} style={{ margin: 0, color: "#fff" }}>
                          {activeConv.customerId
                            ? `${activeConv.customerId.firstName || ""} ${activeConv.customerId.lastName || ""}`.trim() || activeConv.customerName || "Unknown"
                            : activeConv.customerName || "Unknown"}
                        </Title>
                        {activeConv.status && (
                          <Tag color={STATUS_COLORS[activeConv.status] || "default"} style={{ textTransform: "capitalize" }}>
                            {activeConv.status.replace(/_/g, " ")}
                          </Tag>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button size="small" icon={<UserOutlined />} disabled={!activeConv.customerId} onClick={openCustomerDrawer}>
                          View Customer
                        </Button>
                        {ORDER_LINKABLE_PLATFORMS.includes(activeConv.platform) && (
                          <Button size="small" icon={<ShoppingCartOutlined />} onClick={openOrderDrawer}>
                            View Related Order
                          </Button>
                        )}
                      </div>
                    </div>
                    <Text style={{ color: "#6b7280", fontSize: 12, display: "block", marginTop: 4 }}>
                      Customer ID: {activeConv.customerId?._id || "—"} · Email: {activeConv.customerId?.email || "—"} · Phone: {activeConv.customerId?.mobileNo || "—"} · Started: {activeConv.createdAt ? new Date(activeConv.createdAt).toLocaleString() : "—"}
                    </Text>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                    <div
                      ref={messagesContainerRef}
                      onScroll={handleThreadScroll}
                      style={{ height: "100%", overflowY: "auto", overflowX: "hidden", padding: "12px 16px" }}
                    >
                      {sortedMessages.length === 0 ? (
                        <Empty description="No messages yet" />
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {sortedMessages.map((msg, idx) => {
                            const prevMsg = sortedMessages[idx - 1];
                            const showDateDivider =
                              !prevMsg ||
                              (msg.createdAt && new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString());
                            const isCrmUser = Boolean(msg.senderId);
                            const isOutgoing = msg.senderType === "agent";
                            // Historical eBay conversations predate this CRM,
                            // so ownership is derived from real sender
                            // identity, not assumed: a seller/historical
                            // message and a live CRM reply are both
                            // senderType "agent", but only the CRM reply has
                            // a senderId — that's what distinguishes "You"
                            // from the seller's real name below.
                            const displayName = isCrmUser ? "You" : msg.senderName || "Unknown";

                            return (
                              <Fragment key={msg._id || idx}>
                                {showDateDivider && msg.createdAt && (
                                  <div style={{ textAlign: "center", margin: "4px 0" }}>
                                    <Tag style={{ background: "transparent", color: "#6b7280", border: "1px solid #303030" }}>
                                      {new Date(msg.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                    </Tag>
                                  </div>
                                )}
                                <div
                                  style={{
                                    alignSelf: isOutgoing ? "flex-end" : "flex-start",
                                    maxWidth: "80%",
                                    width: "fit-content",
                                    overflow: "hidden",
                                    background: isOutgoing ? "#525BE5" : "#303030",
                                    borderRadius: "12px",
                                    padding: "8px 12px",
                                  }}
                                >
                                  <div style={{ fontSize: 11, color: "#c7c9f5", marginBottom: 2 }}>{displayName}</div>
                                  <div style={{ color: "#fff", fontSize: 13, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word", maxWidth: "100%" }}>{msg.text}</div>
                                  {msg.attachments?.length > 0 && (
                                    <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                      {msg.attachments.map((att, i) => (
                                        <AttachmentItem key={i} att={att} />
                                      ))}
                                    </div>
                                  )}
                                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, textAlign: "right" }}>
                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ""}
                                    {msg.deliveryStatus && msg.deliveryStatus !== "pending" && (
                                      <span style={{ marginLeft: 4 }}>{DELIVERY_ICON[msg.deliveryStatus] || ""}</span>
                                    )}
                                  </div>
                                </div>
                              </Fragment>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>
                    {hasNewMessages && (
                      <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)" }}>
                        <Button
                          size="small"
                          type="primary"
                          shape="round"
                          onClick={() => {
                            scrollToBottom();
                            setHasNewMessages(false);
                          }}
                        >
                          ↓ New messages
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Reply Input */}
                  <div style={{ flexShrink: 0, padding: "8px 16px", borderTop: "1px solid #303030", background: "#1F293D" }}>
                    <Row gutter={8} align="middle">
                      <Col flex="auto">
                        <TextArea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                          rows={2}
                          style={{ background: "#1F293D", border: "1px solid #303030", color: "#fff", minHeight: 40, resize: "none" }}
                        />
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleSendReply}
                          loading={sending}
                          disabled={!replyText.trim()}
                          style={{ height: 40 }}
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
          )}
        </Row>
      </Card>

      <Drawer title="Customer" open={customerDrawerOpen} onClose={() => setCustomerDrawerOpen(false)}>
        {customerDrawerLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
        ) : customerDetail ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div><strong>Name:</strong> {`${customerDetail.firstName || ""} ${customerDetail.lastName || ""}`.trim() || "—"}</div>
            <div><strong>Email:</strong> {customerDetail.email || "—"}</div>
            <div><strong>Phone:</strong> {customerDetail.mobileNo || "—"}</div>
            <div><strong>Created:</strong> {customerDetail.createdAt ? new Date(customerDetail.createdAt).toLocaleString() : "—"}</div>
          </div>
        ) : (
          <Empty description="No linked customer" />
        )}
      </Drawer>

      <Drawer title="Related Order" open={orderDrawerOpen} onClose={() => setOrderDrawerOpen(false)}>
        {orderDrawerLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
        ) : relatedOrder ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div><strong>Order ID:</strong> {relatedOrder.orderId || "—"}</div>
            <div><strong>Marketplace:</strong> {relatedOrder.platform || "—"}</div>
            <div><strong>Order Status:</strong> {relatedOrder.status || "—"}</div>
            <div><strong>Payment Status:</strong> {relatedOrder.paymentStatus || "—"}</div>
            <div><strong>Shipping Status:</strong> {relatedOrder.shippingStatus || "—"}</div>
            <Button type="link" onClick={() => navigate(`/orders?highlight=${relatedOrder._id}`)} style={{ padding: 0 }}>
              Open in Marketplace Orders →
            </Button>
          </div>
        ) : (
          <Empty description="No related order found" />
        )}
      </Drawer>
    </div>
  );
};

export default UnifiedInbox;
