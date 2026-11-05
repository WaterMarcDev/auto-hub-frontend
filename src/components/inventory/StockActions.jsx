// Stock actions for one part: "Sell in store" and (admin/manager) "Adjust stock".
// Every action carries a request id, so a double-click is processed once.
import React, { useState } from "react";
import { Button, Form, Input, InputNumber, Modal, Space, message } from "antd";
import InventorySyncService, { newRequestId } from "../../services/inventorySyncService";

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
          ? await InventorySyncService.sell(part._id, { ...values, requestId })
          : await InventorySyncService.adjust(part._id, { delta: values.delta, reason: values.reason, requestId });
      const q = res.data?.quantityAvailable;
      const ebay = res.data?.ebayQuantitySync?.status === "pending" ? " · eBay update queued" : "";
      message.success(`${mode === "sell" ? "Sale recorded" : "Stock adjusted"} — now ${q ?? "?"} in stock${ebay}`);
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
              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[{ required: true }, { type: "number", min: 1, max: available, message: `1 – ${available}` }]}
              >
                <InputNumber min={1} max={available} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Sale price ($)" name="price">
                <InputNumber min={0} precision={2} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Buyer name" name="buyerName">
                <Input />
              </Form.Item>
              <Form.Item label="Buyer phone" name="buyerPhone">
                <Input />
              </Form.Item>
              <Form.Item label="Note" name="note">
                <Input.TextArea rows={2} />
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
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="Reason" name="reason" rules={[{ required: true, message: "A reason is required" }]}>
                <Input placeholder="e.g. found during stock count, damaged in yard" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default StockActions;
