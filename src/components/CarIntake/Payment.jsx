import React, { useMemo } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
} from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const TAX_RATE = 0.06625; // 6.625%

const Payment = ({
  formData,
  prevStep,
  saveStep,
  nextStep,
  updateFormData,
}) => {
  // finalPrice is the net amount (what seller receives)
  // We need to calculate the gross amount from net
  const netAmount = useMemo(() => {
    const v =
      formData.finalPrice ?? formData.paymentAmount ?? formData.paidAmount ?? 0;
    const n = Number(v) || 0;
    return Number(n.toFixed(2));
  }, [formData.finalPrice, formData.paymentAmount, formData.paidAmount]);

  // Calculate gross amount: gross = net / (1 - tax_rate)
  const grossAmount = useMemo(() => {
    const gross = netAmount / (1 - TAX_RATE);
    return Number(gross.toFixed(2));
  }, [netAmount]);

  const taxAmount = useMemo(
    () => Number((grossAmount - netAmount).toFixed(2)),
    [grossAmount, netAmount]
  );
  const handleInventoryClick = async () => {
    // Save the payment step via saveStep so the backend receives
    // the step payload and status. Then move to the next UI step.
    try {
      if (typeof saveStep === "function") {
        // Ensure the backend receives the gross amount and tax details
        const stepPayload = {
          ...formData,
          finalPrice: netAmount, // what seller receives
          paymentAmount: grossAmount, // total amount including tax
          paidAmount: grossAmount, // gross amount to be paid
          taxRate: TAX_RATE,
          taxAmount,
          netAmount,
        };
        await saveStep(6, stepPayload);
      }
    } catch (e) {
      console.error("Failed to save step 6:", e);
      // continue to next step even if save failed
    }

    if (typeof nextStep === "function") nextStep();
  };

  return (
    <div>
      <Row gutter={24} style={{ marginBottom: "24px" }}>
        <Col span={12}>
          <Card
            title={
              <Title level={4} style={{ color: "white", margin: 0 }}>
                Car Details
              </Title>
            }
            style={{ backgroundColor: "#374151", borderColor: "#6b7280" }}
            headStyle={{
              backgroundColor: "#374151",
              borderBottom: "1px solid #6b7280",
            }}
          >
            <Form.Item label={<Text style={{ color: "white" }}>VIN No</Text>}>
              <Input
                value={formData.vin}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
            <Form.Item label={<Text style={{ color: "white" }}>Year</Text>}>
              <Input
                value={formData.year}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
            <Form.Item label={<Text style={{ color: "white" }}>Model</Text>}>
              <Input
                value={formData.model}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
            <Form.Item label={<Text style={{ color: "white" }}>Trim</Text>}>
              <Input
                value={formData.trim}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
            <Form.Item label={<Text style={{ color: "white" }}>Color</Text>}>
              <Input
                value={formData.color}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={
              <Title level={4} style={{ color: "white", margin: 0 }}>
                Price Details
              </Title>
            }
            style={{ backgroundColor: "#374151", borderColor: "#6b7280" }}
            headStyle={{
              backgroundColor: "#374151",
              borderBottom: "1px solid #6b7280",
            }}
          >
            <Form.Item
              label={<Text style={{ color: "white" }}>Actual Price</Text>}
            >
              <Input
                value={`$${formData.actualPrice || "0"}`}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
            <Form.Item
              label={<Text style={{ color: "white" }}>Our Price</Text>}
            >
              <Input
                value={`$${formData.ourPrice || "0"}`}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
            <Form.Item
              label={<Text style={{ color: "white" }}>Customer Price</Text>}
            >
              <Input
                value={`$${formData.customerPrice || "0"}`}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
            <Form.Item
              label={<Text style={{ color: "white" }}>Negotiate To</Text>}
            >
              <Input
                value={formData.negotiateTo || "Not selected"}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
            <Form.Item
              label={
                <Text style={{ color: "white" }}>
                  Final Price (Net to Seller)
                </Text>
              }
            >
              <Input
                value={`$${formData.finalPrice || "0"}`}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          backgroundColor: "#374151",
          borderColor: "#6b7280",
          marginBottom: "24px",
        }}
      >
        <>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="paidTo"
                label={<Text style={{ color: "white" }}>Paid To</Text>}
                rules={[
                  { required: true, message: "Payment Method is required" },
                ]}
              >
                <Select
                  placeholder="Please Select Payment Method"
                  style={{ width: "100%" }}
                  dropdownStyle={{ backgroundColor: "#374151" }}
                >
                  <Option value="Cash">Cash</Option>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                  <Option value="Zelle">Zelle</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="finalPrice"
                label={
                  <Text style={{ color: "white" }}>
                    Final Price (Net to Seller)
                  </Text>
                }
                rules={[{ required: true, message: "Final Price is required" }]}
                extra={
                  <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
                    This is the amount the seller will receive
                  </Text>
                }
              >
                <InputNumber
                  placeholder="Net Payment Amount"
                  style={{
                    width: "100%",
                    backgroundColor: "#4b5563",
                    borderColor: "#6b7280",
                    color: "white",
                  }}
                  min={0}
                  step={0.01}
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  onChange={(val) => {
                    // Keep parent formData in sync so derived values update
                    if (typeof updateFormData === "function") {
                      updateFormData({ finalPrice: val });
                    }
                  }}
                />
              </Form.Item>

              {/* Tax summary */}
              <div style={{ marginTop: 8 }}>
                <Card
                  size="small"
                  style={{ backgroundColor: "#111827", color: "white" }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ color: "#9ca3af" }}>Gross Amount</Text>
                      <Text style={{ color: "white", fontWeight: 500 }}>
                        ${grossAmount.toFixed(2)}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ color: "#9ca3af" }}>Tax Rate</Text>
                      <Text style={{ color: "white" }}>
                        {(TAX_RATE * 100).toFixed(3)}%
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ color: "#9ca3af" }}>Tax Amount</Text>
                      <Text style={{ color: "#ef4444" }}>
                        -${taxAmount.toFixed(2)}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 700,
                        paddingTop: "8px",
                        borderTop: "1px solid #374151",
                      }}
                    >
                      <Text style={{ color: "#9ca3af" }}>Net to Seller</Text>
                      <Text style={{ color: "#10b981", fontWeight: 700 }}>
                        ${netAmount.toFixed(2)}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </div>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                name="paymentDescription"
                label={<Text style={{ color: "white" }}>Description</Text>}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter payment description"
                  style={{
                    backgroundColor: "#4b5563",
                    borderColor: "#6b7280",
                    color: "white",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "24px",
        }}
      >
        <Button
          size="large"
          onClick={prevStep}
          icon={<ArrowLeftOutlined />}
          style={{
            backgroundColor: "#6b7280",
            borderColor: "#6b7280",
            color: "white",
          }}
        >
          User KYC
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleInventoryClick}
          icon={<ArrowRightOutlined />}
          iconPosition="end"
        >
          Pay Now
        </Button>
      </div>
    </div>
  );
};

export default Payment;
