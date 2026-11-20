import { useEffect, useState } from "react";
import { Card, Table, Select, Button, Input, Tag } from "antd";
import { ArrowLeftOutlined, FileTextOutlined, InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AddJunkCarRequest from "./AddJunkCarRequest";
import { Modal } from "antd";
import api from "../utils/api";    // by shiva
import SourceBadge from "../components/SourceBadge";
import { cacheManager } from "../utils/cacheManager";
import ExportButton from "../components/ExportButton";
import { formatExportDate } from "../utils/exportUtils";

const { Option } = Select;

// Statuses a lead can be set to — used by both the Status column and the
// Status filter (backend: utils/junkCarLeads.js). Stored lowercase; the
// labels are what users see.
const JUNK_CAR_STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "lead converted", label: "Lead Converted" },
    { value: "lead lost", label: "Lead Lost" },
    { value: "lead closed", label: "Lead Closed" },
];

// Retired status still on some older leads: shown (not selectable) until a
// new status is picked.
const LEGACY_STATUS_LABELS = { "in progress": "In Progress" };

// Completed leads are not wanted: the backend no longer returns them and
// scripts/removeCompletedRejectedLeads.js deletes them. Also skipped here so
// none show while an older backend is still running.
const REMOVED_STATUSES = new Set(["completed"]);

// Lead Converted / Lead Closed sink to the bottom of the default list. They
// are never hidden — the Status filter shows them.
const BOTTOM_STATUSES = new Set(["lead converted", "lead closed"]);

