import React, { useState, useRef, useEffect } from "react";
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
  message,
} from "antd";
import { uploadAPI } from "../../utils/api";
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
  form, // Ant Design form from parent
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState(
    formData.sellerSignature || null
  );
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Update signature preview when formData.sellerSignature changes (edit mode)
  useEffect(() => {
    if (
      formData.sellerSignature &&
      formData.sellerSignature !== signaturePreview
    ) {
      setSignaturePreview(formData.sellerSignature);
    }
  }, [formData.sellerSignature, signaturePreview]);

  useEffect(() => {
    // initialize canvas for high DPI screens
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    // use the actual displayed size (boundingClientRect) to avoid offset
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width || canvas.clientWidth || 800;
    const cssHeight = rect.height || canvas.clientHeight || 160;
    canvas.width = Math.round(cssWidth * ratio);
    canvas.height = Math.round(cssHeight * ratio);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;

    // Don't draw existing signature image on canvas to avoid tainting it
    // The signature preview will be shown below the canvas instead
  }, []);

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // Prefer offset coordinates from the native event when available (accounts for padding/border)
    const native = e.nativeEvent || e;
    const offsetX =
      (native && (native.offsetX ?? native.layerX ?? native.pageX)) ??
      undefined;
    const offsetY =
      (native && (native.offsetY ?? native.layerY ?? native.pageY)) ??
      undefined;
    if (typeof offsetX === "number" && typeof offsetY === "number") {
      return { x: offsetX, y: offsetY };
    }

    // Support TouchEvent and PointerEvent fallback
    const clientX =
      e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
    const clientY =
      e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
    // Map client coordinates to CSS pixels inside canvas
    const x = (clientX ?? 0) - rect.left;
    const y = (clientY ?? 0) - rect.top;
    return { x, y };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    // capture pointer to continue receiving events outside canvas bounds
    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    const pos = getCanvasPos(e);
    lastPos.current = pos;
  };

  const handlePointerMove = (e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e);
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const handlePointerUp = () => {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture();
      } catch {
        // ignore
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignaturePreview(null);
    updateFormData({ sellerSignature: null });
    if (form && form.setFieldsValue)
      form.setFieldsValue({ sellerSignature: null });
  };

  const [uploadingSignature, setUploadingSignature] = useState(false);

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to blob
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    if (!blob) {
      message.error("Failed to read signature from canvas");
      return;
    }

    // Create a file to upload
    const file = new File([blob], `signature-${Date.now()}.png`, {
      type: "image/png",
    });

    setUploadingSignature(true);
    try {
      const resp = await uploadAPI.uploadImage(file);
      const result = resp.data || resp;

      // Determine a usable URL from response
      const possible =
        result.url ||
        result.imageUrl ||
        result.path ||
        result.filename ||
        result.file ||
        result.originalName ||
        result.name;
      const uploadedUrl = uploadAPI.getImageUrl(possible);

      if (!uploadedUrl) {
        // Fallback to data URL preview if backend didn't return a usable path
        const dataUrl = canvas.toDataURL("image/png");
        setSignaturePreview(dataUrl);
        updateFormData({ sellerSignature: dataUrl });
        if (form && form.setFieldsValue)
          form.setFieldsValue({ sellerSignature: dataUrl });
        message.warning(
          "Uploaded signature but server did not return a file URL; using local data URL."
        );
      } else {
        setSignaturePreview(uploadedUrl);
        updateFormData({ sellerSignature: uploadedUrl });
        if (form && form.setFieldsValue)
          form.setFieldsValue({ sellerSignature: uploadedUrl });
        console.log("Signature saved to formData:", uploadedUrl);
        message.success("Signature uploaded successfully");
      }
    } catch (err) {
      console.error("Signature upload failed:", err);
      message.error(
        err.response?.data?.error || err.message || "Failed to upload signature"
      );
    } finally {
      setUploadingSignature(false);
    }
  };

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

      {/* Signature pad - visible for both tabs (select seller / create seller) */}
      <Card
        title={<Text style={{ color: "white" }}>Seller Signature</Text>}
        style={{
          backgroundColor: "#374151",
          borderColor: "#6b7280",
          marginBottom: 24,
        }}
      >
        <div>
          {/* Disclaimer */}
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#4b5563",
              borderRadius: 6,
              border: "1px solid #6b7280",
            }}
          >
            <Text
              style={{ color: "#d1d5db", fontSize: "13px", lineHeight: 1.6 }}
            >
              <strong>Declaration:</strong> I certify I own the vehicle as
              described above. I warrant I have the right to sell it, and it is
              free of liens. I sell all my rights in this vehicle to RTX
              Recycling LLC. I release RTX Recycling LLC from any liability
              related to this vehicle. This agreement supersedes all prior
              agreements. This agreement is governed by the laws of the State of
              New Jersey.
            </Text>
          </div>

          <canvas
            ref={canvasRef}
            id="seller-signature-canvas"
            // // width={800}
            // height={160}
            style={{
              width: "100%",
              height: "250px",
              // maxWidth: "820px",
              border: "1px dashed #6b7280",
              borderRadius: 6,
              touchAction: "none",
              background: "white",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Button onClick={clearSignature} size="middle">
              Clear
            </Button>
            <Button
              type="primary"
              onClick={saveSignature}
              size="middle"
              loading={uploadingSignature}
              disabled={uploadingSignature}
            >
              {uploadingSignature ? "Uploading..." : "Save Signature"}
            </Button>
            <Text style={{ color: "#9ca3af", marginLeft: 8 }}>
              {signaturePreview
                ? "Draw a new signature to replace the saved one."
                : "Ask seller to sign on screen. Saved signature appears as preview."}
            </Text>
          </div>

          <div style={{ marginTop: 12 }}>
            {signaturePreview ? (
              <div>
                <Text style={{ color: "#d1d5db", fontWeight: 500 }}>
                  Saved Signature:
                </Text>
                <div
                  style={{
                    marginTop: 8,
                    padding: 12,
                    backgroundColor: "#4b5563",
                    borderRadius: 8,
                    border: "1px solid #6b7280",
                    width: "100%",
                  }}
                >
                  <img
                    src={signaturePreview}
                    alt="signature preview"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "200px",
                      display: "block",
                      backgroundColor: "white",
                      border: "1px solid #9ca3af",
                      borderRadius: 4,
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
            ) : (
              <Text style={{ color: "#9ca3af" }}>No signature saved yet.</Text>
            )}
          </div>

          {/* Hidden Form Item to allow Antd validation from parent form */}
          <div style={{ display: "none" }}>
            <Form.Item
              name="sellerSignature"
              rules={[
                { required: true, message: "Seller signature is required" },
              ]}
            >
              <Input value={formData.sellerSignature} readOnly />
            </Form.Item>
          </div>
        </div>
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
