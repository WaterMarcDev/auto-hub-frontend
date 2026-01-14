import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  List,
  Card,
  Descriptions,
  Checkbox,
} from "antd";
import SignatureCanvas from "../SignatureCanvas";
import { customerAPI, checkInAPI, uploadAPI } from "../../utils/api";

const { Option } = Select;

const CreateCheckInModal = ({ open, onClose, onCreated, preSelectedCustomer }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const fetchCustomers = async () => {
    try {
      // fetch customers based on current searchValue
      const res = await customerAPI.getAll({
        page: 1,
        limit: 50,
        search: searchValue,
      });
      const data = res.data || res;
      const list = data.customers || data.sellers || data.buyers || [];
      setCustomers(list);
    } catch (err) {
      console.error(err);
    }
  };

  // Do not fetch customers automatically when modal opens — default list should be empty.
  // Fetch only when user types a search (see searchValue effect below).

  React.useEffect(() => {
    // refetch when search changes
    if (!open) return;
    const t = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // Set default amount when modal opens
  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({ amount: 2 });

      // Auto-select pre-selected customer if provided
      if (preSelectedCustomer) {
        setSelectedCustomer(preSelectedCustomer);
        form.setFieldsValue({ customer: preSelectedCustomer._id });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preSelectedCustomer]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        customer: values.customer,
        type: values.type,
        transaction: {
          amount: values.amount,
          paymentMethod: values.paymentMethod,
        },
        numberOfPersons: values.numberOfPersons,
        employeeSignature: values.employeeSignature,
      };
      const res = await checkInAPI.create(payload);
      message.success("Check-in created");
      onCreated && onCreated(res.data || res);
      onClose();
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || err.message || "Failed to create check-in"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Check-In"
      open={open}
      onCancel={onClose}
      footer={null}
      //   centered
      style={{
        top: 40,
      }}
      bodyStyle={{
        height: "70vh",
        overflowY: "auto",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ amount: 2 }}
      >
        <Form.Item label="Customer" required>
          <Input.Search
            placeholder="Search customer by name, email, or mobile"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={() => fetchCustomers()}
            enterButton
          />

          <div style={{ marginTop: 8 }}>
            <List
              size="small"
              bordered
              dataSource={customers}
              locale={{ emptyText: "No customers found" }}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedCustomer(item);
                    // set form field
                    form.setFieldsValue({ customer: item._id });
                    // hide the list after selection per requirement
                    setCustomers([]);
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {`${item.firstName || ""} ${item.lastName || ""
                          }`.trim() ||
                          item.email ||
                          item.mobileNo}
                      </div>
                      <div style={{ fontSize: 12, color: "#999" }}>
                        {item.email || "N/A"} • {item.mobileNo || "N/A"}
                      </div>
                    </div>
                    <div>
                      <Button
                        type={
                          selectedCustomer && selectedCustomer._id === item._id
                            ? "primary"
                            : "default"
                        }
                        size="small"
                      >
                        {selectedCustomer && selectedCustomer._id === item._id
                          ? "Selected"
                          : "Select"}
                      </Button>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>

          <Form.Item
            name="customer"
            rules={[{ required: true }]}
            style={{ display: "none" }}
          >
            <Select />
          </Form.Item>
        </Form.Item>

        {selectedCustomer ? (
          <Card
            style={{ marginBottom: 12 }}
            title="Customer Preview"
            extra={
              <Button
                onClick={() => {
                  setSelectedCustomer(null);
                  form.resetFields(["customer"]);
                  setCustomers([]);
                }}
              >
                Clear
              </Button>
            }
          >
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Name">
                {`${selectedCustomer.firstName || ""} ${selectedCustomer.lastName || ""
                  }`.trim()}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedCustomer.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile">
                {selectedCustomer.mobileNo || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="ID Proof">
                {selectedCustomer.idProofImage ? (
                  <div style={{ maxWidth: 180 }}>
                    <img
                      src={uploadAPI.getImageUrl(selectedCustomer.idProofImage)}
                      alt="ID"
                      style={{
                        width: "100%",
                        maxHeight: 140,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ color: "#999" }}>No ID proof</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Signature">
                {selectedCustomer.signatureImage ? (
                  <div
                    style={{
                      maxWidth: 180,
                      background: "#fff",
                      padding: 8,
                      borderRadius: 4,
                    }}
                  >
                    <img
                      src={uploadAPI.getImageUrl(
                        selectedCustomer.signatureImage
                      )}
                      alt="Sig"
                      style={{
                        width: "100%",
                        maxHeight: 80,
                        objectFit: "contain",
                        background: "#fff",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ color: "#999" }}>No signature</div>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : null}

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: "Please select type" }]}
        >
          <Select placeholder="Select type">
            <Option value="seller">Seller</Option>
            <Option value="buyer">Buyer</Option>
            <Option value="both">Both</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="paymentMethod"
          label="Payment Method"
          rules={[
            { required: true, message: "Please select a payment method" },
          ]}
        >
          <Select placeholder="Select payment method">
            <Option value="Cash">Cash</Option>
            <Option value="Bank Transfer">Bank Transfer</Option>
            <Option value="Zelle">Zelle</Option>
            <Option value="Card">Card</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="numberOfPersons"
          label="Number of Persons (1+ )"
          rules={[
            { required: true, message: "Please enter number of persons" },
          ]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item name="employeeSignature" label="Employee Signature">
          <SignatureCanvas
            value={form.getFieldValue("employeeSignature")}
            onChange={(val) => form.setFieldsValue({ employeeSignature: val })}
          />
        </Form.Item>

        {/* Waiver Terms and Conditions */}
        <div
          style={{
            backgroundColor: "#fff8e1",
            border: "2px solid #ffc107",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ color: "#d84315", marginBottom: "12px", fontWeight: "bold", fontSize: "14px" }}>
            WAIVER AND LIABILITY RELEASE
          </h4>
          <div style={{ lineHeight: "1.6", color: "#424242", fontSize: "13px" }}>
            <p style={{ marginBottom: "10px" }}>
              <strong>All parts are sold 'as is,' with no warranties, expressed or implied.</strong> By entering the premises, individuals do so at their own risk and agree to release RTX Management, its employees, and agents from any liability for physical injuries or incidents that may occur while on-site.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Customers further agree to hold RTX Management, its employees, and agents harmless from any liability related to part malfunctions or any incidents involving a vehicle or person after part installation.
            </p>
            <p style={{ marginBottom: "0", color: "#d84315", fontWeight: "600" }}>
              For your safety, closed-toe shoes, shirts, and long pants are required to enter the yard.
            </p>
          </div>
        </div>

        <Form.Item
          name="agreeToTerms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("You must agree to the terms and conditions to proceed")),
            },
          ]}
        >
          <Checkbox>
            <strong>I have read and agree to the above waiver and liability release terms</strong>
          </Checkbox>
        </Form.Item>

        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCheckInModal;
