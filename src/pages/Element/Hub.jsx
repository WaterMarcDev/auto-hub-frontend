import React from "react";
import {
  Table,
  Button,
  Modal,
  InputNumber,
  Input,
  notification,
  Card,
  Tag,
  Select,
  Tabs,
  Form,
} from "antd";
import {
  UserOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import ElementHubService from "../../services/elementHubService";
import { customerAPI } from "../../utils/api";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import { useAuth } from "../../hooks/useAuth";
import { printInvoiceFromApi } from "../../utils/printCheckInInvoice";
import { weightDecimalsRule, MAX_CRM_WEIGHT_LBS } from "../../utils/weightRules";
import NumericInput from "../../components/NumericInput";

// Same limit as the backend (elementHub.controller.js); the note is printed
// on the sale invoice.
const MAX_SALE_NOTE_LENGTH = 500;

// Long notes are cut with "..." in the history tables; full text on hover.
const renderNote = (text) =>
  text ? (
    <div
      title={text}
      style={{
        maxWidth: 260,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  ) : (
    "-"
  );


const Hub = () => {
  // Scraper users can view the Element Hub but cannot sell from it.
  const { user } = useAuth();
  const canSell = user?.role?.toLowerCase() !== "scraper";

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [sellModalOpen, setSellModalOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [customers, setCustomers] = React.useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] =
    React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  // Stock coming in: car extractions + Scrap Purchases (and their corrections)
  const [stockIn, setStockIn] = React.useState([]);
  const [stockInLoading, setStockInLoading] = React.useState(false);
  // Element Hub sales carry no sales tax: the total is the sale value.
  const [totalAmount, setTotalAmount] = React.useState(0);

  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  // Fetches the invoice first (so an error is shown instead of being
  // printed) and prints it once; see utils/printCheckInInvoice.js.
  const handlePrintInvoice = async (record) => {
    try {
      await printInvoiceFromApi(`/element-hub/history/${record._id}/print-invoice`);
    } catch (e) {
      api.error({ message: "Could not print the invoice", description: e.message });
    }
  };

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await ElementHubService.getHubItems();
      setItems(data);
    } catch (e) {
      api.error({ message: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  }, [api]);

  React.useEffect(() => {
    fetchItems();
    fetchHistory();
    fetchStockIn();
  }, [fetchItems]);

  const fetchStockIn = async () => {
    setStockInLoading(true);
    try {
      const [adds, adjusts] = await Promise.all([
        ElementHubService.getHistory({ type: "add" }),
        ElementHubService.getHistory({ type: "adjust" }),
      ]);
      setStockIn(
        [...adds, ...adjusts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (e) {
      api.error({ message: "Error fetching stock history", description: e.message });
    } finally {
      setStockInLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await ElementHubService.getHistory({ type: "sell" });
      setHistory(data);
    } catch (e) {
      api.error({ message: "Error fetching history", description: e.message });
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchCustomers = async (searchText = "") => {
    setCustomerSearchLoading(true);
    try {
      const params = { type: "buyer" };
      if (searchText) {
        params.search = searchText;
      }
      const response = await customerAPI.getAll(params);
      const data = response.data || response;
      setCustomers(data.customers || data || []);
    } catch (e) {
      console.error("Error fetching customers:", e);
    } finally {
      setCustomerSearchLoading(false);
    }
  };

  const openSell = (row) => {
    if (!canSell) return;
    setSelected(row);
    form.resetFields();
    setTotalAmount(0);
    setSellModalOpen(true);
    // Load initial customers
    fetchCustomers();
  };

  // Total = Amount to Sell x Sale Value per lb (like Scrap Purchase:
  // Weight x Price/lb), worked out as either box changes.
  const watchedAmount = Form.useWatch("amount", form);
  const watchedPrice = Form.useWatch("pricePerLb", form);
  React.useEffect(() => {
    const amt = Number(watchedAmount);
    const price = Number(watchedPrice);
    setTotalAmount(
      Number.isFinite(amt) && Number.isFinite(price) && amt > 0 && price > 0
        ? Math.round((Math.round(amt * 100) * Math.round(price * 100)) / 100) / 100 // in whole cents
        : 0
    );
  }, [watchedAmount, watchedPrice]);
  // Most that can be sold at once: what is in stock, and never above 15,000 lb.
  const maxSellable = Math.min(Number(selected?.totalWeight) || 0, MAX_CRM_WEIGHT_LBS);

  // One click = one sale: ignore clicks while a sale request is running.
  const sellingRef = React.useRef(false);
  const [selling, setSelling] = React.useState(false);

  const doSell = async () => {
    if (!selected || sellingRef.current) return;
    sellingRef.current = true;
    setSelling(true);
    try {
      const values = await form.validateFields();
      const note = typeof values.note === "string" ? values.note.trim() : values.note;

      // No tax fields are sent: the server records the sale with no tax.
      const payload = {
        elementName: selected.elementName,
        amount: values.amount,
        unit: selected.unit,
        // The server works out the total (amount x price per lb); saleValue
        // is sent too for reference.
        pricePerLb: values.pricePerLb,
        saleValue: Math.round((Math.round(Number(values.amount) * 100) * Math.round(Number(values.pricePerLb) * 100)) / 100) / 100,
        paymentMethod: values.paymentMethod,
        note: note || undefined,
        customerId: values.customerId,
      };
      await ElementHubService.sellElement(payload);
      api.success({
        message: "Sold",
        description: "Sale recorded successfully",
      });
      setSellModalOpen(false);
      form.resetFields();
      setTotalAmount(0);
      fetchItems();
      fetchHistory();
    } catch (e) {
      if (e.errorFields) {
        // Form validation error
        return;
      }
      api.error({ message: "Error", description: e.message });
    } finally {
      sellingRef.current = false;
      setSelling(false);
    }
  };

  const columns = [
    {
      title: "S. No.",
      key: "srNo",
      fixed: "left",
      width: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Element Name",
      dataIndex: "elementName",
      key: "elementName",
      fixed: "left",
      minWidth: 150,
      render: (text) => (
        <strong style={{ fontSize: 14 }}>{text || "N/A"}</strong>
      ),
    },
    {
      title: "Total Weight",
      dataIndex: "totalWeight",
      key: "totalWeight",
      minWidth: 120,
      render: (val) => (
        <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
          {val || 0} {"lb"}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      minWidth: 120,
      render: (_, record) => {
        const hasStock = record.totalWeight > 0;
        return (
          <Tag color={hasStock ? "green" : "red"} style={{ fontSize: 13 }}>
            {hasStock ? "In Stock" : "Out of Stock"}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      minWidth: 100,
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => openSell(record)}
          disabled={!canSell || record.totalWeight <= 0}
          title={canSell ? undefined : "Scraper users cannot sell from the Element Hub"}
          size="small"
        >
          Sell
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "S. No.",
      key: "srNo",
      minWidth: 70,
      fixed: "left",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Element Name",
      dataIndex: "elementName",
      key: "elementName",
      minWidth: 120,
      fixed: "left",
      render: (text) => <strong>{text || "N/A"}</strong>,
    },
    {
      title: "Quantity",
      dataIndex: "amount",
      key: "amount",
      minWidth: 100,
      fixed: "left",
      render: (val) => (
        <Tag color="orange" style={{ fontSize: 13 }}>
          {val} lb
        </Tag>
      ),
    },
    {
      title: "Subtotal",
      dataIndex: ["transactionId", "amount"],
      key: "subtotal",
      minWidth: 100,
      render: (amount) => (
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          ${amount ? amount.toFixed(2) : "0.00"}
        </span>
      ),
    },
    {
      title: "Tax",
      dataIndex: ["transactionId", "taxAmount"],
      key: "tax",
      minWidth: 90,
      render: (tax) => (
        <span style={{ fontSize: 13, color: "#666" }}>
          ${tax ? tax.toFixed(2) : "0.00"}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: ["transactionId", "netAmount"],
      key: "total",
      minWidth: 100,
      render: (total) => (
        <Tag color="green" style={{ fontSize: 13, fontWeight: 600 }}>
          ${total ? total.toFixed(2) : "0.00"}
        </Tag>
      ),
    },
    {
      title: "Customer",
      dataIndex: ["customerId"],
      key: "customer",
      minWidth: 150,
      render: (customer) => {
        if (!customer) return "N/A";
        return `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
      },
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      minWidth: 150,
      render: renderNote,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      minWidth: 150,
      render: (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString();
      },
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      minWidth: 120,
      render: (_, record) => {
        return (
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintInvoice(record)}
            size="small"
          >
            Print
          </Button>
        );
      },
    },
  ];

  const stockInColumns = [
    {
      title: "S. No.",
      key: "srNo",
      minWidth: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Element Name",
      dataIndex: "elementName",
      key: "elementName",
      minWidth: 120,
      render: (text) => <strong>{text || "N/A"}</strong>,
    },
    {
      title: "Change",
      dataIndex: "amount",
      key: "amount",
      minWidth: 100,
      render: (val) => (
        <Tag color={val >= 0 ? "green" : "red"} style={{ fontSize: 13 }}>
          {val >= 0 ? "+" : ""}
          {val} lb
        </Tag>
      ),
    },
    {
      title: "Source",
      key: "source",
      minWidth: 160,
      render: (_, record) =>
        record.source === "scrap-purchase" ? (
          <Tag color="gold">Scrap Purchase</Tag>
        ) : record.sourceVin ? (
          <span>
            <Tag color="blue">Car</Tag> VIN {record.sourceVin}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      minWidth: 200,
      render: renderNote,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      minWidth: 150,
      render: (date) => (date ? new Date(date).toLocaleString() : "N/A"),
    },
  ];

  return (
    <React.Fragment>
      {contextHolder}
      <TitleBox
        title="Element Hub"
        routes={["Scrap a Car", "Element Hub"]}
        current="Element Hub"
      />
      <PageContentWrapper>
        {/* Table Card with Tabs */}
        <Card>
          <Tabs
            defaultActiveKey="inventory"
            items={[
              {
                key: "inventory",
                label: "Inventory",
                children: (
                  <Table
                    columns={columns}
                    dataSource={items}
                    tableLayout="auto"
                    loading={loading}
                    rowKey={(record) => record._id}
                    scroll={{
                      y: "calc(100vh - 510px)",
                    }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    size="small"
                    bordered
                    className="dark-table"
                    sticky
                  />
                ),
              },
              {
                key: "history",
                label: "Sell History",
                children: (
                  <Table
                    columns={historyColumns}
                    dataSource={history}
                    tableLayout="auto"
                    loading={historyLoading}
                    rowKey={(record) => record._id}
                    scroll={{
                      y: "calc(100vh - 510px)",
                    }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    size="small"
                    bordered
                    className="dark-table"
                    sticky
                  />
                ),
              },
              {
                key: "stockIn",
                label: "Stock In History",
                children: (
                  <Table
                    columns={stockInColumns}
                    dataSource={stockIn}
                    tableLayout="auto"
                    loading={stockInLoading}
                    rowKey={(record) => record._id}
                    scroll={{
                      y: "calc(100vh - 510px)",
                    }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    size="small"
                    bordered
                    className="dark-table"
                    sticky
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* Sell Modal */}
        <Modal
          title={
            selected ? (
              <span>
                Sell - <strong>{selected.elementName}</strong>
              </span>
            ) : (
              "Sell Item"
            )
          }
          open={sellModalOpen}
          onOk={doSell}
          onCancel={() => {
            setSellModalOpen(false);
            form.resetFields();
          }}
          confirmLoading={loading || selling}
          width={550}
          centered
          styles={{
            body: {
              maxHeight: "calc(100vh - 300px)",
              overflowY: "auto",
              paddingRight: "8px",
            },
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 14 }}>Available:</strong>{" "}
            <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
              {selected?.totalWeight || 0} lb
            </Tag>
          </div>

          <Form form={form} layout="vertical">
            <Form.Item
              label="Select Buyer/Customer"
              name="customerId"
              rules={[
                { required: true, message: "Please select a buyer/customer" },
              ]}
            >
              <Select
                showSearch
                placeholder="Search and select a buyer..."
                loading={customerSearchLoading}
                onSearch={(value) => fetchCustomers(value)}
                filterOption={false}
                notFoundContent={
                  customerSearchLoading ? "Loading..." : "No buyers found"
                }
                allowClear
                suffixIcon={<UserOutlined />}
                options={customers.map((customer) => ({
                  label: (
                    <div>
                      <strong>
                        {customer.firstName} {customer.lastName}
                      </strong>
                      {customer.mobileNo && (
                        <span style={{ marginLeft: 8, color: "#888" }}>
                          ({customer.mobileNo})
                        </span>
                      )}
                    </div>
                  ),
                  value: customer._id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Amount to Sell (lb)"
              name="amount"
              rules={[
                { required: true, message: "Please enter amount to sell" },
                {
                  type: "number",
                  min: 0.01,
                  max: maxSellable,
                  message: `Amount must be between 0.01 and ${maxSellable}`,
                },
                weightDecimalsRule("Amount to sell"),
              ]}
            >
              <NumericInput
                mode="number"
                min={0.01}
                max={maxSellable}
                maxMessage={`Amount can be at most ${maxSellable.toLocaleString("en-US")} lb`}
                style={{ width: "100%" }}
                placeholder="Enter amount to sell"
                errorMessage="Please enter a numeric weight"
              />
            </Form.Item>

            <Form.Item
              label="Sale Value per lb ($)"
              name="pricePerLb"
              tooltip="Price per lb. Total = Amount to Sell x Sale Value per lb."
              rules={[
                { required: true, message: "Please enter sale value per lb" },
                {
                  type: "number",
                  min: 0.01,
                  message: "Sale value per lb must be greater than 0",
                },
              ]}
            >
              {/* Numbers only, at most 2 decimals. */}
              <NumericInput
                mode="number"
                min={0.01}
                precision={2}
                style={{ width: "100%" }}
                placeholder="Enter sale value per lb"
                className="crm-number-box"
                errorMessage="Please enter a numeric price"
              />
            </Form.Item>

            {/* No sales tax on Element Hub sales: Total = Amount x Sale Value per lb. */}
            {totalAmount > 0 && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "16px",
                  background:
                    "linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)",
                  borderRadius: "8px",
                  border: "1px solid #4a90e2",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}
                  >
                    Total:
                  </span>
                  <strong style={{ fontSize: 18, color: "#60a5fa" }}>
                    ${totalAmount.toFixed(2)}
                  </strong>
                </div>
              </div>
            )}

            <Form.Item
              label="Payment Method"
              name="paymentMethod"
              rules={[
                { required: true, message: "Please select payment method" },
              ]}
            >
              <Select
                placeholder="Select payment method"
                options={[
                  { label: "Cash", value: "cash" },
                  { label: "Check", value: "check" },
                  { label: "Credit Card", value: "credit-card" },
                  { label: "Debit Card", value: "debit-card" },
                  { label: "Bank Transfer", value: "bank-transfer" },
                  { label: "Other", value: "other" },
                ]}
                allowClear
              />
            </Form.Item>

            <Form.Item
              label="Note (Optional)"
              name="note"
              rules={[
                {
                  max: MAX_SALE_NOTE_LENGTH,
                  message: `Note can be at most ${MAX_SALE_NOTE_LENGTH} characters`,
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                maxLength={MAX_SALE_NOTE_LENGTH}
                showCount
                placeholder="Enter any notes about this sale..."
              />
            </Form.Item>
          </Form>
        </Modal>
      </PageContentWrapper>
    </React.Fragment>
  );
};

export default Hub;
