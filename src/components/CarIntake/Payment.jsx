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
import { getNegotiationLabel } from "./intakeConstants";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

// PRESERVED (no longer used): Car Intake vehicle purchasing has NO tax.
// Previously used to back-calculate a gross amount from the Final Price
// treated as a net amount. Kept for recovery only.
// const TAX_RATE = 0.06625; // 6.625%

const Payment = ({
  formData,
  prevStep,
  saveStep,
  nextStep,
  updateFormData,
}) => {
  // Car Intake vehicle purchase: Final Price IS the actual gross vehicle
  // purchase amount. There is NO tax calculation and NO tax deduction here.
  const purchaseAmount = useMemo(() => {
    const v =
      formData.finalPrice ?? formData.paymentAmount ?? formData.paidAmount ?? 0;
    const n = Number(v) || 0;
    return Number(n.toFixed(2));
  }, [formData.finalPrice, formData.paymentAmount, formData.paidAmount]);

  // Optional towing fee is a separate acquisition cost added on top of the
  // vehicle purchase amount; it never modifies Final Price.
  const towingFee = useMemo(() => {
    const n = Number(formData.towingFee) || 0;
    return n > 0 ? Number(n.toFixed(2)) : 0;
  }, [formData.towingFee]);

  // -----------------------------------------------------------------------
  // PRESERVED (no longer used): previous net/gross/tax derivation, kept for
  // recovery. It treated finalPrice as NET and back-calculated:
  //   grossAmount = netAmount / (1 - TAX_RATE)
  //   taxAmount   = grossAmount - netAmount
  // const netAmount = useMemo(() => {
  //   const v = formData.finalPrice ?? formData.paymentAmount ?? formData.paidAmount ?? 0;
  //   const n = Number(v) || 0;
  //   return Number(n.toFixed(2));
  // }, [formData.finalPrice, formData.paymentAmount, formData.paidAmount]);
  //
  // const grossAmount = useMemo(() => {
  //   const gross = netAmount / (1 - TAX_RATE);
  //   return Number(gross.toFixed(2));
  // }, [netAmount]);
  //
  // const taxAmount = useMemo(
  //   () => Number((grossAmount - netAmount).toFixed(2)),
  //   [grossAmount, netAmount]
  // );
  // -----------------------------------------------------------------------
  const handleInventoryClick = async () => {
    // Save the payment step via saveStep so the backend receives
    // the step payload and status. Then move to the next UI step.
    try {
      if (typeof saveStep === "function") {
        // Car Intake vehicle purchase: the payment amount is the actual gross
        // vehicle purchase amount (Final Price). No tax is applied or deducted.
        const stepPayload = {
          ...formData,
          finalPrice: purchaseAmount, // actual vehicle purchase amount
          paymentAmount: purchaseAmount, // same amount paid
          paidAmount: purchaseAmount, // same amount paid
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
                value={getNegotiationLabel(formData.negotiateTo)}
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
                  Final Price (Actual Vehicle Purchase Amount)
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
                    Final Price (Actual Vehicle Purchase Amount)
                  </Text>
                }
                rules={[{ required: true, message: "Final Price is required" }]}
                extra={
                  <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
                    This is the actual gross vehicle purchase amount paid to the
                    seller. No tax is deducted.
                  </Text>
                }
              >
                <InputNumber
                  placeholder="Vehicle Purchase Amount"
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

              {/*
                PRESERVED (no longer rendered): previous tax summary card that
                displayed "Gross Amount", "Tax Rate", "Tax Amount" and "Net to
                Seller". This was the old 6.625% net-to-seller logic that must
                not apply to the Car Intake vehicle purchase flow.

              <div style={{ marginTop: 8 }}>
                <Card
                  size="small"
                  style={{ backgroundColor: "#111827", color: "white" }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text style={{ color: "#9ca3af" }}>Gross Amount</Text>
                      <Text style={{ color: "white", fontWeight: 500 }}>
                        ${grossAmount.toFixed(2)}
                      </Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text style={{ color: "#9ca3af" }}>Tax Rate</Text>
                      <Text style={{ color: "white" }}>
                        {(TAX_RATE * 100).toFixed(3)}%
                      </Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text style={{ color: "#9ca3af" }}>Tax Amount</Text>
                      <Text style={{ color: "#ef4444" }}>
                        -${taxAmount.toFixed(2)}
                      </Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, paddingTop: "8px", borderTop: "1px solid #374151" }}>
                      <Text style={{ color: "#9ca3af" }}>Net to Seller</Text>
                      <Text style={{ color: "#10b981", fontWeight: 700 }}>
                        ${netAmount.toFixed(2)}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </div>
              */}

              {/* Car Intake vehicle purchase summary: Final Price is the gross
                  purchase amount. No tax. Towing Fee (when > 0) is added on
                  top and does NOT modify Final Price. */}
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
                      <Text style={{ color: "#9ca3af" }}>
                        Vehicle Purchase Amount
                      </Text>
                      <Text style={{ color: "white", fontWeight: 500 }}>
                        ${purchaseAmount.toFixed(2)}
                      </Text>
                    </div>
                    {towingFee > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ color: "#9ca3af" }}>Towing Fee</Text>
                        <Text style={{ color: "white", fontWeight: 500 }}>
                          ${towingFee.toFixed(2)}
                        </Text>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 700,
                        paddingTop: "8px",
                        borderTop: "1px solid #374151",
                      }}
                    >
                      <Text style={{ color: "#9ca3af" }}>Payment Total</Text>
                      <Text style={{ color: "#10b981", fontWeight: 700 }}>
                        ${(purchaseAmount + towingFee).toFixed(2)}
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
          User Identification
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