const normalizeStatus = (status) =>
    (status || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

const statusLabel = (status) =>
    JUNK_CAR_STATUS_OPTIONS.find((s) => s.value === normalizeStatus(status))?.label ||
    LEGACY_STATUS_LABELS[normalizeStatus(status)] ||
    status ||
    "-";

// "First Last" for a populated user, "" otherwise.
const personName = (person) =>
    person && typeof person === "object" && person.first_name
        ? `${person.first_name} ${person.last_name || ""}`.trim()
        : "";

// The Staff filter: always exactly these names, in this order, even before
// they have a user account (backend: utils/junkCarLeads.js). A lead matches
// when its assignee's first + last name is this name, so once an account
// with the same name exists, leads assigned to it show up here.
const NAMED_STAFF = ["Ankit Dewan", "Jaspreet Singh", "Vijay Kumar"];

const nameKey = (name) => (name || "").trim().toLowerCase().replace(/\s+/g, " ");

const JUNK_CAR_EXPORT_COLUMNS = [
    { header: "Date", render: (r) => formatExportDate(r.createdAt), width: 18 },
    { header: "Customer Name", key: "name", width: 22 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "Make", key: "make", width: 16 },
    { header: "Model", key: "model", width: 16 },
    { header: "Year", key: "year", width: 10 },
    { header: "VIN / Engine", render: (r) => r.engineOrVin || "-", width: 22 },
    { header: "Location", render: (r) => r.location || "-", width: 20 },
    {
        header: "Condition",
        render: (r) => {
            if (!r.condition || r.condition === "none") return "-";
            if (typeof r.condition === "object") {
                try {
                    return Object.entries(r.condition)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join("; ");
                } catch {
                    return String(r.condition);
                }
            }
            return String(r.condition);
        },
        width: 35,
    },
    { header: "Message", render: (r) => r.message || "-", width: 35 },
    { header: "Remark", render: (r) => r.remark || "-", width: 35 },
    {
        header: "Source",
        render: (r) => {
            const src = (r.source || "website").toString().toLowerCase();
            return src === "website" ? "Website" : (r.source || "Website");
        },
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
    { header: "Assigned To", render: (r) => personName(r.assignedTo) || "Unassigned", width: 20 },
    { header: "Lead Assigned By", render: (r) => personName(r.assignedBy) || "-", width: 20 },
    { header: "Status", render: (r) => statusLabel(r.status), width: 16 },
    { header: "Payment Status", render: (r) => r.paymentStatus || "Not Paid", width: 16 },
];

// Only the sources in use (backend: utils/requestSources.js). Old records with
// a retired source still display it and can be re-tagged to one of these.
const JUNK_CAR_SOURCE_OPTIONS = [
    { value: "website" },
    { value: "instagram" },
    { value: "facebook" },
];

const JunkCarRequests = () => {
    // SWR instant render: restore immediately from memory cache to avoid "0" and "No requests yet" flash
    const [junkCars, setJunkCars] = useState(() => cacheManager.get("junkCars") || []);
    const [loading, setLoading] = useState(() => !cacheManager.get("junkCars"));
    const [staffUsers, setStaffUsers] = useState([]);    // by shiva
    const [staffFilter, setStaffFilter] = useState("");   // by shiva
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

    const fetchJunkCars = async (force = false) => {
        const cached = cacheManager.get("junkCars");
        if (!cached || force) {
            if (!cached) setLoading(true);
        }
        try {
            const res = await api.get("/junk-car");
            const data = res.data?.data || [];
            cacheManager.set("junkCars", data, 120); // 2 minute memory cache
            setJunkCars(data);
        } catch (error) {
            console.error("Error fetching junk cars:", error);
        } finally {
            setLoading(false);
        }
    };
    const user = JSON.parse(localStorage.getItem("user"));

    const canEditSource =
        user?.role?.toLowerCase() === "admin" ||
        user?.role?.toLowerCase() === "manager";

    // Admins and managers assign leads; everyone can filter by staff.
    const canAssignStaff = canEditSource;

    // Fetch Staff Users by shiva
    const fetchStaffUsers = async () => {
        try {
            const res = await api.get("/users/staff");
            setStaffUsers(res.data.data || []);
        } catch (error) {
            console.error("Error fetching staff users:", error);
        }
    };
    // end here

    useEffect(() => {
        fetchJunkCars();

        // Subscribe to real-time updates from WebSocket push
        const unsub = cacheManager.subscribe("junkCars", () => {
            fetchJunkCars(true);
        });

        // Staff list for the assignment dropdown (admins / managers only).
        // The Staff filter does not need it — see NAMED_STAFF.
        if (canAssignStaff) {
            fetchStaffUsers();
        }

        return () => unsub();
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

            // null unassigns. The backend records the logged-in user as
            // "Lead Assigned By".
            await api.patch(
                `/junk-car/${id}/assign`,
                { assignedTo: assignedTo || null }
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
            title: "Location",
            render: (_, record) => record.location || "none",
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
            render: (_, record) => {
                const current = normalizeStatus(record.status);
                // A retired status (In Progress) is shown as the current
                // value but can't be picked again.
                const options = LEGACY_STATUS_LABELS[current]
                    ? [...JUNK_CAR_STATUS_OPTIONS, { value: current, label: LEGACY_STATUS_LABELS[current], disabled: true }]
                    : JUNK_CAR_STATUS_OPTIONS;

                return (
                    <Select
                        placeholder="Select"
                        value={current || undefined}
                        onChange={(value) =>
                            updateStatus(record._id, value)
                        }
                        style={{ width: 160 }}
                        options={options}
                    />
                );
            },
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
            // Staff member the lead is assigned to — shows whoever it is
            // actually assigned to (no default name).
            title: "Assigned To",
            render: (_, record) => {
                const assignee =
                    record.assignedTo && typeof record.assignedTo === "object"
                        ? record.assignedTo
                        : null;

                if (!canAssignStaff) {
                    return personName(assignee) || (
                        <span style={{ color: "#999" }}>Unassigned</span>
                    );
                }

                const options = staffUsers.map((staff) => ({
                    value: staff._id,
                    label: personName(staff),
                }));
                // Named staff without an account yet are shown but can't be
                // picked — an assignment needs a user account.
                NAMED_STAFF.forEach((name) => {
                    if (!staffUsers.some((s) => nameKey(personName(s)) === nameKey(name))) {
                        options.push({ value: `pending:${name}`, label: `${name} (no account yet)`, disabled: true });
                    }
                });
                // Keep the current assignee selectable/visible even when they
                // are not in the staff list (e.g. an admin who worked it).
                if (assignee?._id && !options.some((o) => o.value === assignee._id)) {
                    options.push({ value: assignee._id, label: personName(assignee) || "Unknown user" });
                }

                return (
                    <Select
                        value={assignee?._id}
                        placeholder="Unassigned"
                        allowClear
                        options={options}
                        onChange={(value) =>
                            assignStaff(record._id, value)
                        }
                        style={{ width: 180 }}
                        disabled={record.status === "completed"}
                    />
                );
            },
        },
        {
            // Who made the current assignment, tracked separately from the
            // assignee. "-" for leads assigned before this was recorded.
            title: "Lead Assigned By",
            render: (_, record) => {
                const name = personName(record.assignedBy);
                if (!name) return "-";
                return (
                    <div>
                        {name}
                        {record.assignedAt && (
                            <div style={{ fontSize: 11, color: "#888" }}>
                                {new Date(record.assignedAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
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

    // Every lead the page shows (Completed leads are left out).
    const visibleJunkCars = junkCars.filter(
        (car) => !REMOVED_STATUSES.has(normalizeStatus(car.status))
    );

    const displayedJunkCars = visibleJunkCars
        .filter((car) => {
            // Staff filter: leads assigned to the selected staff member,
            // matched by the assignee's name.
            const staffMatch =
                !staffFilter ||
                nameKey(personName(car.assignedTo)) === staffFilter;

            const sourceMatch =
                !sourceFilter || car.source === sourceFilter;

            const statusMatch =
                !statusFilter ||
                normalizeStatus(car.status) === statusFilter;

            return staffMatch && sourceMatch && statusMatch;
        })
        .sort((a, b) => {
            // Lead Converted / Lead Closed go to the bottom;
            // newest first within each group.
            const aBottom = BOTTOM_STATUSES.has(normalizeStatus(a.status));
            const bBottom = BOTTOM_STATUSES.has(normalizeStatus(b.status));

            if (aBottom && !bBottom) return 1;
            if (!aBottom && bBottom) return -1;

            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    return (
        <div className="requests-page" style={{ paddingTop: "20px", paddingBottom: "90px" }}>
            <Card
                title={
                    <>
                        Junk Car Requests
                        <span className="request-count-pill">{visibleJunkCars.length}</span>
                    </>
                }
                extra={
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <ExportButton
                            data={displayedJunkCars}
                            columns={JUNK_CAR_EXPORT_COLUMNS}
                            baseFilename="Junk_Car_Requests"
                            sheetName="Junk Cars"
                            label="Download"
                        />

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
                {/* Staff filter by shiva */}
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
                            setStaffFilter(value || "")
                        }
                        options={NAMED_STAFF.map((name) => ({ value: nameKey(name), label: name }))}
                    />

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
                        <Option value="website">Website</Option>
                        <Option value="instagram">Instagram</Option>
                        <Option value="facebook">Facebook</Option>
                        <Option value="offline">Offline (added in CRM)</Option>
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
                        options={JUNK_CAR_STATUS_OPTIONS}
                    />

                </div>

                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={displayedJunkCars}
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

                        // Lead Converted / Lead Closed are faded.
                        if (BOTTOM_STATUSES.has(normalizeStatus(record.status))) {
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
                                    {staffFilter || sourceFilter || statusFilter
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
            </Modal>  {/* end here */}

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