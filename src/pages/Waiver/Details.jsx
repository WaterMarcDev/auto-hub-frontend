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
import { customerAPI, uploadAPI } from "../../utils/api";
import dayjs from "dayjs";

const WaiverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await customerAPI.getById(id);
      const data = response.data || response;
      const cust = data.customer || data.seller || data.buyer || data;
      setCustomer(cust);
    } catch (err) {
      console.error("Error fetching customer:", err);
      message.error("Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

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

  if (!customer) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Customer not found</p>
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

          <Card title="Customer Information" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Created Date">
                {customer.createdAt
                  ? dayjs(customer.createdAt).format("MMMM DD, YYYY hh:mm A")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {customer.email || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                {customer.firstName} {customer.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile">
                {customer.mobileNo || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {customer.description || "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="ID Proof & Signature" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ID Proof Type">
                {customer.idProofType || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="ID Proof Number">
                {customer.idProofNumber || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <div>
                  <strong>ID Proof Image:</strong>
                  <br />
                  {customer.idProofImage ? (
                    <Image
                      width={200}
                      src={getImageUrl(customer.idProofImage)}
                      alt="ID Proof"
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Customer Signature:</strong>
                  <br />
                  {customer.signatureImage || customer.signature ? (
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
                        src={getImageUrl(
                          customer.signatureImage || customer.signature
                        )}
                        alt="Customer Signature"
                      />
                    </div>
                  ) : (
                    <span>No signature</span>
                  )}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Transaction/payment info removed: waiver flow now creates customers only via customerAPI */}
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
