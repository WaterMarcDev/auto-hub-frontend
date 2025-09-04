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
import dayjs from "dayjs";
import CameraUpload from "../CameraUpload";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const UserKYCAndCarDoc = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
  form,
  validationRules,
}) => {
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

  const renderDocumentUploadField = (field, label, description) => (
    <Form.Item label={<Text style={{ color: "white" }}>{label}</Text>}>
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
                label={<Text style={{ color: "white" }}>First Name</Text>}
              >
                <Input
                  placeholder="Enter First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    updateFormData({ firstName: e.target.value })
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
              <Form.Item
                label={<Text style={{ color: "white" }}>Last Name</Text>}
              >
                <Input
                  placeholder="Enter Last Name"
                  value={formData.lastName}
                  onChange={(e) => updateFormData({ lastName: e.target.value })}
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
                label={<Text style={{ color: "white" }}>Mobile No.</Text>}
              >
                <Input
                  placeholder="Enter Mobile No"
                  value={formData.mobileNo}
                  onChange={(e) => updateFormData({ mobileNo: e.target.value })}
                  style={{
                    backgroundColor: "#4b5563",
                    borderColor: "#6b7280",
                    color: "white",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text style={{ color: "white" }}>Email</Text>}>
                <Input
                  type="email"
                  placeholder="Enter a valid e-mail"
                  value={formData.email}
                  onChange={(e) => updateFormData({ email: e.target.value })}
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
                label={<Text style={{ color: "white" }}>Date of Selling</Text>}
              >
                <DatePicker
                  showTime
                  placeholder="Select date and time"
                  value={
                    formData.sellingDate ? dayjs(formData.sellingDate) : null
                  }
                  onChange={(date, dateString) =>
                    updateFormData({ sellingDate: dateString })
                  }
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
                label={<Text style={{ color: "white" }}>Pick Up Type</Text>}
              >
                <Select
                  placeholder="Select Pick Up Type"
                  value={formData.pickUpType}
                  onChange={(value) => updateFormData({ pickUpType: value })}
                  style={{ width: "100%" }}
                  dropdownStyle={{ backgroundColor: "#374151" }}
                >
                  <Option value="0">You Pull</Option>
                  <Option value="1">We Pull</Option>
                </Select>
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
                  placeholder="Enter KYC description"
                  value={formData.kycDescription}
                  onChange={(e) =>
                    updateFormData({ kycDescription: e.target.value })
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
