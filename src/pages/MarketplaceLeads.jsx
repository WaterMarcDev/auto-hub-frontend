import { useEffect, useState } from "react";
import { Card, Table, Button, Select, Tag, message, Input, Row, Col } from "antd";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { marketplaceLeadService } from "../services/socialApi";

const { Option } = Select;

const MARKETPLACE_COLORS = {
  amazon: "#FF9900",
  ebay: "#E53238",
};

// Marketplace Listings manages ONLY marketplace listings (Listing ID,
// Marketplace, Product, Listing Status, SKU, Price, Quantity, Created/Updated
// Date) — order-related fields (Order ID, Order Status, Customer, chat)
// belong exclusively to Marketplace Orders (src/pages/Orders.jsx).
const SocialLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("");
  const navigate = useNavigate();

  const fetchLeads = async (params = {}) => {
    try {
      setLoading(true);
      // hasListingId restricts results to listing-sourced records only —
      // additive, opt-in backend filter (see marketplaceLead.controller.js).
      const res = await marketplaceLeadService.getAll({ hasListingId: "true", ...params });
      setLeads(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch marketplace leads:", err);
      message.error("Failed to load marketplace listings");
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
    fetchLeads(params);
  };

  const columns = [
    {
      title: "Listing ID",
      dataIndex: "marketplaceListingId",
      width: 150,
      render: (id) => id || "—",
    },
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
      title: "Product",
      dataIndex: "productName",
      ellipsis: true,
      render: (name) => name || "—",
    },
    {
      title: "Listing Status",
      dataIndex: "listingStatus",
      width: 130,
      render: (status) => (
        <Tag color={status === "active" ? "green" : "default"} style={{ textTransform: "capitalize" }}>
          {status || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "SKU",
      dataIndex: "productSku",
      width: 140,
      render: (sku) => sku || "—",
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 100,
      render: (price) => (price != null ? `$${Number(price).toFixed(2)}` : "—"),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 100,
      render: (qty) => qty ?? "—",
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      width: 130,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "—"),
    },
    {
      title: "Updated Date",
      dataIndex: "updatedAt",
      width: 130,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "—"),
    },
  ];

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      <Card
        title="Marketplace Listings"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
            Back
          </Button>
        }
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search listing ID, product, SKU, price, status, date..."
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
          locale={{ emptyText: "No marketplace listings found" }}
        />
      </Card>
    </div>
  );
};

export default SocialLeads;
