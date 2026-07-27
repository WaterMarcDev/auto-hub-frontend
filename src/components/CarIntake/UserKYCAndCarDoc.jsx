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
  Modal,
  Image,
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
import { getNegotiationLabel } from "./intakeConstants";

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
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);
  const [sigModalVisible, setSigModalVisible] = useState(false);
  const [sigModalUrl, setSigModalUrl] = useState(null);
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

  // Debug: log initial formData and changes to seller selection
  const debugSellerId = formData && formData.sellerId;
  const debugSelectedSeller = formData && formData.selectedSellerData;
  useEffect(() => {
    console.debug("UserKYCAndCarDoc props/changes", {
      sellerId: debugSellerId,
      selectedSellerData: debugSelectedSeller,
    });
  }, [debugSellerId, debugSelectedSeller]);

  useEffect(() => {
    // initialize and keep the canvas sized correctly for high DPI and responsive layout
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const applyContextSettings = () => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2.5;
    };

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      // use the actual displayed size (boundingClientRect) to avoid offset
      const rect = canvas.getBoundingClientRect();
      const cssWidth = rect.width || canvas.clientWidth || 800;
      const cssHeight = rect.height || canvas.clientHeight || 160;

      // Set the internal pixel size taking device pixel ratio into account
      canvas.width = Math.round(cssWidth * ratio);
      canvas.height = Math.round(cssHeight * ratio);

      // Keep the CSS size so it remains responsive in layout
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      // Scale drawing operations to device pixels
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any existing transform
      ctx.scale(ratio, ratio);
      applyContextSettings();
    };

    // Initial sizing
    resizeCanvas();

    // Watch for parent/container resize to keep canvas responsive
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        // When container/canvas size changes, reinitialize pixel buffer
        resizeCanvas();
      });
      // Observe the canvas' parent if available, otherwise the canvas itself
      const target = canvas.parentElement || canvas;
      ro.observe(target);
    } else {
      // Fallback: window resize
      window.addEventListener("resize", resizeCanvas);
    }

    // Don't draw existing signature image on canvas to avoid tainting it
    // The signature preview (saved image) will be shown below the canvas instead

    return () => {
      if (ro && ro.disconnect) ro.disconnect();
      else window.removeEventListener("resize", resizeCanvas);
    };
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

  const openDocModal = (url) => {
    if (!url) return;
    const isPdf = String(url).toLowerCase().endsWith(".pdf");
    setDocModalIsPdf(isPdf);
    setDocModalUrl(uploadAPI.getImageUrl(url));
    setDocModalVisible(true);
  };

  const closeDocModal = () => {
    setDocModalVisible(false);
    setDocModalUrl(null);
    setDocModalIsPdf(false);
  };

  const openSignatureModal = (url) => {
    if (!url) return;
    setSigModalUrl(uploadAPI.getImageUrl(url));
    setSigModalVisible(true);
  };

  const closeSignatureModal = () => {
    setSigModalVisible(false);
    setSigModalUrl(null);
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
    // Search customers endpoint for type 'seller' to find seller records
    if (!q || q.length < 2) return;
    setSearchLoading(true);
    try {
      const api = await import("../../utils/api");
      // customer API returns { customers, pagination }
      const res = await api.customerAPI.getAll({
        search: q,
        type: "seller",
        limit: 10,
      });
      const customers = (res && res.data && res.data.customers) || [];
      setSearchResults(customers);
    } catch (err) {
      console.error("Seller search (customers) error", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSeller = (seller) => {
    if (!seller) return;
    // Only store reference to the existing seller. Do not populate the full
    // seller form fields when selecting an existing seller — backend updates
    // should receive only the seller _id.
    updateFormData({
      sellerId: seller._id || seller.id || null,
      selectedSellerData: seller,
    });
  };

  const handleClearSelection = () => {
    // Clear only the seller selection; leave other form fields untouched
    // in case user was filling/creating a new seller.
    updateFormData({
      sellerId: null,
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

  const handleRemoveImage = (field) => {
    if (!field) return;
    updateFormData({ [field]: null });
    if (form && form.setFieldsValue) form.setFieldsValue({ [field]: null });
  };

  // If editing an existing intake and sellerId is present, fetch the customer
  // record so the selected-seller card shows up automatically.
  const sellerIdForFetch = formData && formData.sellerId;

  const hasSelectedSeller = !!(formData && formData.selectedSellerData);

  useEffect(() => {
    const fetchSellerIfNeeded = async () => {
      if (!sellerIdForFetch) return;
      // If selectedSellerData already present, don't refetch
      if (hasSelectedSeller) {
        console.debug(
          "fetchSellerIfNeeded: already have selectedSellerData, skipping fetch",
          {
            sellerIdForFetch,
          }
        );
        return;
      }
      console.debug("fetchSellerIfNeeded: attempting fetch for sellerId", {
        sellerIdForFetch,
      });
      try {
        const api = await import("../../utils/api");
        const res = await api.customerAPI.getById(sellerIdForFetch);
        const seller = res && res.data ? res.data.customer || res.data : null;
        if (seller) {
          // Ensure sellerId is present in formData and selectedSellerData is set
          updateFormData({
            sellerId: seller._id || seller.id || sellerIdForFetch,
            selectedSellerData: seller,
          });
          // also set signature preview if available
          if (seller.signatureImage || seller.signature) {
            const sig = seller.signatureImage || seller.signature;
            // set signature preview only if not already present
            if (!signaturePreview) setSignaturePreview(sig);
          }
          console.debug(
            "Fetched seller for sellerId",
            sellerIdForFetch,
            seller
          );
        }
      } catch (err) {
        console.error("Failed to fetch seller by ID", err);
      }
    };

    fetchSellerIfNeeded();
  }, [sellerIdForFetch, hasSelectedSeller, updateFormData, signaturePreview]);

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
        {/* Show uploaded image with remove button like CarImages */}
        {formData[field] && formData[field].uploaded ? (
          <div>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Image
                src={uploadAPI.getImageUrl(formData[field].url)}
                alt={formData[field].name}
                style={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
                preview={{
                  mask: <div>Click to preview</div>,
                }}
              />
              <Button
                danger
                size="small"
                onClick={() => handleRemoveImage(field)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  zIndex: 1,
                }}
                icon={<i className="fas fa-times"></i>}
              >
                Remove
              </Button>
            </div>
            <Text style={{ color: "#10b981", fontSize: 12 }}>
              ✓ Uploaded: {formData[field].name}
            </Text>
          </div>
        ) : (
          <CameraUpload
            onImageUpload={(result) => handleImageUpload(field, result)}
            multiple={false}
            showPreview={true}
            autoUpload={true}
            className="document-upload"
          />
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
                  onClick={() =>
                    openDocModal(formData.selectedSellerData.driversLicense)
                  }
                  style={{ padding: 0, color: "#60a5fa" }}
                >
                  View Document
                </Button>
              </Descriptions.Item>
            )}
            {/* ID Proof fields from Customer model (used when searching customers of type 'seller') */}
            {formData.selectedSellerData.idProofType && (
              <Descriptions.Item
                label={
                  <Text style={{ color: "#9ca3af" }}>
                    {formData.selectedSellerData.idProofType}
                  </Text>
                }
                contentStyle={{
                  backgroundColor: "#374151",
                  color: "white",
                  fontWeight: 600,
                }}
                labelStyle={{ backgroundColor: "#1f2937", color: "#9ca3af" }}
              >
                {formData.selectedSellerData.idProofNumber || "N/A"}
              </Descriptions.Item>
            )}

            {formData.selectedSellerData.idProofImage && (
              <Descriptions.Item
                label={
                  <Text style={{ color: "#9ca3af" }}>
                    <IdcardOutlined /> ID Proof Image
                  </Text>
                }
                contentStyle={{ backgroundColor: "#374151", color: "white" }}
                labelStyle={{ backgroundColor: "#1f2937", color: "#9ca3af" }}
              >
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    openDocModal(formData.selectedSellerData.idProofImage)
                  }
                  style={{ padding: 0, color: "#60a5fa" }}
                >
                  View ID Image
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
            {/* Signature stored on customer as signatureImage (or signature) */}
            {(formData.selectedSellerData.signatureImage ||
              formData.selectedSellerData.signature) && (
              <Descriptions.Item
                label={<Text style={{ color: "#9ca3af" }}>Signature</Text>}
                contentStyle={{ backgroundColor: "#374151", color: "white" }}
                labelStyle={{ backgroundColor: "#1f2937", color: "#9ca3af" }}
              >
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    openSignatureModal(
                      formData.selectedSellerData.signatureImage ||
                        formData.selectedSellerData.signature
                    )
                  }
                  style={{ padding: 0, color: "#60a5fa" }}
                >
                  View Signature
                </Button>
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
        {/* Hidden field: require sellerId when using Search Seller tab so the
            parent form validates presence of a seller reference instead of
            requiring the full seller form inputs. */}
        <div style={{ display: "none" }}>
          <Form.Item
            name="sellerId"
            rules={[
              {
                required: true,
                message: "Select a seller or create a new one",
              },
            ]}
          >
            <Input value={formData.sellerId} readOnly />
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
              "physicalPaper",
              "Upload Physical Paper",
              "Take a clear photo of the vehicle's physical registration paper",
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
              // true
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
                <Option value="Brought In">Brought In</Option>
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

  return (
    <div>
      <Card
        style={{
          backgroundColor: "#374151",
          borderColor: "#6b7280",
          marginBottom: 24,
        }}
      >
        <Tabs defaultActiveKey="search" type="card">
          <Tabs.TabPane tab="Search Seller" key="search">
            {renderSearchTab()}
          </Tabs.TabPane>
        </Tabs>
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

          <div
            style={{
              width: "100%",
              overflow: "hidden",
              borderRadius: 6,
              border: "1px dashed #6b7280",
              background: "white",
            }}
          >
            <canvas
              ref={canvasRef}
              id="seller-signature-canvas"
              // // width={800}
              // height={160}
              style={{
                width: "100%",
                height: "250px",
                maxWidth: "100%",
                display: "block",
                boxSizing: "border-box",
                touchAction: "none",
                background: "white",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>

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
                // { required: true, message: "Seller signature is required" },
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
                value={getNegotiationLabel(formData.negotiateTo)}
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
      {/* Document / Signature Preview Modals */}
      <Modal
        open={docModalVisible}
        onCancel={closeDocModal}
        footer={null}
        width={800}
      >
        {docModalUrl ? (
          docModalIsPdf ? (
            <iframe
              src={docModalUrl}
              title="Document Preview"
              style={{ width: "100%", height: "70vh", border: 0 }}
            />
          ) : (
            <img
              src={docModalUrl}
              alt="Document Preview"
              style={{ width: "100%", height: "auto" }}
            />
          )
        ) : (
          <div style={{ textAlign: "center" }}>No document</div>
        )}
      </Modal>

      <Modal
        title={"Signature Preview"}
        open={sigModalVisible}
        onCancel={closeSignatureModal}
        footer={null}
        width={600}
        bodyStyle={{ backgroundColor: "#ffffff" }}
      >
        {sigModalUrl ? (
          <img
            src={sigModalUrl}
            alt="Signature"
            style={{ width: "100%", height: "auto" }}
          />
        ) : (
          <div style={{ textAlign: "center" }}>No signature</div>
        )}
      </Modal>
    </div>
  );
};

export default UserKYCAndCarDoc;
