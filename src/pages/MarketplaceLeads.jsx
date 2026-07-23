import { useEffect, useState } from "react";
import { Card, Table, Button, Select, Tag, message, Input, Row, Col } from "antd";
import { ArrowLeftOutlined, SearchOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { marketplaceLeadService } from "../services/socialApi";

const { Option } = Select;

const MARKETPLACE_COLORS = {
  amazon: "#FF9900",
  ebay: "#E53238",
};

const SocialLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const fetchLeads = async (params = {}) => {
    try {
      setLoading(true);
      const res = await marketplaceLeadService.getAll(params);
      setLeads(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch marketplace leads:", err);
      message.error("Failed to load marketplace leads");
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
    if (marketplaceFilter) params.marketplace = marketplaceFilter;
    if (statusFilter) params.status = statusFilter;
    fetchLeads(params);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await marketplaceLeadService.updateStatus(id, status);
      message.success("Status updated");
      fetchLeads();
    } catch (err) {
      message.error("Failed to update status");
    }
  };

  const columns = [
    {
      title: "Marketplace",
      dataIndex: "marketplace",
      width: 110,
      render: (mp) => (
        <Tag color={MARKETPLACE_COLORS[mp] || "default"} style={{ textTransform: "capitalize" }}>
          {mp || "—"}
        </Tag>
      ),
    },
    {
      title: "Order ID",
      dataIndex: "marketplaceOrderId",
      width: 150,
      render: (id) => id || "—",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name || "Unknown"}</div>
          {record.customerEmail && <div style={{ fontSize: 12, color: "#6b7280" }}>{record.customerEmail}</div>}
        </div>
      ),
    },
    {
      title: "Product",
      dataIndex: "productName",
      ellipsis: true,
      render: (name) => name || "—",
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      width: 120,
      render: (status) => (
        <Tag color={status === "cancelled" ? "red" : status === "shipped" ? "green" : status === "pending" ? "orange" : "blue"}>
          {status || "—"}
        </Tag>
      ),
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
          onClick={() => navigate(`/unified-inbox?conversation=${record._id}&platform=${record.marketplace}`)}
        >
          Chat
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      <Card
        title="Marketplace Orders & Leads"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
            Back
          </Button>
        }
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search order, customer, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Marketplace"
              value={marketplaceFilter || undefined}
              onChange={(val) => setMarketplaceFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="amazon">Amazon</Option>
              <Option value="ebay">eBay</Option>
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
          locale={{ emptyText: "No marketplace leads found" }}
        />
      </Card>
    </div>
  );
};

export default SocialLeads;