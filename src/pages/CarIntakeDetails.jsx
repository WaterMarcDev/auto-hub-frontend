import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Image,
  Tag,
  Button,
  message,
  Spin,
  Row,
  Col,
  Modal,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { carIntakeAPI, uploadAPI } from "../utils/api";

const CarIntakeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  const showModal = (title, message) => {
    // Open modal in pending state
    setModalContent({ title, message, status: "pending" });
    setModalVisible(true);

    // Simulate completion: update modal content to success but do not close automatically
    setTimeout(() => {
      setModalContent({
        title: `${title} - Success`,
        message: `${title} completed successfully`,
        status: "success",
      });
    }, 900);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await carIntakeAPI.getById(id);
        const payload = res.data || res;
        const carData = payload.carIntake || payload;
        setCar(carData);
        if (payload.transaction) setTransaction(payload.transaction);
        else if (carData.transaction) setTransaction(carData.transaction);
        else setTransaction(null);
      } catch (err) {
        message.error(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch car intake"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Ensure preview container has higher z-index than sidebar (e.g. 999)
  const getPreviewContainer = () => {
    let el = document.getElementById("image-preview-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "image-preview-root";
      // position/fixed not necessary; ensure z-index higher than sidebar
      el.style.zIndex = "2000";
      document.body.appendChild(el);
    }
    return el;
  };

  const renderDocuments = () => {
    if (!car) return <span>N/A</span>;
    // documents may be stored similar to images: car.documents object, document1..N fields, or documents array
    const collected = [];
    const kycDocs = car?.kyc?.documents;
    if (kycDocs && typeof kycDocs === "object") {
      collected.push(...Object.values(kycDocs));
    }

    Object.keys(car || {})
      .filter((k) => /^document\d+$/.test(k) || /Document$/.test(k))
      .forEach((k) => {
        if (car[k]) collected.push(car[k]);
      });

    if (Array.isArray(car?.documentsArray))
      collected.push(...car.documentsArray);

    const docs = [...new Set(collected.filter(Boolean))];
    if (!docs.length) return <span>N/A</span>;

    return (
      <Row gutter={[12, 12]}>
        {docs.map((doc, idx) => {
          // If doc looks like an image, render Image with preview; otherwise render a download link
          const url = uploadAPI.getImageUrl(doc);
          const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(
            String(url).split("?")[0]
          );
          return (
            <Col key={idx}>
              {isImage ? (
                <Image
                  width={120}
                  src={url}
                  alt={`doc-${idx}`}
                  preview={{ getContainer: getPreviewContainer }}
                />
              ) : (
                <a href={url} target="_blank" rel="noreferrer">
                  Document {idx + 1}
                </a>
              )}
            </Col>
          );
        })}
      </Row>
    );
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <Spin size="large" />
      </div>
    );

  if (!car)
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <p>No car intake found.</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </Card>
      </div>
    );

  const renderImages = () => {
    if (!car) return <span>N/A</span>;
    // Collect images from multiple possible shapes:
    // 1) car.carImages as an object { image1: url, ... }
    // 2) top-level image1..imageN fields
    // 3) car.images as an array
    const collected = [];

    if (car.imagesStep && typeof car.imagesStep === "object") {
      collected.push(...Object.values(car.imagesStep));
    }

    // pick up top-level image1..imageN fields if present
    Object.keys(car || {})
      .filter((k) => /^image\d+$/.test(k))
      .sort(
        (a, b) =>
          parseInt(a.replace("image", "")) - parseInt(b.replace("image", ""))
      )
      .forEach((k) => collected.push(car[k]));

    if (Array.isArray(car.images)) {
      collected.push(...car.images);
    }

    // Deduplicate and remove falsy values
    const images = [...new Set(collected.filter(Boolean))];
    if (!images.length) return <span>N/A</span>;

    // preview container is defined above
    return (
      <Row gutter={[12, 12]}>
        {images.map((img, idx) => (
          <Col key={idx}>
            <Image
              width={120}
              src={uploadAPI.getImageUrl(img)}
              alt={`${car?.model || car?.make || "car"}-img-${idx}`}
              preview={{ getContainer: getPreviewContainer }}
            />
          </Col>
        ))}
      </Row>
    );
  };

  const formatPartName = (key) => {
    // camelCase or snake_case -> Title Case
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderParts = () => {
    if (!car) return <span>N/A</span>;
    const parts = car.parts || {};
    const entries = Object.entries(parts || {});
    if (!entries.length) return <span>N/A</span>;

    return (
      <Row gutter={[12, 12]}>
        {entries.map(([key, val]) => (
          <Col key={key} xs={24} sm={12} md={8} lg={6}>
            <Card
              size="small"
              style={{ backgroundColor: "#111827", borderColor: "#374151" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#e5e7eb",
                      textTransform: "capitalize",
                      marginBottom: 6,
                    }}
                  >
                    {formatPartName(key)}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>
                    Units: {val?.unit ?? 0}
                  </div>
                  {val?.quality ? (
                    <div style={{ color: "#9ca3af", fontSize: 12 }}>
                      Quality: {val.quality}
                    </div>
                  ) : null}
                  {val?.weight ? (
                    <div style={{ color: "#9ca3af", fontSize: 12 }}>
                      Weight: {val.weight}
                    </div>
                  ) : null}
                  {val?.dimensions ? (
                    <div style={{ color: "#9ca3af", fontSize: 12 }}>
                      Dimensions: {val.dimensions}
                    </div>
                  ) : null}
                </div>
                <Tag color={val?.selected ? "green" : "default"}>
                  {val?.selected ? "Selected" : "No"}
                </Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderTransaction = () => {
    if (!transaction) return <span>N/A</span>;

    return (
      <Card title="Transaction Summary" size="small" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: "#e5e7eb" }}>Amount</div>
            <div style={{ fontWeight: 600 }}>${transaction.amount}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: "#e5e7eb" }}>Method</div>
            <div>{transaction.paymentMethod || transaction.type || "N/A"}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: "#e5e7eb" }}>Status</div>
            <Tag
              color={
                transaction.status === "completed"
                  ? "green"
                  : transaction.status === "pending"
                  ? "orange"
                  : "default"
              }
            >
              {transaction.status}
            </Tag>
          </Col>
        </Row>

        {transaction.description && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: "#e5e7eb" }}>Description</div>
            <div>{transaction.description}</div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div>
      <div className="page-title-box">
        <div className="page-title">
          <h4>Car Intake Details</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Scrap Yard</a>
            </li>
            <li className="breadcrumb-item active">Details</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card
            title={`${car?.vin || "-"} ${
              car?.carDetails?.make ? `• ${car?.carDetails?.make}` : ""
            }`}
            extra={
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                Back
              </Button>
            }
          >
            <Descriptions column={2} bordered>
              <Descriptions.Item label="VIN">
                {car?.vin || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Intake By">
                {(car?.createdBy &&
                  `${
                    car?.createdBy?.first_name ||
                    car?.createdBy?.firstName ||
                    ""
                  } ${
                    car?.createdBy?.last_name || car?.createdBy?.lastName || ""
                  }`.trim()) ||
                  "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Make">
                {car?.carDetails?.make || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Model">
                {car?.carDetails?.model || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Year">
                {car?.carDetails?.year || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trim">
                {car?.carDetails?.trim || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Color">
                {car?.carDetails?.color || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Body Class">
                {car?.carDetails?.bodyClass || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Transmission">
                {car?.carDetails?.transmission || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Drive">
                {car?.carDetails?.drive || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Fuel Type">
                {car?.carDetails?.fuelType || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Chassis No.">
                {car?.carDetails?.chassisNo || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Engine No.">
                {car?.carDetails?.engineNo || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Scrap Yard">
                {car?.carDetails?.scrapYardName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Scrap Yard Location">
                {car?.carDetails?.scrapYardLocation || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Has Keys">
                <Tag color={car?.carDetails?.keys ? "blue" : "red"}>
                  {car?.carDetails?.keys ? "Yes" : "No"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag>{car?.status || "intake"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Final Price">
                {car?.price?.finalPrice ? `$${car?.price?.finalPrice}` : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {car?.payment?.paymentMethod || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Seller Name">
                {car?.seller
                  ? `${car?.seller?.firstName || ""} ${
                      car?.seller?.lastName || ""
                    }`.trim() || "N/A"
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Seller Phone">
                {(car?.seller &&
                  (car?.seller?.mobileNo || car?.seller?.phone)) ||
                  "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Seller Email">
                {(car?.seller && car?.seller?.email) || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Seller Description" span={2}>
                {(car?.seller && car?.seller?.description) || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Images" span={2}>
                {renderImages()}
              </Descriptions.Item>

              <Descriptions.Item label="Documents" span={2}>
                {renderDocuments()}
              </Descriptions.Item>

              <Descriptions.Item label="Parts" span={2}>
                {renderParts()}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 18, textAlign: "center" }}>
              <Space wrap size="middle">
                <Button
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    showModal(
                      "Car Parts Inventory",
                      "Car Parts are being added to the inventory"
                    )
                  }
                  style={{
                    backgroundColor: "#3b82f6",
                    borderColor: "#3b82f6",
                    color: "white",
                  }}
                >
                  Car Parts Inventory
                </Button>

                <Button
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    showModal(
                      "Car Inventory",
                      "Car is being added to the inventory"
                    )
                  }
                  style={{
                    backgroundColor: "#3b82f6",
                    borderColor: "#3b82f6",
                    color: "white",
                  }}
                >
                  Car Inventory
                </Button>

                <Button
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={() =>
                    showModal(
                      "Print Receipt",
                      "Receipt is being generated and printed"
                    )
                  }
                  style={{
                    backgroundColor: "#8b5cf6",
                    borderColor: "#8b5cf6",
                    color: "white",
                  }}
                >
                  Print Receipt
                </Button>

                <Button
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={() =>
                    showModal(
                      "Print Document",
                      "Document is being generated and printed"
                    )
                  }
                  style={{
                    backgroundColor: "#8b5cf6",
                    borderColor: "#8b5cf6",
                    color: "white",
                  }}
                >
                  Print Document
                </Button>

                <Button
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={() =>
                    showModal(
                      "Print Seller Copy",
                      "Seller copy is being generated and printed"
                    )
                  }
                  style={{
                    backgroundColor: "#8b5cf6",
                    borderColor: "#8b5cf6",
                    color: "white",
                  }}
                >
                  Print Seller Copy
                </Button>
              </Space>
            </div>
          </Card>
          {renderTransaction()}
        </div>
        <ActionModal
          visible={modalVisible}
          content={modalContent}
          onClose={handleModalClose}
        />
      </div>
    </div>
  );
};

// Modal to show action progress
const ActionModal = ({ visible, content, onClose }) => {
  const status = content?.status || "pending";
  return (
    <Modal
      title={<span>{content.title}</span>}
      open={visible}
      onOk={onClose}
      onCancel={onClose}
      centered
      footer={
        status === "success"
          ? [
              <Button key="ok" type="primary" onClick={onClose}>
                OK
              </Button>,
            ]
          : null
      }
    >
      {status === "pending" ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Spin />
          <p style={{ color: "#374151", marginBottom: 0 }}>{content.message}</p>
        </div>
      ) : (
        <div>
          <p style={{ color: "#10b981", marginBottom: 8 }}>{content.message}</p>
        </div>
      )}
    </Modal>
  );
};

export default CarIntakeDetails;
