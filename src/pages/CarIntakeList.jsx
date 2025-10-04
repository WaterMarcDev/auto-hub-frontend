import React, { useState, useEffect } from "react";
import {
  message,
  Table,
  Tag,
  Button,
  Space,
  Card,
  Typography,
  Modal,
  Popover,
  Checkbox,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { carIntakeAPI, uploadAPI } from "../utils/api";
import { useNavigate } from "react-router-dom";
import TitleBox from "../components/TitleBox";
import PageContentWrapper from "../components/PageContentWrapper";

const CarIntakeList = () => {
  const [loading, setLoading] = useState(false);
  const [carIntakes, setCarIntakes] = useState([]);
  const navigate = useNavigate();
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);

  // Ensure modal preview container is above fixed header/sidebar
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

  // Define table columns (allColumns) — these will be filtered by user selection
  const allColumns = [
    {
      title: "Sr. No.",
      key: "srNo",
      fixed: "left",
      minWidth: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: "VIN No.",
      dataIndex: "vin",
      key: "vin",
      fixed: "left",
      minWidth: 100,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/car-intake/${record._id}/details`)}
        >
          {text || "N/A"}
        </Button>
      ),
    },
    {
      title: "Make",
      dataIndex: ["carDetails", "make"],
      key: "make",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Year",
      dataIndex: ["carDetails", "year"],
      key: "year",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Model",
      dataIndex: ["carDetails", "model"],
      key: "model",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Trim",
      dataIndex: ["carDetails", "trim"],
      key: "trim",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Color",
      dataIndex: ["carDetails", "color"],
      key: "color",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Body Class",
      dataIndex: ["carDetails", "bodyClass"],
      key: "bodyClass",
      minWidth: 100,
      maxWidth: 250,
      render: (text) => text || "N/A",
    },
    {
      title: "Transmission",
      dataIndex: ["carDetails", "transmission"],
      key: "transmission",
      minWidth: 110,
      render: (text) => text || "N/A",
    },
    {
      title: "Drive",
      dataIndex: ["carDetails", "drive"],
      key: "drive",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Fuel Type",
      dataIndex: ["carDetails", "fuelType"],
      key: "fuelType",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Chassis No.",
      dataIndex: ["carDetails", "chassisNo"],
      key: "chassisNo",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Engine",
      dataIndex: ["carDetails", "engine"],
      key: "engine",
      minWidth: 100,
    },
    {
      title: "Scrap Yard",
      dataIndex: ["carDetails", "scrapYardName"],
      key: "scrapYardName",
      minWidth: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Scrap Yard Location",
      dataIndex: ["carDetails", "scrapYardLocation"],
      key: "scrapYardLocation",
      minWidth: 180,
      render: (text) => text || "N/A",
    },
    {
      title: "Keys",
      key: "keys",
      minWidth: 80,
      render: (_, record) => {
        const cd = record.carDetails || {};
        const hasKeys = cd.keys ?? cd.hasKeys ?? false;
        return (
          <Tag color={hasKeys ? "blue" : "red"}>{hasKeys ? "Yes" : "No"}</Tag>
        );
      },
    },
    {
      title: "Seller",
      dataIndex: "seller",
      key: "sellerName",
      minWidth: 100,
      render: (seller) => {
        if (!seller) return "N/A";
        const name = `${seller.firstName || ""} ${
          seller.lastName || ""
        }`.trim();

        return (
          <div>
            <div style={{ fontWeight: 600 }}>{name || "N/A"}</div>
          </div>
        );
      },
    },
    // email is displayed together with seller info above; keep a compact column for finalPrice next
    {
      title: "Final Price",
      dataIndex: ["price", "finalPrice"],
      key: "finalPrice",
      minWidth: 100,
      render: (price) => `$${price || "0"}`,
    },
    {
      title: "Documents",
      key: "documents",
      minWidth: 100,
      render: (_, record) => {
        const docs = record?.kyc?.documents || {};
        const dl = docs.driversLicense || docs.drivers_license || null;
        const rc = docs.carRegistration || docs.car_registration || null;
        const tc = docs.titleCertificate || docs.title_certificate || null;

        const openDoc = (url) => {
          if (!url) return;
          const lower = String(url).toLowerCase();
          const isPdf = lower.endsWith(".pdf");
          setDocModalIsPdf(isPdf);
          setDocModalUrl(url);
          setDocModalVisible(true);
        };

        return (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
            {tc ? (
              <Tag
                color="purple"
                style={{ cursor: "pointer" }}
                onClick={() => openDoc(uploadAPI.getImageUrl(tc))}
              >
                TC
              </Tag>
            ) : null}
            {!dl && !rc && !tc ? <Tag color="red">None</Tag> : null}
          </div>
        );
      },
    },
    {
      title: "Paid In",
      dataIndex: ["payment", "paymentMethod"],
      key: "paymentMethod",
      minWidth: 100,
      render: (method) => <Tag color="green">{method || "N/A"}</Tag>,
    },
    {
      title: "Inventory",
      dataIndex: "inventoryAdded",
      key: "inventoryAdded",
      minWidth: 100,
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
      minWidth: 150,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Document Printed",
      dataIndex: "documentPrinted",
      key: "documentPrinted",
      minWidth: 140,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Receipt Printed",
      dataIndex: "receiptPrinted",
      key: "receiptPrinted",
      minWidth: 130,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      minWidth: 150,
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
      minWidth: 160,
      render: (text, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            onClick={() => navigate(`/car-intake/${record._id}/details`)}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/car-intake/${record._id}`)}
            title="Edit"
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  // Helper to derive a stable key for a column
  const getColKey = (col) =>
    col.key
      ? String(col.key)
      : Array.isArray(col.dataIndex)
      ? String(col.dataIndex[0])
      : String(col.dataIndex || "");

  // State: which columns are currently visible (by key)
  const [visibleColumns, setVisibleColumns] = React.useState(
    allColumns.map((c) => getColKey(c))
  );

  const toggleColumn = (key, checked) => {
    setVisibleColumns((prev) => {
      if (checked) return Array.from(new Set([...prev, key]));
      return prev.filter((k) => k !== key);
    });
  };

  const selectAllColumns = (checked) => {
    if (checked) setVisibleColumns(allColumns.map((c) => getColKey(c)));
    else setVisibleColumns([]);
  };

  // Compute displayed columns maintaining original order
  const displayedColumns = allColumns.filter((c) =>
    visibleColumns.includes(getColKey(c))
  );

  // Fetch car intakes data
  const fetchCarIntakes = async () => {
    setLoading(true);
    try {
      const res = await carIntakeAPI.getAll({ page: 1, limit: 100 });
      const data = res.data || res;
      setCarIntakes(data.carIntakes || data);
    } catch (error) {
      message.error(
        `Failed to fetch car intakes: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle actions
  const handleDelete = () => {
    // Simple delete without confirmation for now
    message.info("Delete functionality will be implemented");
  };

  useEffect(() => {
    fetchCarIntakes();
  }, []);

  return (
    <div>
      <TitleBox
        title="Car Intake Lists"
        routes={["Scrap Yard", "Car Intake"]}
        current={"Car Intake Lists"}
      />

      {/* Page Content */}
      <PageContentWrapper>
        <Card
          title={<span>Car Intake Lists</span>}
          extra={
            <div style={{ display: "flex", gap: 8 }}>
              <Popover
                placement="bottomRight"
                content={() => (
                  <div style={{ maxWidth: 320 }}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>
                      Columns
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <Button
                        size="small"
                        onClick={() => selectAllColumns(true)}
                      >
                        Select All
                      </Button>
                      <Button
                        size="small"
                        onClick={() => selectAllColumns(false)}
                      >
                        Clear
                      </Button>
                    </div>
                    <div style={{ maxHeight: 300, overflow: "auto" }}>
                      {allColumns.map((col) => {
                        const key = getColKey(col);
                        return (
                          <div key={key} style={{ marginBottom: 6 }}>
                            <Checkbox
                              checked={visibleColumns.includes(key)}
                              onChange={(e) =>
                                toggleColumn(key, e.target.checked)
                              }
                            >
                              {col.title}
                            </Checkbox>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              >
                <Button>Columns</Button>
              </Popover>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/car-intake")}
              >
                Add New Car
              </Button>
            </div>
          }
        >
          <Table
            columns={displayedColumns}
            dataSource={carIntakes}
            tableLayout="auto"
            loading={loading}
            rowKey={(record) => record._id || record.vin}
            scroll={{
              x: 2500, // Horizontal scroll for many columns
              y: 600, // Vertical scroll height
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            size="small"
            bordered
            className="dark-table"
          />
          <Modal
            open={docModalVisible}
            title="Document Preview"
            footer={null}
            onCancel={() => setDocModalVisible(false)}
            width={800}
            centered
            getContainer={getPreviewContainer}
            bodyStyle={{ maxHeight: "80vh", overflow: "auto" }}
          >
            {docModalUrl ? (
              docModalIsPdf ? (
                <iframe
                  src={docModalUrl}
                  title="PDF Preview"
                  style={{ width: "100%", height: "70vh", border: "none" }}
                />
              ) : (
                <img
                  src={docModalUrl}
                  alt="Document Preview"
                  style={{ maxWidth: "100%", maxHeight: "70vh" }}
                />
              )
            ) : (
              <div>No document to preview</div>
            )}
          </Modal>
        </Card>
      </PageContentWrapper>
    </div>
  );
};

export default CarIntakeList;
