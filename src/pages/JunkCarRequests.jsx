import { useEffect, useState } from "react";
import { Card, Table, Select, Button, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AddJunkCarRequest from "./AddJunkCarRequest";
import { Modal } from "antd";
import api from "../utils/api";    // by shiva

const { Option } = Select;

const JunkCarRequests = () => {
    const [junkCars, setJunkCars] = useState([]);
    const [staffUsers, setStaffUsers] = useState([]);    // by shiva
    const [handledByFilter, setHandledByFilter] = useState("");   // by shiva
    const [sourceFilter, setSourceFilter] = useState("");            // by shiva
    const [statusFilter, setStatusFilter] = useState("");             // by shiva
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);  // by shiva

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
            render: (_, record) => record.condition || "none",
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
            render: (_, record) => (
                <Select
                    placeholder="Source"
                    value={record.source || "Manual"}
                    onChange={(value) =>
                        updateSource(record._id, value)
                    }
                    style={{ width: 130 }}
                    disabled={!canEditSource}
                >
                    <Option value="Manual">Manual</Option>
                    <Option value="Website">Website</Option>
                    <Option value="Instagram">Instagram</Option>
                    <Option value="Facebook">Facebook</Option>
                    <Option value="WhatsApp">WhatsApp</Option>
                    <Option value="TikTok">TikTok</Option>
                    <Option value="SMS">SMS</Option>
                    <Option value="Other">Other</Option>

                </Select>
            ),
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

                const assignedStaff =
                    record.assignedTo &&
                        typeof record.assignedTo === "object" &&
                        record.assignedTo.first_name
                        ? `${record.assignedTo.first_name} ${record.assignedTo.last_name || ""}`
                        : "Unassigned";

                return (
                    <Select
                        defaultValue={
                            record.assignedTo &&
                                typeof record.assignedTo === "object" &&
                                record.assignedTo.first_name
                                ? `${record.assignedTo.first_name} ${record.assignedTo.last_name || ""}`
                                : undefined
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
        <div style={{ paddingTop: "20px", paddingBottom: "90px" }}>
            <Card
                title="Junk Car Requests"
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
                    style={{ 
                        marginBottom: 20,
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
                        <Option value="Manual">Manual</Option>
                        <Option value="Website">Website</Option>
                        <Option value="Instagram">Instagram</Option>
                        <Option value="Facebook">Facebook</Option>
                        <Option value="WhatsApp">WhatsApp</Option>
                        <Option value="TikTok">TikTok</Option>
                        <Option value="SMS">SMS</Option>
                        <Option value="Other">Other</Option>
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

        </div>
    );
};

export default JunkCarRequests;