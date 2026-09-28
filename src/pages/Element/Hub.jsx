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
  DollarOutlined,
  UserOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import ElementHubService from "../../services/elementHubApi";
import { customerAPI } from "../../utils/api";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Hub = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [sellModalOpen, setSellModalOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [customers, setCustomers] = React.useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] =
    React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [taxAmount, setTaxAmount] = React.useState(0);
  const [totalAmount, setTotalAmount] = React.useState(0);

  const TAX_RATE = 0.06625; // 6.625%

  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const handlePrintInvoice = (record) => {
    const baseURL = VITE_API_URL || "http://192.168.1.4:5000/api";
    const url = `${baseURL}/element-hub/history/${record._id}/print-invoice?autoPrint=1`;

    // Create a hidden iframe to load and print the invoice
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        iframe.contentWindow.print();
      } catch (e) {
        console.error("Print error:", e);
      }
    };

    // Clean up iframe after printing
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
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
  }, [fetchItems]);

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
    setSelected(row);
    form.resetFields();
    setTaxAmount(0);
    setTotalAmount(0);
    setSellModalOpen(true);
    // Load initial customers
    fetchCustomers();
  };

  const handleSaleValueChange = (value) => {
    if (value && value > 0) {
      const tax = Number((value * TAX_RATE).toFixed(2));
      const total = Number((value + tax).toFixed(2));
      setTaxAmount(tax);
      setTotalAmount(total);
    } else {
      setTaxAmount(0);
      setTotalAmount(0);
    }
  };

  const doSell = async () => {
    if (!selected) return;
    try {
      const values = await form.validateFields();
      const saleValue = values.saleValue;
      const tax = Number((saleValue * TAX_RATE).toFixed(2));
      const total = Number((saleValue + tax).toFixed(2));

      const payload = {
        elementName: selected.elementName,
        amount: values.amount,
        unit: selected.unit,
        saleValue: saleValue,
        taxRate: TAX_RATE,
        taxAmount: tax,
        totalAmount: total,
        paymentMethod: values.paymentMethod,
        note: values.note,
        customerId: values.customerId,
      };
      await ElementHubService.sellElement(payload);
      api.success({
        message: "Sold",
        description: "Sale recorded successfully",
      });
      setSellModalOpen(false);
      form.resetFields();
      setTaxAmount(0);
      setTotalAmount(0);
      fetchItems();
      fetchHistory();
    } catch (e) {
      if (e.errorFields) {
        // Form validation error
        return;
      }
      api.error({ message: "Error", description: e.message });
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
          disabled={record.totalWeight <= 0}
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
      render: (text) => text || "-",
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
          confirmLoading={loading}
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
                  max: selected?.totalWeight,
                  message: `Amount must be between 0.01 and ${selected?.totalWeight || 0
                    }`,
                },
              ]}
            >
              <InputNumber
                min={0.01}
                max={selected?.totalWeight}
                style={{ width: "100%" }}
                placeholder="Enter amount to sell"
              />
            </Form.Item>

            <Form.Item
              label="Sale Value ($)"
              name="saleValue"
              rules={[
                { required: true, message: "Please enter sale value" },
                {
                  type: "number",
                  min: 0.01,
                  message: "Sale value must be greater than 0",
                },
              ]}
            >
              <InputNumber
                min={0.01}
                style={{ width: "100%" }}
                precision={2}
                placeholder="Enter sale value"
                prefix={<DollarOutlined />}
                onChange={handleSaleValueChange}
              />
            </Form.Item>

            {taxAmount > 0 && (
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
                    marginBottom: 10,
                    color: "#e0e7ff",
                    fontSize: "14px",
                  }}
                >
                  <span>Subtotal:</span>
                  <strong style={{ color: "#fff" }}>
                    ${form.getFieldValue("saleValue")?.toFixed(2) || "0.00"}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    color: "#e0e7ff",
                    fontSize: "14px",
                  }}
                >
                  <span>Tax (6.625%):</span>
                  <strong style={{ color: "#fff" }}>
                    ${taxAmount.toFixed(2)}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255,255,255,0.2)",
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

            <Form.Item label="Note (Optional)" name="note">
              <Input.TextArea
                rows={3}
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
