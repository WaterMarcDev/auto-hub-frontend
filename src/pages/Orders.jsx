import { useEffect, useState } from "react";
import { Card, Table, Button, Select, Tag, message, Input, Row, Col, DatePicker } from "antd";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ordersService } from "../services/ordersApi";

const { Option } = Select;
const { RangePicker } = DatePicker;

// Local to this page — intentionally not shared with MarketplaceLeads.jsx's
// own MARKETPLACE_COLORS constant, to avoid coupling the two modules.
const PLATFORM_COLORS = {
  amazon: "#FF9900",
  ebay: "#E53238",
};

const ORDER_STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "returned",
  "refunded",
  "cancelled",
  "awaiting_payment",
  "on_hold",
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true);
      const res = await ordersService.getAll(params);
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      message.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = () => {
    const params = {};
    if (search.trim()) params.search = search;
    if (platformFilter) params.platform = platformFilter;
    if (orderStatusFilter) params.status = orderStatusFilter;
    if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
    if (dateRange?.[0]) params.dateFrom = dateRange[0].toISOString();
    if (dateRange?.[1]) params.dateTo = dateRange[1].toISOString();
    fetchOrders(params);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      width: 160,
      render: (id, record) => id || record.legacyOrderId || "—",
    },
    {
      title: "Marketplace",
      dataIndex: "platform",
      width: 110,
      render: (platform) => (
        <Tag color={PLATFORM_COLORS[platform] || "default"} style={{ textTransform: "capitalize" }}>
          {platform || "—"}
        </Tag>
      ),
    },
    {
      title: "Customer ID",
      dataIndex: "customerId",
      width: 110,
      render: (customerId) => customerId?._id || "—",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      render: (name, record) =>
        (record.customerId ? `${record.customerId.firstName || ""} ${record.customerId.lastName || ""}`.trim() : "") ||
        name ||
        record.buyerUsername ||
        "—",
    },
    {
      title: "Email",
      dataIndex: "customerEmail",
      render: (email, record) => email || record.buyerEmail || "—",
    },
    {
      title: "Phone",
      dataIndex: "customerPhone",
      width: 130,
      render: (phone, record) => phone || record.customerId?.mobileNo || "—",
    },
    {
      title: "Product",
      dataIndex: "itemsSummary",
      ellipsis: true,
      render: (summary, record) => summary || record.items?.[0]?.title || "—",
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      width: 130,
      render: (status) => (status ? <Tag color="blue">{status}</Tag> : "—"),
    },
    {
      title: "Shipping Status",
      dataIndex: "shippingStatus",
      width: 130,
      render: (status) => (status ? <Tag color="purple">{status}</Tag> : "—"),
    },
    {
      title: "Order Status",
      dataIndex: "status",
      width: 130,
      render: (status, record) => {
        const value = status || record.orderStatus;
        return value ? (
          <Tag color={value === "cancelled" ? "red" : value === "delivered" || value === "shipped" ? "green" : "orange"}>
            {value}
          </Tag>
        ) : (
          "—"
        );
      },
    },
    {
      title: "Tracking #",
      dataIndex: "trackingNumber",
      width: 150,
      render: (val) => val || "—",
    },
    {
      title: "Order Date",
      dataIndex: "createdAtEbay",
      width: 120,
      render: (date, record) => {
        const value = date || record.createdAt;
        return value ? new Date(value).toLocaleDateString() : "—";
      },
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "—"),
    },
  ];

  const expandedRowRender = (record) => {
    const items = record.items || [];
    if (items.length === 0) {
      return <span style={{ color: "#6b7280" }}>No item detail available</span>;
    }

    return (
      <Table
        pagination={false}
        rowKey={(item, idx) => item.itemId || idx}
        dataSource={items}
        columns={[
          { title: "Product Name", dataIndex: "title", render: (v) => v || "—" },
          { title: "SKU", dataIndex: "sku", width: 140, render: (v) => v || "—" },
          { title: "Quantity", dataIndex: "quantity", width: 100, render: (v) => v ?? "—" },
          {
            title: "Price",
            dataIndex: "price",
            width: 110,
            render: (v) => (v != null ? `$${Number(v).toFixed(2)}` : "—"),
          },
        ]}
      />
    );
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      <Card
        title="Orders"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
            Back
          </Button>
        }
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={5}>
            <Input
              placeholder="Search order, customer, product, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Marketplace"
              value={platformFilter || undefined}
              onChange={(val) => setPlatformFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="amazon">Amazon</Option>
              <Option value="ebay">eBay</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Order Status"
              value={orderStatusFilter || undefined}
              onChange={(val) => setOrderStatusFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              {ORDER_STATUS_OPTIONS.map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            {/* Payment Status filtering is UI-complete but stays inert until
                the backend populates `paymentStatus` from real synced order
                data — sending it as a query param the backend doesn't yet
                have values for is harmless. */}
            <Select
              placeholder="Payment Status"
              value={paymentStatusFilter || undefined}
              onChange={(val) => setPaymentStatusFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="PAID">Paid</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="FAILED">Failed</Option>
              <Option value="REFUNDED">Refunded</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <RangePicker style={{ width: "100%" }} value={dateRange} onChange={setDateRange} />
          </Col>
          <Col xs={24} sm={12} md={2}>
            <Button type="primary" icon={<SearchOutlined />} block onClick={handleSearch}>
              Search
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          scroll={{ x: "max-content" }}
          expandable={{ expandedRowRender, rowExpandable: (record) => (record.items?.length || 0) > 0 }}
          locale={{ emptyText: "No orders found" }}
        />
      </Card>
    </div>
  );
};

export default Orders;
