import React, { useEffect, useMemo, useState } from "react";
import { Modal, Table, Checkbox, InputNumber, Input, Button, Alert, Tag, Typography, message } from "antd";
import { carIntakeAPI, elementAPI } from "../../utils/api";

const { Text } = Typography;

/**
 * Extract Elements popup used by the scrap workflow.
 *
 *   mode="scrap"    Ready To Scrap → Move To Scrapped (elements + remarks)
 *   mode="backfill" Scrap Car List → Add Elements for a car scrapped without any
 *
 * Also lists the car's parts still in inventory: parts ticked as "went to the
 * crusher" are taken out of inventory; unticked parts (pulled from the car)
 * stay in inventory for sale.
 */
// Part keys are stored in camelCase (e.g. "acCompressor") → "Ac Compressor".
const toTitle = (s) => String(s || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (c) => c.toUpperCase());

const ExtractElementsModal = ({ open, car, mode = "scrap", onCancel, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [elements, setElements] = useState([]);
  const [rows, setRows] = useState({});
  const [parts, setParts] = useState([]);
  const [removePartIds, setRemovePartIds] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open || !car?._id) return;
    let cancelled = false;
    setLoading(true);
    setSubmitted(false);
    setRemarks("");
    setRemovePartIds([]);

    Promise.all([elementAPI.getAll({ page: 1, limit: 200 }), carIntakeAPI.getScrapDetails(car._id)])
      .then(([elRes, detailRes]) => {
        if (cancelled) return;
        const list = elRes.data?.elements || elRes.data || [];
        setElements(list);
        const initial = {};
        list.forEach((el) => {
          initial[el._id] = { selected: false, unit: 1, weight: el.weight || "", quality: "", dimensions: el.dimensions || "" };
        });
        setRows(initial);
        setParts(detailRes.data?.data?.keptParts || []);
      })
      .catch((err) => message.error(`Failed to load elements: ${err.response?.data?.message || err.message}`))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [open, car?._id]);

  const setRow = (id, patch) => setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  const selected = useMemo(() => elements.filter((el) => rows[el._id]?.selected), [elements, rows]);
  const missingWeight = (id) => {
    const w = Number(rows[id]?.weight);
    return rows[id]?.selected && !(Number.isFinite(w) && w > 0);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (selected.length === 0) return message.error("Select at least one extracted element.");
    if (selected.some((el) => missingWeight(el._id))) return message.error("Weight is required for every selected element.");

    const payload = {
      elements: selected.map((el) => ({
        elementName: el.name,
        unit: rows[el._id].unit || 1,
        weight: Number(rows[el._id].weight),
        quality: rows[el._id].quality || undefined,
        dimensions: rows[el._id].dimensions || undefined,
      })),
      removePartIds,
    };

    setSaving(true);
    try {
      if (mode === "scrap") {
        await carIntakeAPI.moveToScrapped(car._id, { ...payload, scrapRemarks: remarks });
        message.success("Elements saved and car moved to Scrapped");
      } else {
        await carIntakeAPI.addScrapElements(car._id, payload);
        message.success("Elements added");
      }
      onDone?.();
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const elementColumns = [
    {
      title: "Select",
      key: "select",
      width: 70,
      render: (_, el) => <Checkbox checked={!!rows[el._id]?.selected} onChange={(e) => setRow(el._id, { selected: e.target.checked })} />,
    },
    { title: "Element", dataIndex: "name", key: "name" },
    {
      title: "Unit",
      key: "unit",
      width: 100,
      render: (_, el) => <InputNumber min={1} precision={0} value={rows[el._id]?.unit} onChange={(v) => setRow(el._id, { unit: v || 1 })} />,
    },
    {
      title: "Weight",
      key: "weight",
      width: 140,
      render: (_, el) => {
        const error = submitted && missingWeight(el._id);
        return (
          <>
            <Input
              type="number"
              min={0}
              value={rows[el._id]?.weight}
              status={error ? "error" : ""}
              placeholder={rows[el._id]?.selected ? "Required" : "Enter weight"}
              onChange={(e) => setRow(el._id, { weight: e.target.value })}
            />
            {error && <div style={{ color: "#ff4d4f", fontSize: 12 }}>Required</div>}
          </>
        );
      },
    },
    {
      title: "Quality",
      key: "quality",
      render: (_, el) => <Input value={rows[el._id]?.quality} onChange={(e) => setRow(el._id, { quality: e.target.value })} />,
    },
    {
      title: "Dimensions",
      key: "dimensions",
      render: (_, el) => <Input value={rows[el._id]?.dimensions} onChange={(e) => setRow(el._id, { dimensions: e.target.value })} />,
    },
  ];

  const partColumns = [
    {
      title: "Went to crusher",
      key: "remove",
      width: 130,
      render: (_, p) => (
        <Checkbox
          checked={removePartIds.includes(p._id)}
          onChange={(e) => setRemovePartIds((prev) => (e.target.checked ? [...prev, p._id] : prev.filter((id) => id !== p._id)))}
        />
      ),
    },
    { title: "Part", dataIndex: "partName", key: "partName", render: toTitle },
    {
      title: "Listed on",
      key: "listed",
      render: (_, p) => (
        <>
          {p.ebayListingId && <Tag color="blue">eBay</Tag>}
          {p.wixProductId && <Tag color="purple">Wix</Tag>}
        </>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={`${mode === "scrap" ? "Move To Scrapped — Extract Elements" : "Add Extracted Elements"}${car?.vin ? ` · ${car.vin}` : ""}`}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      destroyOnHidden
    >
      <Text strong>1. Elements extracted from this car</Text>
      <Table
        dataSource={elements}
        rowKey="_id"
        columns={elementColumns}
        loading={loading}
        pagination={false}
        size="small"
        bordered
        scroll={{ y: 260 }}
        locale={{ emptyText: "No elements configured — add them under Add Scrap Elements" }}
        style={{ margin: "8px 0 16px" }}
      />

      <Text strong>2. Parts still in inventory</Text>
      <div style={{ margin: "4px 0 8px" }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Tick only the parts that went to the crusher with the car — they are removed from inventory. Unticked parts were pulled
          from the car and stay in inventory.
        </Text>
      </div>
      {removePartIds.some((id) => parts.find((p) => p._id === id && (p.ebayListingId || p.wixProductId))) && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 8 }}
          message="Some ticked parts are listed on eBay/Wix. They will be flagged for removal on the car's scrap details — end those listings manually."
        />
      )}
      <Table
        dataSource={parts}
        rowKey="_id"
        columns={partColumns}
        loading={loading}
        pagination={false}
        size="small"
        bordered
        scroll={{ y: 200 }}
        locale={{ emptyText: "No parts of this car are in inventory" }}
        style={{ marginBottom: 16 }}
      />

      {mode === "scrap" && (
        <>
          <Text strong>3. Remarks (optional)</Text>
          <Input.TextArea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter scrap remarks..." style={{ marginTop: 4 }} />
        </>
      )}

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button type="primary" danger={mode === "scrap"} loading={saving} disabled={loading} onClick={handleSubmit}>
          {mode === "scrap" ? `Save & Move To Scrapped (${selected.length})` : `Save Elements (${selected.length})`}
        </Button>
      </div>
    </Modal>
  );
};

export default ExtractElementsModal;
