import { useEffect, useState } from "react";
import { Card, Table, Button, Select, Tag, message, Input, Row, Col, DatePicker } from "antd";
import { ArrowLeftOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ordersService } from "../services/ordersApi";
import { marketplaceLeadService } from "../services/socialApi";

const { Option } = Select;
const { RangePicker } = DatePicker;

// Local to this page — intentionally not shared with MarketplaceLeads.jsx's
// own MARKETPLACE_COLORS constant, to avoid coupling the two modules.
const PLATFORM_COLORS = {
  amazon: "#FF9900",
  ebay: "#E53238",
};

// Canonical vocabularies — must exactly match services/orderStatusMapper.js
// on the backend, since Order.status/paymentStatus/refundStatus/
// shippingStatus are normalized into these same strings at sync time. This
// is what makes filtering actually work: the stored value and the filter
// option are always drawn from the same source of truth.
const ORDER_STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Awaiting Shipment",
  "Shipped",
  "Out For Delivery",
  "Completed",
  "Cancelled",
  "Returned",
  "Refund Pending",
  "Refunded",
  "Partially Refunded",
  "Unknown",
];

const PAYMENT_STATUS_OPTIONS = [
  "Paid",
  "Pending",
  "Failed",
  "Partially Paid",
  "Refunded",
  "Partially Refunded",
  "Unknown",
];

const REFUND_STATUS_OPTIONS = [
  "Not Refunded",
  "Refund Pending",
  "Refunded",
  "Partially Refunded",
];

// Mirrors the backend's canonical SHIPPING_STATUS vocabulary
// (services/orderStatusMapper.js) — same pattern as the other status option
// lists above, so the stored value and this filter's options can never
// mismatch.
const SHIPPING_STATUS_OPTIONS = [
  "Awaiting Shipment",
  "Processing",
  "Shipped",
  "Delivered",
  "Returned",
  "Cancelled",
  "Unknown",
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [refundStatusFilter, setRefundStatusFilter] = useState("");
  const [shippingStatusFilter, setShippingStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [syncing, setSyncing] = useState(false);
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
    if (refundStatusFilter) params.refundStatus = refundStatusFilter;
    if (shippingStatusFilter) params.shippingStatus = shippingStatusFilter;
    if (dateRange?.[0]) params.dateFrom = dateRange[0].startOf("day").toISOString();
    // RangePicker's end date defaults to midnight (00:00:00) of that day —
    // without extending to end-of-day, records from the selected end date
    // itself would be excluded from the range.
    if (dateRange?.[1]) params.dateTo = dateRange[1].endOf("day").toISOString();
    fetchOrders(params);
  };

  // Order Status/Payment/Refund/Shipping/Tracking are always marketplace-
  // derived, never manually maintained — this triggers a live eBay order
  // sync (existing sync endpoint) so the CRM picks up the latest values,
  // then refreshes the table from the database.
  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      await marketplaceLeadService.syncOrders(platformFilter || "ebay");
      message.success("Marketplace orders synced");
      fetchOrders();
    } catch (err) {
      console.error("Failed to sync orders:", err);
      message.error(err.response?.data?.message || "Failed to sync orders");
    } finally {
      setSyncing(false);
    }
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
      render: (email, record) => email || record.buyerEmail || "N/A",
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
      width: 140,
      render: (status, record) => {
        const value = status || record.orderStatus || "Unknown";
        const color =
          value === "Cancelled" || value === "Returned"
            ? "red"
            : value === "Completed" || value === "Shipped" || value === "Out For Delivery"
            ? "green"
            : value === "Unknown"
            ? "default"
            : "orange";
        return <Tag color={color}>{value}</Tag>;
      },
    },
    {
      title: "Refund Status",
      dataIndex: "refundStatus",
      width: 140,
      render: (status) => {
        const value = status || "Not Refunded";
        return <Tag color={value === "Not Refunded" ? "default" : "volcano"}>{value}</Tag>;
      },
    },
    {
      title: "Carrier",
      dataIndex: "carrier",
      width: 120,
      render: (val) => val || "N/A",
    },
    {
      title: "Tracking #",
      dataIndex: "trackingNumber",
      width: 150,
      render: (val) => val || "N/A",
    },
    {
      title: "Tracking URL",
      dataIndex: "trackingUrl",
      width: 130,
      // eBay's shipping_fulfillment API does not provide a tracking URL
      // field — this is only ever populated if a real one is present.
      // Never fabricated (e.g. never built from a carrier+number template).
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : (
          "N/A"
        ),
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
        title="Marketplace Orders"
        extra={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              icon={<SyncOutlined spin={syncing} />}
              onClick={handleSyncNow}
              loading={syncing}
            >
              Sync Now
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
              Back
            </Button>
          </div>
        }
      >
        <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
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
            <Select
              placeholder="Payment Status"
              value={paymentStatusFilter || undefined}
              onChange={(val) => setPaymentStatusFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              {PAYMENT_STATUS_OPTIONS.map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Refund Status"
              value={refundStatusFilter || undefined}
              onChange={(val) => setRefundStatusFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              {REFUND_STATUS_OPTIONS.map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Shipping Status"
              value={shippingStatusFilter || undefined}
              onChange={(val) => setShippingStatusFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              {SHIPPING_STATUS_OPTIONS.map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <RangePicker style={{ width: "100%" }} value={dateRange} onChange={setDateRange} />
          </Col>
          <Col xs={24} sm={12} md={3} style={{ display: "flex", alignItems: "center", }}>
            <Button type="primary" icon={<SearchOutlined />} block style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", }} onClick={handleSearch}>
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
