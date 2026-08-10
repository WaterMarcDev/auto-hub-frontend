import { useEffect, useState } from "react";
import { Card, Table, Tag, Modal } from "antd";
import { Button } from "antd";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Input, Select, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import SourceBadge from "../../components/SourceBadge";
// import { Tabs } from "antd";
// import axios from "axios";

const { Option } = Select;

// "Online"/"Offline" are assigned automatically at creation (organic website
// submission vs staff-entered) and were never selectable here — preserved
// from the previous <Select> implementation's commented-out Options.
const PART_REQUEST_SOURCE_OPTIONS = [
    { value: "Website" },
    { value: "Instagram" },
    { value: "Facebook" },
    { value: "WhatsApp" },
    { value: "TikTok" },
    { value: "eBay" },
    { value: "Google Business" },
    { value: "SMS" },
    { value: "Other" },
];


const Requests = () => {
    const [requests, setRequests] = useState([]);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const canEditSource =
        user?.role?.toLowerCase() === "admin" ||
        user?.role?.toLowerCase() === "manager";

    const [search, setSearch] = useState("");
    const [searched, setSearched] = useState("");
    const [status, setStatus] = useState(null);
    const [sourceFilter, setSourceFilter] = useState("");  // added by shiva for Search by source
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [noResults, setNoResults] = useState(false);
    const [junkCars, setJunkCars] = useState([]);

    // Message popup — copies the exact same behaviour/state pattern/UI as
    // the Junk Car Request "Condition" column popup
    // (src/pages/JunkCarRequests.jsx#openConditionModal / "Condition
    // Details" Modal), replicated here since that implementation is
    // embedded inline there rather than a shared component.
    // JunkCarRequests.jsx itself is read-only and was not modified.
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [messageModalRecord, setMessageModalRecord] = useState(null);

    const openMessageModal = (record) => {
        setMessageModalRecord(record);
        setMessageModalOpen(true);
    };

    // Filter requests based on search and status by shiva
    const handleSearch = () => {

        // If empty search then show warning
        if (!search.trim()) {
            setFilteredRequests([]);
            setSearched(false);

            return;
        }
        // end here
        
        // if (filteredRequests.length === 0) {
        //     message.warning("Item not found")
        // }

        const searchText = search.trim().toLowerCase();

        // const filtered = requests.filter((item) => {
        //     return (
        //         item.name?.toLowerCase().includes(searchText) ||
        //         item.email?.toLowerCase().includes(searchText) ||
        //         item.phone?.toLowerCase().includes(searchText) ||
        //         item.make?.toLowerCase().includes(searchText) ||
        //         item.model?.toLowerCase().includes(searchText) ||
        //         item.partName?.toLowerCase().includes(searchText) ||
        //         String(item.year || "").toLowerCase().includes(searchText)
        //     );
        // });

        // Filtered by search bar added by shiva

        const filtered = requests.filter((item) => {

            return [
                item.createdAt
                    ? new Date(item.createdAt)
                        .toLocaleDateString()
                    : "",
                item.name,
                item.make,
                item.date,
                item.model,
                item.year,
                item.partName,
                item.email,
                item.phone,
                item.remark,
                item.source,
                item.status
            ]

                .some((field) =>
                    String(field || "")
                        .toLowerCase()
                        .includes(searchText)
                );
        });
        // end here
        setFilteredRequests(filtered);
        setSearched(true);
    };

    // Status filter function by shiva
    const handleStatusChange = (value) => {
        setStatus(value);

        if (!value) {
            setFilteredRequests([]);
            setSearched(false);
            return;
        }

        const filtered = requests.filter(
            (item) => item.status?.toLowerCase() === value.toLowerCase()
        );

        setFilteredRequests(filtered);
        setSearched(true);
    };
    //end here

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/part-request`);
            const data = await res.json();
            setRequests(data.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    //Fetch Junk Car API - shiva
    const fetchJunkCars = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/junk-car`);
            const data = await res.json();
            setJunkCars(data.data || []);
        } catch (error) {
            console.error("Error fetching junk cars : ", error);
        }
    }; //end here

    useEffect(() => {
        fetchRequests();
        fetchJunkCars();  // by shiva
    }, []);
    console.log(requests);

    const updateStatus = async (id, status) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/part-request/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            fetchRequests();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // Source by shiva
    const updateSource = async (id, source) => {
        try {

            await fetch(
                `${import.meta.env.VITE_API_URL}/part-request/${id}/source`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ source }),
                }
            );

            fetchRequests();

        } catch (error) {

            console.error("Error updating source:", error);
        }
    };

    // Update Remark by shiva
    const updateRemark = async (id, remark) => {

        try {

            await fetch(
                `${import.meta.env.VITE_API_URL}/part-request/${id}/remark`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ remark }),
                }
            );

            fetchRequests();

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
            title: "Part Name",
            dataIndex: "partName",
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
            title: "Message",
            width: 110,
            render: (_, record) => {
                const hasMessage = record.message && record.message.trim();
                return (
                    <Tag
                        icon={<FileTextOutlined />}
                        color={hasMessage ? "blue" : "default"}
                        style={{ cursor: "pointer" }}
                        onClick={() => openMessageModal(record)}
                    >
                        View
                    </Tag>
                );
            },
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
                        record.status?.toLowerCase() ===
                        "completed"
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
            title: "Source",
            render: (_, record) => (
                <SourceBadge
                    value={record.source || "Online"}
                    options={PART_REQUEST_SOURCE_OPTIONS}
                    onChange={
                        canEditSource
                            ? (value) => updateSource(record._id, value)
                            : undefined
                    }
                    disabled={!canEditSource}
                    readOnlyReason="Only admins/managers can change source"
                />
            ),
        },
        {
            title: "Created By",
            render: (_, record) =>
                record.createdBy
                    ? `${record.createdBy.first_name} ${record.createdBy.last_name}`
                    : "—",
        },
        {
            title: "Status",
            render: (_, record) => (
                <Select
                    value={record.status}
                    onChange={(value) =>
                        updateStatus(record._id, value)
                    }
                    style={{ width: 150 }}
                    disabled={
                        record.status?.toLowerCase() === "completed"
                    }
                >
                    <Option value="Pending">Pending</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Completed">Completed</Option>
                    <Option value="Rejected">Rejected</Option>
                </Select>
            ),
        },
    ];

    return (
        <div
            className="requests-page"
            style={{
                paddingTop: "20px",
                paddingBottom: "90px"
            }}>
            <Card
                title={
                    <>
                        Part Requests
                        <span className="request-count-pill">{requests.length}</span>
                    </>
                }
                extra={
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/")}
                        >
                            Back
                        </Button>

                        <Button
                            type="primary"
                            onClick={() => navigate("/add-part-request")}
                        >
                            Add Part
                        </Button>
                    </div>
                }
            >

                {/* Add Search + Filter Here -> by shiva*/}

                <div className="requests-toolbar">
                <Row gutter={[12, 12]}>

                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Search by Name, Email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={handleSearch}
                            size="large"
                        />
                    </Col>

                    <Col xs={24} sm={12} md={4}>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            block
                            onClick={handleSearch}
                            blocksize="large"
                        >
                            Search
                        </Button>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Filter by status"
                            value={status}
                            onChange={handleStatusChange}
                            allowClear
                            size="large"
                            style={{ width: "100%" }}
                            options={[
                                { value: "pending", label: "Pending" },
                                { value: "in progress", label: "In Progress" },
                                { value: "completed", label: "Completed" },
                                { value: "rejected", label: "Rejected" }
                            ]}
                        />
                    </Col>

                    {/* Search dropdopwn for Source */}
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Filter by Source"
                            value={sourceFilter || undefined}
                            onChange={(value) => {

                                setSourceFilter(value || "");

                                if (!value) {

                                    setFilteredRequests([]);
                                    setSearched(false);
                                    return;
                                }

                                const filtered = requests.filter(
                                    (item) =>
                                        item.source === value
                                );

                                setFilteredRequests(filtered);
                                setSearched(true);
                            }}
                            allowClear
                            size="large"
                            style={{ width: "100%" }}
                            options={[
                                { value: "Online", label: "Online" },
                                { value: "Offline", label: "Offline" },
                                { value: "Website", label: "Website" },
                                { value: "Instagram", label: "Instagram" },
                                { value: "Facebook", label: "Facebook" },
                                { value: "WhatsApp", label: "WhatsApp" },
                                { value: "TikTok", label: "TikTok" },
                                { value: "eBay", label: "eBay" },
                                { value: "Google Business", label: "Google Business" },
                                { value: "SMS", label: "SMS" },
                                { value: "Other", label: "Other" },
                            ]}
                        />
                    </Col>
                    {/* end here */}
                </Row>
                </div>

                {noResults && (
                    <div style={{
                        textAlign: "center",
                        marginBottom: 10,
                        color: "#999",
                        fontWeight: 500
                    }}>
                        Item not found
                    </div>
                )}
                <Table
                    columns={columns}
                    dataSource={
                        [...(searched ? filteredRequests : requests)].sort((a, b) => {
                            const aCompleted =
                                a.status?.toLowerCase() === "completed";

                            const bCompleted =
                                b.status?.toLowerCase() === "completed";

                            if (aCompleted && !bCompleted) return 1;
                            if (!aCompleted && bCompleted) return -1;

                            return new Date(b.createdAt) - new Date(a.createdAt);
                        })
                    }
                    // columns={columns}
                    // dataSource={searched ? filteredRequests : requests}
                    // rowKey="_id"
                    // rowClassName={(record) => {

                    //     if (
                    //         record.status?.toLowerCase() ===
                    //         "completed"
                    //     ) {
                    //         return "completed-row";
                    //     }

                    //     return "";
                    // }}
                    rowKey="_id"
                    bordered
                    scroll={{ x: "max-content" }}
                    locale={{
                        emptyText: searched ? "Item not found" : "No data"
                    }}

                />
            </Card>

            {/* Message Details popup — visually and behaviourally identical
                to the Junk Car Request "Condition Details" popup. */}
            <Modal
                title="Message Details"
                open={messageModalOpen}
                onCancel={() => setMessageModalOpen(false)}
                footer={
                    <Button onClick={() => setMessageModalOpen(false)}>
                        Close
                    </Button>
                }
                width={480}
                centered
                destroyOnHidden
            >
                {messageModalRecord && (
                    <div>
                        <div style={{ marginBottom: 12, color: "#888", fontSize: 13 }}>
                            {messageModalRecord.make} {messageModalRecord.model}{" "}
                            {messageModalRecord.year ? `(${messageModalRecord.year})` : ""}
                            {" — "}
                            {messageModalRecord.name}
                            {messageModalRecord.partName ? ` — Part: ${messageModalRecord.partName}` : ""}
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
                            {messageModalRecord.message && messageModalRecord.message.trim()
                                ? messageModalRecord.message
                                : "No message provided."}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );

    // return (
    //     <div style={{ padding: "20px" }}>
    //         <h1>Part Requests</h1>

    //             <table border="1" cellPadding="10" style={{ width: "100%" }}>
    //                 <thead>
    //                     <tr>
    //                         <th>Name</th>
    //                         <th>Vehicle</th>
    //                         <th>Part</th>
    //                         <th>Status</th>
    //                         <th>Date</th>
    //                     </tr>
    //                 </thead>

    //                 <tbody>
    //                     {requests.map((req) => (
    //                         <tr key={req._id}>
    //                             <td>{req.name}</td>
    //                             <td>{req.make} {req.model} {req.year}</td>
    //                             <td>{req.partName}</td>

    //                             <td>
    //                                 <select
    //                                     value={req.status}
    //                                     onChange={(e) => 
    //                                         updateStatus(req._id, e.target.value)
    //                                     }
    //                                 >
    //                                     <option value="Pending">Pending</option>
    //                                     <option value="In Progress">In Progress</option>
    //                                     <option value="Completed">Completed</option>
    //                                 </select>
    //                             </td>

    //                             <td>
    //                                 {new Date(req.createdAt).toLocaleDateString()}
    //                             </td>
    //                         </tr>
    //                     ))}
    //                 </tbody>
    //             </table>
    //         </div>
    //     );
};

export default Requests;