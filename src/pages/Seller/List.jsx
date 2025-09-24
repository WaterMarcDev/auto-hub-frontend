import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  message,
  Input,
  Space,
  Modal,
  Popover,
  Checkbox,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { sellerAPI, uploadAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);
  const [carsModalVisible, setCarsModalVisible] = useState(false);
  const [carsModalSeller, setCarsModalSeller] = useState(null);
  const [carsLoading, setCarsLoading] = useState(false);
  const navigate = useNavigate();

  const getPreviewContainer = () => {
    let el = document.getElementById("image-preview-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "image-preview-root";
      el.style.zIndex = "2000";
      document.body.appendChild(el);
    }
    return el;
  };

  const closeDocModal = () => {
    setDocModalVisible(false);
    setDocModalUrl(null);
    setDocModalIsPdf(false);
  };

  const fetchSellers = async (params = {}) => {
    setLoading(true);
    try {
      const res = await sellerAPI.getAll({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
      });

      const data = res.data || res;
      setSellers(data.sellers || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || err.message || "Failed to fetch sellers"
      );
    } finally {
      setLoading(false);
    }
  };
  const INITIAL_LIMIT = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await sellerAPI.getAll({ page: 1, limit: INITIAL_LIMIT });
        const data = res.data || res;
        setSellers(data.sellers || []);
        if (data.pagination) setPagination(data.pagination);
      } catch (err) {
        console.error(err);
        message.error(
          err.response?.data?.error || err.message || "Failed to fetch sellers"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      render: (firstName, rec) => `${firstName || ""} ${rec.lastName || ""}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobileNo", key: "mobileNo" },
    {
      title: "DL",
      key: "dl",
      render: (text, rec) => {
        const dl = rec.driversLicense;
        const openDoc = (url) => {
          if (!url) return message.error("No document available");
          const lower = String(url).toLowerCase();
          const isPdf = lower.endsWith(".pdf");
          setDocModalIsPdf(isPdf);
          setDocModalUrl(url);
          setDocModalVisible(true);
        };

        return dl ? (
          <Button
            type="primary"
            size="small"
            onClick={() => openDoc(uploadAPI.getImageUrl(dl))}
          >
            Preview
          </Button>
        ) : (
          <span>N/A</span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (text, rec) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => openCarsModal(rec._id)}
          >
            Cars
          </Button>
        </Space>
      ),
    },
  ];

  const openCarsModal = async (sellerId) => {
    setCarsLoading(true);
    try {
      const res = await sellerAPI.getById(sellerId);
      const data = res.data || res;
      setCarsModalSeller(data.seller || data);
      setCarsModalVisible(true);
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.error || err.message || "Failed to load seller cars"
      );
    } finally {
      setCarsLoading(false);
    }
  };

  const closeCarsModal = () => {
    setCarsModalVisible(false);
    setCarsModalSeller(null);
  };

  return (
    <div>
      <div className="page-title-box">
        <div className="page-title">
          <h4>Seller Lists</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Sellers</a>
            </li>
            <li className="breadcrumb-item active">List</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card title="Sellers">
            <div
              style={{
                marginBottom: 12,
                display: "flex",
                justifyContent: "end",
              }}
            >
              <Button
                type="primary"
                onClick={() => (window.location.href = "/seller/register")}
              >
                New Seller
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={sellers}
              rowKey={(r) => r._id || r.email}
              loading={loading}
              size="small"
              bordered={true}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                onChange: (page, pageSize) =>
                  fetchSellers({ page, limit: pageSize }),
              }}
            />
          </Card>
        </div>
      </div>
      <Modal
        title={"Drivers License Preview"}
        open={docModalVisible}
        footer={null}
        onCancel={closeDocModal}
        width={800}
        getContainer={getPreviewContainer}
        style={{ textAlign: "center" }}
      >
        {docModalIsPdf ? (
          <iframe
            src={docModalUrl}
            style={{ width: "100%", height: "60vh", border: "none" }}
          />
        ) : (
          <img
            src={docModalUrl}
            alt="DL"
            style={{ maxWidth: "100%", maxHeight: "60vh" }}
          />
        )}
      </Modal>
      <Modal
        title={
          carsModalSeller
            ? `${carsModalSeller.firstName || ""} ${
                carsModalSeller.lastName || ""
              } — Cars Sold`
            : "Cars Sold"
        }
        open={carsModalVisible}
        footer={null}
        onCancel={closeCarsModal}
        width={1200}
        getContainer={getPreviewContainer}
        style={{}}
      >
        <div style={{ minHeight: 200 }}>
          <Table
            dataSource={carsModalSeller?.carIntakes || []}
            rowKey={(r) => r._id || r.vin}
            loading={carsLoading}
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 1800 }}
            columns={[
              {
                title: "Sr. No.",
                key: "srNo",
                fixed: "left",
                width: 70,
                render: (text, record, index) => index + 1,
              },
              {
                title: "VIN No.",
                dataIndex: "vin",
                key: "vin",
                fixed: "left",
                width: 200,
                render: (text, record) => (
                  <Button
                    type="link"
                    onClick={() => navigate(`/car-intake/${record._id}`)}
                  >
                    {text || "N/A"}
                  </Button>
                ),
              },
              {
                title: "Make",
                dataIndex: ["carDetails", "make"],
                key: "make",
                width: 100,
                render: (text) => text || "N/A",
              },
              {
                title: "Year",
                dataIndex: ["carDetails", "year"],
                key: "year",
                width: 80,
                render: (text) => text || "N/A",
              },
              {
                title: "Model",
                dataIndex: ["carDetails", "model"],
                key: "model",
                width: 120,
                render: (text) => text || "N/A",
              },
              {
                title: "Trim",
                dataIndex: ["carDetails", "trim"],
                key: "trim",
                width: 100,
                render: (text) => text || "N/A",
              },
              {
                title: "Color",
                dataIndex: ["carDetails", "color"],
                key: "color",
                width: 100,
                render: (text) => text || "N/A",
              },
              {
                title: "Body Class",
                dataIndex: ["carDetails", "bodyClass"],
                key: "bodyClass",
                width: 120,
                render: (text) => text || "N/A",
              },
              {
                title: "Transmission",
                dataIndex: ["carDetails", "transmission"],
                key: "transmission",
                width: 120,
                render: (text) => text || "N/A",
              },
              {
                title: "Drive",
                dataIndex: ["carDetails", "drive"],
                key: "drive",
                width: 100,
                render: (text) => text || "N/A",
              },
              {
                title: "Fuel Type",
                dataIndex: ["carDetails", "fuelType"],
                key: "fuelType",
                width: 250,
                render: (text) => text || "N/A",
              },
              {
                title: "Chassis No.",
                dataIndex: ["carDetails", "chassisNo"],
                key: "chassisNo",
                width: 180,
                render: (text) => text || "N/A",
              },
              {
                title: "Engine No.",
                dataIndex: ["carDetails", "engineNo"],
                key: "engineNo",
                width: 180,
                render: (text) => text || "N/A",
              },
              {
                title: "Scrap Yard",
                dataIndex: ["carDetails", "scrapYardName"],
                key: "scrapYardName",
                width: 120,
                render: (text) => text || "N/A",
              },
              {
                title: "Scrap Yard Location",
                dataIndex: ["carDetails", "scrapYardLocation"],
                key: "scrapYardLocation",
                width: 180,
                render: (text) => text || "N/A",
              },
              {
                title: "Keys",
                key: "keys",
                width: 80,
                render: (_, record) => {
                  const cd = record.carDetails || {};
                  const hasKeys = cd.keys ?? cd.hasKeys ?? false;
                  return (
                    <Tag color={hasKeys ? "blue" : "red"}>
                      {hasKeys ? "Yes" : "No"}
                    </Tag>
                  );
                },
              },
              {
                title: "Final Price",
                dataIndex: ["price", "finalPrice"],
                key: "finalPrice",
                width: 100,
                render: (price) => `$${price || "0"}`,
              },
              {
                title: "Documents",
                key: "documents",
                width: 160,
                render: (_, record) => {
                  const docs = record?.kyc?.documents || {};
                  const dl =
                    docs.driversLicense || docs.drivers_license || null;
                  const rc =
                    docs.carRegistration || docs.car_registration || null;
                  const openDoc = (url) => {
                    if (!url) return;
                    const lower = String(url).toLowerCase();
                    const isPdf = lower.endsWith(".pdf");
                    setDocModalIsPdf(isPdf);
                    setDocModalUrl(url);
                    setDocModalVisible(true);
                  };
                  return (
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      {dl ? (
                        <Tag
                          color="blue"
                          style={{ cursor: "pointer" }}
                          onClick={() => openDoc(uploadAPI.getImageUrl(dl))}
                        >
                          DL
                        </Tag>
                      ) : null}
                      {rc ? (
                        <Tag
                          color="green"
                          style={{ cursor: "pointer" }}
                          onClick={() => openDoc(uploadAPI.getImageUrl(rc))}
                        >
                          RC
                        </Tag>
                      ) : null}
                      {!dl && !rc ? <Tag color="red">None</Tag> : null}
                    </div>
                  );
                },
              },
              {
                title: "Paid In",
                dataIndex: ["payment", "paymentMethod"],
                key: "paymentMethod",
                width: 120,
                render: (method) => <Tag color="green">{method || "N/A"}</Tag>,
              },
              {
                title: "Inventory",
                dataIndex: "inventoryAdded",
                key: "inventoryAdded",
                width: 100,
                render: (inventoryAdded) => (
                  <Tag color={inventoryAdded ? "green" : "red"}>
                    {inventoryAdded ? "Yes" : "No"}
                  </Tag>
                ),
              },
              {
                title: "Seller Copy Printed",
                dataIndex: "sellerCopyPrinted",
                key: "sellerCopyPrinted",
                width: 150,
                render: (printed) => (
                  <Tag color={printed ? "blue" : "red"}>
                    {printed ? "Yes" : "No"}
                  </Tag>
                ),
              },
              {
                title: "Document Printed",
                dataIndex: "documentPrinted",
                key: "documentPrinted",
                width: 140,
                render: (printed) => (
                  <Tag color={printed ? "blue" : "red"}>
                    {printed ? "Yes" : "No"}
                  </Tag>
                ),
              },
              {
                title: "Receipt Printed",
                dataIndex: "receiptPrinted",
                key: "receiptPrinted",
                width: 130,
                render: (printed) => (
                  <Tag color={printed ? "blue" : "red"}>
                    {printed ? "Yes" : "No"}
                  </Tag>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 150,
                render: (status) => {
                  let color = "default";
                  if (status === "completed") color = "green";
                  else if (status === "in-progress") color = "orange";
                  else if (status === "intake") color = "blue";
                  return <Tag color={color}>{status || "Intake"}</Tag>;
                },
              },
              {
                title: "Action",
                key: "action",
                width: 160,
                render: (_, record) => (
                  <Space>
                    <Button
                      type="default"
                      size="small"
                      onClick={() => navigate(`/car-intake/${record._id}`)}
                    >
                      View
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => message.info("Edit disabled")}
                      title="Edit"
                    />
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => message.info("Delete disabled")}
                      title="Delete"
                    />
                  </Space>
                ),
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default SellerList;
