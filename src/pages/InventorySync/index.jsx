// Inventory Sync — one place to run and check eBay ↔ CRM stock sync:
//   Returns            receive returned parts and pass/fail inspection (restocks only on pass)
//   eBay updates       CRM → eBay quantity pushes; failed/given-up ones can be retried
//   eBay notifications order webhooks that failed processing; retry
//   Reconciliation     CRM vs eBay differences (report only — CRM is never overwritten)
//   Stock ledger       every stock change with before/after quantity and reason
// Refreshes live when stock changes (Socket.IO "inventorySync" scope).
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Empty, Input, Modal, Select, Space, Table, Tabs, Tag, Tooltip, message } from "antd";
import { ReloadOutlined, SyncOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import InventorySyncService from "../../services/inventorySyncService";
import { cacheManager } from "../../utils/cacheManager";

const fmt = (d) => (d ? dayjs(d).format("MMM D, YYYY h:mm A") : "—");
const prettyPart = (t) =>
  !t ? "—" : String(t).replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (s) => s.toUpperCase()).trim();
const errMsg = (e) => e?.response?.data?.message || e?.message || "Request failed";

const RETURN_TAG = {
  requested: ["orange", "Return requested"],
  in_transit: ["blue", "On its way back"],
  delivered: ["purple", "Delivered — confirm receipt"],
  received: ["gold", "Received — inspect"],
  inspection_passed: ["green", "Passed — restocked"],
  inspection_failed: ["red", "Failed inspection"],
  closed: ["default", "Closed on eBay"],
};
const SYNC_TAG = { pending: "processing", synced: "success", failed: "warning", dead: "error", skipped: "default" };
const EVENT_TAG = { received: "processing", processing: "processing", done: "success", ignored: "default", failed: "warning", dead: "error" };
const ISSUE_LABEL = {
  quantity_mismatch: "Quantity differs (CRM vs eBay)",
  unavailable_but_listed: "Out of stock in CRM but still for sale on eBay",
  missing_listing: "Published in CRM but no active eBay listing",
  failed_quantity_sync: "eBay quantity updates failing",
  failed_events: "eBay notifications failing",
  unmatched_order_lines: "eBay sales not matched to a CRM part",
  returns_awaiting_staff: "Returns waiting for staff",
  sold_twice: "Parts sold twice",
};

