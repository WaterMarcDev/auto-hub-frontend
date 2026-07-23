import { useEffect, useState } from "react";
import { Card, Table, Button, Select, Tag, message, Input, Row, Col } from "antd";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

/**
 * Social Media Leads
 *
 * Reports completed Part Requests that originated from a social channel —
 * i.e. leads that came in through Instagram/Facebook/TikTok/Google Business
 * and were successfully fulfilled. Backed by the same PartRequest data as
 * the Requests page (GET /api/part-request), filtered down here.
 *
 * Only these four sources are ever shown — a request with any other source
 * (Online, Website, WhatsApp, eBay, SMS, Other, ...) never appears, so the
 * Source column never displays an unrecognized value.
 */
const SUPPORTED_SOURCES = ["Instagram", "Facebook", "TikTok", "Google Business"];

const SOURCE_COLORS = {
  Instagram: "#E4405F",
  Facebook: "#1877F2",
  TikTok: "#000000",
  "Google Business": "#4285F4",
};

const SocialLeads = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/part-request`);
      const json = await res.json();
      setRequests(json.data || []);
    } catch (err) {
      console.error("Failed to fetch part requests:", err);
      message.error("Failed to load social media leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Only completed requests from a supported social source ever qualify.
  const completedSocialLeads = requests.filter(
    (r) => r.status === "Completed" && SUPPORTED_SOURCES.includes(r.source)
  );

  const searchedLeads = completedSocialLeads.filter((r) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    const vehicle = `${r.year || ""} ${r.make || ""} ${r.model || ""}`.toLowerCase();
    return (
      (r.name || "").toLowerCase().includes(term) ||
      (r.phone || "").toLowerCase().includes(term) ||
      (r.partName || "").toLowerCase().includes(term) ||
      vehicle.includes(term)
    );
  });

  const filteredLeads = sourceFilter
    ? searchedLeads.filter((r) => r.source === sourceFilter)
    : searchedLeads;

  const columns = [
    {
      title: "Lead",
      dataIndex: "partName",
      render: (partName) => partName || "—",
    },
    {
      title: "Customer",
      dataIndex: "name",
      render: (name) => name || "Unknown",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      width: 130,
      render: (phone) => phone || "—",
    },
    {
      title: "Vehicle",
      key: "vehicle",
      render: (_, record) => {
        const parts = [record.year, record.make, record.model].filter(Boolean);
        return parts.length ? parts.join(" ") : "—";
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      width: 130,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "—"),
    },
    {
      title: "Completed Date",
      dataIndex: "completedAt",
      width: 140,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "—"),
    },
    {
      title: "Source",
      dataIndex: "source",
      width: 130,
      render: (source) => (
        <Tag color={SOURCE_COLORS[source] || "default"}>{source}</Tag>
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
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search customer, phone, part, vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              placeholder="Source"
              value={sourceFilter || undefined}
              onChange={(val) => setSourceFilter(val || "")}
              allowClear
              style={{ width: "100%" }}
            >
              {SUPPORTED_SOURCES.map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredLeads}
          rowKey="_id"
          loading={loading}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "No completed social media leads found" }}
        />
      </Card>
    </div>
  );
};

export default SocialLeads;
