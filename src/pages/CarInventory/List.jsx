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
  InputNumber,
  Input,
} from "antd";
import {
  carIntakeAPI,
  uploadAPI,
  elementAPI,
  scrapElementAPI,
} from "../../utils/api";
import TitleBox from "../../components/TitleBox";

const CarInventoryList = () => {
  const [loading, setLoading] = useState(false);
  const [carIntakes, setCarIntakes] = useState([]);

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);
  // Extract Elements modal state
  const [extractModalVisible, setExtractModalVisible] = useState(false);
  const [elementsList, setElementsList] = useState([]);
  const [elementsLoading, setElementsLoading] = useState(false);
  const [selectedElementsMap, setSelectedElementsMap] = useState({});
  const [extractSaving, setExtractSaving] = useState(false);
  const [activeExtractRecord, setActiveExtractRecord] = useState(null);

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
          <Button onClick={() => openExtractElementsModal(record)}>
            Extract Elements
          </Button>
        </Space>
      ),
    },
  ];

  const getColKey = (col) =>
    col.key
      ? String(col.key)
      : Array.isArray(col.dataIndex)
      ? String(col.dataIndex[0])
      : String(col.dataIndex || "");

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

  const displayedColumns = allColumns.filter((c) =>
    visibleColumns.includes(getColKey(c))
  );

  const fetchCarIntakes = async () => {
    setLoading(true);
    try {
      const res = await carIntakeAPI.getAll({
        page: 1,
        limit: 100,
        status: "part-added-to-inventory",
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

  const openExtractElementsModal = async (record) => {
    const vin = record?.vin || record?._id || "";
    if (!vin) {
      message.error("No VIN available for this record");
      return;
    }

    setElementsLoading(true);
    setActiveExtractRecord(record);
    setExtractModalVisible(true);
    try {
      const res = await elementAPI.getAll({ page: 1, limit: 200 });
      const data = res.data || res;
      const items = data.elements || data || [];
      setElementsList(items);

      // initialize selection map with defaults from element
      const map = {};
      items.forEach((el) => {
        map[el._id || el.id || el.name] = {
          selected: false,
          elementName: el.name || el.elementName || "",
          unit: 1,
          weight: el.weight || "",
          dimensions: el.dimensions || "",
          quality: "",
        };
      });
      setSelectedElementsMap(map);
    } catch (err) {
      console.error("Failed to fetch elements", err);
      message.error("Failed to fetch elements: " + (err.message || ""));
      setElementsList([]);
    } finally {
      setElementsLoading(false);
    }
  };

  const handleElementSelectChange = (key, checked) => {
    setSelectedElementsMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        selected: checked,
      },
    }));
  };

  const handleElementFieldChange = (key, field, value) => {
    setSelectedElementsMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const submitExtractedElements = async (record) => {
    const useRecord = record || activeExtractRecord;
    const vin = useRecord?.vin || useRecord?._id || "";
    if (!vin) return message.error("No VIN available");

    const entries = Object.entries(selectedElementsMap).filter(
      ([, v]) => v && v.selected
    );
    if (!entries.length) return message.error("No elements selected");

    setExtractSaving(true);
    try {
      for (const [key, val] of entries) {
        const payload = {
          elementName: val.elementName || key,
          unit: val.unit || 1,
          weight: val.weight || "",
          dimensions: val.dimensions || "",
          quality: val.quality || "",
          vin: vin,
        };

        await scrapElementAPI.create(payload);
      }

      // update intake status
      try {
        await carIntakeAPI.updateStatus(
          useRecord._id || useRecord.vin,
          "elements-scraped"
        );
      } catch (sErr) {
        console.warn("Failed to update car intake status", sErr);
      }

      message.success("Elements extracted successfully");
      setActiveExtractRecord(null);
      setExtractModalVisible(false);
      fetchCarIntakes();
    } catch (err) {
      console.error("Failed to create scrap elements", err);
      message.error("Failed to extract elements: " + (err.message || ""));
    } finally {
      setExtractSaving(false);
    }
  };

  return (
    <div>
      <style>
        {`
          .dark-table .ant-table {
            background-color: #1f2937 !important;
            color: #f9fafb;
          }
          
          .dark-table .ant-table-thead > tr > th {
            background-color: #374151 !important;
            color: #f9fafb !important;
            border-color: #4b5563 !important;
          }
          
          .dark-table .ant-table-tbody > tr > td {
            background-color: #1f2937 !important;
            color: #f9fafb !important;
            border-color: #4b5563 !important;
          }
          
          .dark-table .ant-table-tbody > tr:hover > td {
            background-color: #374151 !important;
          }
          
          .dark-table .ant-table-fixed-left,
          .dark-table .ant-table-fixed-right {
            background-color: #1f2937 !important;
          }
          
          .dark-table .ant-pagination {
            color: #f9fafb;
          }
          
          .dark-table .ant-pagination .ant-pagination-item {
            background-color: #374151;
            border-color: #4b5563;
          }
          
          .dark-table .ant-pagination .ant-pagination-item a {
            color: #f9fafb;
          }
          
          .dark-table .ant-pagination .ant-pagination-item:hover {
            border-color: #6b7280;
          }
          
          .dark-table .ant-pagination .ant-pagination-item-active {
            background-color: #1d4ed8;
            border-color: #1d4ed8;
          }
          
          .dark-table .ant-pagination .ant-pagination-prev,
          .dark-table .ant-pagination .ant-pagination-next {
            color: #f9fafb;
          }
          
          .dark-table .ant-select-selector {
            background-color: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
          }
          
          .dark-table .ant-select-arrow {
            color: #f9fafb;
          }
        `}
      </style>

      <TitleBox
        title="Car Inventory Lists"
        routes={["Scrap Yard", "Car Intake"]}
        current={"Car Inventory Lists"}
      />

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card
            title={<span>Car Inventory Lists</span>}
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
                x: 2500,
                y: 600,
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
              open={extractModalVisible}
              title={`Extract Elements`}
              onCancel={() => setExtractModalVisible(false)}
              footer={null}
              width={1000}
              centered
            >
              {elementsLoading ? (
                <div>Loading elements...</div>
              ) : elementsList && elementsList.length > 0 ? (
                <Table
                  dataSource={elementsList}
                  rowKey={(r) => r._id || r.name || JSON.stringify(r)}
                  pagination={false}
                  size="small"
                  bordered
                  columns={[
                    {
                      title: "Select",
                      key: "select",
                      render: (t, rec) => {
                        const key = rec._id || rec.name;
                        const sel = selectedElementsMap[key]?.selected || false;
                        return (
                          <Checkbox
                            checked={sel}
                            onChange={(e) =>
                              handleElementSelectChange(key, e.target.checked)
                            }
                          />
                        );
                      },
                    },
                    { title: "Element", dataIndex: "name", key: "name" },
                    {
                      title: "Unit",
                      key: "unit",
                      render: (t, rec) => {
                        const key = rec._id || rec.name;
                        const val = selectedElementsMap[key]?.unit || 1;
                        return (
                          <InputNumber
                            min={1}
                            value={val}
                            onChange={(v) =>
                              handleElementFieldChange(key, "unit", v)
                            }
                          />
                        );
                      },
                    },
                    {
                      title: "Weight",
                      key: "weight",
                      render: (t, rec) => {
                        const key = rec._id || rec.name;
                        const val =
                          selectedElementsMap[key]?.weight || rec.weight || "";
                        return (
                          <Input
                            type="number"
                            value={val}
                            onChange={(e) =>
                              handleElementFieldChange(
                                key,
                                "weight",
                                e.target.value
                              )
                            }
                          />
                        );
                      },
                    },
                    {
                      title: "Dimensions",
                      key: "dimensions",
                      render: (t, rec) => {
                        const key = rec._id || rec.name;
                        const val =
                          selectedElementsMap[key]?.dimensions ||
                          rec.dimensions ||
                          "";
                        return (
                          <Input
                            value={val}
                            onChange={(e) =>
                              handleElementFieldChange(
                                key,
                                "dimensions",
                                e.target.value
                              )
                            }
                          />
                        );
                      },
                    },
                  ]}
                />
              ) : (
                <div>No elements available</div>
              )}

              <div style={{ marginTop: 12, textAlign: "right" }}>
                <Button
                  onClick={() => setExtractModalVisible(false)}
                  style={{ marginRight: 8 }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={extractSaving}
                  onClick={() => submitExtractedElements(activeExtractRecord)}
                >
                  Save
                </Button>
              </div>
            </Modal>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarInventoryList;
