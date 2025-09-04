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
} from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const CarPrice = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
  errors = {},
  touched = {},
}) => {
  // Calculate actual price whenever weight or rate changes
  React.useEffect(() => {
    const weight = parseFloat(formData.carWeight) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const actualPrice = (weight * rate * 0.01).toFixed(2); // rate is in cents, so divide by 100

    if (weight > 0 && rate > 0) {
      updateFormData({ actualPrice });
    }
  }, [formData.carWeight, formData.rate, updateFormData]);

  return (
    <div>
      <>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={<Text style={{ color: "white" }}>Weight</Text>}>
              <InputNumber
                placeholder="Enter Car Weight in pounds"
                value={formData.carWeight}
                onChange={(value) => updateFormData({ carWeight: value })}
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
            <Form.Item label={<Text style={{ color: "white" }}>Rate</Text>}>
              <Select
                placeholder="Select Rate"
                value={formData.rate}
                onChange={(value) => updateFormData({ rate: value })}
                style={{ width: "100%" }}
                dropdownStyle={{ backgroundColor: "#374151" }}
              >
                <Option value="5">5 Cent / Pound</Option>
                <Option value="6">6 Cent / Pound</Option>
                <Option value="7">7 Cent / Pound</Option>
                <Option value="8">8 Cent / Pound</Option>
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
                value={formData.actualPrice || "0"}
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
              label={<Text style={{ color: "white" }}>Our Price</Text>}
            >
              <InputNumber
                value={formData.ourPrice || 0}
                onChange={(value) => updateFormData({ ourPrice: value })}
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
              label={<Text style={{ color: "white" }}>Customer Price</Text>}
            >
              <InputNumber
                value={formData.customerPrice || 0}
                onChange={(value) => updateFormData({ customerPrice: value })}
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
              label={<Text style={{ color: "white" }}>Negotiate To</Text>}
            >
              <Select
                placeholder="Select Negotiate Type"
                value={formData.negotiateTo}
                onChange={(value) => updateFormData({ negotiateTo: value })}
                style={{ width: "100%" }}
                dropdownStyle={{ backgroundColor: "#374151" }}
              >
                <Option value="0">0% More</Option>
                <Option value="In Between">In Between</Option>
                <Option value="10">10% More</Option>
                <Option value="20">20% More</Option>
                <Option value="25">25% More</Option>
                <Option value="30">30% More</Option>
                <Option value="40">40% More</Option>
                <Option value="50">50% More</Option>
                <Option value="60">60% More</Option>
                <Option value="70">70% More</Option>
                <Option value="75">75% More</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label={<Text style={{ color: "white" }}>Final Price</Text>}
            >
              <InputNumber
                value={formData.finalPrice || 0}
                onChange={(value) => updateFormData({ finalPrice: value })}
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
          <Col span={12}>{/* Empty column as in original */}</Col>
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
              Car Diagnosis
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={nextStep}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
            >
              User KYC
            </Button>
          </div>
        </Form.Item>
      </>
    </div>
  );
};

export default CarPrice;
