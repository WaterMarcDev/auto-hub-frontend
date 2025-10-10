import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Input,
  DatePicker,
  Modal,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { customerAPI, uploadAPI } from "../../utils/api";
import dayjs from "dayjs";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";

const { RangePicker } = DatePicker;

const WaiverList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    startDate: null,
    endDate: null,
  });

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);
  const [sigModalVisible, setSigModalVisible] = useState(false);
  const [sigModalUrl, setSigModalUrl] = useState(null);

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

  const openDocModal = (url) => {
    if (!url) return;
    setDocModalIsPdf(String(url).toLowerCase().endsWith(".pdf"));
    setDocModalUrl(uploadAPI.getImageUrl(url));
    setDocModalVisible(true);
  };

  const closeDocModal = () => {
    setDocModalVisible(false);
    setDocModalUrl(null);
    setDocModalIsPdf(false);
  };

  const openSignatureModal = (url) => {
    if (!url) {
      message.error("No signature available");
      return;
    }
    setSigModalUrl(uploadAPI.getImageUrl(url));
    setSigModalVisible(true);
  };

  const closeSignatureModal = () => {
    setSigModalVisible(false);
    setSigModalUrl(null);
  };

  const fetchCustomers = useCallback(
    async (opts = {}) => {
      setLoading(true);
      try {
        const params = {
          page: opts.page || pagination.current,
          limit: opts.limit || pagination.pageSize,
          search: opts.search ?? filters.search ?? "",
        };

        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const res = await customerAPI.getAll(params);
        const data = res.data || res;
        const fetched = data.customers || data.sellers || data.buyers || [];
        setCustomers(fetched);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || fetched.length,
        }));
      } catch (err) {
        console.error("Error fetching customers:", err);
        message.error(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch customers"
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination]
  );

  useEffect(() => {
    fetchCustomers({ page: 1, limit: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchCustomers({
      page: 1,
      limit: pagination.pageSize,
      search: filters.search,
    });
  };

  const handleReset = () => {
    setFilters({ search: "", startDate: null, endDate: null });
    setPagination((prev) => ({ ...prev, current: 1 }));
    setTimeout(
      () => fetchCustomers({ page: 1, limit: pagination.pageSize }),
      100
    );
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchCustomers({
      page: newPagination.current,
      limit: newPagination.pageSize,
      search: filters.search,
    });
  };

  const columns = [
    {
      title: "Sr. No.",
      key: "srNo",
      fixed: "left",
      minWidth: 70,
      render: (text, record, index) => {
        const currentPage = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => (
        <Tag color={type === "seller" ? "blue" : "green"}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      minWidth: 160,
      render: (fn, rec) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/waivers/${rec._id}`)}
        >
          {`${fn || ""} ${rec.lastName || ""}`.trim() || "N/A"}
        </Button>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      minWidth: 140,
      render: (e) => e || "N/A",
    },
    {
      title: "Mobile",
      dataIndex: "mobileNo",
      key: "mobileNo",
      minWidth: 120,
      render: (m) => m || "N/A",
    },
    {
      title: "ID Type",
      dataIndex: "idProofType",
      key: "idProofType",
      width: 150,
      render: (t) => t || "N/A",
    },
    {
      title: "ID Number",
      dataIndex: "idProofNumber",
      key: "idProofNumber",
      width: 150,
      render: (n) => n || "N/A",
    },
    {
      title: "ID Image",
      key: "idImage",
      minWidth: 100,
      render: (text, rec) => {
        const idProof =
          rec.idProofImage ||
          rec.documents?.idProofImage ||
          rec.kyc?.documents?.idProofImage;
        return idProof ? (
          <Button size="small" onClick={() => openDocModal(idProof)}>
            Preview
          </Button>
        ) : (
          <span>N/A</span>
        );
      },
    },
    {
      title: "Signature",
      key: "signature",
      minWidth: 120,
      render: (text, rec) => {
        const sig =
          rec.signatureImage || rec.signature || rec.kyc?.signature || null;
        return sig ? (
          <Button size="small" onClick={() => openSignatureModal(sig)}>
            Preview
          </Button>
        ) : (
          <span>N/A</span>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (date ? dayjs(date).format("MMM DD, YYYY") : "-"),
    },
    {
      title: "Action",
      key: "action",
      minWidth: 140,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            onClick={() => navigate(`/waivers/${record._id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <TitleBox title="Waiver Lists" routes={["Waivers"]} current="List" />

      <PageContentWrapper>
        <Card title="Waivers">
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/waivers/add")}
            >
              Create Waiver
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: 16,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Input
              placeholder="Search by name, email, or mobile"
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              onPressEnter={handleSearch}
              style={{ width: 400 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                Search
              </Button>
              <Button onClick={handleReset}>Reset</Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={customers}
            tableLayout="auto"
            loading={loading}
            rowKey={(r) => r._id}
            scroll={{ x: "max-content", y: "calc(100vh - 510px)" }}
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
        </Card>
      </PageContentWrapper>

      <Modal
        title={"ID Proof Preview"}
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
            alt="ID"
            style={{ maxWidth: "100%", maxHeight: "60vh" }}
          />
        )}
      </Modal>

      <Modal
        title={"Signature Preview"}
        open={sigModalVisible}
        footer={null}
        onCancel={closeSignatureModal}
        width={600}
        getContainer={getPreviewContainer}
        bodyStyle={{ background: "#fff", textAlign: "center" }}
      >
        {sigModalUrl ? (
          <img
            src={sigModalUrl}
            alt="Signature"
            style={{ maxWidth: "100%", maxHeight: "60vh", background: "#fff" }}
          />
        ) : (
          <div style={{ textAlign: "center" }}>No signature</div>
        )}
      </Modal>
    </div>
  );
};

export default WaiverList;
