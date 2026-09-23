import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  InputNumber,
  Select,
  Modal,
  Form,
  DatePicker,
  message,
  Popconfirm,
  Tag,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  PrinterOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import ScrapPurchaseService from "../../services/scrapPurchaseApi";

const { Option } = Select;

// Predefined material options per the module's intent, plus a free "Other".
const MATERIAL_OPTIONS = [
  "Iron",
  "Metal",
  "Aluminium",
  "Copper",
  "Steel",
  "Other",
];

const MATERIAL_UNITS = "lb";

// Calculate a single material line total. Kept at module scope so it is stable
// (no re-creation per render) and reused for display, validation and payload.
const lineTotalOf = (item) => {
  const weight = Number(item?.weightLbs || 0);
  const rate = Number(item?.pricePerLb || 0);
  return Number((weight * rate).toFixed(2));
};

// True when the stored line total differs from weight × rate (a manual override).
const isLineOverridden = (item) => {
  const stored = item?.totalAmount;
  if (stored === undefined || stored === null || stored === "") return false;
  return Math.abs(Number(stored) - lineTotalOf(item)) > 0.009;
};

// US phone validation for the New Seller form. Accepts 10 digits, or 11 digits
// with a leading country code 1, allowing spaces, dashes, parentheses and a
// leading "+". Rejects any value containing letters. Mirrors the backend check
// so the user gets immediate feedback.
const isValidUsPhone = (value) => {
  if (value === undefined || value === null) return false;
  const raw = String(value).trim();
  if (!raw) return false;
  if (/[a-zA-Z]/.test(raw)) return false;
  const cleaned = raw.replace(/[\s\-().+]/g, "");
  if (!/^\d+$/.test(cleaned)) return false;
  return /^\d{10}$/.test(cleaned) || /^1\d{10}$/.test(cleaned);
};

