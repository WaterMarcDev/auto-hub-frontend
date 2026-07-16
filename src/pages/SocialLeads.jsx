import { useEffect, useState } from "react";
import { Card, Table, Button, Select, Tag, message, Input, Row, Col } from "antd";
import { ArrowLeftOutlined, SearchOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { socialLeadService } from "../services/socialApi";

const { Option } = Select;

const PLATFORM_COLORS = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  whatsapp: "#25D366",
  tiktok: "#000000",
  google_ads: "#4285F4",
};

const STATUS_COLORS = {
  new: "blue",
  open: "green",
  in_progress: "orange",
  waiting_customer: "purple",
  waiting_internal: "geekblue",
  resolved: "cyan",
  closed: "default",
  archived: "default",
};

const SocialLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const fetchLeads = async (params = {}) => {
    try {
      setLoading(true);
      const res = await socialLeadService.getAll(params);
      setLeads(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch social leads:", err);
      message.error("Failed to load social leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSearch = () => {
    const params = {};
    if (search.trim()) params.search = search;
    if (platformFilter) params.platform = platformFilter;
    if (statusFilter) params.status = statusFilter;
    fetchLeads(params);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await socialLeadService.updateStatus(id, status);
      message.success("Status updated");
      fetchLeads();
    } catch (err) {
      message.error("Failed to update status");
    }
  };

  const columns = [
    {
      title: "Platform",
      dataIndex: "platform",
      width: 100,
      render: (platform) => (
        <Tag color={PLATFORM_COLORS[platform] || "default"} style={{ textTransform: "capitalize" }}>
          {platform}
        </Tag>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name || "Unknown"}</div>
          {record.email && <div style={{ fontSize: 12, color: "#6b7280" }}>{record.email}</div>}
        </div>
      ),
    },
    {
      title: "Last Message",
      dataIndex: "lastMessage",
      ellipsis: true,
      render: (msg) => msg || "—",
    },
    {
      title: "Status",
      dataIndex: "conversationStatus",
      width: 140,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record._id, val)}
          size="small"
          style={{ width: 120 }}
        >
          <Option value="new">New</Option>
          <Option value="open">Open</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="waiting_customer">Waiting Customer</Option>
          <Option value="resolved">Resolved</Option>
          <Option value="closed">Closed</Option>
        </Select>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      width: 90,
      render: (priority) => (
        <Tag color={priority === "urgent" ? "red" : priority === "high" ? "orange" : priority === "medium" ? "blue" : "default"}>
          {priority}
        </Tag>
      ),
    },
    {
      title: "Unread",
      dataIndex: "unreadCount",
      width: 70,
      render: (count) => count > 0 ? <Tag color="red">{count}</Tag> : null,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : "—",
    },
    {
      title: "Action",
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<MessageOutlined />}
          onClick={() => navigate(`/unified-inbox?conversation=${record._id}&platform=${record.platform}`)}
        >
          Chat
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      <Card
        title="Social Media Leads"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
            Back
          </Button>
        }
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search customer, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Platform"
              value={platformFilter || undefined}
              onChange={(val) => setPlatformFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="facebook">Facebook</Option>
              <Option value="instagram">Instagram</Option>
              <Option value="whatsapp">WhatsApp</Option>
              <Option value="tiktok">TikTok</Option>
              <Option value="google_ads">Google Ads</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Status"
              value={statusFilter || undefined}
              onChange={(val) => setStatusFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="new">New</Option>
              <Option value="open">Open</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="closed">Closed</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Button type="primary" icon={<SearchOutlined />} block onClick={handleSearch}>
              Search
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={leads}
          rowKey="_id"
          loading={loading}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "No social leads found" }}
        />
      </Card>
    </div>
  );
};

export default SocialLeads;