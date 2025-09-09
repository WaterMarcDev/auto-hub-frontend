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

const CarDetails = ({ nextStep, vinData, form }) => {
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
            rules={[{ required: true, message: "VIN Number is required" }]}
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
            rules={[{ required: true, message: "Year is required" }]}
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
            rules={[{ required: true, message: "Make is required" }]}
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
            rules={[{ required: true, message: "Model is required" }]}
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
            rules={[{ required: true, message: "Trim is required" }]}
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
            rules={[{ required: true, message: "Color is required" }]}
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
          <Form.Item
            name="bodyClass"
            label={<Text style={{ color: "white" }}>Body Class</Text>}
            rules={[{ required: true, message: "Body Class is required" }]}
          >
            <Input
              placeholder="Please Enter Body Class"
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
            name="chassisNo"
            label={<Text style={{ color: "white" }}>Chassis No.</Text>}
            rules={[{ required: true, message: "Chassis No. is required" }]}
          >
            <Input
              placeholder="Please Enter Chassis No."
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
          <Form.Item
            name="engineNo"
            label={<Text style={{ color: "white" }}>Engine No.</Text>}
            rules={[{ required: true, message: "Engine No. is required" }]}
          >
            <Input
              placeholder="Please Enter Engine No."
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
            name="engineVariant"
            label={<Text style={{ color: "white" }}>Engine Variant</Text>}
            rules={[{ required: true, message: "Engine Variant is required" }]}
          >
            <Input
              placeholder="Please Enter Engine Variant"
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
          <Form.Item
            name="drive"
            label={<Text style={{ color: "white" }}>Drive</Text>}
            rules={[{ required: true, message: "Drive is required" }]}
          >
            <Radio.Group
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
            name="transmission"
            label={<Text style={{ color: "white" }}>Transmission</Text>}
            rules={[{ required: true, message: "Transmission is required" }]}
          >
            <Radio.Group
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
          <Form.Item
            name="scrapYardName"
            label={<Text style={{ color: "white" }}>Where</Text>}
            rules={[{ required: true, message: "Scrap Yard Name is required" }]}
          >
            <Input
              placeholder="Please Enter Scrap Yard Name"
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
            name="scrapYardLocation"
            label={<Text style={{ color: "white" }}>Location</Text>}
            rules={[{ required: true, message: "Location is required" }]}
          >
            <Input
              placeholder="Please Enter Scrap Yard Location"
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
          <Form.Item
            name="fuelType"
            label={<Text style={{ color: "white" }}>Fuel Type</Text>}
            rules={[{ required: true, message: "Fuel Type is required" }]}
          >
            <Input
              placeholder="Please Enter Fuel Type"
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
          <Form.Item
            name="hasKeys"
            label={<Text style={{ color: "white" }}>Keys</Text>}
            rules={[
              {
                required: true,
                message: "Please specify if keys are available",
              },
            ]}
          >
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
              checked={form ? form.getFieldValue("hasKeys") : undefined}
              onChange={(checked) => {
                if (form) form.setFieldsValue({ hasKeys: checked });
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="weight"
            label={<Text style={{ color: "white" }}>Weight</Text>}
            rules={[{ required: true, message: "Weight is required" }]}
          >
            <Input
              placeholder="Enter Car Weight"
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
            name="dimensions"
            label={<Text style={{ color: "white" }}>Dimensions</Text>}
            rules={[{ required: true, message: "Dimensions are required" }]}
          >
            <Input
              placeholder="Enter Car Dimensions"
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
            name="description"
            label={<Text style={{ color: "white" }}>Description</Text>}
          >
            <TextArea
              rows={4}
              placeholder="Enter description"
              style={{
                backgroundColor: "#4b5563",
                borderColor: "#6b7280",
                color: "white",
              }}
            />
          </Form.Item>
        </Col>
      </Row>{" "}
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
