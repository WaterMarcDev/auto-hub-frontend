import { useEffect, useState } from "react";
import { Card, Table, Tag, Modal } from "antd";
import { Button } from "antd";
import { ArrowLeftOutlined, FileTextOutlined, InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import SourceBadge from "../../components/SourceBadge";
import { cacheManager } from "../../utils/cacheManager";
import ExportButton from "../../components/ExportButton";
import { formatExportDate } from "../../utils/exportUtils";

const { Option } = Select;

const PART_REQUEST_EXPORT_COLUMNS = [
    { header: "Date", render: (r) => formatExportDate(r.createdAt), width: 18 },
    { header: "Customer Name", key: "name", width: 22 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "Make", key: "make", width: 16 },
    { header: "Model", key: "model", width: 16 },
    { header: "Year", key: "year", width: 10 },
    { header: "Part Name", key: "partName", width: 25 },
    { header: "Message", render: (r) => r.message || "-", width: 35 },
    { header: "Remark", render: (r) => r.remark || "-", width: 35 },
    {
        header: "Source",
        render: (r) => (r.source === "Online" ? "Website" : r.source || "Website"),
        width: 16,
    },
    {
        header: "Created By",
        render: (r) =>
            r.createdBy && typeof r.createdBy === "object" && r.createdBy.first_name
                ? `${r.createdBy.first_name} ${r.createdBy.last_name || ""}`.trim()
                : "-",
        width: 20,
    },
    { header: "Status", render: (r) => r.status || "-", width: 16 },
];

// "Online"/"Offline" are assigned automatically at creation (organic website
// submission vs staff-entered) and were never selectable here — preserved
// from the previous <Select> implementation's commented-out Options.
// Only the sources in use (backend: utils/requestSources.js). Old records with
// a retired source still display it and can be re-tagged to one of these.
const PART_REQUEST_SOURCE_OPTIONS = [
    { value: "Website" },
    { value: "Instagram" },
    { value: "Facebook" },
];

// Filter: "Website" covers both website-form requests (stored "Online") and
// requests staff tagged "Website".
const SOURCE_FILTER_MATCHES = {
    Website: ["Online", "Website"],
    Offline: ["Offline"],
    Instagram: ["Instagram"],
    Facebook: ["Facebook"],
};


const Requests = () => {
    const [requests, setRequests] = useState(() => cacheManager.get("partRequests") || []);
    const [loading, setLoading] = useState(() => !cacheManager.get("partRequests"));
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const canEditSource =
        user?.role?.toLowerCase() === "admin" ||
        user?.role?.toLowerCase() === "manager";

    const [search, setSearch] = useState("");               // text in the search box
    const [appliedSearch, setAppliedSearch] = useState(""); // applied on Enter / Search
    const [status, setStatus] = useState(null);
    const [sourceFilter, setSourceFilter] = useState("");  // added by shiva for Search by source
    const [noResults, setNoResults] = useState(false);
    const [junkCars, setJunkCars] = useState(() => cacheManager.get("junkCars") || []);

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

    // Search runs on Enter / Search click; clearing the box clears it.
    // Source and Status apply as soon as they change. All three combine —
    // see displayedRequests below.
    const handleSearch = () => setAppliedSearch(search.trim());

    const fetchRequests = async (force = false) => {
        const cached = cacheManager.get("partRequests");
        if (!cached || force) {
            if (!cached) setLoading(true);
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/part-request`);
            const data = await res.json();
            const list = data.data || [];
            cacheManager.set("partRequests", list, 120);
            setRequests(list);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    //Fetch Junk Car API - shiva
    const fetchJunkCars = async () => {
        const cached = cacheManager.get("junkCars");
        if (cached) {
            setJunkCars(cached);
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/junk-car`);
            const data = await res.json();
            const list = data.data || [];
            cacheManager.set("junkCars", list, 120);
            setJunkCars(list);
        } catch (error) {
            console.error("Error fetching junk cars : ", error);
        }
    }; //end here

    useEffect(() => {
        fetchRequests();
        fetchJunkCars();  // by shiva

        const unsubPart = cacheManager.subscribe("partRequests", () => {
            fetchRequests(true);
        });
        const unsubJunk = cacheManager.subscribe("junkCars", () => {
            fetchJunkCars();
        });

        return () => {
            unsubPart();
            unsubJunk();
        };
    }, []);

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
            render: (_, record) => {
                const sourceValue = record.source || "Online";
                return (
                    <SourceBadge
                        value={sourceValue}
                        // "Online" is the auto-assigned value for a genuine
                        // website form submission (see comment above) — only
                        // its DISPLAYED text changes here, never the stored
                        // value/API contract/filter behavior.
                        displayLabel={sourceValue === "Online" ? "Website" : undefined}
                        options={PART_REQUEST_SOURCE_OPTIONS}
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

    // Search, Source and Status combine (same as Junk Car Requests): a row is
    // shown only if it matches every filter that is set.
    const searchText = appliedSearch.toLowerCase();
    const sourceMatches = sourceFilter ? SOURCE_FILTER_MATCHES[sourceFilter] || [sourceFilter] : null;
    const isFiltering = Boolean(searchText || status || sourceFilter);

    const displayedRequests = requests.filter((item) => {
        const searchMatch =
            !searchText ||
            [
                item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
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
                item.status,
            ].some((field) => String(field || "").toLowerCase().includes(searchText));

        const statusMatch = !status || item.status?.toLowerCase() === status.toLowerCase();
        const sourceMatch = !sourceMatches || sourceMatches.includes(item.source || "Online");

        return searchMatch && statusMatch && sourceMatch;
    }).sort((a, b) => {
        const aCompleted = a.status?.toLowerCase() === "completed";
        const bCompleted = b.status?.toLowerCase() === "completed";

        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;

        return new Date(b.createdAt) - new Date(a.createdAt);
    });

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
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <ExportButton
                            data={displayedRequests}
                            columns={PART_REQUEST_EXPORT_COLUMNS}
                            baseFilename="Part_Requests"
                            sheetName="Part Requests"
                            label="Download"
                        />

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

                {/* Filters — same layout as Junk Car Requests: one wrapping row,
                    same control sizes. Search, Source and Status combine. */}
                <div
                    className="requests-toolbar"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        alignItems: "center",
                    }}
                >
                    <Space size={8}>
                        <Input
                            placeholder="Search by Name, Email, Part..."
                            value={search}
                            allowClear
                            style={{ width: 240 }}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                if (!e.target.value) setAppliedSearch("");
                            }}
                            onPressEnter={handleSearch}
                        />
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                            Search
                        </Button>
                    </Space>

                    <Select
                        placeholder="Filter by Source"
                        style={{ width: 180 }}
                        allowClear
                        value={sourceFilter || undefined}
                        onChange={(value) => setSourceFilter(value || "")}
                        options={[
                            { value: "Website", label: "Website" },
                            { value: "Instagram", label: "Instagram" },
                            { value: "Facebook", label: "Facebook" },
                            { value: "Offline", label: "Offline (added in CRM)" },
                        ]}
                    />

                    <Select
                        placeholder="Filter by Status"
                        style={{ width: 180 }}
                        allowClear
                        value={status || undefined}
                        onChange={(value) => setStatus(value || null)}
                        options={[
                            { value: "pending", label: "Pending" },
                            { value: "in progress", label: "In Progress" },
                            { value: "completed", label: "Completed" },
                            { value: "rejected", label: "Rejected" },
                        ]}
                    />
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
                    loading={loading}
                    columns={columns}
                    dataSource={displayedRequests}
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
                        emptyText: (
                            <div className="requests-empty-state">
                                <InboxOutlined />
                                <span>{isFiltering ? "No matching requests found" : "No requests yet"}</span>
                            </div>
                        )
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