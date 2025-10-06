import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Descriptions,
  Image,
  Spin,
  message,
  Button,
  Tag,
  Row,
  Col,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { waiverAPI, uploadAPI } from "../../utils/api";
import dayjs from "dayjs";

const WaiverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [waiver, setWaiver] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWaiverDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await waiverAPI.getById(id);
      setWaiver(response.data.waiver);
    } catch (err) {
      console.error("Error fetching waiver:", err);
      message.error("Failed to fetch waiver details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWaiverDetails();
  }, [fetchWaiverDetails]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return uploadAPI.getImageUrl(imagePath);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!waiver) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Waiver not found</p>
        <Button onClick={() => navigate("/waivers")}>Back to List</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title-box">
        <div className="page-title">
          <h4>Waiver Details</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Waivers</a>
            </li>
            <li className="breadcrumb-item active">Details</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/waivers")}
            style={{ marginBottom: 16 }}
          >
            Back to List
          </Button>

          <Card title="Waiver Information" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Waiver ID">
                {waiver._id}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Type">
                <Tag
                  color={waiver.customerType === "seller" ? "blue" : "green"}
                >
                  {waiver.customerType?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                {dayjs(waiver.createdAt).format("MMMM DD, YYYY hh:mm A")}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {waiver.createdBy
                  ? `${waiver.createdBy.first_name} ${waiver.createdBy.last_name}`
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {waiver.seller && (
            <Card title="Seller Information" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Name">
                  {waiver.seller.firstName} {waiver.seller.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {waiver.seller.email || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Mobile">
                  {waiver.seller.mobileNo || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Driver's License">
                  {waiver.seller.driversLicense ? (
                    <Image
                      width={100}
                      src={getImageUrl(waiver.seller.driversLicense)}
                      alt="Driver's License"
                    />
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {waiver.buyer && (
            <Card title="Buyer Information" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Name">
                  {waiver.buyer.firstName} {waiver.buyer.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {waiver.buyer.email || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Mobile">
                  {waiver.buyer.mobileNo || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {waiver.buyer.description || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          <Card title="ID Proof Information" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ID Proof Type">
                {waiver.idProofType || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="ID Proof Number">
                {waiver.idProofNumber || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <div>
                  <strong>ID Proof Image:</strong>
                  <br />
                  {waiver.idProofImage ? (
                    <Image
                      width={200}
                      src={getImageUrl(waiver.idProofImage)}
                      alt="ID Proof"
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <strong>Customer Signature:</strong>
                  <br />
                  {waiver.signatureImage ? (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "8px",
                        marginTop: 8,
                        display: "inline-block",
                      }}
                    >
                      <Image
                        width={200}
                        src={getImageUrl(waiver.signatureImage)}
                        alt="Customer Signature"
                      />
                    </div>
                  ) : (
                    <span>No signature</span>
                  )}
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <strong>Employee Signature:</strong>
                  <br />
                  {waiver.employeeSignature ? (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "8px",
                        marginTop: 8,
                        display: "inline-block",
                      }}
                    >
                      <Image
                        width={200}
                        src={getImageUrl(waiver.employeeSignature)}
                        alt="Employee Signature"
                      />
                    </div>
                  ) : (
                    <span>No signature</span>
                  )}
                </div>
              </Col>
            </Row>
          </Card>

          {waiver.payment && (
            <Card title="Transaction Information">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Type">
                  <Tag
                    color={waiver.payment.type === "credit" ? "green" : "red"}
                  >
                    {waiver.payment.type?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Amount">
                  ${waiver.payment.amount?.toFixed(2) || "0.00"}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {waiver.payment.paymentMethod || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={
                      waiver.payment.status === "completed"
                        ? "green"
                        : waiver.payment.status === "pending"
                        ? "orange"
                        : "red"
                    }
                  >
                    {waiver.payment.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Transaction Date">
                  {dayjs(waiver.payment.transactionDate).format(
                    "MMMM DD, YYYY hh:mm A"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  {waiver.payment.description || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </div>
      </div>
      <style>{`
  .ant-image-preview-img {
    background: #fff !important;
  }
`}</style>
    </div>
  );
};

export default WaiverDetails;