const ScrapPurchase = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // record being edited (null = create)

  const [customers, setCustomers] = useState([]);

  // "+ New Seller" sub-modal state. Uses its own form so the main Scrap
  // Purchase form values are never disturbed while creating a seller.
  const [sellerForm] = Form.useForm();
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [savingSeller, setSavingSeller] = useState(false);

  // ── Multi-material line items ─────────────────────────────────────────────
  // One entry per selected material. This is the canonical source of truth for
  // the row inputs and is converted to the backend items[] array on save.
  const [items, setItems] = useState([]);
  // Materials currently selected in the multi-select (kept in sync with items).
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  // Any non-standard material names found on a legacy/edited record, so they
  // remain selectable and display correctly.
  const [customOptions, setCustomOptions] = useState([]);

  // Grand total override state. When true the explicitly entered Grand Total is
  // authoritative and is never overwritten by the calculated sum.
  const [totalOverridden, setTotalOverridden] = useState(false);

  const materialOptions = Array.from(
    new Set([...MATERIAL_OPTIONS, ...customOptions])
  );

  const itemsTotal = Number(
    items.reduce((acc, it) => acc + lineTotalOf(it), 0).toFixed(2)
  );

  const fetchRecords = useCallback(
    async (page = pagination.current, pageSize = pagination.pageSize, q = search) => {
      setLoading(true);
      try {
        const data = await ScrapPurchaseService.getAll({
          page,
          limit: pageSize,
          search: q || undefined,
        });
        const list = data.records || data.purchases || [];
        setRecords(list);
        setPagination((prev) => ({
          ...prev,
          current: data.pagination?.current || page,
          pageSize: data.pagination?.pageSize || pageSize,
          total: data.pagination?.total ?? list.length,
        }));
      } catch (e) {
        message.error(e.message || "Failed to load scrap purchases");
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, search]
  );

  // Load sellers from the dedicated Scrap Purchase seller API. Search is
  // server-side and matches by seller name or phone.
  const fetchCustomers = async (searchText = "") => {
    try {
      const params = {};
      if (searchText) params.search = searchText;
      const data = await ScrapPurchaseService.getSellers(params);
      setCustomers(data.sellers || []);
    } catch (e) {
      console.error("Error fetching suppliers:", e);
    }
  };

  const openSellerModal = () => {
    sellerForm.resetFields();
    setSellerModalOpen(true);
  };

  const closeSellerModal = () => {
    // Only the seller sub-form is reset; the main Scrap Purchase form values
    // (materials, weights, rates, total, supplier, payment, note) are preserved.
    setSellerModalOpen(false);
    sellerForm.resetFields();
  };

  const handleSaveSeller = async () => {
    let values;
    try {
      values = await sellerForm.validateFields();
    } catch (e) {
      return; // inline validation errors already shown
    }

    const fullName = String(values.name || "")
      .trim()
      .replace(/\s+/g, " ");
    const phone = String(values.phone || "").trim();
    if (!fullName) {
      message.error("Enter the seller name");
      return;
    }
    if (!isValidUsPhone(phone)) {
      message.error("Please enter a valid US phone number.");
      return;
    }

    setSavingSeller(true);
    try {
      // Store the seller in the dedicated ScrapPurchaseSeller collection.
      // The full name is stored verbatim — it is never split into parts and no
      // surname is ever fabricated.
      const created = await ScrapPurchaseService.createSeller({
        name: fullName,
        phone,
      });
      if (!created || !created._id) {
        throw new Error("Seller could not be created");
      }

      // Add to the dropdown without a refresh, then auto-select it. Existing
      // Scrap Purchase form values are untouched.
      setCustomers((prev) =>
        prev.some((c) => c._id === created._id)
          ? prev
          : [created, ...prev]
      );
      form.setFieldsValue({ supplier: created._id });
      setSellerModalOpen(false);
      sellerForm.resetFields();
      message.success("Seller created and selected");
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to create seller"
      );
    } finally {
      setSavingSeller(false);
    }
  };

  useEffect(() => {
    fetchRecords(1, pagination.pageSize, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the Grand Total in sync with the sum of the line totals, unless the
  // operator has explicitly overridden it.
  useEffect(() => {
    if (!modalOpen) return;
    if (!totalOverridden) {
      form.setFieldsValue({ totalAmount: itemsTotal });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsTotal, totalOverridden, modalOpen]);

  const emptyItem = (materialName) => ({
    materialName,
    customName: undefined,
    weightLbs: undefined,
    pricePerLb: undefined,
    totalAmount: undefined,
  });

  const openCreate = () => {
    setEditing(null);
    setTotalOverridden(false);
    setCustomOptions([]);
    setSelectedMaterials(["Iron"]);
    setItems([emptyItem("Iron")]);
    form.resetFields();
    form.setFieldsValue({ totalAmount: 0, paymentDate: dayjs() });
    fetchCustomers();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);

    // Prefer the canonical items[] array; fall back to the legacy top-level
    // fields for records created before items[] was sent.
    const raw =
      Array.isArray(record.items) && record.items.length
        ? record.items
        : [
            {
              materialName: record.materialName,
              weightLbs: record.weightLbs,
              pricePerLb: record.pricePerLb,
              totalAmount: record.totalAmount,
            },
          ];

    // Malformed/duplicate names are collapsed to a single row (data preserved
    // for the first occurrence) — duplicate materials are never shown twice.
    const seen = new Set();
    const loaded = [];
    raw.forEach((it) => {
      const name = (it.materialName || "Other").toString().trim() || "Other";
      if (seen.has(name)) return;
      seen.add(name);
      loaded.push({
        materialName: name,
        customName: undefined,
        weightLbs: it.weightLbs,
        pricePerLb: it.pricePerLb,
        totalAmount: it.totalAmount,
      });
    });

    const extras = loaded
      .map((it) => it.materialName)
      .filter((n) => n && !MATERIAL_OPTIONS.includes(n));
    setCustomOptions(Array.from(new Set(extras)));
    setSelectedMaterials(Array.from(new Set(loaded.map((it) => it.materialName))));
    setItems(loaded);

    form.setFieldsValue({
      totalAmount: record.totalAmount,
      supplier: record.supplier?._id || record.supplier || undefined,
      paymentMethod: record.paymentMethod,
      paymentDate: record.paymentDate ? dayjs(record.paymentDate) : dayjs(),
      note: record.note,
    });

    // Detect an existing Grand Total override so it is preserved on reload.
    const expected = Number(
      loaded.reduce((acc, it) => acc + lineTotalOf(it), 0).toFixed(2)
    );
    setTotalOverridden(
      Number(record.totalAmount || 0) > 0 &&
        Math.abs(Number(record.totalAmount) - expected) > 0.009
    );

    fetchCustomers();
    setModalOpen(true);
  };

  // Update a single row. Auto-managed line totals follow weight/rate changes;
  // a manually overridden line total is preserved.
  const updateItem = (index, patch) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const next = { ...it, ...patch };
        if (patch.weightLbs !== undefined || patch.pricePerLb !== undefined) {
          if (!isLineOverridden(it)) {
            next.totalAmount = lineTotalOf(next);
          }
        }
        return next;
      })
    );
  };

  // Add rows for newly selected materials; remove rows for deselected ones.
  // Existing rows (and any values already entered) are always preserved.
  const handleMaterialsChange = (selected) => {
    const unique = Array.from(new Set(selected || []));
    setSelectedMaterials(unique);
    setItems((prev) => {
      const byName = new Map(prev.map((it) => [it.materialName, it]));
      return unique.map((name) => byName.get(name) || emptyItem(name));
    });
  };

  // Resolve the stored material name, using the free-text value for "Other".
  const resolveMaterialName = (item) =>
    item.materialName === "Other"
      ? String(item.customName || "").trim()
      : String(item.materialName || "").trim();

  // Row-level validation (weight > 0, price >= 0, valid numerics).
  const validateItems = () => {
    const errs = [];
    const seen = new Set();
    items.forEach((it, idx) => {
      const name = resolveMaterialName(it);
      const label = name || `Row ${idx + 1}`;
      if (!name) errs.push(`Row ${idx + 1}: material name is required`);
      else {
        const key = name.toLowerCase();
        if (seen.has(key)) errs.push(`Duplicate material: ${name}`);
        seen.add(key);
      }

      const w = it.weightLbs;
      if (
        w === undefined ||
        w === null ||
        w === "" ||
        typeof w === "boolean" ||
        typeof w === "object" ||
        !Number.isFinite(Number(w)) ||
        Number(w) <= 0
      ) {
        errs.push(`${label}: weight must be a number greater than 0`);
      }

      const p = it.pricePerLb;
      if (
        p === undefined ||
        p === null ||
        p === "" ||
        typeof p === "boolean" ||
        typeof p === "object" ||
        !Number.isFinite(Number(p)) ||
        Number(p) < 0
      ) {
        errs.push(`${label}: price per lb must be 0 or greater`);
      }
    });
    return errs;
  };

  const buildPayload = async () => {
    const values = await form.validateFields();

    const errs = validateItems();
    if (errs.length) {
      message.error(errs[0]);
      // Throw a validation-shaped error so callers treat it as a form error.
      throw { errorFields: [{ name: "items", errors: errs }] };
    }

    // Each selected material becomes one line item — no double multiplication,
    // an explicit line override (legacy) always wins over weight × rate.
    const payloadItems = items.map((it) => {
      const weightLbs = Number(it.weightLbs || 0);
      const pricePerLb = Number(it.pricePerLb || 0);
      const calc = lineTotalOf(it);
      const totalAmount = isLineOverridden(it) ? Number(it.totalAmount) : calc;
      return {
        materialName: resolveMaterialName(it),
        description: "",
        weightLbs,
        pricePerLb,
        totalAmount,
      };
    });

    const itemsSum = Number(
      payloadItems.reduce((acc, it) => acc + Number(it.totalAmount || 0), 0).toFixed(2)
    );

    const enteredTotal = Number(values.totalAmount || 0);
    // Editable Grand Total override: keep the entered value when overridden (or
    // when the calculated sum is zero); otherwise persist the exact sum.
    const grandTotal =
      totalOverridden || itemsSum === 0 ? enteredTotal : itemsSum;

    const first = payloadItems[0];

    return {
      // Top-level fields retained as compatibility/mirror fields for existing
      // records and existing UI behavior (mirrors the first line item).
      materialName: first.materialName,
      weightLbs: first.weightLbs,
      pricePerLb: first.pricePerLb,
      totalAmount: grandTotal,
      // Canonical line-item representation. items[] is authoritative for the
      // backend normalization and for printing.
      items: payloadItems,
      supplier: values.supplier || undefined,
      paymentMethod: values.paymentMethod || undefined,
      paymentDate: values.paymentDate ? values.paymentDate.toISOString() : undefined,
      note: values.note || undefined,
    };
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = await buildPayload();
      if (editing) {
        await ScrapPurchaseService.update(editing._id, payload);
        message.success("Scrap purchase updated");
      } else {
        await ScrapPurchaseService.create(payload);
        message.success("Scrap purchase created");
      }
      setModalOpen(false);
      fetchRecords(1, pagination.pageSize, search);
    } catch (e) {
      if (e && e.errorFields) return; // form validation error
      message.error(e.message || "Failed to save scrap purchase");
    } finally {
      setSaving(false);
    }
  };

  // Print always persists the latest edits first, then renders from the DB.
  // This is the anti-stale-state guarantee.
  const handlePrint = async (record) => {
    try {
      let id = record._id;
      // If the modal is open on this same record and has edits, save them first.
      if (modalOpen && editing && String(editing._id) === String(record._id)) {
        const payload = await buildPayload();
        await ScrapPurchaseService.update(record._id, payload);
        id = record._id;
      }
      const url = ScrapPurchaseService.printUrl(id);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 60000);
    } catch (e) {
      if (e && e.errorFields) {
        message.warning("Please fix the form fields before printing");
        return;
      }
      message.error(e.message || "Failed to print");
    }
  };

  const handleDelete = async (record) => {
    try {
      await ScrapPurchaseService.remove(record._id);
      message.success("Scrap purchase deleted");
      fetchRecords(pagination.current, pagination.pageSize, search);
    } catch (e) {
      message.error(e.message || "Failed to delete");
    }
  };

  // Material names for a list row (multi-material aware, legacy-safe).
  const recordMaterialNames = (r) => {
    if (Array.isArray(r.items) && r.items.length) {
      return r.items.map((it) => it.materialName || "Scrap Material");
    }
    return [r.materialName || "Scrap Material"];
  };

  const columns = [
    {
      title: "Bill #",
      key: "billNumber",
      width: 120,
      render: (_, r) =>
        r.billNumber ? `${r.billPrefix || "SP"}-${String(r.billNumber).padStart(7, "0")}` : "—",
    },
    {
      title: "Material",
      dataIndex: "materialName",
      key: "materialName",
      render: (_, r) => (
        <Space size={4} wrap>
          {recordMaterialNames(r).map((name, i) => (
            <Tag color="blue" key={`${name}-${i}`}>
              {name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: `Weight (${MATERIAL_UNITS})`,
      dataIndex: "weightLbs",
      key: "weightLbs",
      align: "right",
      render: (v) => (v != null ? Number(v).toLocaleString("en-US") : "—"),
    },
    {
      title: "Rate / lb",
      dataIndex: "pricePerLb",
      key: "pricePerLb",
      align: "right",
      render: (v) => `$${Number(v || 0).toFixed(2)}`,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (v) => (
        <strong>${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      ),
    },
    {
      title: "Supplier",
      key: "supplier",
      render: (_, r) => {
        const s = r.supplier || r.supplierSnapshot;
        if (!s) return "—";
        return (
          s.name ||
          [s.firstName, s.lastName].filter(Boolean).join(" ") ||
          "—"
        );
      },
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (v) => v || "—",
    },
    {
      title: "Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (v) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Print Bill">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            />
          </Tooltip>
          <Tooltip title="Edit / Edit Bill">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this scrap purchase?"
            onConfirm={() => handleDelete(record)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContentWrapper>
      <TitleBox
        title="Scrap Material Purchase"
        routes={["Scrap Material Purchase"]}
        current="Lists"
      />

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <Space.Compact style={{ width: "100%", maxWidth: 600 }} size="middle">
          <Input
            allowClear
            placeholder="Search by material, supplier, or note"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={() => fetchRecords(1, pagination.pageSize, search)}
            prefix={<SearchOutlined />}
            style={{ width: "100%" }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchRecords(1, pagination.pageSize, search)}
          >
            Search
          </Button>
        </Space.Compact>

        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={() => fetchRecords()}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Purchase
          </Button>
        </div>
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={records}
        scroll={{ x: "max-content" }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        onChange={(p) => fetchRecords(p.current, p.pageSize, search)}
      />

      {/* Create / Edit modal — fully editable before printing */}
      <Modal
        open={modalOpen}
        title={editing ? "Edit Scrap Purchase / Bill" : "New Scrap Purchase"}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText={editing ? "Save Changes" : "Create"}
        width={640}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>,
          editing ? (
            <Button
              key="print"
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(editing)}
            >
              Save & Print Bill
            </Button>
          ) : null,
          <Button
            key="ok"
            type="primary"
            loading={saving}
            onClick={handleSubmit}
          >
            {editing ? "Save Changes" : "Create"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="selectedMaterials"
            label="Material Type"
            rules={[
              {
                validator: () =>
                  selectedMaterials.length
                    ? Promise.resolve()
                    : Promise.reject(new Error("Select at least one material")),
              },
            ]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Select one or more materials"
              value={selectedMaterials}
              onChange={handleMaterialsChange}
              optionFilterProp="value"
            >
              {materialOptions.map((m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* One pricing card per selected material */}
          {items.map((it, index) => (
            <div
              key={it.materialName}
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: "12px 12px 0",
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {it.materialName === "Other" ? "Other material" : it.materialName}
              </div>

              {it.materialName === "Other" && (
                <Form.Item
                  label="Specify Material"
                  required
                  style={{ marginBottom: 12 }}
                >
                  <Input
                    value={it.customName}
                    placeholder="e.g. Brass, Lead, Mixed Scrap"
                    onChange={(e) =>
                      updateItem(index, { customName: e.target.value })
                    }
                  />
                </Form.Item>
              )}

              <Space style={{ display: "flex" }} align="start">
                <Form.Item
                  label={`Weight (${MATERIAL_UNITS})`}
                  required
                  style={{ flex: 1, minWidth: 150 }}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: "100%" }}
                    value={it.weightLbs}
                    onChange={(v) => updateItem(index, { weightLbs: v })}
                  />
                </Form.Item>
                <Form.Item
                  label="Price / lb ($)"
                  required
                  style={{ flex: 1, minWidth: 150 }}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: "100%" }}
                    value={it.pricePerLb}
                    onChange={(v) => updateItem(index, { pricePerLb: v })}
                  />
                </Form.Item>
                <Form.Item
                  label="Total Amount ($)"
                  tooltip="Calculated as Weight x Price/lb."
                  style={{ flex: 1, minWidth: 150 }}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: "100%" }}
                    value={Number(it.totalAmount || 0)}
                    disabled
                  />
                </Form.Item>
              </Space>
            </div>
          ))}

          {/* One overall Grand Total for the complete purchase */}
          <Form.Item
            name="totalAmount"
            label="Grand Total ($)"
            tooltip="Sum of all material line totals. Edit to override the printed total."
            rules={[{ required: true, message: "Enter grand total" }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: "100%" }}
              onChange={(v) => {
                const entered = Number(v || 0);
                setTotalOverridden(Math.abs(entered - itemsTotal) > 0.009);
              }}
            />
          </Form.Item>

          {totalOverridden && (
            <div style={{ marginTop: -8, marginBottom: 12, color: "#faad14" }}>
              Grand total manually overridden (calculated: ${itemsTotal.toFixed(2)})
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              marginBottom: 24,
            }}
          >
            <Form.Item
              name="supplier"
              label="Supplier (Seller)"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Select
                showSearch
                allowClear
                placeholder="Search supplier"
                filterOption={false}
                onSearch={fetchCustomers}
                loading={false}
              >
                {customers.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name || c.phone || c._id}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Button icon={<UserAddOutlined />} onClick={openSellerModal}>
              New Seller
            </Button>
          </div>

          <Space style={{ display: "flex" }} align="start">
            <Form.Item name="paymentMethod" label="Payment Method" style={{ flex: 1, minWidth: 200 }}>
              <Select allowClear placeholder="Select method">
                <Option value="Cash">Cash</Option>
                <Option value="Check">Check</Option>
                <Option value="Bank Transfer">Bank Transfer</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item name="paymentDate" label="Payment Date" style={{ flex: 1, minWidth: 200 }}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} placeholder="Optional note for the bill" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add New Seller — only Name and Phone Number are collected. */}
      <Modal
        open={sellerModalOpen}
        title="Add New Seller"
        onCancel={closeSellerModal}
        width={420}
        footer={[
          <Button key="cancel" onClick={closeSellerModal}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={savingSeller}
            onClick={handleSaveSeller}
          >
            Save Seller
          </Button>,
        ]}
      >
        <Form form={sellerForm} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                validator: (_, value) =>
                  value && value.trim()
                    ? Promise.resolve()
                    : Promise.reject(new Error("Enter the seller name")),
              },
            ]}
          >
            <Input placeholder="e.g. Ramesh or Ramesh Kumar" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              {
                validator: (_, value) => {
                  if (!value || !String(value).trim()) {
                    return Promise.reject(new Error("Enter the phone number"));
                  }
                  if (!isValidUsPhone(value)) {
                    return Promise.reject(
                      new Error("Please enter a valid US phone number.")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="e.g. 201-555-0123" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContentWrapper>
  );
};

export default ScrapPurchase;
