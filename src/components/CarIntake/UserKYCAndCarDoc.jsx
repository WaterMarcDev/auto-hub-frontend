import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Card,
  DatePicker,
  Select,
  Tabs,
  List,
  Avatar,
  Descriptions,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import CameraUpload from "../CameraUpload";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const UserKYCAndCarDoc = ({
  formData = {},
  updateFormData = () => {},
  nextStep = () => {},
  prevStep = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const doSearch = async (q) => {
    if (!q || q.length < 2) return;
    setSearchLoading(true);
    try {
      const api = await import("../../utils/api");
      const res = await api.sellerAPI.search(q);
      const sellers = (res && res.data && (res.data.sellers || res.data)) || [];
      setSearchResults(sellers);
    } catch (err) {
      console.error("Seller search error", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSeller = (seller) => {
    if (!seller) return;
    updateFormData({
      sellerId: seller._id || seller.id || null,
      firstName: seller.firstName || seller.first_name || "",
      lastName: seller.lastName || seller.last_name || "",
      email: seller.email || "",
      mobileNo: seller.mobileNo || seller.phone || "",
      selectedSellerData: seller, // Store the full seller object for display
    });
  };

  const handleClearSelection = () => {
    updateFormData({
      sellerId: null,
      firstName: "",
      lastName: "",
      email: "",
      mobileNo: "",
      selectedSellerData: null,
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleImageUpload = (field, uploadResult) => {
    if (!field || !uploadResult) return;
    updateFormData({
      [field]: {
        name: uploadResult.originalName || uploadResult.name || "",
        url: uploadResult.imageUrl || uploadResult.url || "",
        filename: uploadResult.filename || "",
        uploaded: true,
        size: uploadResult.size || 0,
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
          borderRadius: 8,
          padding: 16,
          border: "1px solid #6b7280",
        }}
      >
        <CameraUpload
          onImageUpload={(result) => handleImageUpload(field, result)}
          multiple={false}
          showPreview
          autoUpload
          className="document-upload"
        />
        {formData[field] && formData[field].uploaded && (
          <div style={{ marginTop: 8 }}>
            <Text style={{ color: "#10b981", fontSize: 12 }}>
              ✓ Uploaded: {formData[field].name}
            </Text>
          </div>
        )}
      </div>
      {description && (
        <Text
          style={{
            color: "#9ca3af",
            fontSize: 11,
            display: "block",
            marginTop: 4,
            fontStyle: "italic",
          }}
        >
          {description}
        </Text>
      )}
    </Form.Item>
  );

  const renderSearchTab = () => (
    <div>
      {/* Show selected seller card if a seller is selected */}
      {formData.sellerId && formData.selectedSellerData ? (
        <Card
          style={{
            backgroundColor: "#1f2937",
            borderColor: "#10b981",
            border: "2px solid #10b981",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <Title level={5} style={{ color: "#10b981", margin: 0 }}>
              <UserOutlined /> Selected Seller
            </Title>
            <Button
              danger
              type="primary"
              icon={<CloseCircleOutlined />}
              onClick={handleClearSelection}
              size="small"
            >
              Clear Selection
            </Button>
          </div>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item
              label={
                <Text style={{ color: "#9ca3af" }}>
                  <UserOutlined /> Name
                </Text>
              }
              contentStyle={{
                backgroundColor: "#374151",
                color: "white",
                fontWeight: 600,
              }}
              labelStyle={{ backgroundColor: "#1f2937", color: "#9ca3af" }}
            >
              {formData.selectedSellerData.firstName}{" "}
              {formData.selectedSellerData.lastName}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Text style={{ color: "#9ca3af" }}>
                  <MailOutlined /> Email
                </Text>
              }
              contentStyle={{ backgroundColor: "#374151", color: "white" }}
              labelStyle={{ backgroundColor: "#1f2937", color: "#9ca3af" }}
            >
              {formData.selectedSellerData.email || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Text style={{ color: "#9ca3af" }}>
                  <PhoneOutlined /> Mobile No.
                </Text>
              }
              contentStyle={{ backgroundColor: "#374151", color: "white" }}
              labelStyle={{ backgroundColor: "#1f2937", color: "#9ca3af" }}
            >
              {formData.selectedSellerData.mobileNo || "N/A"}
            </Descriptions.Item>
            {formData.selectedSellerData.driversLicense && (
              <Descriptions.Item
                label={
                  <Text style={{ color: "#9ca3af" }}>
                    <IdcardOutlined /> Driver's License
                  </Text>
                }
                contentStyle={{ backgroundColor: "#374151", color: "white" }}
                labelStyle={{ backgroundColor: "#1f2937", color: "#9ca3af" }}
              >
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={async () => {
                    const { uploadAPI } = await import("../../utils/api");
                    const imageUrl = uploadAPI.getImageUrl(
                      formData.selectedSellerData.driversLicense
                    );
                    window.open(imageUrl, "_blank");
                  }}
                  style={{ padding: 0, color: "#60a5fa" }}
                >
                  View Document
                </Button>
              </Descriptions.Item>
            )}
            {formData.selectedSellerData.description && (
              <Descriptions.Item
                label={<Text style={{ color: "#9ca3af" }}>Description</Text>}
                contentStyle={{ backgroundColor: "#374151", color: "white" }}
                labelStyle={{ backgroundColor: "#1f2937", color: "#9ca3af" }}
              >
                {formData.selectedSellerData.description}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      ) : (
        <>
          <Row gutter={12}>
            <Col span={18}>
              <Input
                placeholder="Search by mobile number or email (min 2 chars)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={(e) => doSearch(e.target.value)}
              />
            </Col>
            <Col span={6}>
              <Button
                onClick={() => doSearch(searchQuery)}
                loading={searchLoading}
                type="primary"
              >
                Search
              </Button>
            </Col>
          </Row>

          <div style={{ marginTop: 12 }}>
            <List
              loading={searchLoading}
              dataSource={searchResults}
              locale={{ emptyText: "No sellers found" }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key={`select-${item._id || item.id}`}
                      type="default"
                      onClick={() => handleSelectSeller(item)}
                    >
                      Select
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{(item.firstName || "")[0] || "S"}</Avatar>}
                    title={`${item.firstName || ""} ${item.lastName || ""}`}
                    description={`${item.email || ""} • ${item.mobileNo || ""}`}
                  />
                </List.Item>
              )}
            />
          </div>
        </>
      )}

      <div style={{ marginTop: 16 }}>
        {/* Hidden fields to ensure validation runs when Search tab is active */}
        <div style={{ display: "none" }}>
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: "First Name is required" }]}
          >
            <Input value={formData.firstName} readOnly />
          </Form.Item>
          <Form.Item
            name="lastName"
            rules={[{ required: true, message: "Last Name is required" }]}
          >
            <Input value={formData.lastName} readOnly />
          </Form.Item>
          <Form.Item
            name="mobileNo"
            rules={[
              { required: true, message: "Mobile No. is required" },
              {
                pattern: /^\+?[\d\s\-()]{10,}$/,
                message: "Invalid mobile number format",
              },
            ]}
          >
            <Input value={formData.mobileNo} readOnly />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input value={formData.email} readOnly />
          </Form.Item>
        </div>
        <Row gutter={24}>
          <Col span={12}>
            {renderDocumentUploadField(
              "dlDocument",
              "Upload DL - DMV",
              "Take a clear photo of the driver's license",
              false
            )}
          </Col>
          <Col span={12}>
            {renderDocumentUploadField(
              "carRC",
              "Upload Car RC",
              "Take a clear photo of the car registration document",
              false
            )}
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            {renderDocumentUploadField(
              "titleCertificate",
              "Upload Title Certificate",
              "Take a clear photo of the vehicle title certificate",
              false
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
                value={formData.sellingDate}
                onChange={(d) => updateFormData({ sellingDate: d })}
                placeholder="Select date"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="pickUpType"
              label={<Text style={{ color: "white" }}>Pick Up Type</Text>}
              rules={[{ required: true, message: "Pick Up Type is required" }]}
            >
              <Select
                value={formData.pickUpType}
                onChange={(val) => updateFormData({ pickUpType: val })}
                placeholder="Select Pick Up Type"
                style={{ width: "100%" }}
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
                rows={3}
                value={formData.kycDescription}
                onChange={(e) =>
                  updateFormData({ kycDescription: e.target.value })
                }
                placeholder="Enter KYC description"
                style={{ backgroundColor: "#4b5563", color: "white" }}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );

  const renderCreateTab = () => (
    <div>
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
                pattern: /^\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
                message: "Enter a valid US phone number (e.g. +1 555-555-5555)",
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
              { type: "email", message: "Please enter a valid email address" },
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
            "Take a clear photo of the driver's license",
            false
          )}
        </Col>
        <Col span={12}>
          {renderDocumentUploadField(
            "carRC",
            "Upload Car RC",
            "Take a clear photo of the car registration document",
            false
          )}
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          {renderDocumentUploadField(
            "titleCertificate",
            "Upload Title Certificate",
            "Take a clear photo of the vehicle title certificate",
            false
          )}
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="sellingDate"
            label={<Text style={{ color: "white" }}>Date of Selling</Text>}
            rules={[{ required: true, message: "Date of Selling is required" }]}
          >
            <DatePicker
              value={formData.sellingDate}
              onChange={(d) => updateFormData({ sellingDate: d })}
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
            rules={[{ required: true, message: "Pick Up Type is required" }]}
          >
            <Select
              value={formData.pickUpType}
              onChange={(val) => updateFormData({ pickUpType: val })}
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
              value={formData.kycDescription}
              onChange={(e) =>
                updateFormData({ kycDescription: e.target.value })
              }
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
    </div>
  );

  return (
    <div>
      <Card
        style={{
          backgroundColor: "#374151",
          borderColor: "#6b7280",
          marginBottom: 24,
        }}
      >
        <Tabs
          defaultActiveKey="search"
          type="card"
          items={[
            {
              key: "search",
              label: "Search Seller",
              children: renderSearchTab(),
            },
            {
              key: "create",
              label: "Create / Upload New",
              children: renderCreateTab(),
            },
          ]}
        />
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
                value={"$" + (formData.actualPrice || "0")}
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
                value={"$" + (formData.ourPrice || "0")}
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
                value={"$" + (formData.customerPrice || "0")}
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
                value={"$" + (formData.finalPrice || "0")}
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
          marginTop: 24,
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
        >
          Payment
        </Button>
      </div>
    </div>
  );
};

export default UserKYCAndCarDoc;
