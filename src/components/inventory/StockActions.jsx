// Stock actions for one part: "Sell in store" and (admin/manager) "Adjust stock".
// Every action carries a request id, so a double-click is processed once.
import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Input, InputNumber, Modal, Select, Space, Spin, message } from "antd";
import InventorySyncService, { newRequestId } from "../../services/inventorySyncService";
import { assetTagsAPI } from "../../utils/api";
import { formatPhoneNumber, US_PHONE_MAX_LENGTH, US_PHONE_REGEX } from "../../utils/phone";
import UnitInput from "../UnitInput";
import {
  MAX_SALE_PRICE,
  TEXT_LIMITS,
  buyerNameRules,
  cleanText,
  optionalTextRules,
  priceRule,
} from "./fieldRules";

// Every free asset tag from the Asset Tags module (codes like AUT000123),
// searchable. Tags are loaded a page at a time as the list is scrolled, so
// all of them can be reached without typing.
const TAG_PAGE_SIZE = 50;

const FreeAssetTagSelect = ({ value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const query = useRef({ search: "", page: 0, pages: 1, seq: 0 });

  // page 1 replaces the list; later pages are appended.
  const load = async (search, page) => {
    const seq = ++query.current.seq;
    query.current.search = search;
    setLoading(true);
    try {
      const res = await assetTagsAPI.available({ page, limit: TAG_PAGE_SIZE, search });
      if (seq !== query.current.seq) return; // a newer search started
      const tags = res.data?.tags || [];
      const next = tags.map((t) => ({ value: t.barcodeString, label: t.barcodeString }));
      query.current.page = page;
      query.current.pages = res.data?.pagination?.pages || 1;
      setTotal(res.data?.pagination?.total ?? next.length);
      setOptions((prev) => (page === 1 ? next : [...prev, ...next]));
    } catch {
      if (seq === query.current.seq && page === 1) setOptions([]);
    } finally {
      if (seq === query.current.seq) setLoading(false);
    }
  };

  useEffect(() => {
    load("", 1);
    return () => clearTimeout(timer.current);
  }, []);

  const loadMore = (e) => {
    const el = e.target;
    const { page, pages, search } = query.current;
    if (!loading && page < pages && el.scrollTop + el.offsetHeight >= el.scrollHeight - 24) {
      load(search, page + 1);
    }
  };

  return (
    <Select
      showSearch
      allowClear
      value={value}
      onChange={onChange}
      placeholder={`Select an asset tag (${total} free)`}
      filterOption={false}
      onSearch={(q) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => load(q.trim(), 1), 300);
      }}
      onPopupScroll={loadMore}
      loading={loading}
      notFoundContent={loading ? <Spin size="small" /> : "No free asset tags. Generate tags in Asset Tags first."}
      options={options}
      popupRender={(menu) => (
        <>
          {menu}
          <div style={{ padding: "4px 12px", fontSize: 12, color: "#888" }}>
            Showing {options.length} of {total} free tags
          </div>
        </>
      )}
    />
  );
};

