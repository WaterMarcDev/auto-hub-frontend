import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Radio,
  Switch,
  Button,
  Row,
  Col,
  Typography,
} from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

const CarDetails = ({
  formData,
  updateFormData,
  nextStep,
  form,
  validationRules,
  vinData,
}) => {
  // Check if field should be disabled (populated by VIN data)
  const isVinField = (fieldName) => {
    const vinFields = [
      "year",
      "make",
      "model",
      "trim",
      "bodyClass",
      "drive",
      "transmission",
      "fuelType",
      "engineVariant",
    ];
    return vinFields.includes(fieldName) && vinData;
  };

  return (
    <>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="vin"
            label={<Text style={{ color: "white" }}>Enter VIN No.</Text>}
            // rules={validationRules.vin}
          >
            <Input
              placeholder="Enter VIN No."
              disabled={true} // VIN should be read-only after being set
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
                opacity: 1,
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="year"
            label={<Text style={{ color: "white" }}>Year</Text>}
            // rules={validationRules.year}
          >
            <InputNumber
              placeholder="Please Enter Car Manufacturing Year"
              min={1900}
              max={new Date().getFullYear() + 1}
              disabled={isVinField("year")}
              style={{
                width: "100%",
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
                opacity: 1,
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="make"
            label={<Text style={{ color: "white" }}>Make</Text>}
            // rules={validationRules.make}
          >
            <Input
              placeholder="Please Enter Car Make"
              disabled={isVinField("make")}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
                opacity: 1,
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="model"
            label={<Text style={{ color: "white" }}>Model</Text>}
            // rules={validationRules.model}
          >
            <Input
              placeholder="Please Enter Car Model"
              disabled={isVinField("model")}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
                opacity: 1,
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="trim"
            label={<Text style={{ color: "white" }}>Trim</Text>}
            // rules={validationRules.trim}
          >
            <Input
              placeholder="Please Enter Car Trim"
              disabled={isVinField("trim")}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
                opacity: 1,
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="color"
            label={<Text style={{ color: "white" }}>Color</Text>}
            // rules={validationRules.color}
          >
            <Input
              placeholder="Please Enter Car Color"
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label={<Text style={{ color: "white" }}>Body Class</Text>}>
            <Input
              placeholder="Please Enter Body Class"
              value={formData.bodyClass}
              onChange={(e) => updateFormData({ bodyClass: e.target.value })}
              disabled={isVinField("bodyClass")}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
                opacity: 1,
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<Text style={{ color: "white" }}>Chassis No.</Text>}
          >
            <Input
              placeholder="Please Enter Chassis No."
              value={formData.chassisNo}
              onChange={(e) => updateFormData({ chassisNo: e.target.value })}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label={<Text style={{ color: "white" }}>Engine No.</Text>}>
            <Input
              placeholder="Please Enter Engine No."
              value={formData.engineNo}
              onChange={(e) => updateFormData({ engineNo: e.target.value })}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<Text style={{ color: "white" }}>Engine Variant</Text>}
          >
            <Input
              placeholder="Please Enter Engine Variant"
              value={formData.engineVariant}
              onChange={(e) =>
                updateFormData({ engineVariant: e.target.value })
              }
              disabled={isVinField("engineVariant")}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
                opacity: 1,
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label={<Text style={{ color: "white" }}>Drive</Text>}>
            <Radio.Group
              value={formData.drive}
              onChange={(e) => updateFormData({ drive: e.target.value })}
              disabled={isVinField("drive")}
              style={{ width: "100%" }}
            >
              <Row gutter={8}>
                <Col span={6}>
                  <Radio value="2WD" style={{ color: "white" }}>
                    2WD
                  </Radio>
                </Col>
                <Col span={6}>
                  <Radio value="4WD" style={{ color: "white" }}>
                    4WD
                  </Radio>
                </Col>
                <Col span={6}>
                  <Radio value="AWD" style={{ color: "white" }}>
                    AWD
                  </Radio>
                </Col>
                <Col span={6}>
                  <Radio value="FWD" style={{ color: "white" }}>
                    FWD
                  </Radio>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<Text style={{ color: "white" }}>Transmission</Text>}
          >
            <Radio.Group
              value={formData.transmission}
              onChange={(e) => updateFormData({ transmission: e.target.value })}
              disabled={isVinField("transmission")}
              style={{ width: "100%" }}
            >
              <Row gutter={8}>
                <Col span={12}>
                  <Radio value="Automatic" style={{ color: "white" }}>
                    Automatic
                  </Radio>
                </Col>
                <Col span={12}>
                  <Radio value="Manual" style={{ color: "white" }}>
                    Manual
                  </Radio>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label={<Text style={{ color: "white" }}>Where</Text>}>
            <Input
              placeholder="Please Enter Scrap Yard Name"
              value={formData.scrapYardName}
              onChange={(e) =>
                updateFormData({ scrapYardName: e.target.value })
              }
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={<Text style={{ color: "white" }}>Location</Text>}>
            <Input
              placeholder="Please Enter Scrap Yard Location"
              value={formData.scrapYardLocation}
              onChange={(e) =>
                updateFormData({ scrapYardLocation: e.target.value })
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

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label={<Text style={{ color: "white" }}>Fuel Type</Text>}>
            <Input
              placeholder="Please Enter Fuel Type"
              value={formData.fuelType}
              onChange={(e) => updateFormData({ fuelType: e.target.value })}
              disabled={isVinField("fuelType")}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
                opacity: 1,
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={<Text style={{ color: "white" }}>Keys</Text>}>
            <Switch
              checked={formData.hasKeys}
              onChange={(checked) => updateFormData({ hasKeys: checked })}
              checkedChildren="Yes"
              unCheckedChildren="No"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label={<Text style={{ color: "white" }}>Weight</Text>}>
            <Input
              placeholder="Enter Car Weight"
              value={formData.weight}
              onChange={(e) => updateFormData({ weight: e.target.value })}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={<Text style={{ color: "white" }}>Dimensions</Text>}>
            <Input
              placeholder="Enter Car Dimensions"
              value={formData.dimensions}
              onChange={(e) => updateFormData({ dimensions: e.target.value })}
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Form.Item
            label={<Text style={{ color: "white" }}>Description</Text>}
          >
            <TextArea
              rows={4}
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
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
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="primary"
            size="large"
            onClick={nextStep}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            Car Images
          </Button>
        </div>
      </Form.Item>
    </>
  );
};

export default CarDetails;
