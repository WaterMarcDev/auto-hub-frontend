// Sold Products — every CRM part sold on eBay or Wix, with full order details.
//
// Parts are marked sold automatically (every 15 minutes, or "Sync now") from
// eBay and Wix orders. A sold part leaves available stock and is no longer
// pushed to eBay/Wix. See backend services/marketplaceSales.service.js.

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Popover,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  ExclamationCircleOutlined,
  SearchOutlined,
  SyncOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import SoldProductsService from "../../services/soldProductsService";

const CHANNEL = {
  ebay: { label: "eBay", color: "blue" },
  wix: { label: "Wix", color: "purple" },
};

const prettyPart = (text) =>
  !text
    ? "N/A"
    : String(text)
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();

const vehicleOf = (r) =>
  [r.year, r.make?.name, r.model?.name, r.trim?.name].filter(Boolean).join(" ") || "—";

const money = (amount, currency = "USD") =>
  amount === undefined || amount === null
    ? "—"
    : `${currency === "USD" || !currency ? "$" : `${currency} `}${Number(amount).toFixed(2)}`;

const fmtDate = (d) => (d ? dayjs(d).format("MMM D, YYYY h:mm A") : "—");

const ChannelTag = ({ channel }) => {
  const c = CHANNEL[channel];
  return c ? <Tag color={c.color}>{c.label}</Tag> : <Tag>—</Tag>;
};

const addressLines = (a) => {
  if (!a) return "—";
  const lines = [
    a.name,
    a.line1,
    a.line2,
    [a.city, a.state, a.postalCode].filter(Boolean).join(", "),
    a.country,
  ].filter(Boolean);
  return lines.length ? lines.map((l, i) => <div key={i}>{l}</div>) : "—";
};

