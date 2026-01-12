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
import getStatusColor from "../utils/statusColors";

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

    if (car?.imagesStep && typeof car.imagesStep === "object") {
      // Only include values that are strings and look like image paths/URLs.
      // Some keys (e.g. imagesUploadedBy or descriptions) are objects or non-image strings
      // and should not be rendered as images.
      const vals = Object.values(car.imagesStep).filter((v) => {
        if (!v) return false;
        if (typeof v === "string") {
          // consider strings that contain "/uploads/" or image file extensions
          return /\/(uploads|images)\/|\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(
            v
          );
        }
        return false;
      });
      collected.push(...vals);
    }

    // pick up top-level image1..imageN fields if present
    Object.keys(car || {})
      .filter((k) => /^image\d+$/.test(k))
      .sort(
        (a, b) =>
          parseInt(a.replace("image", "")) - parseInt(b.replace("image", ""))
      )
      .forEach((k) => collected.push(car[k]));

    if (Array.isArray(car?.images)) {
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
    const parts = car?.partDetails?.parts || {};
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
    if (!transaction) return <div className="p-3"></div>;

    // Helpers / fallbacks for tax values
    const rawAmount = Number(transaction?.amount) || 0;
    const rate =
      transaction && typeof transaction.taxRate === "number"
        ? Number(transaction.taxRate)
        : undefined;
    const defaultRate = 0.06625; // 6.625% fallback
    const usedRate = rate != null ? rate : defaultRate;
    const taxAmt =
      transaction && typeof transaction.taxAmount === "number"
        ? Number(transaction.taxAmount)
        : Math.round((Math.abs(rawAmount) * usedRate + Number.EPSILON) * 100) /
          100;

    const netAmt =
      transaction && typeof transaction.netAmount === "number"
        ? Number(transaction.netAmount)
        : transaction?.type === "debit"
        ? Math.round((rawAmount - taxAmt + Number.EPSILON) * 100) / 100
        : Math.round((rawAmount + taxAmt + Number.EPSILON) * 100) / 100;

    const fmt = (v) => `$${(Number(v) || 0).toFixed(2)}`;

    return (
      <Card
        title="Transaction Summary"
        size="small"
        style={{ marginTop: 16, marginBottom: 80 }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: "#e5e7eb" }}>Amount</div>
            <div style={{ fontWeight: 600 }}>{fmt(rawAmount)}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: "#e5e7eb" }}>Method</div>
            <div>
              {transaction?.paymentMethod || transaction?.type || "N/A"}
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: "#e5e7eb" }}>Status</div>
            <Tag
              color={
                transaction?.status === "completed"
                  ? "green"
                  : transaction?.status === "pending"
                  ? "orange"
                  : "default"
              }
            >
              {transaction?.status || "N/A"}
            </Tag>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: "#e5e7eb" }}>Tax Rate</div>
            <div>
              {rate != null ? `${(usedRate * 100).toFixed(3)}%` : "6.625%"}
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: "#e5e7eb" }}>Tax Amount</div>
            <div style={{ fontWeight: 600 }}>{fmt(taxAmt)}</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ color: "#e5e7eb" }}>Net Amount</div>
            <div style={{ fontWeight: 600 }}>{fmt(netAmt)}</div>
          </Col>
        </Row>

        {transaction?.description && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: "#e5e7eb" }}>Description</div>
            <div>{transaction.description}</div>
          </div>
        )}
      </Card>
    );
  };

  const openPrintSlip = () => {
    // Fetch the rendered slip HTML from the backend and print inside a hidden iframe
    (async () => {
      try {
        const base = (
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        ).replace(/\/api\/?$/, "");
        const url = `${base}/api/car-intake/${id}/print-payment`;

        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to load slip: ${res.status}`);
        const html = await res.text();

        // Create hidden iframe
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.style.visibility = "hidden";
        document.body.appendChild(iframe);

        const idoc = iframe.contentWindow || iframe.contentDocument;
        const doc = idoc.document || idoc;
        doc.open();
        doc.write(html);
        doc.close();

        // Wait for content to load then print
        const whenLoaded = () =>
          new Promise((resolve) => {
            const win = iframe.contentWindow || iframe;
            if (win.document.readyState === "complete") return resolve(win);
            win.addEventListener("load", () => resolve(win));
          });

        const win = await whenLoaded();
        try {
          win.focus();
        } catch {
          /* ignore */
        }
        try {
          win.print();
        } catch (errPrint) {
          console.error(errPrint);
        }

        // Cleanup the iframe after a short delay (allow user to finish print dialog)
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {
            /* ignore */
          }
        }, 2000);
      } catch (err) {
        console.error(err);
        message.error(err.message || "Failed to print slip");
      }
    })();
  };

  const openPrintAllDocuments = () => {
    // Fetch the rendered combined documents HTML from the backend and print inside a hidden iframe
    (async () => {
      try {
        const base = (
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        ).replace(/\/api\/?$/, "");
        const url = `${base}/api/car-intake/${id}/print-all-documents`;

        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          if (res.status === 404) {
            message.error("Car intake not found.");
            return;
          }
          throw new Error(`Failed to load documents: ${res.status}`);
        }
        const html = await res.text();

        // Create hidden iframe
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.style.visibility = "hidden";
        document.body.appendChild(iframe);

        const idoc = iframe.contentWindow || iframe.contentDocument;
        const doc = idoc.document || idoc;
        doc.open();
        doc.write(html);
        doc.close();

        // Wait for content to load then print
        const whenLoaded = () =>
          new Promise((resolve) => {
            const win = iframe.contentWindow || iframe;
            if (win.document.readyState === "complete") return resolve(win);
            win.addEventListener("load", () => resolve(win));
          });

        const win = await whenLoaded();
        try {
          win.focus();
        } catch {
          /* ignore */
        }
        try {
          win.print();
        } catch (errPrint) {
          console.error(errPrint);
        }

        // Cleanup the iframe after a short delay (allow user to finish print dialog)
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {
            /* ignore */
          }
        }, 2000);
      } catch (err) {
        console.error(err);
        message.error(err.message || "Failed to print documents. Please try again.");
      }
    })();
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
              <Descriptions.Item label="Engine Size">
                {car?.carDetails?.engine || car?.carDetails?.engineNo || "N/A"}
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
                <Tag color={getStatusColor(car?.status)}>
                  {car?.status || "intake"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Final Price">
                {car?.price?.finalPrice ? `$${car?.price?.finalPrice}` : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {car?.payment?.paymentMethod || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Seller Name">
                {car?.kyc?.seller
                  ? `${car?.kyc?.seller?.firstName || ""} ${
                      car?.kyc?.seller?.lastName || ""
                    }`.trim() || "N/A"
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Seller Phone">
                {(car?.kyc?.seller &&
                  (car?.kyc?.seller?.mobileNo || car?.kyc?.seller?.phone)) ||
                  "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Seller Email">
                {(car?.kyc?.seller && car?.kyc?.seller?.email) || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Seller Description" span={2}>
                {(car?.kyc?.seller && car?.kyc?.seller?.description) || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Seller Signature" span={2}>
                {car?.kyc?.seller?.signatureImage ? (
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 8,
                      border: "1px solid #d9d9d9",
                      display: "inline-block",
                      maxWidth: "100%",
                    }}
                  >
                    <Image
                      src={car.kyc.seller.signatureImage}
                      alt="Seller Signature"
                      style={{
                        maxWidth: "400px",
                        maxHeight: "150px",
                        backgroundColor: "white",
                        border: "1px solid #d9d9d9",
                      }}
                      preview={{
                        mask: "View Signature",
                        getContainer: getPreviewContainer,
                      }}
                    />
                  </div>
                ) : (
                  <></>
                )}
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
            <div className="d-flex justify-content-between mt-4">
              <Button
                size="large"
                icon={<PrinterOutlined />}
                onClick={openPrintAllDocuments}
                style={{
                  backgroundColor: "#8b5cf6",
                  borderColor: "#8b5cf6",
                  color: "white",
                }}
              >
                Print documents
              </Button>
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
