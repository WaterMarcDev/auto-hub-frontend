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

const CarInventory = ({ formData, prevStep, handleSubmit }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  const showModal = (title, message) => {
    setModalContent({ title, message });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
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
            <Form.Item label={<Text style={{ color: "white" }}>Amount</Text>}>
              <Input
                value={`$${formData.paymentAmount || "0"}`}
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

      <div style={{ textAlign: "center" }}>
        <Space wrap size="middle">
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

          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            icon={<DollarOutlined />}
            style={{ backgroundColor: "#059669", borderColor: "#059669" }}
          >
            Pay Now
          </Button>

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
              showModal("Car Inventory", "Car is being added to the inventory")
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

      <Modal
        title={<span style={{ color: "#f9fafb" }}>{modalContent.title}</span>}
        open={modalVisible}
        onOk={handleModalClose}
        onCancel={handleModalClose}
        centered
        styles={{
          content: {
            backgroundColor: "#374151",
            color: "white",
          },
          header: {
            backgroundColor: "#374151",
            borderBottom: "1px solid #6b7280",
            color: "#f9fafb",
          },
          body: {
            backgroundColor: "#374151",
          },
        }}
        footer={[
          <Button key="ok" type="primary" onClick={handleModalClose}>
            OK
          </Button>,
        ]}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Spin />
          <p style={{ color: "#d1d5db", marginBottom: 0 }}>
            {modalContent.message}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default CarInventory;
