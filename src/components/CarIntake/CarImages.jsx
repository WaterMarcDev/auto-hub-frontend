import React, { useState } from "react";
import { Form, Button, Row, Col, Typography, Space, Image, Input, message } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, ThunderboltOutlined } from "@ant-design/icons";
import CameraUpload from "../CameraUpload";
import { uploadAPI } from "../../utils/api";
import { enhanceImageToFile } from "../../utils/imageEnhance";
import { checkImageFile, showImageError, showUploadError } from "../../utils/imageRules";
import { MAX_DESCRIPTION_LENGTH, descriptionRule, noOnlySpacesRule } from "../../utils/descriptionLimit";

const { TextArea } = Input;
const { Text } = Typography;

const CarImages = ({ formData, updateFormData, nextStep, prevStep }) => {
  const mapUpload = (uploadResult) => ({
    name: uploadResult.originalName,
    url: uploadResult.imageUrl,
    filename: uploadResult.filename,
    uploaded: true,
    size: uploadResult.size,
  });

  const handleImageUpload = (field, uploadResult) => {
    // Update form data with uploaded image information
    updateFormData({
      [field]: mapUpload(uploadResult),
    });
  };

  // Enhance an uploaded photo: the improved (cleaned, sharpened, enlarged)
  // version is uploaded and replaces the photo in this intake.
  const [enhancing, setEnhancing] = useState(null); // field being enhanced
  const handleEnhanceImage = async (field) => {
    const current = formData[field];
    if (!current?.url) return;
    setEnhancing(field);
    try {
      const file = await enhanceImageToFile(
        uploadAPI.getImageUrl(current.url),
        `${String(current.name || field).replace(/\.[^.]+$/, "")}-enhanced`
      );
      const problem = checkImageFile(file);
      if (problem) {
        showImageError(problem);
        return;
      }
      const response = await uploadAPI.uploadImage(file);
      updateFormData({ [field]: { ...mapUpload(response.data), enhanced: true } });
      message.success("Photo enhanced");
    } catch (err) {
      if (err?.response) showUploadError(err);
      else message.error(err.message || "Could not enhance this photo");
    } finally {
      setEnhancing(null);
    }
  };

  const handleRemoveImage = (field) => {
    updateFormData({
      [field]: null,
    });
  };

  const renderCameraUploadField = (
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
        {/* Show uploaded image with remove button */}
        {formData[field] && formData[field].uploaded ? (
          <div>
            <div style={{ position: "relative", marginBottom: "8px" }}>
              <Image
                src={uploadAPI.getImageUrl(formData[field].url)}
                alt={formData[field].name}
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                preview={{
                  mask: <div>Click to preview</div>,
                }}
              />
              <Space
                size={6}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  zIndex: 1,
                }}
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  loading={enhancing === field}
                  disabled={Boolean(enhancing) || formData[field].enhanced}
                  onClick={() => handleEnhanceImage(field)}
                >
                  {formData[field].enhanced ? "Enhanced" : "Enhance"}
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => handleRemoveImage(field)}
                  disabled={enhancing === field}
                  icon={<i className="fas fa-times"></i>}
                >
                  Remove
                </Button>
              </Space>
            </div>
            <Text style={{ color: "#10b981", fontSize: "12px" }}>
              ✓ Uploaded: {formData[field].name}
            </Text>
          </div>
        ) : (
          <CameraUpload
            onImageUpload={(result) => handleImageUpload(field, result)}
            multiple={false}
            showPreview={true}
            autoUpload={true}
            adjustBeforeUpload
            className="car-image-upload"
          />
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
          src="/assets/images/AutoHubCarReferenceImage.png"
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
            <Form.Item rules={[descriptionRule, noOnlySpacesRule()]}
              name="imageDescription"
              label={<Text style={{ color: "white" }}>Description</Text>}
            >
              <TextArea maxLength={MAX_DESCRIPTION_LENGTH} showCount
                rows={4}
                placeholder="Enter image description"
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
              Car Diagnostic
            </Button>
          </div>
        </Form.Item>
      </>
    </>
  );
};
export default CarImages;
