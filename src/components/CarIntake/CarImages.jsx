import React from "react";
import { Form, Button, Row, Col, Typography, Space, Image, Input } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import CameraUpload from "../CameraUpload";

const { TextArea } = Input;
const { Text } = Typography;

const CarImages = ({ formData, updateFormData, nextStep, prevStep }) => {
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

  const renderCameraUploadField = (field, label, description) => (
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
          className="car-image-upload"
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
    <>
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <Image
          src="assets/images/AutoHubCarReferenceImage.png"
          alt="Car Reference"
          style={{ maxWidth: "100%", borderRadius: "8px" }}
          preview={false}
        />
      </div>

      <>
        <Row gutter={24}>
          <Col span={12}>
            {renderCameraUploadField(
              "carImage1",
              "Car Image 1",
              "Front view of the vehicle"
            )}
          </Col>
          <Col span={12}>
            {renderCameraUploadField(
              "carImage2",
              "Car Image 2",
              "Rear view of the vehicle"
            )}
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            {renderCameraUploadField(
              "carImage3",
              "Car Image 3",
              "Driver side view"
            )}
          </Col>
          <Col span={12}>
            {renderCameraUploadField(
              "carImage4",
              "Car Image 4",
              "Passenger side view"
            )}
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            {renderCameraUploadField(
              "carImage5",
              "Car Image 5",
              "Interior - front seats"
            )}
          </Col>
          <Col span={12}>
            {renderCameraUploadField(
              "carImage6",
              "Car Image 6",
              "Interior - rear seats"
            )}
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            {renderCameraUploadField(
              "carImage7",
              "Car Image 7",
              "Dashboard and controls"
            )}
          </Col>
          <Col span={12}>
            {renderCameraUploadField(
              "carImage8",
              "Car Image 8",
              "Additional angle"
            )}
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            {renderCameraUploadField(
              "carEngineImage",
              "Car Engine Image",
              "Engine bay view"
            )}
          </Col>
          <Col span={12}>
            {renderCameraUploadField(
              "carBootImage",
              "Car Open Boot Image",
              "Trunk/boot space"
            )}
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            {renderCameraUploadField(
              "belowVehicleImage",
              "Below Vehicle Image From Front",
              "Undercarriage view"
            )}
          </Col>
          <Col span={12}>
            {renderCameraUploadField(
              "fullVehicleImage",
              "Full Vehicle Image",
              "Complete vehicle overview"
            )}
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              label={<Text style={{ color: "white" }}>Description</Text>}
            >
              <TextArea
                rows={4}
                placeholder="Enter image description"
                value={formData.imageDescription}
                onChange={(e) =>
                  updateFormData({ imageDescription: e.target.value })
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
              Car Details
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={nextStep}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
            >
              Car Diagnosis
            </Button>
          </div>
        </Form.Item>
      </>
    </>
  );
};
export default CarImages;
