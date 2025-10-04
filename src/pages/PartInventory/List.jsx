import React, { useState, useEffect } from "react";
import {
  message,
  Table,
  Tag,
  Button,
  Space,
  Card,
  Modal,
  Popover,
  Checkbox,
} from "antd";
import { carIntakeAPI, uploadAPI, inventoryAPI } from "../../utils/api";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";

const PartInventoryList = () => {
  const [loading, setLoading] = useState(false);
  const [carIntakes, setCarIntakes] = useState([]);

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);

  const [viewPartsModalVisible, setViewPartsModalVisible] = useState(false);
  const [viewPartsLoading, setViewPartsLoading] = useState(false);
  const [viewPartsData, setViewPartsData] = useState([]);
  const [printTagModalVisible, setPrintTagModalVisible] = useState(false);
  const [printTagMessage, setPrintTagMessage] = useState("");

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
      minWidth: 200,
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
      minWidth: 80,
      render: (text) => text || "N/A",
    },
    {
      title: "Model",
      dataIndex: ["carDetails", "model"],
      key: "model",
      minWidth: 120,
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
      minWidth: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Transmission",
      dataIndex: ["carDetails", "transmission"],
      key: "transmission",
      minWidth: 120,
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
      minWidth: 150,
      render: (text) => text || "N/A",
    },
    {
      title: "Chassis No.",
      dataIndex: ["carDetails", "chassisNo"],
      key: "chassisNo",
      minWidth: 180,
      render: (text) => text || "N/A",
    },
    {
      title: "Engine",
      dataIndex: ["carDetails", "engine"],
      key: "engine",
      minWidth: 120,
    },
    {
      title: "Scrap Yard",
      dataIndex: ["carDetails", "scrapYardName"],
      key: "scrapYardName",
      minWidth: 120,
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
      minWidth: 200,
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
      minWidth: 160,
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
      minWidth: 120,
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
          <Button type="primary" onClick={() => openViewPartsModal(record)}>
            View Parts
          </Button>
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
      const res = await carIntakeAPI.getAll({
        page: 1,
        limit: 100,
        status:
          "part-added-to-inventory,elements-scraped,car-added-to-inventory,elements-scraped,scraped",
      });
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

  useEffect(() => {
    fetchCarIntakes();
  }, []);

  // View parts by VIN - open modal and fetch inventory items
  const fetchViewPartsByVIN = async (vin) => {
    if (!vin) return;
    setViewPartsLoading(true);
    try {
      const res = await inventoryAPI.getByVIN(vin);
      const data = res.data || res;
      setViewPartsData(data.inventoryItems || data);
      setViewPartsModalVisible(true);
    } catch (err) {
      console.error("Failed to fetch inventory by VIN", err);
      message.error(
        `Failed to fetch parts for VIN ${vin}: ${
          err.response?.data?.message || err.message
        }`
      );
      setViewPartsData([]);
    } finally {
      setViewPartsLoading(false);
    }
  };

  const openViewPartsModal = (record) => {
    const vin = record?.vin || record?._id || "";
    if (!vin) {
      message.error("No VIN available for this record");
      return;
    }
    fetchViewPartsByVIN(vin);
  };

  // Handle Print Tag action: show a small modal indicating the tag is printing
  const handlePrintTag = (part) => {
    const partName = part?.partName || part?.tag || "Part";
    setPrintTagMessage(`${partName} tag is being printed`);
    setPrintTagModalVisible(true);

    // Auto-dismiss after 2.5 seconds
    setTimeout(() => {
      setPrintTagModalVisible(false);
    }, 2500);
  };

  return (
    <React.Fragment>
      <TitleBox
        title="Inventory List"
        routes={["Scrap Yard", "Inventory"]}
        current={"Inventory List"}
      />

      {/* Page Content */}

      <PageContentWrapper>
        <Card
          title={<span>Car Lists</span>}
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
            </div>
          }
        >
          <Table
            columns={displayedColumns}
            dataSource={carIntakes}
            loading={loading}
            rowKey={(record) => record._id || record.vin}
            tableLayout="auto"
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

          <Modal
            open={viewPartsModalVisible}
            title={`Parts For VIN`}
            onCancel={() => setViewPartsModalVisible(false)}
            footer={null}
            width={1200}
            centered
          >
            {viewPartsLoading ? (
              <div>Loading...</div>
            ) : viewPartsData && viewPartsData.length > 0 ? (
              <Table
                dataSource={viewPartsData}
                rowKey={(r) => r._id || r.tag || JSON.stringify(r)}
                pagination={false}
                size="small"
                bordered
                columns={[
                  {
                    title: "Part Name",
                    dataIndex: "partName",
                    key: "partName",
                  },
                  {
                    title: "Make",
                    dataIndex: ["make", "name"],
                    key: "make",
                  },
                  {
                    title: "Model",
                    dataIndex: ["model", "name"],
                    key: "model",
                  },
                  {
                    title: "Trim",
                    dataIndex: ["trim", "name"],
                    key: "trim",
                  },

                  { title: "Unit", dataIndex: "unit", key: "unit" },
                  { title: "Quality", dataIndex: "quality", key: "quality" },
                  {
                    title: "Cleaned",
                    dataIndex: "cleaned",
                    key: "cleaned",
                    render: (c) => (c ? "Yes" : "No"),
                  },
                  { title: "Weight", dataIndex: "weight", key: "weight" },
                  {
                    title: "Dimensions",
                    dataIndex: "dimensions",
                    key: "dimensions",
                  },
                  {
                    title: "Location",
                    dataIndex: "location",
                    key: "location",
                  },
                  { title: "Tag", dataIndex: "tag", key: "tag" },
                  {
                    title: "Action",
                    key: "action",
                    render: (_, part) => (
                      <Space>
                        <Button
                          type="link"
                          onClick={() => handlePrintTag(part)}
                        >
                          Print Tag
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            ) : (
              <div>No parts found for this VIN.</div>
            )}
          </Modal>

          <Modal
            open={printTagModalVisible}
            title={null}
            footer={null}
            onCancel={() => setPrintTagModalVisible(false)}
            centered
            closable={false}
            width={360}
          >
            <div style={{ padding: 8, textAlign: "center", fontWeight: 600 }}>
              {printTagMessage || "Tag is being printed"}
            </div>
          </Modal>
        </Card>
      </PageContentWrapper>
    </React.Fragment>
  );
};

export default PartInventoryList;
