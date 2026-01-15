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
import getStatusColor from "../../utils/statusColors";
import PageContentWrapper from "../../components/PageContentWrapper";

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
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
    const [carsModalCustomer, setCarsModalCustomer] = useState(null);
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

    const fetchCustomers = async (params = {}) => {
        setLoading(true);
        try {
            const page = Number(params.page ?? pagination.page ?? 1);
            const limit = Number(params.limit ?? pagination.limit ?? 10);
            const search = params.search ?? searchValue ?? "";

            const res = await customerAPI.getAll({
                page,
                limit,
                search,
            });

            const data = res.data || res;
            const fetchedCustomers = data.customers || [];
            setCustomers(fetchedCustomers);

            setPagination({
                page,
                limit,
                total: Number(data.pagination?.total ?? fetchedCustomers.length),
            });
        } catch (err) {
            console.error(err);
            notificationApi.error({
                message: "Failed to fetch customers",
                description: err.response?.data?.error || err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        const trimmed = value.trim();
        setSearchValue(trimmed);
        fetchCustomers({ page: 1, limit: pagination.limit, search: trimmed });
    };

    const handleSearchClear = () => {
        setSearchValue("");
        fetchCustomers({ page: 1, limit: pagination.limit, search: "" });
    };

    const minWidthForTitle = (title) => {
        if (!title) return 80;
        const base = Math.max(60, title.length * 12 + 20);
        return base;
    };

    const handleDelete = async (id) => {
        try {
            await customerAPI.delete(id);
            notificationApi.success({ message: "Customer deleted successfully" });
            fetchCustomers({
                page: pagination.page,
                limit: pagination.limit,
                search: searchValue,
            });
        } catch (err) {
            console.error(err);
            notificationApi.error({
                message: "Failed to delete customer",
                description: err.response?.data?.error || err.message,
            });
        }
    };

    useEffect(() => {
        fetchCustomers({ page: 1, limit: pagination.limit, search: "" });
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
                const sig = rec.signatureImage || rec.signature || null;
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
                        title="Are you sure you want to delete this customer?"
                        onConfirm={() => handleDelete(rec._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            title="Delete"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const columnsWithMin = columns.map((col) => {
        const title = typeof col.title === "string" ? col.title : col.key || "col";
        const min = minWidthForTitle(title);
        return {
            ...col,
            onCell: () => ({ style: { minWidth: `${min}px` } }),
        };
    });

    const openCarsModal = async (customerId) => {
        setCarsLoading(true);
        try {
            const res = await customerAPI.getById(customerId);
            const data = res.data || res;
            setCarsModalCustomer(data.customer || data);
            setCarsModalVisible(true);
        } catch (err) {
            console.error(err);
            notificationApi.error({
                message: "Failed to load customer cars",
                description: err.response?.data?.error || err.message,
            });
        } finally {
            setCarsLoading(false);
        }
    };

    const closeCarsModal = () => {
        setCarsModalVisible(false);
        setCarsModalCustomer(null);
    };

    const carsColumns = [
        {
            title: "S. No.",
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
            <TitleBox title="Customer Lists" routes={["Customers"]} current="List" />

            <PageContentWrapper>
                <Card title="Customers">
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
                                placeholder="Search customers by name, email, or mobile..."
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
                            onClick={() => navigate("/customer/register")}
                        >
                            + New Customer
                        </Button>
                    </div>

                    <Table
                        columns={columnsWithMin}
                        dataSource={customers}
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
                                `${range[0]}-${range[1]} of ${total} customers`,
                            showSizeChanger: true,
                            pageSizeOptions: ["10", "20", "50", "100"],
                            onChange: (page, pageSize) =>
                                fetchCustomers({ page, limit: pageSize, search: searchValue }),
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
                        alt="ID Proof"
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
                    carsModalCustomer
                        ? `${carsModalCustomer.firstName || ""} ${carsModalCustomer.lastName || ""
                        } — Cars`
                        : "Cars"
                }
                open={carsModalVisible}
                footer={null}
                onCancel={closeCarsModal}
                width={1200}
                getContainer={getPreviewContainer}
            >
                <div style={{ minHeight: 200 }}>
                    <Table
                        dataSource={carsModalCustomer?.carIntakes || []}
                        rowKey={(r) => r._id || r.vin}
                        loading={carsLoading}
                        pagination={{ pageSize: 10 }}
                        size="small"
                        tableLayout="auto"
                        scroll={{ x: 1000, y: "calc(70vh - 200px)" }}
                        columns={carsColumnsWithMin}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default CustomerList;