const StockActions = ({ part, canAdjust, onDone, size = "small" }) => {
  const [mode, setMode] = useState(null); // "sell" | "adjust"
  const [saving, setSaving] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [form] = Form.useForm();
  const available = part?.quantityAvailable ?? 1;

  const open = (m) => {
    form.resetFields();
    setRequestId(newRequestId());
    setMode(m);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const res =
        mode === "sell"
          ? await InventorySyncService.sell(part._id, {
              ...values,
              // Optional text is trimmed; blank / spaces-only is not sent.
              buyerName: cleanText(values.buyerName),
              note: cleanText(values.note),
              requestId,
            })
          : await InventorySyncService.adjust(part._id, {
              delta: values.delta,
              reason: cleanText(values.reason),
              requestId,
            });
      const q = res.data?.quantityAvailable;
      const ebay = res.data?.ebayQuantitySync?.status === "pending" ? " · eBay update queued" : "";
      message.success(`${mode === "sell" ? "Sale recorded" : "Stock adjusted"} — now ${q ?? "?"} in stock${ebay}`);
      if (res.warning) message.warning(res.warning);
      setMode(null);
      onDone?.();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || err.message || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Space size={4}>
        <Button size={size} type="primary" disabled={available <= 0} onClick={() => open("sell")}>
          Sell in store
        </Button>
        {canAdjust && (
          <Button size={size} onClick={() => open("adjust")}>
            Adjust
          </Button>
        )}
      </Space>

      <Modal
        title={mode === "sell" ? `Sell in store — ${available} in stock` : `Adjust stock — currently ${available}`}
        open={Boolean(mode)}
        onOk={submit}
        okText={mode === "sell" ? "Record sale" : "Save adjustment"}
        confirmLoading={saving}
        onCancel={() => setMode(null)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ quantity: 1, delta: 1 }}>
          {mode === "sell" ? (
            <>
              {/* Whole numbers only, 1 to the stock on hand (server max 100). */}
              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[
                  { required: true, message: "Enter the quantity sold" },
                  {
                    type: "integer",
                    min: 1,
                    max: Math.min(available, 100),
                    message: `Enter a whole number from 1 to ${Math.min(available, 100)}`,
                  },
                ]}
              >
                <UnitInput min={1} max={Math.min(available, 100)} style={{ width: "100%" }} />
              </Form.Item>
              {/* Optional; 0 – 1,000,000, up to 2 decimals. */}
              <Form.Item label="Sale price ($)" name="price" rules={[priceRule]}>
                <InputNumber
                  min={0}
                  max={MAX_SALE_PRICE}
                  precision={2}
                  maxLength={10}
                  placeholder="0.00"
                  style={{ width: "100%" }}
                  onKeyDown={(e) => {
                    // No "-", "+", "e" or letters.
                    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !/[\d.]/.test(e.key)) e.preventDefault();
                  }}
                />
              </Form.Item>
              <Form.Item label="Buyer name" name="buyerName" rules={buyerNameRules}>
                <Input maxLength={TEXT_LIMITS.buyerName} placeholder="Optional" />
              </Form.Item>
              {/* Optional; when entered it must be a 10-digit US number,
                  formatted as (XXX) XXX-XXXX while typing. */}
              <Form.Item
                label="Buyer phone"
                name="buyerPhone"
                normalize={(value, prevValue) => formatPhoneNumber(value, prevValue || "")}
                rules={[
                  {
                    validator: (_, value) =>
                      !value || US_PHONE_REGEX.test(value)
                        ? Promise.resolve()
                        : Promise.reject(new Error("Enter a 10-digit US phone number: (XXX) XXX-XXXX")),
                  },
                ]}
              >
                <Input
                  placeholder="(XXX) XXX-XXXX"
                  maxLength={US_PHONE_MAX_LENGTH}
                  inputMode="tel"
                />
              </Form.Item>
              {/* Asset tag (required): a part that already has one keeps it;
                  otherwise a free tag from the Asset Tags module must be picked. */}
              {part?.assetTag ? (
                <Form.Item label="Asset Tag">
                  <Input value={part.assetTag} disabled />
                </Form.Item>
              ) : (
                <Form.Item
                  label="Asset Tag"
                  name="assetTag"
                  rules={[{ required: true, message: "Select an asset tag to sell this part" }]}
                >
                  <FreeAssetTagSelect />
                </Form.Item>
              )}
              <Form.Item
                label="Note"
                name="note"
                rules={optionalTextRules("Note", TEXT_LIMITS.saleNote)}
              >
                <Input.TextArea rows={2} maxLength={TEXT_LIMITS.saleNote} showCount />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                label="Change (+ adds stock, − removes)"
                name="delta"
                rules={[
                  { required: true },
                  {
                    validator: (_, v) =>
                      v && Math.abs(v) <= 100 && available + v >= 0
                        ? Promise.resolve()
                        : Promise.reject(new Error("Must be non-zero, max ±100, and not below 0")),
                  },
                ]}
              >
                <InputNumber precision={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Reason"
                name="reason"
                rules={[
                  { required: true, whitespace: true, message: "A reason is required" },
                  { max: TEXT_LIMITS.adjustReason, message: `Reason must be at most ${TEXT_LIMITS.adjustReason} characters` },
                ]}
              >
                <Input
                  maxLength={TEXT_LIMITS.adjustReason}
                  placeholder="e.g. found during stock count, damaged in yard"
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default StockActions;