const InventorySync = () => {
  const [tab, setTab] = useState("returns");
  const [summary, setSummary] = useState(null);
  const [returns, setReturns] = useState([]);
  const [sync, setSync] = useState([]);
  const [events, setEvents] = useState([]);
  const [report, setReport] = useState(null);
  const [ledger, setLedger] = useState({ data: [], pagination: { page: 1, limit: 50, total: 0 } });
  const [ledgerSource, setLedgerSource] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null);
  const [inspect, setInspect] = useState(null); // { part, result }
  const [notes, setNotes] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      setSummary((await InventorySyncService.summary()).data);
    } catch {
      /* badge counts are optional */
    }
  }, []);

  const loadTab = useCallback(
    async (which = tab, page = 1) => {
      setLoading(true);
      try {
        if (which === "returns") setReturns((await InventorySyncService.returns()).data || []);
        if (which === "ebay") setSync((await InventorySyncService.ebaySync()).data || []);
        if (which === "events") setEvents((await InventorySyncService.events()).data || []);
        if (which === "reconciliation") setReport((await InventorySyncService.reconciliation()).data);
        if (which === "ledger") {
          const res = await InventorySyncService.transactions({ page, limit: 50, source: ledgerSource });
          setLedger({ data: res.data || [], pagination: res.pagination });
        }
      } catch (e) {
        message.error(errMsg(e));
      } finally {
        setLoading(false);
      }
    },
    [tab, ledgerSource]
  );

  useEffect(() => {
    loadSummary();
    loadTab(tab);
  }, [tab, loadTab, loadSummary]);

  useEffect(() => {
    const unsub = cacheManager.subscribe("inventorySync", () => {
      loadSummary();
      loadTab(tab);
    });
    return () => unsub && unsub();
  }, [tab, loadTab, loadSummary]);

  const act = async (key, fn, ok) => {
    setBusy(key);
    try {
      await fn();
      if (ok) message.success(ok);
      loadSummary();
      loadTab(tab);
    } catch (e) {
      message.error(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  const doInspection = async () => {
    const { part, result } = inspect;
    await act(`insp-${part._id}`, () => InventorySyncService.inspection(part._id, result, notes), result === "pass" ? "Approved — part is back in stock" : "Marked as failed — not restocked");
    setInspect(null);
    setNotes("");
  };

  const returnColumns = [
    { title: "Part", key: "part", render: (_, r) => <div><strong>{prettyPart(r.partName)}</strong><div style={{ fontSize: 12, color: "#999" }}>{[r.year, r.make?.name, r.model?.name].filter(Boolean).join(" ")} · {r.vin}</div></div> },
    { title: "Sold on", key: "ch", render: (_, r) => r.sale?.channel ? <Tag>{r.sale.channel === "crm" ? "In store" : r.sale.channel === "ebay" ? "eBay" : "Wix"}</Tag> : "—" },
    { title: "Order #", key: "o", render: (_, r) => r.sale?.orderNumber || r.returnInfo?.orderId || "—" },
    { title: "eBay return", key: "rid", render: (_, r) => r.returnInfo?.returnId ? <span>{r.returnInfo.returnId}<div style={{ fontSize: 12, color: "#999" }}>{r.returnInfo.ebayState}</div></span> : "—" },
    { title: "Status", key: "st", render: (_, r) => { const [c, l] = RETURN_TAG[r.returnInfo?.status] || ["default", r.returnInfo?.status]; return <Tag color={c}>{l}</Tag>; } },
    { title: "In stock", key: "q", render: (_, r) => r.quantityAvailable ?? 1 },
    { title: "Updated", key: "u", render: (_, r) => fmt(r.returnInfo?.updatedAt) },
    {
      title: "Action",
      key: "a",
      fixed: "right",
      render: (_, r) => {
        const st = r.returnInfo?.status;
        if (st === "received") {
          return (
            <Space size={4}>
              <Button size="small" type="primary" onClick={() => setInspect({ part: r, result: "pass" })}>Pass — restock</Button>
              <Button size="small" danger onClick={() => setInspect({ part: r, result: "fail" })}>Fail</Button>
            </Space>
          );
        }
        return (
          <Tooltip title="Only when the part is physically back in the yard. A refund alone never restocks.">
            <Button size="small" loading={busy === `rcv-${r._id}`} onClick={() => act(`rcv-${r._id}`, () => InventorySyncService.returnReceived(r._id), "Marked as received — now inspect it")}>
              Mark received
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  const syncColumns = [
    { title: "Part", key: "p", render: (_, r) => <div><strong>{prettyPart(r.partName)}</strong><div style={{ fontSize: 12, color: "#999" }}>{r.vin}</div></div> },
    { title: "eBay item", dataIndex: "ebayListingId", key: "l" },
    { title: "CRM qty", key: "q", render: (_, r) => r.quantityAvailable ?? 1 },
    { title: "Status", key: "s", render: (_, r) => <Badge status={SYNC_TAG[r.ebayQuantitySync?.status] || "default"} text={r.ebayQuantitySync?.status} /> },
    { title: "Why queued", key: "why", render: (_, r) => r.ebayQuantitySync?.reason || "—" },
    { title: "Attempts", key: "at", render: (_, r) => r.ebayQuantitySync?.attempts ?? 0 },
    { title: "Next try", key: "n", render: (_, r) => fmt(r.ebayQuantitySync?.nextAttemptAt) },
    { title: "Error", key: "e", render: (_, r) => <span style={{ color: "#ff7875", fontSize: 12 }}>{r.ebayQuantitySync?.lastError || "—"}</span> },
    { title: "Action", key: "a", fixed: "right", render: (_, r) => ["failed", "dead"].includes(r.ebayQuantitySync?.status) ? <Button size="small" loading={busy === `rs-${r._id}`} onClick={() => act(`rs-${r._id}`, () => InventorySyncService.retryEbaySync(r._id), "Queued for retry")}>Retry</Button> : null },
  ];

  const eventColumns = [
    { title: "Received", key: "c", render: (_, r) => fmt(r.createdAt) },
    { title: "Topic", dataIndex: "topic", key: "t" },
    { title: "eBay order", dataIndex: "orderId", key: "o" },
    { title: "Status", key: "s", render: (_, r) => <Badge status={EVENT_TAG[r.status] || "default"} text={r.status} /> },
    { title: "Attempts", dataIndex: "attempts", key: "a" },
    { title: "Error", key: "e", render: (_, r) => <span style={{ color: "#ff7875", fontSize: 12 }}>{r.lastError || "—"}</span> },
    { title: "Action", key: "x", fixed: "right", render: (_, r) => ["failed", "dead"].includes(r.status) ? <Button size="small" loading={busy === `ev-${r._id}`} onClick={() => act(`ev-${r._id}`, () => InventorySyncService.retryEvent(r._id), "Queued for retry")}>Retry</Button> : null },
  ];

  const ledgerColumns = [
    { title: "When", key: "w", render: (_, r) => fmt(r.createdAt) },
    { title: "Part", key: "p", render: (_, r) => r.inventoryId ? <div>{prettyPart(r.inventoryId.partName)}<div style={{ fontSize: 12, color: "#999" }}>{r.inventoryId.vin}</div></div> : "—" },
    { title: "Source", dataIndex: "source", key: "s", render: (s) => <Tag>{s}</Tag> },
    { title: "Change", key: "c", render: (_, r) => r.type === "info" ? <Tag>no change</Tag> : <Tag color={r.type === "deduct" ? "red" : "green"}>{r.type === "deduct" ? "−" : "+"}{r.quantity}</Tag> },
    { title: "Before → After", key: "ba", render: (_, r) => (r.previousQuantity ?? "—") + " → " + (r.newQuantity ?? "—") },
    { title: "Result", dataIndex: "status", key: "st", render: (s) => <Tag color={s === "applied" ? "green" : s === "rejected" ? "red" : "default"}>{s}</Tag> },
    { title: "Order / return", key: "o", render: (_, r) => [r.orderId, r.returnId].filter(Boolean).join(" · ") || "—" },
    { title: "Reason", dataIndex: "reason", key: "r", render: (t) => <span style={{ fontSize: 12 }}>{t || "—"}</span> },
    { title: "By", key: "b", render: (_, r) => r.createdBy ? `${r.createdBy.first_name || ""} ${r.createdBy.last_name || ""}`.trim() : "system" },
  ];

  const tableProps = { size: "small", bordered: true, className: "dark-table", scroll: { x: "max-content" }, loading, rowKey: "_id" };

  const reconciliationTab = (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space>
        <Button type="primary" icon={<SyncOutlined />} loading={busy === "recon"} onClick={() => act("recon", () => InventorySyncService.runReconciliation(), "Reconciliation finished")}>
          Run now
        </Button>
        <span style={{ color: "#999" }}>
          Last run: {fmt(report?.runAt)} · runs hourly · compares with the last eBay active-listing snapshot · never changes CRM stock
        </span>
      </Space>
      {!report ? (
        <Empty description="No reconciliation run yet" />
      ) : (
        <>
          {!report.snapshotAvailable && <Alert type="warning" showIcon message="No eBay active-listing snapshot yet — quantity checks are limited until the eBay listing sync has run." />}
          {report.totalIssues === 0 && <Alert type="success" showIcon message="CRM and eBay agree — nothing needs attention." />}
          {Object.entries(report.counts || {}).filter(([, n]) => n > 0).map(([k, n]) => (
            <Card key={k} size="small" title={<span>{ISSUE_LABEL[k] || k} <Tag color="red">{n}</Tag></span>}>
              <Table
                size="small"
                pagination={{ pageSize: 10 }}
                rowKey={(r, i) => String(r.inventoryId || r.eventId || r.orderId || i)}
                dataSource={report.issues?.[k] || []}
                columns={[
                  { title: "Item", key: "i", render: (_, r) => prettyPart(r.partName) !== "—" ? `${prettyPart(r.partName)} · ${r.vin || ""}` : r.title || r.topic || r.orderNumber || r.returnId || "—" },
                  { title: "Details", key: "d", render: (_, r) => <span style={{ fontSize: 12 }}>{[r.listingId && `eBay ${r.listingId}`, r.crmQuantity !== undefined && `CRM ${r.crmQuantity}`, r.ebayQuantity !== undefined && `eBay qty ${r.ebayQuantity}`, r.status, r.reason, r.error, r.lastError].filter(Boolean).join(" · ")}</span> },
                ]}
              />
            </Card>
          ))}
        </>
      )}
    </Space>
  );

  const badge = (n) => (n ? <Badge count={n} size="small" style={{ marginLeft: 6 }} /> : null);

  return (
    <>
      <TitleBox title="Inventory Sync" routes={["Integrations", "Inventory Sync"]} current="Inventory Sync" />
      <PageContentWrapper>
        <Card
          extra={
            <Space>
              {tab === "ebay" && (
                <Button icon={<SyncOutlined />} loading={busy === "run"} onClick={() => act("run", () => InventorySyncService.runEbaySync(), "eBay updates processed")}>
                  Push queued updates now
                </Button>
              )}
              <Button icon={<ReloadOutlined />} onClick={() => { loadSummary(); loadTab(tab); }}>Refresh</Button>
            </Space>
          }
        >
          <Tabs
            activeKey={tab}
            onChange={setTab}
            items={[
              { key: "returns", label: <span>Returns{badge(summary?.returnsOpen)}</span>, children: <Table {...tableProps} columns={returnColumns} dataSource={returns} locale={{ emptyText: <Empty description="No open returns" /> }} /> },
              { key: "ebay", label: <span>eBay quantity updates{badge(summary?.failedSync)}</span>, children: <Table {...tableProps} columns={syncColumns} dataSource={sync} locale={{ emptyText: <Empty description="Nothing pending or failing" /> }} /> },
              { key: "events", label: <span>eBay notifications{badge(summary?.failedEvents)}</span>, children: <Table {...tableProps} columns={eventColumns} dataSource={events} locale={{ emptyText: <Empty description="No failed notifications" /> }} /> },
              { key: "reconciliation", label: <span>Reconciliation{badge(summary?.reconciliation?.totalIssues)}</span>, children: reconciliationTab },
              {
                key: "ledger",
                label: "Stock ledger",
                children: (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Select
                      allowClear
                      placeholder="All sources"
                      style={{ width: 240 }}
                      value={ledgerSource}
                      onChange={setLedgerSource}
                      options={["EBAY_SALE", "WIX_SALE", "CRM_SALE", "EBAY_CANCELLATION", "WIX_CANCELLATION", "EBAY_RETURN", "EBAY_RESTOCK", "MANUAL_ADJUSTMENT", "RECONCILIATION"].map((s) => ({ value: s, label: s }))}
                    />
                    <Table
                      {...tableProps}
                      columns={ledgerColumns}
                      dataSource={ledger.data}
                      pagination={{ current: ledger.pagination.page, pageSize: ledger.pagination.limit, total: ledger.pagination.total, onChange: (p) => loadTab("ledger", p) }}
                    />
                  </Space>
                ),
              },
            ]}
          />
        </Card>

        <Modal
          title={inspect?.result === "pass" ? "Approve for resale — put back in stock?" : "Fail inspection — keep out of stock?"}
          open={Boolean(inspect)}
          onOk={doInspection}
          okButtonProps={{ danger: inspect?.result === "fail" }}
          okText={inspect?.result === "pass" ? "Approve & restock" : "Mark as failed"}
          confirmLoading={busy?.startsWith("insp-")}
          onCancel={() => setInspect(null)}
        >
          <p>{prettyPart(inspect?.part?.partName)} · {inspect?.part?.vin}</p>
          <Input.TextArea rows={3} placeholder="Inspection notes (condition, damage…)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Modal>
      </PageContentWrapper>
    </>
  );
};

export default InventorySync;
