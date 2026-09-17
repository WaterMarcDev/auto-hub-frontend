import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Select,
  Tag,
  message,
  Input,
  Row,
  Col,
  Space,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  SyncOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { marketplaceListingService } from "../services/socialApi";

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
  const [syncing, setSyncing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [marketplaceFilter, setMarketplaceFilter] = useState("");
  const navigate = useNavigate();

  // SERVER-SIDE pagination state. `total` comes from the backend's
  // pagination.total (the count of the WHOLE filtered set) — it must never be
  // derived from leads.length. Deriving the page count from the current
  // page's row count was the bug that capped the UI at 5 pages / 50 records.
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Remembered so a Sync/delete can refresh the table without losing the
  // user's active search/marketplace filter.
  const [activeParams, setActiveParams] = useState({});

  const fetchLeads = async (
    params = activeParams,
    page = currentPage,
    limit = pageSize
  ) => {
    try {
      setLoading(true);
      // hasListingId restricts results to listing-sourced records only —
      // additive, opt-in backend filter (see marketplaceListing.controller.js).
      // page/limit are sent so the BACKEND paginates and returns the true
      // total for the entire filtered set (pagination.total), rather than the
      // client paginating a single capped page of rows.
      const res = await marketplaceListingService.getAll({
        hasListingId: "true",
        ...params,
        page,
        limit,
      });
      const rows = res.data?.data || [];
      setLeads(rows);
      // The authoritative total for the whole filtered set. Fall back to the
      // current page length only if the backend omitted pagination metadata.
      setTotal(res.data?.pagination?.total ?? rows.length);
      return rows;
    } catch (err) {
      console.error("Failed to fetch marketplace leads:", err);
      message.error("Failed to load marketplace listings");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Refresh the current page while keeping the active filters. If that page is
  // now empty (e.g. a sync removed stale rows or a delete emptied the last
  // page), step back one page so the table never strands the user on a blank
  // page.
  const refresh = async (page = currentPage, limit = pageSize) => {
    const rows = await fetchLeads(activeParams, page, limit);
    if (rows.length === 0 && page > 1) {
      const prevPage = page - 1;
      setCurrentPage(prevPage);
      await fetchLeads(activeParams, prevPage, limit);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSearch = () => {
    const params = {};
    if (search.trim()) params.search = search;
    if (marketplaceFilter) params.marketplace = marketplaceFilter;
    setActiveParams(params);
    // A new search/filter defines a NEW result set — always restart at page 1.
    setCurrentPage(1);
    fetchLeads(params, 1, pageSize);
  };

  // Ant Design routes EVERY page and page-size change through here now that
  // the Table is given a pagination.total. Re-fetch from the server; never
  // slice the already-fetched `leads` client-side.
  const handleTableChange = (pagination) => {
    const nextSize = pagination.pageSize || pageSize;
    const sizeChanged = nextSize !== pageSize;
    // Changing page size changes the row boundaries — go back to page 1.
    const nextPage = sizeChanged ? 1 : pagination.current || 1;
    setPageSize(nextSize);
    setCurrentPage(nextPage);
    fetchLeads(activeParams, nextPage, nextSize);
  };

  /**
   * Manual "Sync eBay Listings".
   *
   * Runs the authoritative eBay → CRM reconciliation on the backend, then
   * refreshes the table (keeping the active filters) so the user immediately
   * sees the corrected set. Surfaces the real reconciliation stats rather than
   * a generic "done", and never exposes a token — the backend response only
   * carries counts.
   */
  const handleSyncListings = async () => {
    try {
      setSyncing(true);
      const res = await marketplaceListingService.syncListings({ platform: "ebay" });
      const summary = res.data?.summary;

      if (summary) {
        const parts = [
          `Active on eBay: ${summary.activeOnEbay}`,
          `Created ${summary.created}`,
          `Updated ${summary.updated}`,
          `Removed ${summary.removed}`,
          `Unchanged ${summary.unchanged}`,
        ];
        if (summary.duplicatesCollapsed > 0) {
          parts.push(`Duplicates collapsed ${summary.duplicatesCollapsed}`);
        }

        if (summary.fetchComplete === false) {
          // Partial fetch: the backend deliberately skipped removals, so this
          // must not be reported as a clean success.
          message.warning(
            `eBay sync partially completed — ${parts.join(", ")}. Stale records were NOT removed because the eBay fetch was incomplete.`
          );
        } else {
          message.success(`eBay sync complete — ${parts.join(", ")}`);
        }
      } else {
        message.success("eBay listings synced");
      }

      await refresh();
    } catch (err) {
      console.error("eBay listing sync failed:", err);
      message.error(
        err.response?.data?.message || "Failed to sync eBay listings"
      );
    } finally {
      setSyncing(false);
    }
  };

  /**
   * CRM-only delete. Removes the CRM's own record; the eBay listing itself is
   * never ended, revised, or otherwise touched by this action (the backend
   * handler performs a single findByIdAndDelete and makes no marketplace call).
   */
  const handleDelete = async (record) => {
    try {
      setDeletingId(record._id);
      await marketplaceListingService.remove(record._id);
      message.success("Listing removed from CRM (eBay listing was not affected)");
      await refresh();
    } catch (err) {
      console.error("Failed to remove marketplace listing:", err);
      message.error(err.response?.data?.message || "Failed to remove listing");
    } finally {
      setDeletingId(null);
    }
  };

  // Root cause of "click Amazon, then eBay, same data shown": this Select's
  // onChange previously only called setMarketplaceFilter() — pure local
  // state, no re-fetch — so the table kept showing whatever the LAST actual
  // fetchLeads() call returned (the unfiltered initial load) until the user
  // separately pressed "Search". Selecting a marketplace now re-fetches
  // immediately, matching the filter UX used elsewhere in this app (e.g.
  // Requests/Junk Car Requests). Passes the new value directly rather than
  // reading the `marketplaceFilter` state var, since setState here hasn't
  // re-rendered yet in this same tick. The backend's own `marketplace`
  // query filter (controllers/marketplaceListing.controller.js) was already
  // correct — this was a frontend-only bug.
  const handleMarketplaceFilterChange = (val) => {
    const marketplace = val || "";
    setMarketplaceFilter(marketplace);
    const params = {};
    if (search.trim()) params.search = search;
    if (marketplace) params.marketplace = marketplace;
    // Persist the new filter combination so a later Sync/refresh keeps it.
    setActiveParams(params);
    // New filter = new result set — restart at page 1.
    setCurrentPage(1);
    fetchLeads(params, 1, pageSize);
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
      // Canonical values come from the listing data itself —
      // normalizeEbayListingStatus() in
      // services/ebay/ebayListingReconcile.service.js: Active, Ended,
      // Inactive, Out of Stock. Only items the ACTIVE listings feed returned
      // are stored, so "Unknown" is no longer produced for eBay listings; it
      // remains in the renderer only as a defensive fallback for legacy rows
      // written before this fix.
      render: (status) => {
        const value = status || "Unknown";
        const color =
          value === "Active"
            ? "green"
            : value === "Ended" || value === "Inactive"
            ? "default"
            : value === "Out of Stock"
            ? "orange"
            : value === "Unknown"
            ? "default"
            : "blue";
        return <Tag color={color}>{value}</Tag>;
      },
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
      // Explicit "en-US" locale — without it, toLocaleDateString() falls
      // back to the browser/server's own locale, which can render dates
      // day-first (ambiguous, and unparseable for day-of-month > 12 if
      // typed back into search). Matches the format the backend's search
      // date-parsing expects (see marketplaceListing.controller.js).
      render: (date) => (date ? new Date(date).toLocaleDateString("en-US") : "—"),
    },
    {
      title: "Updated Date",
      dataIndex: "updatedAt",
      width: 130,
      // Explicit "en-US" locale — without it, toLocaleDateString() falls
      // back to the browser/server's own locale, which can render dates
      // day-first (ambiguous, and unparseable for day-of-month > 12 if
      // typed back into search). Matches the format the backend's search
      // date-parsing expects (see marketplaceListing.controller.js).
      render: (date) => (date ? new Date(date).toLocaleDateString("en-US") : "—"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        // CRM-ONLY removal. The confirm text states explicitly that the eBay
        // listing itself is untouched, so nobody expects this button to end a
        // live eBay listing.
        <Popconfirm
          title="Remove from CRM?"
          description="This deletes the CRM record only. The eBay listing stays live and is untouched."
          okText="Remove"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onConfirm={() => handleDelete(record)}
        >
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={deletingId === record._id}
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      <Card
        title="Marketplace Listings"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<SyncOutlined spin={syncing} />}
              loading={syncing}
              onClick={handleSyncListings}
            >
              {syncing ? "Syncing…" : "Sync eBay Listings"}
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
              Back
            </Button>
          </Space>
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
              onChange={handleMarketplaceFilterChange}
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
          // Server-side pagination: the Table shows only the current page's
          // rows, but the pager is sized by the backend's TOTAL for the whole
          // filtered set — so every page is reachable, not just the first 5.
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (count) => `${count} listings`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default SocialLeads;
