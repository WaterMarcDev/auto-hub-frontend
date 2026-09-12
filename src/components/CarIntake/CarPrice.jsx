import React from "react";
import {
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
} from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { NEGOTIATION_OPTIONS, VEHICLE_SOURCE_OPTIONS } from "./intakeConstants";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

// PRESERVED (no longer used): Car Intake vehicle purchasing has NO tax.
// The 6.625% rate was previously used to back-calculate a gross amount from
// the Final Price treated as a net amount. It must no longer participate in
// the Car Intake vehicle purchase calculation (Final Price IS the gross
// vehicle purchase amount). Kept here for recovery only.
// const TAX_RATE = 0.06625; // 6.625%

const CarPrice = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
  validationRules,
}) => {
  // Calculate actual price whenever weight or rate changes
  React.useEffect(() => {
    const weight = parseFloat(formData.actualWeight) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const actualPrice = (weight * rate * 0.01).toFixed(2); // rate is in cents, so divide by 100

    if (weight > 0 && rate > 0) {
      // only update if different to avoid update loops
      if (String(formData.actualPrice) !== String(actualPrice)) {
        updateFormData({ actualPrice });
      }
    }
  }, [
    formData.actualWeight,
    formData.rate,
    formData.actualPrice,
    updateFormData,
  ]);

  // Calculate final price based on negotiation selection
  React.useEffect(() => {
    const negotiate = formData.negotiateTo;

    const parseIfPresent = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const n = parseFloat(v);
      return Number.isNaN(n) ? 0 : n;
    };

    const cust = parseIfPresent(formData.customerPrice);
    const our = parseIfPresent(formData.ourPrice);

    // Our price numeric (treat empty as 0 for percentage calculations)
    const ourNumeric = our !== null ? our : 0;

    let final = ourNumeric;

    if (!negotiate || negotiate === "0") {
      final = ourNumeric; // no change from ourPrice
    } else if (negotiate === "In Between") {
      // Average between ourPrice and customerPrice if both present
      if (our !== null && cust !== null) final = (our + cust) / 2;
      else final = ourNumeric;
    } else {
      const pct = parseFloat(negotiate);
      if (!isNaN(pct)) {
        final = ourNumeric * (1 + pct / 100);
      }
    }

    // round to 2 decimals
    const finalPrice = Number((final || 0).toFixed(2));
    if (Number(formData.finalPrice) !== Number(finalPrice)) {
      updateFormData({ finalPrice });
    }
  }, [
    formData.negotiateTo,
    formData.customerPrice,
    formData.ourPrice,
    formData.actualPrice,
    formData.finalPrice,
    updateFormData,
  ]);

  // Car Intake vehicle purchase: Final Price IS the actual gross vehicle
  // purchase amount. There is NO 6.625% tax calculation and NO tax deduction
  // from Final Price for this flow.
  const finalPriceAmount = React.useMemo(() => {
    const fp = parseFloat(formData.finalPrice) || 0;
    return Number(fp.toFixed(2));
  }, [formData.finalPrice]);

  // -----------------------------------------------------------------------
  // PRESERVED (no longer used): previous net/gross/tax derivation, kept for
  // recovery. It treated finalPrice as NET and back-calculated:
  //   grossAmount = netAmount / (1 - TAX_RATE)
  //   taxAmount   = grossAmount - netAmount
  // const netAmount = React.useMemo(() => {
  //   const fp = parseFloat(formData.finalPrice) || 0;
  //   return Number(fp.toFixed(2));
  // }, [formData.finalPrice]);
  //
  // const grossAmount = React.useMemo(() => {
  //   const gross = netAmount / (1 - TAX_RATE);
  //   return Number(gross.toFixed(2));
  // }, [netAmount]);
  //
  // const taxAmount = React.useMemo(() => {
  //   const tax = grossAmount - netAmount;
  //   return Number(tax.toFixed(2));
  // }, [grossAmount, netAmount]);
  // -----------------------------------------------------------------------

  return (
    <div>
      <style jsx>{`
        .weight-input .ant-input-number-input::placeholder {
          color: #9ca3af !important;
          opacity: 0.7 !important;
        }
      `}</style>
      <>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="actualWeight"
              label={<Text style={{ color: "white" }}>Weight (lbs)</Text>}
              extra={formData.weight}
              rules={[{ required: true, message: "Weight is required" }]}
            >
              <InputNumber
                placeholder="Enter Car Weight in pounds"
                className="weight-input"
                style={{
                  width: "100%",
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "white",
                }}
                min={0}
                step={0.1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rate"
              label={<Text style={{ color: "white" }}>Rate</Text>}
              rules={[{ required: true, message: "Rate is required" }]}
            >
              <Select
                placeholder="Select Rate (Cent / Pound)"
                style={{ width: "100%" }}
                dropdownStyle={{ backgroundColor: "#374151" }}
                optionLabelProp="label"
              >
                <Option value="3" label="3 Cent / Pound">
                  3 Cent / Pound
                </Option>
                <Option value="4" label="4 Cent / Pound">
                  4 Cent / Pound
                </Option>
                <Option value="5" label="5 Cent / Pound">
                  5 Cent / Pound
                </Option>
                <Option value="6" label="6 Cent / Pound">
                  6 Cent / Pound
                </Option>
                <Option value="7" label="7 Cent / Pound">
                  7 Cent / Pound
                </Option>
                <Option value="8" label="8 Cent / Pound">
                  8 Cent / Pound
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label={
                <Text style={{ color: "white" }}>
                  Actual Price (Auto-calculated)
                </Text>
              }
              extra={
                <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
                  Calculated as: Weight × Rate
                </Text>
              }
            >
              <Input
                value={`$${formData.actualPrice || "0"}`}
                readOnly
                style={{
                  backgroundColor: "#374151",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ourPrice"
              label={<Text style={{ color: "white" }}>Our Price</Text>}
              rules={
                validationRules?.ourPrice || [
                  { required: true, message: "Our Price is required" },
                ]
              }
              dependencies={["customerPrice"]}
            >
              <InputNumber
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
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="customerPrice"
              label={<Text style={{ color: "white" }}>Customer Price</Text>}
              rules={
                validationRules?.customerPrice || [
                  { required: true, message: "Customer Price is required" },
                ]
              }
            >
              <InputNumber
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
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="negotiateTo"
              label={<Text style={{ color: "white" }}>Negotiate To</Text>}
              rules={[{ required: true, message: "Negotiate To is required" }]}
            >
              <Select
                placeholder="Select Negotiate Type"
                style={{ width: "100%" }}
                dropdownStyle={{ backgroundColor: "#374151" }}
              >
                {NEGOTIATION_OPTIONS.map((opt) => {
                  // Logic to disable options that exceed Customer Price
                  let isDisabled = false;
                  const our = parseFloat(formData.ourPrice) || 0;
                  const cust = parseFloat(formData.customerPrice);

                  if (opt.value === "In Between") {
                    // "In Between" is already safe by definition (average), but check just in case our price is somehow > customer price
                    if (!isNaN(cust) && (our + cust) / 2 > cust) isDisabled = true;
                  } else {
                    const pct = parseFloat(opt.value);
                    if (!isNaN(pct) && !isNaN(cust)) {
                      const calculatedFinal = our * (1 + pct / 100);
                      if (calculatedFinal > cust) isDisabled = true;
                    }
                  }

                  return (
                    <Option
                      key={opt.value}
                      value={opt.value}
                      disabled={isDisabled}
                      style={{
                        color: isDisabled ? "#9ca3af" : "inherit",
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      {opt.label}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Vehicle Source + Towing Fee (optional; do NOT affect finalPrice/tax math) */}
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="vehicleSource"
              label={<Text style={{ color: "white" }}>Vehicle Source</Text>}
              extra={
                <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
                  Where the vehicle came from (optional)
                </Text>
              }
            >
              <Select
                placeholder="Select Vehicle Source"
                style={{ width: "100%" }}
                dropdownStyle={{ backgroundColor: "#374151" }}
                allowClear
              >
                {VEHICLE_SOURCE_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="towingFee"
              label={<Text style={{ color: "white" }}>Towing Fee</Text>}
              extra={
                <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
                  Optional; added as a separate line and does not change Final
                  Price
                </Text>
              }
              rules={[
                {
                  validator: (_, v) => {
                    // Empty/missing is allowed (optional field).
                    if (v === undefined || v === null || v === "")
                      return Promise.resolve();
                    // Only accept a real number (or numeric string); reject
                    // booleans/arrays/objects instead of coercing them.
                    const t = typeof v;
                    if (t !== "number" && t !== "string")
                      return Promise.reject(
                        new Error("Towing Fee must be a valid number")
                      );
                    const n = Number(v);
                    if (!Number.isFinite(n))
                      return Promise.reject(
                        new Error("Towing Fee must be a valid number")
                      );
                    if (n < 0)
                      return Promise.reject(
                        new Error("Towing Fee cannot be negative")
                      );
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{
                  width: "100%",
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "white",
                }}
                placeholder="Enter towing fee (optional)"
                min={0}
                step={0.01}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
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
                  seller. No tax is deducted. Towing Fee (if any) is added as a
                  separate acquisition cost and does not change this amount.
                </Text>
              }
            >
              <InputNumber
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
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {/*
              PRESERVED (no longer rendered): previous tax breakdown card that
              displayed "Gross Amount", "Tax (6.625%)" and "Net to Seller".
              This was the old 6.625% net-to-seller logic that must not apply
              to the Car Intake vehicle purchase flow.

            <div style={{ marginTop: 30 }}>
              <Card
                size="small"
                style={{
                  backgroundColor: "#1f2937",
                  borderColor: "#6b7280",
                }}
                bodyStyle={{ padding: "12px" }}
              >
                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text style={{ color: "#9ca3af" }}>Gross Amount:</Text>
                    <Text style={{ color: "white", fontWeight: 500 }}>
                      ${grossAmount.toFixed(2)}
                    </Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text style={{ color: "#9ca3af" }}>
                      Tax ({(TAX_RATE * 100).toFixed(3)}%):
                    </Text>
                    <Text style={{ color: "#ef4444" }}>
                      -${taxAmount.toFixed(2)}
                    </Text>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #6b7280" }}>
                    <Text style={{ color: "#9ca3af", fontWeight: 600 }}>
                      Net to Seller:
                    </Text>
                    <Text style={{ color: "#10b981", fontWeight: 700, fontSize: "16px" }}>
                      ${netAmount.toFixed(2)}
                    </Text>
                  </div>
                </Space>
              </Card>
            </div>
            */}

            {/* Car Intake vehicle purchase summary: Final Price is the gross
                purchase amount. No tax. Towing Fee (when > 0) is added on top
                and does NOT modify Final Price. */}
            <div style={{ marginTop: 30 }}>
              <Card
                size="small"
                style={{
                  backgroundColor: "#1f2937",
                  borderColor: "#6b7280",
                }}
                bodyStyle={{ padding: "12px" }}
              >
                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ color: "#9ca3af" }}>
                      Vehicle Purchase Amount:
                    </Text>
                    <Text style={{ color: "white", fontWeight: 500 }}>
                      ${finalPriceAmount.toFixed(2)}
                    </Text>
                  </div>
                  {Number(formData.towingFee) > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ color: "#9ca3af" }}>Towing Fee:</Text>
                      <Text style={{ color: "white", fontWeight: 500 }}>
                        ${Number(formData.towingFee).toFixed(2)}
                      </Text>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "8px",
                      borderTop: "1px solid #6b7280",
                    }}
                  >
                    <Text style={{ color: "#9ca3af", fontWeight: 600 }}>
                      Payment Total:
                    </Text>
                    <Text
                      style={{
                        color: "#10b981",
                        fontWeight: 700,
                        fontSize: "16px",
                      }}
                    >
                      $
                      {(
                        finalPriceAmount +
                        (Number(formData.towingFee) > 0
                          ? Number(formData.towingFee)
                          : 0)
                      ).toFixed(2)}
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
              label={<Text style={{ color: "white" }}>Description</Text>}
            >
              <TextArea
                rows={4}
                placeholder="Enter price description"
                value={formData.priceDescription}
                onChange={(e) =>
                  updateFormData({ priceDescription: e.target.value })
                }
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "white",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
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
              Car Diagnostic
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={nextStep}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
            >
              User Identification
            </Button>
          </div>
        </Form.Item>
      </>
    </div>
  );
};

export default CarPrice;