// One line per channel: when the sold-status sync last ran and how it went.
const SyncLine = ({ name, sync }) => {
  if (!sync) return <div><ChannelTag channel={name} /> not synced yet</div>;
  const ok = sync.lastStatus === "success";
  const unmatched = sync.unmatched || [];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <ChannelTag channel={name} />
      <span>
        Last checked {sync.lastRunAt ? dayjs(sync.lastRunAt).format("MMM D, h:mm A") : "never"}
      </span>
      {ok ? (
        <Tag color="green">OK</Tag>
      ) : (
        <Tooltip title={sync.lastError}>
          <Tag color={sync.lastStatus === "skipped" ? "default" : "red"}>
            {sync.lastStatus === "skipped" ? "Skipped" : "Failed"}
          </Tag>
        </Tooltip>
      )}
      {!ok && sync.lastError && (
        <span style={{ color: "#ff7875", fontSize: 12 }}>{sync.lastError}</span>
      )}
      {unmatched.length > 0 && (
        <Popover
          title="Sold on the marketplace, but no matching CRM part was found"
          content={
            <div style={{ maxWidth: 460, maxHeight: 300, overflow: "auto" }}>
              {unmatched.map((u, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <strong>Order {u.orderNumber || u.orderId}</strong> — {u.title || "Untitled"} (qty {u.quantity || 1})
                  <div style={{ fontSize: 12, color: "#888" }}>
                    SKU: {u.sku || "—"} · Listing: {u.listingId || "—"}
                    {u.reason ? ` · ${u.reason}` : ""}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <Tag color="orange" style={{ cursor: "pointer" }}>
            {unmatched.length} unmatched line{unmatched.length > 1 ? "s" : ""}
          </Tag>
        </Popover>
      )}
    </div>
  );
};

const SoldProducts = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0 });

  const [channel, setChannel] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [onlyConflicts, setOnlyConflicts] = useState(false);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      const res = await SoldProductsService.summary();
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load sold summary", err);
    }
  }, []);

  const loadRows = useCallback(
    async (page = 1, limit = 25) => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (channel !== "all") params.channel = channel;
        if (search.trim()) params.search = search.trim();
        if (onlyConflicts) params.conflicts = "true";
        if (dateRange?.[0]) params.dateFrom = dateRange[0].startOf("day").toISOString();
        if (dateRange?.[1]) params.dateTo = dateRange[1].endOf("day").toISOString();
        const res = await SoldProductsService.list(params);
        setRows(res.data || []);
        setPagination({
          page: res.pagination?.page || page,
          limit: res.pagination?.limit || limit,
          total: res.pagination?.total || 0,
        });
      } catch (err) {
        message.error(`Failed to load sold products: ${err.message}`);
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [channel, search, onlyConflicts, dateRange]
  );

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadRows(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, search, onlyConflicts, dateRange]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await SoldProductsService.syncNow();
      const r = res.data || {};
      const part = (name, x) =>
        !x ? "" : x.error ? `${name}: failed` : x.skipped ? `${name}: ${x.skipped}` : `${name}: ${x.sold} newly sold`;
      message.success(`Sync finished — ${[part("eBay", r.ebay), part("Wix", r.wix)].filter(Boolean).join(" · ")}`);
    } catch (err) {
      message.error(err.response?.data?.message || err.message || "Sync failed");
    } finally {
      setSyncing(false);
      loadSummary();
      loadRows(pagination.page, pagination.limit);
    }
  };

  const openDetail = async (row) => {
    setDetail(row);
    setDetailLoading(true);
    try {
      const res = await SoldProductsService.getOne(row._id);
      setDetail(res.data);
    } catch (err) {
      message.error(`Failed to load details: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: "Sold On",
      key: "channel",
      width: 90,
      fixed: "left",
      render: (_, r) => <ChannelTag channel={r.sale?.channel} />,
    },
    {
      title: "Part",
      key: "part",
      minWidth: 200,
      fixed: "left",
      render: (_, r) => (
        <div>
          <strong>{prettyPart(r.partName)}</strong>
          <div style={{ fontSize: 12, color: "#999" }}>{vehicleOf(r)}</div>
        </div>
      ),
    },
    { title: "VIN", dataIndex: "vin", key: "vin", minWidth: 170, render: (v) => v || "—" },
    {
      title: "Order #",
      key: "order",
      minWidth: 140,
      render: (_, r) => r.sale?.orderNumber || r.sale?.orderId || "—",
    },
    {
      title: "Sold Date",
      key: "soldAt",
      minWidth: 160,
      render: (_, r) => fmtDate(r.sale?.soldAt),
    },
    {
      title: "Sale Price",
      key: "price",
      minWidth: 100,
      render: (_, r) => <strong>{money(r.sale?.price, r.sale?.currency)}</strong>,
    },
    {
      title: "Buyer",
      key: "buyer",
      minWidth: 160,
      render: (_, r) => (
        <div>
          {r.sale?.buyerName || r.sale?.buyerUsername || "—"}
          {r.sale?.buyerEmail && (
            <div style={{ fontSize: 12, color: "#999" }}>{r.sale.buyerEmail}</div>
          )}
        </div>
      ),
    },
    {
      title: "Payment",
      key: "payment",
      minWidth: 100,
      render: (_, r) => r.sale?.paymentStatus || "—",
    },
    {
      title: "Shipping",
      key: "shipping",
      minWidth: 140,
      render: (_, r) => (
        <div>
          {r.sale?.shippingStatus || "—"}
          {r.sale?.trackingNumber && (
            <div style={{ fontSize: 12, color: "#999" }}>
              {r.sale.carrier ? `${r.sale.carrier} ` : ""}
              {r.sale.trackingNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Alerts",
      key: "alerts",
      minWidth: 150,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          {r.saleConflicts?.length > 0 && (
            <Tooltip title="This part was sold again in another order after it was already sold.">
              <Tag color="red" icon={<WarningOutlined />}>
                Sold twice
              </Tag>
            </Tooltip>
          )}
          {r.alsoListedOn && (
            <Tooltip
              title={`This part also has a ${CHANNEL[r.alsoListedOn.channel]?.label} listing (${r.alsoListedOn.listingId}). Check it is no longer for sale there.`}
            >
              <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                Check {CHANNEL[r.alsoListedOn.channel]?.label}
              </Tag>
            </Tooltip>
          )}
          {!r.saleConflicts?.length && !r.alsoListedOn && <span style={{ color: "#999" }}>—</span>}
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 90,
      render: (_, r) => (
        <Button size="small" type="primary" onClick={() => openDetail(r)}>
          Details
        </Button>
      ),
    },
  ];

  const s = detail?.sale || {};
  const order = s.orderRef && typeof s.orderRef === "object" ? s.orderRef : null;

  return (
    <>
      <TitleBox
        title="Sold Products"
        routes={["Car Parts Inventory", "Sold Products"]}
        current="Sold Products"
      />
      <PageContentWrapper>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} md={6}>
            <Card size="small">
              <Statistic title="Total sold" value={summary?.total ?? 0} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" hoverable onClick={() => setChannel("ebay")}>
              <Statistic
                title="Sold on eBay"
                value={summary?.ebay?.count ?? 0}
                suffix={<span style={{ fontSize: 13, color: "#999" }}>{money(summary?.ebay?.revenue ?? 0)}</span>}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" hoverable onClick={() => setChannel("wix")}>
              <Statistic
                title="Sold on Wix"
                value={summary?.wix?.count ?? 0}
                suffix={<span style={{ fontSize: 13, color: "#999" }}>{money(summary?.wix?.revenue ?? 0)}</span>}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card size="small" hoverable onClick={() => setOnlyConflicts(true)}>
              <Statistic
                title="Sold twice (needs attention)"
                value={summary?.conflicts ?? 0}
                valueStyle={summary?.conflicts ? { color: "#ff4d4f" } : undefined}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="Parts sold on eBay & Wix"
          extra={
            <Button type="primary" icon={<SyncOutlined spin={syncing} />} loading={syncing} onClick={handleSync}>
              Sync now
            </Button>
          }
        >
          <Space direction="vertical" size={4} style={{ width: "100%", marginBottom: 12 }}>
            <SyncLine name="ebay" sync={summary?.sync?.ebay} />
            <SyncLine name="wix" sync={summary?.sync?.wix} />
          </Space>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
            <Segmented
              value={channel}
              onChange={setChannel}
              options={[
                { label: "All", value: "all" },
                { label: "eBay", value: "ebay" },
                { label: "Wix", value: "wix" },
              ]}
            />
            <Space.Compact style={{ minWidth: 320, flex: 1, maxWidth: 520 }}>
              <Input
                allowClear
                placeholder="Search part, VIN, SKU, order #, buyer…"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (!e.target.value) setSearch("");
                }}
                onPressEnter={() => setSearch(searchInput)}
              />
              <Button icon={<SearchOutlined />} onClick={() => setSearch(searchInput)}>
                Search
              </Button>
            </Space.Compact>
            <DatePicker.RangePicker value={dateRange} onChange={setDateRange} placeholder={["Sold from", "Sold to"]} />
            <Checkbox checked={onlyConflicts} onChange={(e) => setOnlyConflicts(e.target.checked)}>
              Only sold twice
            </Checkbox>
          </div>

          <Table
            rowKey="_id"
            columns={columns}
            dataSource={rows}
            loading={loading}
            size="small"
            bordered
            tableLayout="auto"
            className="dark-table"
            scroll={{ x: "max-content", y: "calc(100vh - 520px)" }}
            locale={{ emptyText: <Empty description="No sold parts yet" /> }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} sold parts`,
              onChange: (p, ps) => loadRows(p, ps),
            }}
          />
        </Card>

        <Drawer
          title={detail ? `${prettyPart(detail.partName)} — sold on ${CHANNEL[s.channel]?.label || "—"}` : "Sold part"}
          open={Boolean(detail)}
          onClose={() => setDetail(null)}
          width={640}
          loading={detailLoading}
        >
          {detail && (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {detail.saleConflicts?.length > 0 && (
                <Alert
                  type="error"
                  showIcon
                  message="This part was sold more than once"
                  description={
                    <div>
                      {detail.saleConflicts.map((c, i) => (
                        <div key={i}>
                          Also sold on {CHANNEL[c.channel]?.label || c.channel} — order {c.orderNumber || c.orderId}
                          {c.buyerName ? ` to ${c.buyerName}` : ""} ({fmtDate(c.soldAt)})
                        </div>
                      ))}
                      <div style={{ marginTop: 6 }}>Contact one of the buyers to cancel/refund.</div>
                    </div>
                  }
                />
              )}
              {detail.alsoListedOn && (
                <Alert
                  type="warning"
                  showIcon
                  message={`Check the ${CHANNEL[detail.alsoListedOn.channel]?.label} listing`}
                  description={`This part also has a ${CHANNEL[detail.alsoListedOn.channel]?.label} listing (${detail.alsoListedOn.listingId}). Make sure it is no longer for sale there.`}
                />
              )}

              <Descriptions title="Sale" bordered size="small" column={1}>
                <Descriptions.Item label="Sold on"><ChannelTag channel={s.channel} /></Descriptions.Item>
                <Descriptions.Item label="Order number">{s.orderNumber || "—"}</Descriptions.Item>
                <Descriptions.Item label="Marketplace order ID">{s.orderId || "—"}</Descriptions.Item>
                <Descriptions.Item label="Sold date">{fmtDate(s.soldAt)}</Descriptions.Item>
                <Descriptions.Item label="Sale price">{money(s.price, s.currency)}</Descriptions.Item>
                {order?.total !== undefined && (
                  <Descriptions.Item label="Order total">{money(order.total, order.currency)}</Descriptions.Item>
                )}
                <Descriptions.Item label="Quantity">{s.quantity || 1}</Descriptions.Item>
                <Descriptions.Item label="Listing">
                  {s.listingTitle || "—"}
                  {s.listingId && <div style={{ fontSize: 12, color: "#999" }}>ID: {s.listingId}</div>}
                </Descriptions.Item>
                <Descriptions.Item label="Order status">{s.orderStatus || "—"}</Descriptions.Item>
                <Descriptions.Item label="Payment">{s.paymentStatus || "—"}</Descriptions.Item>
                <Descriptions.Item label="Shipping">{s.shippingStatus || "—"}</Descriptions.Item>
                <Descriptions.Item label="Tracking">
                  {s.trackingNumber ? (
                    order?.trackingUrl ? (
                      <a href={order.trackingUrl} target="_blank" rel="noreferrer">
                        {s.carrier ? `${s.carrier} ` : ""}
                        {s.trackingNumber}
                      </a>
                    ) : (
                      `${s.carrier ? `${s.carrier} ` : ""}${s.trackingNumber}`
                    )
                  ) : (
                    "—"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Recorded in CRM">{fmtDate(s.recordedAt)}</Descriptions.Item>
              </Descriptions>

              <Descriptions title="Buyer" bordered size="small" column={1}>
                <Descriptions.Item label="Name">{s.buyerName || "—"}</Descriptions.Item>
                {s.buyerUsername && <Descriptions.Item label="eBay user">{s.buyerUsername}</Descriptions.Item>}
                <Descriptions.Item label="Email">{s.buyerEmail || "—"}</Descriptions.Item>
                <Descriptions.Item label="Phone">{s.buyerPhone || "—"}</Descriptions.Item>
                <Descriptions.Item label="Ship to">{addressLines(s.shippingAddress)}</Descriptions.Item>
              </Descriptions>

              <Descriptions title="Part" bordered size="small" column={1}>
                <Descriptions.Item label="Part">{prettyPart(detail.partName)}</Descriptions.Item>
                <Descriptions.Item label="Vehicle">{vehicleOf(detail)}</Descriptions.Item>
                <Descriptions.Item label="VIN">{detail.vin || "—"}</Descriptions.Item>
                <Descriptions.Item label="SKU">{detail.sku || "—"}</Descriptions.Item>
                <Descriptions.Item label="Location">{detail.location || "—"}</Descriptions.Item>
                <Descriptions.Item label="CRM price">{money(detail.crmPrice)}</Descriptions.Item>
                <Descriptions.Item label="Inventory status">
                  <Tag color="red">Sold — out of stock</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Space>
          )}
        </Drawer>
      </PageContentWrapper>
    </>
  );
};

export default SoldProducts;
