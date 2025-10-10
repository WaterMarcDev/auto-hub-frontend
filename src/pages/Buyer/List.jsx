import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  notification,
  Input,
  Space,
  Modal,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { customerAPI, uploadAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";

const BuyerList = () => {
  const [buyers, setBuyers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const navigate = useNavigate();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);
  const [sigModalVisible, setSigModalVisible] = useState(false);
  const [sigModalUrl, setSigModalUrl] = useState(null);

  const fetchBuyers = async (params = {}) => {
    setLoading(true);
    try {
      const res = await customerAPI.getAll({
        type: "buyer",
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
      });

      const data = res.data || res;
      const fetchedBuyers = data.customers || data.buyers || [];
      setBuyers(fetchedBuyers);

      setPagination({
        page: params.page || 1,
        limit: params.limit || 10,
        total: data.pagination?.total || fetchedBuyers.length,
      });
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to fetch buyers",
        description: err.response?.data?.error || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Universal search function
  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    setSearchValue(trimmedValue);
    fetchBuyers({ page: 1, limit: pagination.limit, search: trimmedValue });
  };

  // Clear search
  const handleSearchClear = () => {
    setSearchValue("");
    fetchBuyers({ page: 1, limit: pagination.limit, search: "" });
  };

  const INITIAL_LIMIT = 10;

  useEffect(() => {
    fetchBuyers({ page: 1, limit: INITIAL_LIMIT });
    // notificationApi is stable from Ant and safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    try {
      await customerAPI.delete(id);
      notificationApi.success({ message: "Buyer deleted successfully" });
      fetchBuyers();
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to delete buyer",
        description: err.response?.data?.error || err.message,
      });
    }
  };

  const openSignatureModal = (url) => {
    if (!url) {
      notificationApi.error({ message: "No signature available" });
      return;
    }
    setSigModalUrl(uploadAPI.getImageUrl(url));
    setSigModalVisible(true);
  };

  const closeSignatureModal = () => {
    setSigModalVisible(false);
    setSigModalUrl(null);
  };

  const columns = [
    {
      title: "Sr. No.",
      key: "srNo",
      minWidth: 70,
      render: (text, record, index) => {
        const currentPage = pagination.page || 1;
        const pageSize = pagination.limit || 10;
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      minWidth: 100,
      render: (firstName, rec) => `${firstName || ""} ${rec.lastName || ""}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      minWidth: 100,
      render: (email) => email || "N/A",
    },
    {
      title: "Mobile",
      dataIndex: "mobileNo",
      key: "mobileNo",
      minWidth: 100,
      render: (mobile) => mobile || "N/A",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      minWidth: 100,
      render: (desc) => desc || "N/A",
      ellipsis: true,
    },
    {
      title: "ID Type",
      dataIndex: "idProofType",
      key: "idProofType",
      minWidth: 100,
      render: (t) => t || "N/A",
    },
    {
      title: "ID Number",
      dataIndex: "idProofNumber",
      key: "idProofNumber",
      minWidth: 100,
      render: (n) => n || "N/A",
    },
    {
      title: "ID Image",
      key: "idImage",
      minWidth: 100,
      render: (text, rec) => {
        const docs = rec.kyc?.documents || rec.kyc || rec.documents || {};
        const idProof =
          rec.idProofImage ||
          docs.idProofImage ||
          docs.driversLicense ||
          rec.driversLicense;
        return idProof ? (
          <Button
            size="small"
            onClick={() => {
              setDocModalIsPdf(String(idProof).toLowerCase().endsWith(".pdf"));
              setDocModalUrl(uploadAPI.getImageUrl(idProof));
              setDocModalVisible(true);
            }}
          >
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
      minWidth: 100,
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
      title: "Action",
      key: "action",
      minWidth: 100,
      render: (text, rec) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this buyer?"
            onConfirm={() => handleDelete(rec._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              type="primary"
              danger
              icon={<DeleteOutlined />}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <TitleBox title="Buyer Lists" routes={["Buyers"]} current="List" />

      <PageContentWrapper>
        <Card title="Buyers">
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
                placeholder="Search buyers by name, email, or mobile number..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if (!e.target.value) {
                    handleSearchClear();
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

            <Button
              type="primary"
              size="middle"
              onClick={() => navigate("/buyer/register")}
            >
              + New Buyer
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={buyers}
            rowKey={(r) => r._id || r.email}
            loading={loading}
            size="small"
            tableLayout="auto"
            bordered={true}
            scroll={{ y: "calc(100vh - 510px)" }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} buyers`,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) => {
                fetchBuyers({ page, limit: pageSize, search: searchValue });
              },
            }}
          />
        </Card>
      </PageContentWrapper>
      <Modal
        title={"ID Preview"}
        open={docModalVisible}
        footer={null}
        onCancel={() => {
          setDocModalVisible(false);
          setDocModalUrl(null);
          setDocModalIsPdf(false);
        }}
        width={800}
        getContainer={() => {
          let el = document.getElementById("image-preview-root");
          if (!el) {
            el = document.createElement("div");
            el.id = "image-preview-root";
            el.style.zIndex = "2000";
            document.body.appendChild(el);
          }
          return el;
        }}
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
        getContainer={() => {
          let el = document.getElementById("image-preview-root");
          if (!el) {
            el = document.createElement("div");
            el.id = "image-preview-root";
            el.style.zIndex = "2000";
            document.body.appendChild(el);
          }
          return el;
        }}
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

export default BuyerList;
