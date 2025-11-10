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
  Popover,
  Checkbox,
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
import getStatusColor from "../../utils/statusColors";
import PageContentWrapper from "../../components/PageContentWrapper";

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  // sellers is the current page of sellers from backend
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState(null);
  const [docModalIsPdf, setDocModalIsPdf] = useState(false);
  const [sigModalVisible, setSigModalVisible] = useState(false);
  const [sigModalUrl, setSigModalUrl] = useState(null);
  const [carsModalVisible, setCarsModalVisible] = useState(false);
  const [carsModalSeller, setCarsModalSeller] = useState(null);
  const [carsLoading, setCarsLoading] = useState(false);
  const navigate = useNavigate();
  const [notificationApi, contextHolder] = notification.useNotification();

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

  const fetchSellers = async (params = {}) => {
    setLoading(true);
    try {
      // Use customers endpoint filtered by type; support server-side search & pagination
      const page = Number(params.page ?? pagination.page ?? 1);
      const limit = Number(pagination.limit);
      const search = params.search ?? searchValue ?? "";

      // Debug: log outgoing request
      console.debug("fetchSellers request", { page, limit, search });

      const res = await customerAPI.getAll({
        type: "seller",
        page,
        limit,
        search,
      });

      const data = res.data || res;
      console.debug("fetchSellers response", data?.pagination);
      const fetchedSellers = data.customers || data.sellers || [];
      setSellers(fetchedSellers);

      setPagination({
        page,
        limit,
        total: Number(data.pagination?.total ?? fetchedSellers.length),
      });
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to fetch sellers",
        description: err.response?.data?.error || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Universal search function (server-side)
  const handleSearch = (value) => {
    const trimmed = value.trim();
    setSearchValue(trimmed);
    // fetch from server with search applied, reset to page 1
    fetchSellers({ page: 1, limit: pagination.limit, search: trimmed });
  };

  // Clear search
  const handleSearchClear = () => {
    setSearchValue("");
    fetchSellers({ page: 1, limit: pagination.limit, search: "" });
  };

  const minWidthForTitle = (title) => {
    if (!title) return 80;
    // base calculation: 12px per character + padding
    const base = Math.max(60, title.length * 12 + 20);
    return base;
  };

  const handleDelete = async (id) => {
    try {
      await customerAPI.delete(id);
      notificationApi.success({ message: "Seller deleted successfully" });
      // refetch current page
      fetchSellers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchValue,
      });
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to delete seller",
        description: err.response?.data?.error || err.message,
      });
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // initial fetch uses shared fetchSellers helper
        await fetchSellers({ page: 1, limit: pagination.limit, search: "" });
      } catch (err) {
        console.error(err);
        notificationApi.error({
          message: "Failed to fetch sellers",
          description: err.response?.data?.error || err.message,
        });
      } finally {
        setLoading(false);
      }
    })();
    // notificationApi is stable from Ant and safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      title: "ID Type",
      dataIndex: "idProofType",
      key: "idProofType",
      render: (t) => t || "N/A",
    },
    {
      title: "ID Number",
      dataIndex: "idProofNumber",
      key: "idProofNumber",
      render: (n) => n || "N/A",
    },
    {
      title: "ID Image",
      key: "idImage",
      render: (text, rec) => {
        const idProof = rec.idProofImage;
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
      render: (text, rec) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => openCarsModal(rec._id)}
          >
            Cars
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this buyer?"
            onConfirm={() => handleDelete(rec._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              // type="primary"
              danger
              icon={<DeleteOutlined />}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // attach minWidth to columns without changing each definition
  const columnsWithMin = columns.map((col) => {
    const title = typeof col.title === "string" ? col.title : col.key || "col";
    const min = minWidthForTitle(title);
    return {
      ...col,
      onCell: () => ({ style: { minWidth: `${min}px` } }),
    };
  });

  const openCarsModal = async (sellerId) => {
    setCarsLoading(true);
    try {
      const res = await customerAPI.getById(sellerId);
      const data = res.data || res;
      setCarsModalSeller(data.customer || data.seller || data);
      setCarsModalVisible(true);
    } catch (err) {
      console.error(err);
      notificationApi.error({
        message: "Failed to load seller cars",
        description: err.response?.data?.error || err.message,
      });
    } finally {
      setCarsLoading(false);
    }
  };

  const closeCarsModal = () => {
    setCarsModalVisible(false);
    setCarsModalSeller(null);
  };

  const carsColumns = [
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
      title: "Displacement (CC)",
      dataIndex: ["carDetails", "displacementCC"],
      key: "displacementCC",
      width: 180,
      render: (text, record) => text || record?.carDetails?.engineNo || "N/A",
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
          <Tag color={hasKeys ? "blue" : "red"}>{hasKeys ? "Yes" : "No"}</Tag>
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
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Document Printed",
      dataIndex: "documentPrinted",
      key: "documentPrinted",
      width: 140,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Receipt Printed",
      dataIndex: "receiptPrinted",
      key: "receiptPrinted",
      width: 130,
      render: (printed) => (
        <Tag color={printed ? "blue" : "red"}>{printed ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || "Intake"}</Tag>
      ),
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
            onClick={() => navigate(`/car-intake/${record._id}/details`)}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => notificationApi.info({ message: "Edit disabled" })}
            title="Edit"
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => notificationApi.info({ message: "Delete disabled" })}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  const carsColumnsWithMin = carsColumns.map((col) => {
    const title = typeof col.title === "string" ? col.title : col.key || "col";
    const min = minWidthForTitle(title);
    return { ...col, onCell: () => ({ style: { minWidth: `${min}px` } }) };
  });

  return (
    <div>
      {contextHolder}
      <TitleBox title="Seller Lists" routes={["Sellers"]} current="List" />

      <PageContentWrapper>
        <Card title="Sellers">
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
                placeholder="Search sellers by name, email, or mobile number..."
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
              onClick={() => (window.location.href = "/seller/register")}
            >
              + New Seller
            </Button>
          </div>

          <Table
            columns={columnsWithMin}
            dataSource={sellers}
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
                `${range[0]}-${range[1]} of ${total} sellers`,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) =>
                fetchSellers({ page, limit: pageSize, search: searchValue }),
            }}
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
            alt="DL"
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
            tableLayout="auto"
            scroll={{ x: 1800 }}
            columns={carsColumnsWithMin}
          />
        </div>
      </Modal>
    </div>
  );
};

export default SellerList;
