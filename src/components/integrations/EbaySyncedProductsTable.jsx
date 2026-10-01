import { useState, useEffect, useCallback, useRef } from "react";
import { Table, Tag, Input, Select, Button, Row, Col, Tooltip, Typography, App } from "antd";
import { SearchOutlined, RedoOutlined } from "@ant-design/icons";
import api from "../../utils/api";

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: "PUBLISHED", label: "Published", color: "green" },
  { value: "UPDATED", label: "Updated", color: "blue" },
  { value: "FAILED", label: "Failed", color: "red" },
  { value: "EXCLUDED", label: "Excluded", color: "default" },
  { value: "SKIPPED", label: "Skipped", color: "default" },
  { value: "VALIDATING", label: "Validating", color: "processing" },
  { value: "NOT_SYNCED", label: "Not Synced", color: "default" },
];
const STATUS_BY_VALUE = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]));

const dash = (value) => (value ? value : <Text type="secondary">{"—"}</Text>);

/**
 * Server-paginated table of products the eBay catalog sync has processed,
 * with their eBay identifiers and per-product sync status.
 * `refreshKey` changes whenever the parent wants the current page re-fetched
 * (e.g. after Sync Now).
 */
const EbaySyncedProductsTable = ({ refreshKey }) => {
  const { message } = App.useApp();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [retryingId, setRetryingId] = useState(null);
  // Ignores responses from superseded requests (fast paging / filtering).
  const requestSeq = useRef(0);

  const fetchProducts = useCallback(async () => {
    const seq = ++requestSeq.current;
    try {
      setLoading(true);
      const params = { page, pageSize };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get("/ebay/catalog-sync/products", { params });
      if (seq !== requestSeq.current) return;
      setRows(res.data?.data || []);
      setTotal(res.data?.total ?? 0);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      console.error("Failed to fetch eBay synced products:", err);
      message.error(`Failed to load eBay products: ${err.response?.data?.error || err.message}`);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [page, pageSize, statusFilter, search, message]);

  useEffect(() => { fetchProducts(); }, [fetchProducts, refreshKey]);

  const handleSearch = () => { setPage(1); setSearch(searchInput.trim()); };

  const handleStatusChange = (value) => { setPage(1); setStatusFilter(value); };

  const handleTableChange = (pagination) => {
    const nextSize = pagination.pageSize || pageSize;
    setPage(nextSize !== pageSize ? 1 : pagination.current || 1);
    setPageSize(nextSize);
  };

  const handleRetry = async (record) => {
    try {
      setRetryingId(record._id);
      // A single-product eBay push can take longer than the default timeout.
      const res = await api.post("/ebay/catalog-sync/retry-failed", { productIds: [record._id] }, { timeout: 120000 });
      const result = res.data?.results?.[0];
      if (result?.success) message.success(`Retried "${record.partName}"`);
      else message.error(`Retry failed: ${result?.error || "Unknown error"}`);
      await fetchProducts();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      message.error(`Retry failed: ${errMsg}`);
    } finally {
      setRetryingId(null);
    }
  };

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_, r) => {
        const vehicle = [r.year, r.make, r.model, r.trim].filter(Boolean).join(" ");
        return vehicle ? `${vehicle} - ${r.partName}` : r.partName;
      },
    },
    {
      title: "Sync Status",
      dataIndex: "ebaySyncStatus",
      key: "ebaySyncStatus",
      render: (value) => {
        const s = STATUS_BY_VALUE[value];
        return <Tag color={s?.color || "default"}>{s?.label || value || "—"}</Tag>;
      },
    },
    {
      title: "eBay Listing ID",
      dataIndex: "ebayListingId",
      key: "ebayListingId",
      render: (value, r) =>
        value && r.ebayListingUrl ? (
          <a href={r.ebayListingUrl} target="_blank" rel="noopener noreferrer">{value}</a>
        ) : dash(value),
    },
    { title: "Offer ID", dataIndex: "ebayOfferId", key: "ebayOfferId", render: dash },
    { title: "eBay SKU", dataIndex: "ebaySku", key: "ebaySku", render: dash },
    { title: "Category ID", dataIndex: "ebayCategoryId", key: "ebayCategoryId", render: dash },
    { title: "Marketplace", dataIndex: "ebayMarketplaceId", key: "ebayMarketplaceId", render: dash },
    {
      title: "Last Synced",
      dataIndex: "ebayLastSyncedAt",
      key: "ebayLastSyncedAt",
      render: (value) => (value ? new Date(value).toLocaleString() : dash(null)),
    },
    {
      title: "Error",
      dataIndex: "ebaySyncError",
      key: "ebaySyncError",
      render: (value) =>
        value ? (
          <Tooltip title={value}>
            <Text type="danger" ellipsis style={{ maxWidth: 260, display: "inline-block" }}>{value}</Text>
          </Tooltip>
        ) : dash(null),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, r) =>
        r.ebaySyncStatus === "FAILED" ? (
          <Button size="small" icon={<RedoOutlined />} loading={retryingId === r._id}
            disabled={retryingId !== null && retryingId !== r._id} onClick={() => handleRetry(r)}>
            Retry
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Search part name, SKU, eBay SKU, offer ID, listing ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            placeholder="Sync status"
            value={statusFilter}
            onChange={handleStatusChange}
            allowClear
            style={{ width: "100%" }}
            options={STATUS_OPTIONS.map(({ value, label }) => ({ value, label }))}
          />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Button type="primary" icon={<SearchOutlined />} block onClick={handleSearch}>Search</Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={rows}
        rowKey="_id"
        loading={loading}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No products have been processed by the eBay catalog sync yet" }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (count) => `${count} products`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
      />
    </>
  );
};

export default EbaySyncedProductsTable;
