import React, { useState } from "react";
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
import { vehicleWeightMax } from "../../utils/carDimensions";
import NumericInput from "../NumericInput";
import { CAR_TEXT_FIELDS, carTextRules } from "./intakeConstants";
import { MAX_DESCRIPTION_LENGTH, descriptionRule } from "../../utils/descriptionLimit";

const { TextArea } = Input;
const { Text } = Typography;

const PULL_TYPES = ["You Pull", "We Pull"];

const CarDetails = ({ nextStep, vinData, form, validationRules }) => {
  const pickUpType = Form.useWatch("pickUpType", form);
  const legacyPickupType = pickUpType && !PULL_TYPES.includes(pickUpType) ? pickUpType : null;

  // Height / Width / Length: typing or pasting anything but a number shows
  // "Please enter the correct ..." until a valid value is typed.
  const [dimErrors, setDimErrors] = useState({});
  const setDimError = (name, bad) =>
    setDimErrors((prev) => (Boolean(prev[name]) === bad ? prev : { ...prev, [name]: bad }));
  const isNumberKey = (key) => /^[0-9.]$/.test(key);
  // Check if field should be disabled (populated by VIN data)
  const isVinField = (fieldName) => {
    const vinFields = [
      // "year",
      // "make",
      // "model",
      // "trim",
      // "bodyClass",
      // "drive",
      // "transmission",
      // "fuelType",
      // "engineVariant",
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
            rules={validationRules?.vin || [{ required: true, message: "VIN Number is required" }]}
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
            rules={validationRules?.year || [{ required: true, message: "Year is required" }]}
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
            rules={validationRules?.make || carTextRules("make")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.make.max}
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
            rules={validationRules?.model || carTextRules("model")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.model.max}
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
            rules={validationRules?.trim || carTextRules("trim")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.trim.max}
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
            rules={validationRules?.color || carTextRules("color")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.color.max}
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
            rules={validationRules?.bodyClass || carTextRules("bodyClass")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.bodyClass.max}
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
            rules={validationRules?.chassisNo || carTextRules("chassisNo")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.chassisNo.max}
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
            name="engine"
            label={<Text style={{ color: "white" }}>Engine Size</Text>}
            rules={validationRules?.engine || carTextRules("engine")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.engine.max}
              placeholder="Please Enter Engine Size"
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
            rules={validationRules?.engineVariant || carTextRules("engineVariant")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.engineVariant.max}
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
            rules={validationRules?.drive || [{ required: true, message: "Drive is required" }]}
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
            rules={validationRules?.transmission || [{ required: true, message: "Transmission is required" }]}
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
            rules={validationRules?.scrapYardName || carTextRules("scrapYardName")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.scrapYardName.max}
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
            rules={validationRules?.scrapYardLocation || carTextRules("scrapYardLocation")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.scrapYardLocation.max}
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
            rules={validationRules?.fuelType || carTextRules("fuelType")}
          >
            <Input
              maxLength={CAR_TEXT_FIELDS.fuelType.max}
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
          {/* Who pulls the parts from this car. Saved as kyc.pickupType and
              shown in the Car Intake list and details. */}
          <Form.Item
            name="pickUpType"
            label={<Text style={{ color: "white" }}>Pull Type</Text>}
            rules={[{ required: true, message: "Please select You Pull or We Pull" }]}
          >
            <Radio.Group style={{ width: "100%" }}>
              <Row gutter={8}>
                <Col span={12}>
                  <Radio value="You Pull" style={{ color: "white" }}>
                    You Pull
                  </Radio>
                </Col>
                <Col span={12}>
                  <Radio value="We Pull" style={{ color: "white" }}>
                    We Pull
                  </Radio>
                </Col>
                {/* Older intakes may hold another pickup type. */}
                {legacyPickupType && (
                  <Col span={12}>
                    <Radio value={legacyPickupType} style={{ color: "white" }}>
                      {legacyPickupType}
                    </Radio>
                  </Col>
                )}
              </Row>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="weight"
            label={<Text style={{ color: "white" }}>Weight (lbs)</Text>}
            rules={validationRules?.weight || [{ required: true, message: "Weight is required" }]}
            extra={
              // The VIN's GVWR class is the maximum loaded weight, so it is
              // shown (and checked) only as an upper limit.
              vehicleWeightMax(vinData) ? (
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                  Allowed range: 1 - {vehicleWeightMax(vinData).toLocaleString()} lbs
                </span>
              ) : null
            }
          >
            <NumericInput
              mode="number"
              decimals={false}
              placeholder="Enter Car Weight"
              className="intake-number-box"
              style={{ width: "100%" }}
              addonAfter="lbs"
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
      {/* Dimensions (optional): Height, Width and Length only, in inches. */}
      <Row gutter={24}>
        {[
          { name: "height", label: "Height" },
          { name: "width", label: "Width" },
          { name: "length", label: "Length" },
        ].map((dim) => (
          <Col xs={24} sm={8} key={dim.name}>
            <Form.Item
              name={dim.name}
              label={<Text style={{ color: "white" }}>{dim.label} (optional)</Text>}
              validateStatus={dimErrors[dim.name] ? "error" : undefined}
              help={dimErrors[dim.name] ? `Please enter the correct ${dim.label}` : undefined}
            >
              <InputNumber
                min={0}
                onKeyDown={(e) => {
                  if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
                  if (isNumberKey(e.key)) {
                    setDimError(dim.name, false);
                  } else {
                    e.preventDefault();
                    setDimError(dim.name, true);
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData?.getData("text")?.trim() ?? "";
                  const bad = !/^\d*\.?\d*$/.test(text);
                  if (bad) e.preventDefault();
                  setDimError(dim.name, bad);
                }}
                onChange={() => setDimError(dim.name, false)}
                placeholder={`Enter ${dim.label}`}
                className="intake-number-box"
                style={{ width: "100%" }}
                addonAfter="in"
              />
            </Form.Item>
          </Col>
        ))}
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item rules={[descriptionRule]}
            name="description"
            label={<Text style={{ color: "white" }}>Description</Text>}
          >
            <TextArea maxLength={MAX_DESCRIPTION_LENGTH} showCount
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
