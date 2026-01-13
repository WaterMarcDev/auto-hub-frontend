import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Result,
  Modal,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  PrinterOutlined,
  PlusOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const CarInventory = ({ formData, prevStep, id }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    status: "",
  });

  const showModal = (title, message) => {
    // open modal in pending state, then switch to success
    setModalContent({ title, message, status: "pending" });
    setModalVisible(true);
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
    setModalContent({ title: "", message: "", status: "" });
  };

  const openPrintSlip = () => {
    // Fetch the rendered slip HTML from the backend and print inside a hidden iframe
    (async () => {
      try {
        const base = (
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        ).replace(/\/api\/?$/, "");
        // Determine car intake id: prefer formData._id or formData.id, otherwise try to parse from the URL
        const carId =
          id || // prioritize calling prop
          formData?._id ||
          formData?.id ||
          (() => {
            try {
              const m = window.location.pathname.match(
                /\/car-intake\/(?:([^/]+))(?:\/?|$)/
              );
              return m ? m[1] : null;
            } catch {
              return null;
            }
          })();

        if (!carId) {
          message.error("Unable to determine Car Intake id for printing.");
          return;
        }

        const url = `${base}/api/car-intake/${carId}/print-payment`;

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
        // Determine car intake id: prefer formData._id or formData.id, otherwise try to parse from the URL
        const carId =
          id || // prioritize calling prop
          formData?._id ||
          formData?.id ||
          (() => {
            try {
              const m = window.location.pathname.match(
                /\/car-intake\/(?:([^/]+))(?:\/?|$)/
              );
              return m ? m[1] : null;
            } catch {
              return null;
            }
          })();

        if (!carId) {
          message.error("Unable to determine Car Intake id for printing.");
          return;
        }

        const url = `${base}/api/car-intake/${carId}/print-all-documents`;

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
        message.error(
          err.message || "Failed to print documents. Please try again."
        );
      }
    })();
  };

  return (
    <div>
      <Result
        icon={<CheckCircleOutlined style={{ color: "#10b981" }} />}
        title={
          <Title level={3} style={{ color: "white" }}>
            Confirm Details
          </Title>
        }
        subTitle={
          <Text style={{ color: "#9ca3af" }}>
            Confirm all the details mentioned below
          </Text>
        }
        style={{ marginBottom: "32px" }}
      />

      <Row gutter={24} style={{ marginBottom: "24px" }}>
        <Col span={12}>
          <Card
            title={
              <Title level={4} style={{ color: "white", margin: 0 }}>
                Car Details
              </Title>
            }
            style={{ backgroundColor: "#1F293D", borderColor: "#6b7280" }}
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

      <Card
        style={{
          backgroundColor: "#374151",
          borderColor: "#6b7280",
          marginBottom: "24px",
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={<Text style={{ color: "white" }}>Paid To</Text>}>
              <Select
                value={formData.paidTo || "Not selected"}
                disabled
                style={{ width: "100%" }}
              >
                <Option value="Cash">Cash</Option>
                <Option value="Bank Transfer">Bank Transfer</Option>
                <Option value="Zelle">Zelle</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <Text style={{ color: "white" }}>Amount Paid to Seller</Text>
              }
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
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              label={<Text style={{ color: "white" }}>Description</Text>}
            >
              <TextArea
                rows={4}
                value={formData.paymentDescription || "No description provided"}
                readOnly
                style={{
                  backgroundColor: "#4b5563",
                  borderColor: "#6b7280",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <div className="d-flex justify-content-between">
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
          Payment
        </Button>
        <div className="d-flex gap-3">
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
      </div>

      <Modal
        title={<span>{modalContent.title}</span>}
        open={modalVisible}
        onOk={handleModalClose}
        onCancel={handleModalClose}
        centered
        footer={
          modalContent?.status === "success"
            ? [
                <Button key="ok" type="primary" onClick={handleModalClose}>
                  OK
                </Button>,
              ]
            : null
        }
      >
        {modalContent?.status === "pending" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Spin />
            <p style={{ color: "#d1d5db", marginBottom: 0 }}>
              {modalContent.message}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ color: "#10b981", marginBottom: 8 }}>
              {modalContent.message}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CarInventory;
