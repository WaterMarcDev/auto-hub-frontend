import { useEffect, useState } from "react";
import { Card, Table, Select, Button, Input, Tag } from "antd";
import { ArrowLeftOutlined, FileTextOutlined, InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AddJunkCarRequest from "./AddJunkCarRequest";
import { Modal } from "antd";
import api from "../utils/api";    // by shiva
import SourceBadge from "../components/SourceBadge";

const { Option } = Select;

// Mirrors the selectable list on the Part Request page (see
// src/pages/Requests/index.jsx), plus "Manual" which — unlike Part Request's
// "Online"/"Offline" — has always been a selectable value here, not just a
// creation-time default. "eBay"/"Google Business" now included to match the
// backend's shared BOT_SOURCES whitelist.
const JUNK_CAR_SOURCE_OPTIONS = [
    // { value: "manual" },
    { value: "website" },
    { value: "instagram" },
    { value: "facebook" },
    { value: "whatsApp" },
    { value: "tiktok" },
    { value: "ebay" },
    { value: "google business" },
    { value: "sms" },
    { value: "other" },
];

const JunkCarRequests = () => {
    const [junkCars, setJunkCars] = useState([]);
    const [staffUsers, setStaffUsers] = useState([]);    // by shiva
    const [handledByFilter, setHandledByFilter] = useState("");   // by shiva
    const [sourceFilter, setSourceFilter] = useState("");            // by shiva
    const [statusFilter, setStatusFilter] = useState("");             // by shiva
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);  // by shiva
    const [conditionModalOpen, setConditionModalOpen] = useState(false);
    const [conditionModalRecord, setConditionModalRecord] = useState(null);

    const openConditionModal = (record) => {
        setConditionModalRecord(record);
        setConditionModalOpen(true);
    };

    const fetchJunkCars = async () => {
        try {

            const res = await api.get("/junk-car");

            setJunkCars(res.data.data || []);

        } catch (error) {

            console.error(error);
        }
    };
    const user = JSON.parse(localStorage.getItem("user"));

    const canEditSource =
        user?.role?.toLowerCase() === "admin" ||
        user?.role?.toLowerCase() === "manager";

    // Fetch Staff Users by shiva
    const fetchStaffUsers = async () => {
        try {

            const res = await api.get("/users/staff");

            setStaffUsers(res.data.data || []);

            console.log("STAFF USERS:", res.data);    // temp debug by shiva

        } catch (error) {

            console.error("Error fetching staff users:", error);
        }
    };
    // end here

    useEffect(() => {
        fetchJunkCars();

        //     const user = JSON.parse(localStorage.getItem("user"));

        //     console.log("LOGGED USER:", user);    // temp debug by shiva

            if (
                user?.role?.toLowerCase() === "admin" ||
                user?.role?.toLowerCase() === "manager"
            ) {
                fetchStaffUsers();
            }    // added by shiva
    }, []);

    const updateStatus = async (id, status) => {
        try {

            await api.patch(
                `/junk-car/${id}/status`,
                { status }
            );

            fetchJunkCars();

        } catch (error) {

            console.error(error);
        }
    };

    const updatePaymentStatus = async (id, paymentStatus) => {
        try {

            await api.patch(
                `/junk-car/${id}/payment-status`,
                { paymentStatus }
            );

            fetchJunkCars();

        } catch (error) {

            console.error(error);
        }
    };

    // added by shiva Source Field
    const updateSource = async (id, source) => {
        try {

            await api.patch(
                `/junk-car/${id}/source`,
                { source }
            );

            fetchJunkCars();

        } catch (error) {

            console.error(error);
        }
    };
    // end here

    // AssignStaff logic by shiva
    const assignStaff = async (id, assignedTo) => {
        try {

            await api.patch(
                `/junk-car/${id}/assign`,
                { assignedTo }
            );

            fetchJunkCars();

        } catch (error) {

            console.error("Error assigning staff:", error);
        }
    };
    // end here

    // Remark logic by shiva
    const updateRemark = async (id, remark) => {
        try {

            await api.patch(
                `/junk-car/${id}/remark`,
                { remark }
            );

        } catch (error) {

            console.error(
                "Remark update failed:",
                error
            );
        }
    };
    // end here

    const columns = [
        {
            title: "Date",
            render: (_, record) =>
                new Date(record.createdAt).toLocaleDateString(),
        },
        {
            title: "Name",
            dataIndex: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
        },
        {
            title: "Phone",
            dataIndex: "phone",
        },
        {
            title: "Make",
            dataIndex: "make",
        },
        {
            title: "Model",
            dataIndex: "model",
        },
        {
            title: "Year",
            dataIndex: "year"
        },
        // {
        //     title: "Vehicle",
        //     render: (_, record) =>
        //         `${record.make} ${record.model} ${record.year}`,
        // },
        {
            title: "VIN / Engine",
            render: (_, record) => record.engineOrVin || "none",
        },
        {
            title: "Condition",
            width: 110,
            render: (_, record) => {
                const hasCondition = record.condition && record.condition !== "none";
                return (
                    <Tag
                        icon={<FileTextOutlined />}
                        color={hasCondition ? "blue" : "default"}
                        style={{ cursor: "pointer" }}
                        onClick={() => openConditionModal(record)}
                    >
                        View
                    </Tag>
                );
            },
        },

        {
            title: "Message",
            dataIndex: "message",
            key: "message",
            render: (text) => text || "-",
        },

        {
            title: "Remark",
            dataIndex: "remark",
            key: "remark",
            width: 240,

            render: (_, record) => (

                <Input.TextArea
                    defaultValue={record.remark}
                    autoSize={{
                        minRows: 1,
                        maxRows: 2,
                    }}
                    placeholder="Add remark..."
                    disabled={
                        record.status === "completed"
                    }
                    style={{
                        fontSize: "12px",
                        resize: "none",
                    }}
                    onBlur={(e) =>
                        updateRemark(
                            record._id,
                            e.target.value
                        )
                    }
                />
            ),
        },

        {
            title: "Status",
            render: (_, record) => (
                <Select
                    placeholder="Select"
                    value={record.status}
                    onChange={(value) =>
                        updateStatus(record._id, value)
                    }
                    style={{ width: 150 }}
                    disabled={
                        record.status?.toLowerCase() === "completed"
                    }
                >
                    <Option value="pending">Pending</Option>
                    <Option value="in progress">In Progress</Option>
                    <Option value="completed">Completed</Option>
                </Select>
            ),
        },
        {
            title: "Source",
            render: (_, record) => {
                const sourceValue = record.source?.toString().trim().toLowerCase() || "other";
                return (
                    <SourceBadge
                        value={sourceValue}
                        // Junk Car has no "Online" value (unlike Part Request) —
                        // "Website" is its equivalent "came from our public
                        // website" indicator, so that's the one whose DISPLAYED
                        // text changes here. The stored value/API contract/
                        // filter behavior are untouched.
                        displayLabel={sourceValue === "website" ? "Website" : undefined}
                        options={JUNK_CAR_SOURCE_OPTIONS}
                        onChange={
                            canEditSource
                                ? (value) => updateSource(record._id, value)
                                : undefined
                        }
                        disabled={!canEditSource}
                        readOnlyReason="Only admins/managers can change source"
                    />
                );
            },
        },

        {
            title: "Created By",
            render: (_, record) => {

                if (
                    record.createdBy &&
                    typeof record.createdBy === "object" &&
                    record.createdBy.first_name
                ) {
                    return `${record.createdBy.first_name} ${record.createdBy.last_name || ""}`;
                }

                return "-";
            },
        },
        {
            title: "Handled By",
            render: (_, record) => {

                // ─── TEMPORARY DEFAULT ──────────────────────────────────
                // Current requirement: default "Handled By" display to
                // "Vijay Kumar" for now, regardless of actual assignment.
                //
                // ORIGINAL ACCOUNT-BASED "HANDLED BY" LOGIC IS PRESERVED
                // BELOW, COMMENTED OUT — NOT DELETED. Re-enable it (restore
                // `assignedStaff` and the Select's `placeholder`/
                // `defaultValue` below) when Completed requests need to show
                // the handler according to the user's account again.
                //
                // const assignedStaff =
                //     record.assignedTo &&
                //         typeof record.assignedTo === "object" &&
                //         record.assignedTo.first_name
                //         ? `${record.assignedTo.first_name} ${record.assignedTo.last_name || ""}`
                //         : "Unassigned";
                const assignedStaff = "Vijay Kumar";

                // The underlying assignment mechanism (assignStaff / the
                // Select's onChange / staffUsers options) is left fully
                // intact and functional — only the displayed placeholder/
                // defaultValue is temporarily overridden, so real staff
                // assignment still works and persists exactly as before.
                return (
                    <Select
                        defaultValue={
                            // record.assignedTo &&
                            //     typeof record.assignedTo === "object" &&
                            //     record.assignedTo.first_name
                            //     ? `${record.assignedTo.first_name} ${record.assignedTo.last_name || ""}`
                            //     : undefined
                            undefined
                        }
                        placeholder={assignedStaff}
                        onChange={(value) =>
                            assignStaff(record._id, value)
                        }
                        style={{ width: 180 }}
                        disabled={record.status === "completed"}
                    >
                        {staffUsers.map((staff) => (
                            <Option
                                key={staff._id}
                                value={staff._id}
                            >
                                {staff.first_name} {staff.last_name}
                            </Option>
                        ))}
                    </Select>
                );
            },
        },
        {
            title: "Payment",
            render: (_, record) => (
                <Select
                    placeholder="Payment"
                    value={record.paymentStatus || "Not Paid"}
                    onChange={(value) =>
                        updatePaymentStatus(record._id, value)
                    }
                    style={{ width: 150 }}
                >
                    <Option value="Not Paid">Not Paid</Option>
                    <Option value="Cash">Cash</Option>
                    <Option value="Online">Online</Option>

                </Select>
            ),
        },
    ];

    return (
        <div className="requests-page" style={{ paddingTop: "20px", paddingBottom: "90px" }}>
            <Card
                title={
                    <>
                        Junk Car Requests
                        <span className="request-count-pill">{junkCars.length}</span>
                    </>
                }
                extra={
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                            onClick={() => navigate("/")}
                            icon={<ArrowLeftOutlined />}
                        >
                            Back
                        </Button>

                        <Button
                            type="primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Add Request
                        </Button>
                    </div>
                }
            >
                {/* HandledByFilter by shiva */}
                <div
                    className="requests-toolbar"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        alignItems: "center",
                    }}
                >

                    <Select
                        placeholder="Filter by Staff"
                        style={{ width: 220 }}
                        allowClear
                        onChange={(value) =>
                            setHandledByFilter(value || "")
                        }
                    >

                        {staffUsers.map((staff) => (
                            <Option
                                key={staff._id}
                                value={staff._id}
                            >
                                {staff.first_name} {staff.last_name}
                            </Option>
                        ))}
                    </Select>

                    {/* Search by source added by shiva */}
                    <Select
                        placeholder="Filter by Source"
                        style={{
                            width: 180,
                            // marginLeft: 10,
                        }}
                        allowClear
                        onChange={(value) =>
                            setSourceFilter(value || "")
                        }
                    >
                        {/* <Option value="manual">Manual</Option> */}
                        <Option value="website">Website</Option>
                        <Option value="instagram">Instagram</Option>
                        <Option value="facebook">Facebook</Option>
                        <Option value="whatsApp">WhatsApp</Option>
                        <Option value="tiktok">TikTok</Option>
                        <Option value="ebay">eBay</Option>
                        <Option value="google business">Google Business</Option>
                        <Option value="sms">SMS</Option>
                        <Option value="other">Other</Option>
                    </Select>

                    {/* Search by Status : added by shiva*/}
                    <Select
                        placeholder="Filter by Status"
                        style={{
                            width: 180,
                            // marginLeft: 10,
                        }}
                        allowClear
                        onChange={(value) =>
                            setStatusFilter(value || "")
                        }
                    >
                        <Option value="pending">
                            Pending
                        </Option>

                        <Option value="in progress">
                            In Progress
                        </Option>

                        <Option value="completed">
                            Completed
                        </Option>

                        <Option value="rejected">
                            Rejected
                        </Option>
                    </Select>

                </div>

                <Table
                    columns={columns}
                    dataSource={
                        junkCars
                            .filter((car) => {

                                const handledMatch =
                                    !handledByFilter ||
                                    (
                                        car.assignedTo &&
                                        typeof car.assignedTo === "object" &&
                                        car.assignedTo._id === handledByFilter
                                    );
                                
                                const sourceMatch =
                                    !sourceFilter ||
                                    car.source === sourceFilter;

                                const statusMatch =
                                    !statusFilter ||
                                    car.status?.toLowerCase() ===
                                    statusFilter.toLowerCase();

                                return handledMatch && sourceMatch && statusMatch;
                            })
                            .sort((a, b) => {
                                const aCompleted =
                                    a.status?.toLowerCase() === "completed";

                                const bCompleted =
                                    b.status?.toLowerCase() === "completed";

                                if (aCompleted && !bCompleted) return 1;
                                if (!aCompleted && bCompleted) return -1;

                                return new Date(b.createdAt) - new Date(a.createdAt);
                            })
                    }
                    // dataSource={
                    //     junkCars.filter((car) => {

                    //         const handledMatch =
                    //             !handledByFilter ||
                    //             (
                    //                 car.assignedTo &&
                    //                 typeof car.assignedTo === "object" &&
                    //                 car.assignedTo._id === handledByFilter
                    //             );

                    //         const sourceMatch =
                    //             !sourceFilter ||
                    //             car.source === sourceFilter;

                    //         const statusMatch = 
                    //             !statusFilter ||
                    //             car.status?.toLowerCase() ===
                    //             statusFilter.toLowerCase();

                    //         return handledMatch && sourceMatch && statusMatch;
                    //     })
                    // }
                    rowKey="_id"
                    rowClassName={(record) => {

                        if (record.status === "completed") {
                            return "completed-row";
                        }

                        if (record.status === "pending") {
                            return "new-request-row";
                        }

                        return "";
                    }}
                    bordered
                    scroll={{ x: "max-content" }}
                    locale={{
                        emptyText: (
                            <div className="requests-empty-state">
                                <InboxOutlined />
                                <span>
                                    {handledByFilter || sourceFilter || statusFilter
                                        ? "No matching requests found"
                                        : "No junk car requests yet"}
                                </span>
                            </div>
                        )
                    }}
                />
            </Card>

            {/* Add Modal */}
            <Modal
                // title="Add Junk Car Request"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    fetchJunkCars();  // refresh data
                }}
                footer={null}
                width={800}
                destroyOnHidden    // added by shiva from close  to destroyOnHidden 
                styles={{ body: { padding: 20 } }}
            >
                <AddJunkCarRequest
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchJunkCars();   // refresh table
                    }}
                />
            </Modal>  // end here

            {/* Condition Details popup */}
            <Modal
                title="Condition Details"
                open={conditionModalOpen}
                onCancel={() => setConditionModalOpen(false)}
                footer={
                    <Button onClick={() => setConditionModalOpen(false)}>
                        Close
                    </Button>
                }
                width={480}
                centered
                destroyOnHidden
            >
                {conditionModalRecord && (
                    <div>
                        <div style={{ marginBottom: 12, color: "#888", fontSize: 13 }}>
                            {conditionModalRecord.make} {conditionModalRecord.model}{" "}
                            {conditionModalRecord.year ? `(${conditionModalRecord.year})` : ""}
                            {" — "}
                            {conditionModalRecord.name}
                        </div>
                        <div
                            style={{
                                maxHeight: "50vh",
                                overflowY: "auto",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                lineHeight: 1.6,
                            }}
                        >
                            {conditionModalRecord.condition && conditionModalRecord.condition !== "none"
                                ? conditionModalRecord.condition
                                : "No condition details provided."}
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default JunkCarRequests;