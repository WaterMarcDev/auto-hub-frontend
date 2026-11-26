import React, { useEffect, useMemo, useState } from "react";
import { Modal, Table, Checkbox, Input, Select, Button, Alert, Tag, Typography, message } from "antd";
import { carIntakeAPI, elementAPI } from "../../utils/api";
import UnitInput from "../UnitInput";
import NumericInput from "../NumericInput";

const { Text } = Typography;

// Same rules as the server (auto-hub-backend/services/carScrap.service.js).
const QUALITY_OPTIONS = ["Good", "Average", "OK", "Broken", "Scratches"];
const MAX_WEIGHT = 15000; // lb
const MAX_UNIT = 10000;
const MAX_DIMENSIONS = 100;
const MAX_REMARKS = 1000;
const WEIGHT_PATTERN = /^(\d+(\.\d{1,2})?|\.\d{1,2})$/;
const DIMENSIONS_PATTERN = /^[A-Za-z0-9 .,*/"'()×]+$/;

const weightError = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "Required";
  if (!WEIGHT_PATTERN.test(text) || !(Number(text) > 0)) return "Must be greater than 0, max 2 decimals";
  if (Number(text) > MAX_WEIGHT) return `Max ${MAX_WEIGHT.toLocaleString("en-US")}`;
  return null;
};

const dimensionsError = (value) => {
  const raw = String(value ?? "");
  const text = raw.trim();
  if (!raw) return null;
  if (!text) return "Cannot be only spaces";
  if (text.length > MAX_DIMENSIONS) return `Max ${MAX_DIMENSIONS} characters`;
  if (!DIMENSIONS_PATTERN.test(text)) return "Letters, numbers, spaces and . , x * / \" ' ( ) only — no negative numbers";
  return null;
};

const FieldError = ({ children }) => (children ? <div style={{ color: "#ff4d4f", fontSize: 12 }}>{children}</div> : null);

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
          initial[el._id] = {
            selected: false,
            unit: 1,
            weight: el.weight ? String(el.weight) : "",
            quality: undefined,
            dimensions: el.dimensions || "",
          };
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
  // Errors are checked for selected rows only (unselected rows are not saved).
  const rowErrors = (id) => {
    const row = rows[id];
    if (!row?.selected) return {};
    const unit = Number(row.unit);
    return {
      weight: weightError(row.weight),
      unit: Number.isInteger(unit) && unit >= 1 && unit <= MAX_UNIT ? null : `1 to ${MAX_UNIT.toLocaleString("en-US")}`,
      dimensions: dimensionsError(row.dimensions),
    };
  };
  const hasRowError = (id) => Object.values(rowErrors(id)).some(Boolean);
  const remarksTrimmed = remarks.trim();
  const remarksError = remarksTrimmed.length > MAX_REMARKS ? `Remarks must be at most ${MAX_REMARKS} characters` : null;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (selected.length === 0) return message.error("Select at least one extracted element.");
    if (selected.some((el) => hasRowError(el._id))) return message.error("Fix the highlighted fields of the selected elements.");
    if (mode === "scrap" && remarksError) return message.error(remarksError);

    const payload = {
      elements: selected.map((el) => {
        const dims = String(rows[el._id].dimensions ?? "").trim().replace(/\s+/g, " ");
        return {
          elementName: el.name,
          unit: rows[el._id].unit || 1,
          weight: Number(String(rows[el._id].weight).trim()),
          quality: rows[el._id].quality || undefined,
          dimensions: dims || undefined,
        };
      }),
      removePartIds,
    };

    setSaving(true);
    try {
      if (mode === "scrap") {
        await carIntakeAPI.moveToScrapped(car._id, { ...payload, scrapRemarks: remarksTrimmed });
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
      render: (_, el) => {
        const error = submitted && rowErrors(el._id).unit;
        return (
          <>
            <UnitInput
              min={1}
              max={MAX_UNIT}
              value={rows[el._id]?.unit}
              status={error ? "error" : ""}
              onChange={(v) => setRow(el._id, { unit: v || 1 })}
            />
            <FieldError>{error}</FieldError>
          </>
        );
      },
    },
    {
      title: "Weight",
      key: "weight",
      width: 140,
      render: (_, el) => {
        const error = submitted && rowErrors(el._id).weight;
        return (
          <>
            <NumericInput
              value={rows[el._id]?.weight}
              status={error ? "error" : ""}
              maxLength={8}
              placeholder={rows[el._id]?.selected ? "Required" : "Enter weight"}
              onChange={(v) => setRow(el._id, { weight: v })}
            />
            <FieldError>{error}</FieldError>
          </>
        );
      },
    },
    {
      title: "Quality",
      key: "quality",
      width: 140,
      render: (_, el) => (
        <Select
          allowClear
          placeholder="Select"
          style={{ width: "100%" }}
          value={rows[el._id]?.quality || undefined}
          onChange={(v) => setRow(el._id, { quality: v })}
          options={QUALITY_OPTIONS.map((q) => ({ value: q, label: q }))}
        />
      ),
    },
    {
      title: "Dimensions",
      key: "dimensions",
      render: (_, el) => {
        const error = submitted && rowErrors(el._id).dimensions;
        return (
          <>
            <Input
              value={rows[el._id]?.dimensions}
              maxLength={MAX_DIMENSIONS}
              status={error ? "error" : ""}
              placeholder='e.g. 10 x 5 x 2"'
              onChange={(e) => setRow(el._id, { dimensions: e.target.value })}
            />
            <FieldError>{error}</FieldError>
          </>
        );
      },
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
          <Input.TextArea
            rows={3}
            value={remarks}
            maxLength={MAX_REMARKS}
            showCount
            status={remarksError ? "error" : ""}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter scrap remarks..."
            style={{ marginTop: 4 }}
          />
          <FieldError>{remarksError}</FieldError>
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
