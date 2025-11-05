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
  Upload,
  Typography,
} from "antd";
import { UploadOutlined, SearchOutlined } from "@ant-design/icons";
import { carIntakeAPI, uploadAPI } from "../../utils/api";
import TitleBox from "../../components/TitleBox";
import getStatusColor from "../../utils/statusColors";

const AddScrap = () => {
  const [loading, setLoading] = useState(false);
  const [carIntakes, setCarIntakes] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState("");

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);
  // Bulk upload modal state (copied behavior from CarIntakeList)
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);

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
      render: (text, record, index) =>
        (pagination?.current - 1) * pagination?.pageSize + index + 1 ||
        index + 1,
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
      minWidth: 100,
      render: (text, record) => text || record?.carDetails?.engineNo || "N/A",
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
            {!dl && !rc ? <Tag color="red">None</Tag> : null}
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
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || "Intake"}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      minWidth: 160,
      render: (text, record) => (
        <Space>
          <Button
            type="primary"
            danger
            disabled={record?.status === "scraped"}
            onClick={() => markAsScraped(record)}
          >
            {record?.status === "scraped" ? "Scraped" : "Scrap"}
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

  const fetchCarIntakes = async (page, limit, search) => {
    setLoading(true);
    try {
      const res = await carIntakeAPI.getAll({
        page: page || pagination.current,
        limit: limit || pagination.pageSize,
        status: "elements-scraped",
        search: search !== undefined ? search : searchValue,
      });
      const data = res.data || res;
      setCarIntakes(data.carIntakes || data);
      if (data.pagination) {
        setPagination({
          current: data.pagination.page,
          pageSize: data.pagination.limit,
          total: data.pagination.total,
        });
      }
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

  const handleSearch = (value) => {
    setSearchValue(value);
    fetchCarIntakes(1, pagination.pageSize, value);
  };

  useEffect(() => {
    fetchCarIntakes();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    // no-op: keep effect for initial fetch only
  }, []);

  // Bulk upload modal handlers (copied/adapted from CarIntakeList)
  const handleBulkUploadOpen = () => {
    setBulkUploadFile(null);
    setBulkUploadResult(null);
    setBulkUploadModalVisible(true);
  };

  const handleBulkUploadClose = () => {
    setBulkUploadModalVisible(false);
    setBulkUploadFile(null);
    setBulkUploadResult(null);
  };

  const handleFileChange = (file) => {
    setBulkUploadFile(file);
  };

  const handleBulkUploadSubmit = async () => {
    if (!bulkUploadFile) {
      message.error("Please select an Excel file");
      return;
    }

    setBulkUploadLoading(true);
    try {
      // Step 1: Upload the file first
      const uploadResponse = await uploadAPI.uploadImage(bulkUploadFile);
      const fileUrl =
        uploadResponse.data.imageUrl ||
        uploadResponse.data?.imageUrl ||
        uploadResponse.imageUrl;

      if (!fileUrl) throw new Error("Upload did not return a file URL");

      // Step 2: Submit bulk upload with file URL
      const bulkResponse = await carIntakeAPI.bulkUploadScraped(fileUrl);
      const result = bulkResponse.data || bulkResponse;

      setBulkUploadResult(result);
      message.success(
        `Bulk upload completed! ${result.summary.successful} successful, ${result.summary.failed} failed, ${result.summary.skipped} skipped`
      );

      // Refresh the list
      fetchCarIntakes();
    } catch (error) {
      console.error("Bulk upload error:", error);
      message.error(
        `Failed to upload: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setBulkUploadLoading(false);
    }
  };

  const markAsScraped = async (record) => {
    const id = record._id || record.vin;
    if (!id) return message.error("Unable to identify record id");

    try {
      await carIntakeAPI.updateStatus(id, "scraped");
      message.success("Record marked as scraped");
      // Optimistically update UI and refresh list from server to ensure
      // consistent state (in case other fields changed server-side).
      setCarIntakes((prev) =>
        prev.map((r) =>
          (r._id || r.vin) === (record._id || record.vin)
            ? { ...r, status: "scraped" }
            : r
        )
      );

      // Small delay to allow backend to settle, then refetch full list
      setTimeout(() => {
        fetchCarIntakes();
      }, 300);
    } catch (err) {
      console.error("Failed to mark as scraped", err);
      message.error(
        "Failed to mark as scraped: " +
          (err.response?.data?.error || err.message)
      );
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
        title="Scrap Car"
        routes={["Scrap Yard", "Scrap a Car"]}
        current={"Scrap Car"}
      />

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card
            title={<span>Car Inventory Lists</span>}
            extra={
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={handleBulkUploadOpen}>
                  Bulk Upload Scraped
                </Button>
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <Space.Compact style={{ flex: 1, maxWidth: 600 }} size="middle">
                <Input
                  placeholder="Search by VIN, Make, Model, Trim..."
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    if (!e.target.value) {
                      handleSearch("");
                    }
                  }}
                  onPressEnter={() => handleSearch(searchValue)}
                  size="middle"
                  style={{ width: "100%" }}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => handleSearch(searchValue)}
                  size="middle"
                >
                  Search
                </Button>
              </Space.Compact>
            </div>

            <Table
              columns={displayedColumns}
              dataSource={carIntakes}
              loading={loading}
              rowKey={(record) => record._id || record.vin}
              tableLayout="auto"
              scroll={{
                y: "calc(100vh - 510px)",
              }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              onChange={(pagination) => {
                setPagination({
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                });
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

            {/* Bulk Upload Modal (for scraped records) */}
            <Modal
              open={bulkUploadModalVisible}
              title="Bulk Upload Scraped Records"
              onCancel={handleBulkUploadClose}
              footer={[
                <Button key="cancel" onClick={handleBulkUploadClose}>
                  {bulkUploadResult ? "Close" : "Cancel"}
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  loading={bulkUploadLoading}
                  onClick={handleBulkUploadSubmit}
                  disabled={!bulkUploadFile || bulkUploadResult !== null}
                >
                  Upload
                </Button>,
              ]}
              width={700}
              centered
            >
              <div style={{ marginBottom: 16 }}>
                <Typography.Title level={5}>Upload Excel File</Typography.Title>
                <Typography.Text type="secondary">
                  Select an Excel file (.xlsx or .xls) containing scraped
                  records.
                  <br />
                  Sheet named <strong>GONE</strong> will be processed. The
                  importer recognizes <strong>What Happen?</strong> values:
                  <ul style={{ marginTop: 8 }}>
                    <li>
                      <strong>Crushed</strong> &rarr; saved with status{" "}
                      <em>scraped</em>
                    </li>
                    <li>
                      <strong>Sold</strong> &rarr; saved with status{" "}
                      <em>sold</em>
                    </li>
                    <li>
                      <strong>Towed</strong> &rarr; saved with status{" "}
                      <em>towed</em>
                    </li>
                  </ul>
                  If the <strong>What Happen?</strong> column is missing or
                  empty, the row will be saved with status <em>intake</em> and
                  default yard values will be applied (Yard:{" "}
                  <strong>RTX</strong>, Location: <strong>New Jersey</strong>).
                </Typography.Text>
              </div>

              <Upload
                accept=".xlsx,.xls"
                maxCount={1}
                beforeUpload={() => false}
                onChange={(info) => handleFileChange(info.file)}
                fileList={bulkUploadFile ? [bulkUploadFile] : []}
              >
                <Button icon={<UploadOutlined />} block>
                  Select Excel File
                </Button>
              </Upload>

              {bulkUploadResult && (
                <div style={{ marginTop: 24 }}>
                  <Typography.Title level={5} style={{ color: "#fff" }}>
                    Upload Results
                  </Typography.Title>
                  <div
                    style={{
                      padding: 16,
                      background: "#1f1f1f",
                      border: "1px solid #434343",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ marginBottom: 8, color: "#e0e0e0" }}>
                      <strong>Total Records:</strong>{" "}
                      {bulkUploadResult.summary.total}
                    </div>
                    <div style={{ marginBottom: 8, color: "#52c41a" }}>
                      <strong>Successful:</strong>{" "}
                      {bulkUploadResult.summary.successful}
                    </div>
                    <div style={{ marginBottom: 8, color: "#ff4d4f" }}>
                      <strong>Failed:</strong> {bulkUploadResult.summary.failed}
                    </div>
                    <div style={{ color: "#faad14" }}>
                      <strong>Skipped:</strong>{" "}
                      {bulkUploadResult.summary.skipped}
                    </div>

                    {(bulkUploadResult.results.failed.length > 0 ||
                      bulkUploadResult.results.skipped.length > 0) && (
                      <div style={{ marginTop: 16 }}>
                        <Typography.Text strong style={{ color: "#e0e0e0" }}>
                          Details:
                        </Typography.Text>
                        <div
                          style={{
                            maxHeight: 200,
                            overflow: "auto",
                            marginTop: 8,
                            padding: 8,
                            background: "#141414",
                            borderRadius: 4,
                          }}
                        >
                          {bulkUploadResult.results.failed.map(
                            (item, index) => (
                              <div
                                key={`failed-${index}`}
                                style={{ marginBottom: 4, color: "#ff7875" }}
                              >
                                <strong>Row {item.row}:</strong> {item.reason}
                              </div>
                            )
                          )}
                          {bulkUploadResult.results.skipped.map(
                            (item, index) => (
                              <div
                                key={`skipped-${index}`}
                                style={{ marginBottom: 4, color: "#ffc53d" }}
                              >
                                <strong>Row {item.row}:</strong> {item.reason}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Modal>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddScrap;
