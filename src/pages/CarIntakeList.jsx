import React, { useState, useEffect, useCallback } from "react";
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
  Upload,
  Select,
  Spin,
  Input,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { carIntakeAPI, uploadAPI } from "../utils/api";
import getStatusColor from "../utils/statusColors";
import { useNavigate } from "react-router-dom";
import TitleBox from "../components/TitleBox";
import PageContentWrapper from "../components/PageContentWrapper";

const CarIntakeList = () => {
  const [loading, setLoading] = useState(false);
  const [carIntakes, setCarIntakes] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const navigate = useNavigate();
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);

  // Bulk upload state
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);

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
      title: "S. No.",
      key: "srNo",
      fixed: "left",
      minWidth: 70,
      width: 70,
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "VIN No.",
      dataIndex: "vin",
      key: "vin",
      fixed: "left",
      minWidth: 100,
      width: 100,
      render: (text, record) => (
        <Button
          type="link"
          size="small"
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
      dataIndex: "kyc",
      key: "sellerName",
      minWidth: 100,
      render: (kyc) => {
        if (!kyc) return "N/A";
        const name = `${kyc?.seller?.firstName || ""} ${
          kyc?.seller?.lastName || ""
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
        const physicalPaper = docs.physicalPaper || docs.physical_paper || null;
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
            {physicalPaper ? (
              <Tag
                color="green"
                style={{ cursor: "pointer" }}
                onClick={() => openDoc(uploadAPI.getImageUrl(physicalPaper))}
              >
                Physical Paper
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
            {!dl && !physicalPaper && !tc ? <Tag color="red">None</Tag> : null}
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
        const color = getStatusColor(status);
        return <Tag color={color}>{status || "Intake"}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      minWidth: 160,
      fixed: "right",
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
            type={record?.status === "payment-done" ? "default" : "primary"}
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/car-intake/${record._id}`)}
            title={
              record?.status === "payment-done"
                ? "Cannot edit — payment completed"
                : "Edit"
            }
            disabled={record?.status === "payment-done"}
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

  // `minWidth` is handled via CSS with tableLayout="auto" elsewhere; keep columns as-is

  // Fetch car intakes data
  const fetchCarIntakes = useCallback(
    async (page = 1, pageSize = 10, search = "", statusArg) => {
      setLoading(true);
      try {
        const params = { page, limit: pageSize };
        if (search && search.trim()) {
          params.search = search.trim();
        }
        // include status filter if any (single value)
        const statusToSend = statusArg !== undefined ? statusArg : statusFilter;
        if (statusToSend) {
          params.status = statusToSend;
        }
        // debug
        // console.debug("fetchCarIntakes params:", params);
        const res = await carIntakeAPI.getAll(params);
        const data = res.data || res;
        setCarIntakes(data.carIntakes || data);

        // Update pagination info if available from backend
        if (data.pagination) {
          setPagination({
            current: data.pagination.page,
            pageSize: data.pagination.limit,
            total: data.pagination.total,
          });
        } else {
          // Fallback if pagination data not available
          setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: pageSize,
          }));
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
    },
    [statusFilter]
  );

  // Handle table pagination change
  const handleTableChange = (paginationConfig) => {
    fetchCarIntakes(
      paginationConfig.current,
      paginationConfig.pageSize,
      searchTerm
    );
  };

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchTerm(value);
    // Reset to first page when searching
    fetchCarIntakes(1, pagination.pageSize, value);
  };

  const handleStatusChange = (value) => {
    const newStatus = value || null;
    setStatusFilter(newStatus);
    // Reset to first page when filtering. Pass the selected value directly so request uses it immediately.
    fetchCarIntakes(1, pagination.pageSize, searchTerm, newStatus);
  };

  // Handle actions
  const handleDelete = () => {
    // Simple delete without confirmation for now
    message.info("Delete functionality will be implemented");
  };

  // Bulk upload handlers
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

  const handleFileChange = (info) => {
    if (info.fileList.length > 0) {
      setBulkUploadFile(info.file);
    } else {
      setBulkUploadFile(null);
    }
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
      const fileUrl = uploadResponse.data.imageUrl;

      // Step 2: Submit bulk upload with file URL
      const bulkResponse = await carIntakeAPI.bulkUpload(fileUrl);
      const result = bulkResponse.data;

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

  useEffect(() => {
    fetchCarIntakes();
  }, [fetchCarIntakes]);

  return (
    <div>
      <TitleBox
        title="Car Intake Lists"
        routes={["Scrap Yard", "Car Intake"]}
        current={"Car Intake Lists"}
      />

      {/* Page Content */}
      <PageContentWrapper>
        <Card title={<span>Car Intake Lists</span>}>
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
                placeholder="Search by VIN, Make, Model, Trim, or Seller..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!e.target.value) {
                    handleSearch("");
                  }
                }}
                onPressEnter={() => handleSearch(searchTerm)}
                size="middle"
                style={{ width: "100%" }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => handleSearch(searchTerm)}
                size="middle"
              >
                Search
              </Button>
            </Space.Compact>

            <div style={{ minWidth: 260 }}>
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={handleStatusChange}
                allowClear
                style={{ width: "100%" }}
                options={[
                  { label: "Intake", value: "intake" },
                  { label: "VIN Fetched", value: "vin-fetched" },
                  { label: "Details Uploaded", value: "details-uploaded" },
                  { label: "Images Uploaded", value: "images-uploaded" },
                  { label: "Parts Uploaded", value: "parts-uploaded" },
                  { label: "Price Uploaded", value: "price-uploaded" },
                  { label: "KYC Uploaded", value: "kyc-uploaded" },
                  { label: "Payment Done", value: "payment-done" },
                  { label: "Scraped", value: "scraped" },
                  { label: "Sold", value: "sold" },
                  { label: "Towed", value: "towed" },
                ]}
              />
            </div>

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
                <Button size="middle">Columns</Button>
              </Popover>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/car-intake")}
                size="middle"
              >
                Add New Car
              </Button>

              <Button
                type="default"
                icon={<UploadOutlined />}
                onClick={handleBulkUploadOpen}
                size="middle"
              >
                Bulk Upload
              </Button>
            </div>
          </div>

          <Table
            columns={displayedColumns}
            dataSource={carIntakes}
            tableLayout="auto"
            loading={loading}
            rowKey={(record) => record._id || record.vin}
            scroll={{
              y: "calc(100vh - 510px)", // Dynamic height based on viewport
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
            onChange={handleTableChange}
            size="small"
            bordered
            className="dark-table"
            sticky
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

          {/* Bulk Upload Modal */}
          <Modal
            open={bulkUploadModalVisible}
            title="Bulk Upload Car Intakes"
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
                Select an Excel file (.xlsx or .xls) containing car intake data.
                <br />
                <strong>Required column:</strong> VIN
                <br />
                <strong>Optional columns:</strong> Make, Model, Year, trim,
                color, Body Class, Engine, Transmission, Drive, Fuel type, Where
                (Location), Keys, date In
              </Typography.Text>
            </div>

            <Upload
              accept=".xlsx,.xls"
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleFileChange}
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
                    <strong>Skipped:</strong> {bulkUploadResult.summary.skipped}
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
                        {bulkUploadResult.results.failed.map((item, index) => (
                          <div
                            key={`failed-${index}`}
                            style={{ marginBottom: 4, color: "#ff7875" }}
                          >
                            <strong>Row {item.row}:</strong> {item.reason}
                          </div>
                        ))}
                        {bulkUploadResult.results.skipped.map((item, index) => (
                          <div
                            key={`skipped-${index}`}
                            style={{ marginBottom: 4, color: "#ffc53d" }}
                          >
                            <strong>Row {item.row}:</strong> {item.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </Card>
      </PageContentWrapper>
    </div>
  );
};

export default CarIntakeList;
