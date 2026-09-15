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
import ScrapPurchaseService from "../../services/scrapPurchaseService";

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

  // Live-derived total shown in the form (weight × rate) unless overridden.
  const [derivedTotal, setDerivedTotal] = useState(0);
  const [totalOverridden, setTotalOverridden] = useState(false);
  const [materialOtherMode, setMaterialOtherMode] = useState(false);

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
    // (material, weight, rate, total, supplier, payment, note) are preserved.
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

  const recomputeDerived = (values) => {
    const weight = Number(values?.weightLbs || 0);
    const rate = Number(values?.pricePerLb || 0);
    setDerivedTotal(Number((weight * rate).toFixed(2)));
  };

  const openCreate = () => {
    setEditing(null);
    setTotalOverridden(false);
    setDerivedTotal(0);
    setMaterialOtherMode(false);
    form.resetFields();
    form.setFieldsValue({
      materialName: "Iron",
      paymentDate: dayjs(),
    });
    fetchCustomers();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    // Prefer the canonical line item (items[0]) for NEW records; fall back to
    // the legacy top-level fields for records created before items[] was sent.
    const item =
      Array.isArray(record.items) && record.items.length
        ? record.items[0]
        : record;
    const isOther =
      item.materialName && !MATERIAL_OPTIONS.includes(item.materialName);
    setMaterialOtherMode(isOther);
    form.setFieldsValue({
      materialName: item.materialName || "Other",
      customMaterialName: isOther ? item.materialName : undefined,
      weightLbs: item.weightLbs,
      pricePerLb: item.pricePerLb,
      totalAmount: item.totalAmount,
      supplier: record.supplier?._id || record.supplier || undefined,
      paymentMethod: record.paymentMethod,
      paymentDate: record.paymentDate ? dayjs(record.paymentDate) : dayjs(),
      note: record.note,
    });
    const expected = Number(
      ((item.weightLbs || 0) * (item.pricePerLb || 0)).toFixed(2)
    );
    setTotalOverridden(
      Number(item.totalAmount || 0) > 0 &&
        Math.abs(Number(item.totalAmount) - expected) > 0.009
    );
    setDerivedTotal(expected);
    fetchCustomers();
    setModalOpen(true);
  };

  const buildPayload = async () => {
    const values = await form.validateFields();
    const materialName =
      values.materialName === "Other"
        ? (values.customMaterialName || "Other").trim()
        : values.materialName;

    const weightLbs = Number(values.weightLbs || 0);
    const pricePerLb = Number(values.pricePerLb || 0);
    // Editable total override: use it if the operator changed it or if no
    // weight/rate is available; otherwise let the backend derive it.
    const providedTotal = Number(values.totalAmount || 0);
    const derived = Number((weightLbs * pricePerLb).toFixed(2));
    const totalAmount =
      totalOverridden || derived === 0 ? providedTotal : derived;

    return {
      // Top-level fields retained as compatibility/mirror fields for existing
      // records and existing UI behavior.
      materialName,
      weightLbs,
      pricePerLb,
      totalAmount,
      // Canonical line-item representation. items[] is authoritative for the
      // backend normalization and for printing.
      items: [
        {
          materialName,
          description: "",
          weightLbs,
          pricePerLb,
          totalAmount,
        },
      ],
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
      render: (v) => <Tag color="blue">{v || "Scrap Material"}</Tag>,
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
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changed) => {
            const values = form.getFieldsValue();
            if (changed.weightLbs !== undefined || changed.pricePerLb !== undefined) {
              const weight = Number(values.weightLbs || 0);
              const rate = Number(values.pricePerLb || 0);
              const derived = Number((weight * rate).toFixed(2));
              setDerivedTotal(derived);
              // Keep the displayed total in sync while not overridden.
              if (!totalOverridden) {
                form.setFieldsValue({ totalAmount: derived });
              }
            }
            if (changed.totalAmount !== undefined) {
              const entered = Number(changed.totalAmount || 0);
              setTotalOverridden(Math.abs(entered - derivedTotal) > 0.009);
            }
          }}
        >
          <Form.Item
            name="materialName"
            label="Material Type"
            rules={[{ required: true, message: "Select a material" }]}
          >
            <Select
              onChange={(v) => setMaterialOtherMode(v === "Other")}
              placeholder="Select material"
            >
              {MATERIAL_OPTIONS.map((m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {materialOtherMode && (
            <Form.Item
              name="customMaterialName"
              label="Specify Material"
              rules={[{ required: true, message: "Enter the material name" }]}
            >
              <Input placeholder="e.g. Brass, Lead, Mixed Scrap" />
            </Form.Item>
          )}

          <Space style={{ display: "flex" }} align="start">
            <Form.Item
              name="weightLbs"
              label={`Weight (${MATERIAL_UNITS})`}
              rules={[{ required: true, message: "Enter weight" }]}
              style={{ flex: 1, minWidth: 160 }}
            >
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="pricePerLb"
              label="Price / lb ($)"
              rules={[{ required: true, message: "Enter price per lb" }]}
              style={{ flex: 1, minWidth: 160 }}
            >
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="totalAmount"
              label="Total Amount ($)"
              tooltip="Defaults to Weight x Price/lb. Edit to override the printed total."
              rules={[{ required: true, message: "Enter total" }]}
              style={{ flex: 1, minWidth: 160 }}
            >
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          {totalOverridden && (
            <div style={{ marginTop: -8, marginBottom: 12, color: "#faad14" }}>
              Total manually overridden (calculated: ${derivedTotal.toFixed(2)})
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
