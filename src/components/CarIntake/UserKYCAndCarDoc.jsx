import React from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
  DatePicker,
  Select,
} from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import CameraUpload from "../CameraUpload";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const UserKYCAndCarDoc = ({ formData, updateFormData, nextStep, prevStep }) => {
  const handleImageUpload = (field, uploadResult) => {
    // Update form data with uploaded image information
    updateFormData({
      [field]: {
        name: uploadResult.originalName,
        url: uploadResult.imageUrl,
        filename: uploadResult.filename,
        uploaded: true,
        size: uploadResult.size,
      },
    });
  };

  const renderDocumentUploadField = (
    field,
    label,
    description,
    required = true
  ) => (
    <Form.Item
      name={field}
      label={<Text style={{ color: "white" }}>{label}</Text>}
      rules={
        required ? [{ required: true, message: `${label} is required` }] : []
      }
    >
      <div
        style={{
          backgroundColor: "#374151",
          borderRadius: "8px",
          padding: "16px",
          border: "1px solid #6b7280",
        }}
      >
        <CameraUpload
          onImageUpload={(result) => handleImageUpload(field, result)}
          multiple={false}
          showPreview={true}
          autoUpload={true}
          className="document-upload"
        />

        {/* Show upload status */}
        {formData[field] && formData[field].uploaded && (
          <div style={{ marginTop: "8px" }}>
            <Text style={{ color: "#10b981", fontSize: "12px" }}>
              ✓ Uploaded: {formData[field].name}
            </Text>
          </div>
        )}
      </div>

      {description && (
        <Text
          style={{
            color: "#9ca3af",
            fontSize: "11px",
            display: "block",
            marginTop: "4px",
            fontStyle: "italic",
          }}
        >
          {description}
        </Text>
      )}
    </Form.Item>
  );

  return (
    <div>
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
                name="firstName"
                label={<Text style={{ color: "white" }}>First Name</Text>}
                rules={[{ required: true, message: "First Name is required" }]}
              >
                <Input
                  placeholder="Enter First Name"
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
                name="lastName"
                label={<Text style={{ color: "white" }}>Last Name</Text>}
                rules={[{ required: true, message: "Last Name is required" }]}
              >
                <Input
                  placeholder="Enter Last Name"
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
                name="mobileNo"
                label={<Text style={{ color: "white" }}>Mobile No.</Text>}
                rules={[
                  { required: true, message: "Mobile No. is required" },
                  {
                    pattern:
                      /^\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, // US formats
                    message:
                      "Enter a valid US phone number (e.g. +1 555-555-5555)",
                  },
                ]}
              >
                <Input
                  placeholder="e.g. +1 555-555-5555"
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
                name="email"
                label={<Text style={{ color: "white" }}>Email</Text>}
                rules={[
                  { required: true, message: "Email is required" },
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input
                  type="email"
                  placeholder="Enter a valid e-mail"
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
              {renderDocumentUploadField(
                "dlDocument",
                "Upload DL - DMV",
                "Take a clear photo of the driver's license"
              )}
            </Col>
            <Col span={12}>
              {renderDocumentUploadField(
                "carRC",
                "Upload Car RC",
                "Take a clear photo of the car registration document"
              )}
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="sellingDate"
                label={<Text style={{ color: "white" }}>Date of Selling</Text>}
                rules={[
                  { required: true, message: "Date of Selling is required" },
                ]}
              >
                <DatePicker
                  placeholder="Select date"
                  style={{
                    width: "100%",
                    backgroundColor: "#4b5563",
                    borderColor: "#6b7280",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pickUpType"
                label={<Text style={{ color: "white" }}>Pick Up Type</Text>}
                rules={[
                  { required: true, message: "Pick Up Type is required" },
                ]}
              >
                <Select
                  placeholder="Select Pick Up Type"
                  style={{ width: "100%" }}
                  dropdownStyle={{ backgroundColor: "#374151" }}
                >
                  <Option value="You Pull">You Pull</Option>
                  <Option value="We Pull">We Pull</Option>
                  <Option value="Bulk">Bulk</Option>
                  <Option value="Location">Location</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                name="kycDescription"
                label={<Text style={{ color: "white" }}>Description</Text>}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter KYC description"
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

      <Row gutter={24}>
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
              label={<Text style={{ color: "white" }}>Final Price</Text>}
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
          Car Price
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={nextStep}
          icon={<ArrowRightOutlined />}
          iconPosition="end"
        >
          Payment
        </Button>
      </div>
    </div>
  );
};

export default UserKYCAndCarDoc;
