import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Table,
} from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

const CarDiagnosis = ({ formData, updateFormData, nextStep, prevStep }) => {
  const partsList = [
    { key: "frontBumper", name: "Front Bumper", id: "KeyFrontBumper" },
    { key: "rearBumper", name: "Rear Bumper", id: "KeyRearBumper" },
    { key: "fender", name: "Fender", id: "KeyFender" },
    { key: "headlights", name: "Headlights", id: "KeyHeadlights" },
    { key: "hood", name: "Hood", id: "KeyHood" },
    { key: "doors", name: "Doors", id: "KeyDoors" },
    { key: "sideMirrors", name: "Side Mirrors", id: "KeySideMirrors" },
    { key: "seats", name: "Seats", id: "KeySeats" },
    { key: "odometer", name: "Odometer", id: "KeyOdometer" },
    { key: "rimsAndTires", name: "Rims & Tire Set", id: "KeyRims" },
    { key: "acCompressor", name: "AC Compressor", id: "KeyAC" },
    {
      key: "airIntakeManifold",
      name: "Air Intake Manifold",
      id: "KeyAirIntake",
    },
    { key: "battery", name: "Battery", id: "KeyBattery" },
    { key: "fuseBox", name: "Fuse Box", id: "KeyFuseBox" },
    { key: "windowSwitches", name: "Window Switches", id: "KeyWindowSwitches" },
    { key: "radioHeadunit", name: "Radio Head unit", id: "KeyRadio" },
  ];

  const updatePartData = (partKey, field, value) => {
    const currentDiagnosis = formData.diagnosis || {};
    const currentPart = currentDiagnosis[partKey] || {};

    updateFormData({
      diagnosis: {
        ...currentDiagnosis,
        [partKey]: {
          ...currentPart,
          [field]: value,
        },
      },
    });
  };

  const getPartData = (partKey, field) => {
    return formData.diagnosis?.[partKey]?.[field] || "";
  };

  const columns = [
    {
      title: <Text style={{ color: "white", fontWeight: "bold" }}>Select</Text>,
      dataIndex: "selected",
      key: "selected",
      width: 80,
      render: (_, record) => (
        <Switch
          checked={getPartData(record.key, "selected") || false}
          onChange={(checked) =>
            updatePartData(record.key, "selected", checked)
          }
          size="small"
        />
      ),
    },
    {
      title: (
        <Text style={{ color: "white", fontWeight: "bold" }}>Parts Name</Text>
      ),
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <Text style={{ color: "white" }}>{text}</Text>,
    },
    {
      title: <Text style={{ color: "white", fontWeight: "bold" }}>Unit</Text>,
      dataIndex: "unit",
      key: "unit",
      width: 100,
      render: (_, record) => (
        <InputNumber
          value={getPartData(record.key, "unit") || 1}
          onChange={(value) => updatePartData(record.key, "unit", value)}
          min={1}
          disabled={!getPartData(record.key, "selected")}
          style={{
            width: "100%",
            backgroundColor: "#4b5563",
            borderColor: "#6b7280",
          }}
        />
      ),
    },
    {
      title: (
        <Text style={{ color: "white", fontWeight: "bold" }}>Quality</Text>
      ),
      dataIndex: "quality",
      key: "quality",
      width: 150,
      render: (_, record) => (
        <Select
          placeholder="Select Quality"
          value={getPartData(record.key, "quality")}
          onChange={(value) => updatePartData(record.key, "quality", value)}
          disabled={!getPartData(record.key, "selected")}
          style={{ width: "100%" }}
          dropdownStyle={{ backgroundColor: "#374151" }}
        >
          <Option value="Good">Good</Option>
          <Option value="Average">Average</Option>
          <Option value="OK">OK</Option>
          <Option value="Broken">Broken</Option>
          <Option value="Scratches">Scratches</Option>
        </Select>
      ),
    },
    {
      title: (
        <Text style={{ color: "white", fontWeight: "bold" }}>Parts Weight</Text>
      ),
      dataIndex: "weight",
      key: "weight",
      width: 150,
      render: (_, record) => (
        <Input
          placeholder={`Enter ${record.name} Weight`}
          value={getPartData(record.key, "weight")}
          onChange={(e) => updatePartData(record.key, "weight", e.target.value)}
          disabled={!getPartData(record.key, "selected")}
          style={{
            backgroundColor: "#4b5563",
            borderColor: "#6b7280",
            color: "white",
          }}
        />
      ),
    },
    {
      title: (
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Parts Dimensions
        </Text>
      ),
      dataIndex: "dimensions",
      key: "dimensions",
      width: 180,
      render: (_, record) => (
        <Input
          placeholder={`Enter ${record.name} Dimensions`}
          value={getPartData(record.key, "dimensions")}
          onChange={(e) =>
            updatePartData(record.key, "dimensions", e.target.value)
          }
          disabled={!getPartData(record.key, "selected")}
          style={{
            backgroundColor: "#4b5563",
            borderColor: "#6b7280",
            color: "white",
          }}
        />
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          backgroundColor: "#374151",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <Table
          columns={columns}
          dataSource={partsList}
          pagination={false}
          size="middle"
          rowKey="key"
          style={{
            backgroundColor: "#374151",
            border: "1px solid #6b7280",
          }}
          className="diagnosis-table"
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{ backgroundColor: "#374151", borderColor: "#6b7280" }}
                />
              ),
            },
            body: {
              row: (props) => (
                <tr {...props} style={{ backgroundColor: "#374151" }} />
              ),
              cell: (props) => (
                <td
                  {...props}
                  style={{ backgroundColor: "#374151", borderColor: "#6b7280" }}
                />
              ),
            },
          }}
        />

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
            Car Images
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={nextStep}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            Car Price
          </Button>
        </div>
      </div>
      <style jsx>{`
        .diagnosis-table .ant-table-thead > tr > th {
          background-color: #374151 !important;
          border-color: #6b7280 !important;
          color: white !important;
        }
        .diagnosis-table .ant-table-tbody > tr > td {
          background-color: #374151 !important;
          border-color: #6b7280 !important;
        }
        .diagnosis-table .ant-table {
          background-color: #374151 !important;
        }
        .diagnosis-table .ant-table-container {
          border-color: #6b7280 !important;
        }
      `}</style>
    </>
  );
};

export default CarDiagnosis;
