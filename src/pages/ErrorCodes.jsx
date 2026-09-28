import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { errorCodes } from "../data/ErrorCodesData";
import {
    Table,
    Card,
    Input,
    Select,
    Button,
    Tag,
    Typography,
    Space
} from "antd";
import { SearchOutlined, FilePdfOutlined } from "@ant-design/icons";
import TitleBox from "../components/TitleBox";
import PageContentWrapper from "../components/PageContentWrapper";

const { Option } = Select;
const { Title } = Typography;

const ErrorCodes = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All");

    const roles = ["All", "Admin", "Inventory Manager", "Staff", "Sales", "Inventory"];

    const filteredErrors = errorCodes.filter((error) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            error.code.toLowerCase().includes(term) ||
            (error.simpleCode && error.simpleCode.toLowerCase().includes(term)) ||
            error.message.toLowerCase().includes(term) ||
            error.meaning.toLowerCase().includes(term);
        const matchesRole =
            selectedRole === "All" ||
            error.role.includes(selectedRole) ||
            error.role === "All Roles";

        return matchesSearch && matchesRole;
    });

    const columns = [
        {
            title: "Simple Code",
            dataIndex: "simpleCode",
            key: "simpleCode",
            width: 120,
            render: (text) => <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>{text || "N/A"}</Tag>,
        },
        {
            title: "Technical Code",
            dataIndex: "code",
            key: "code",
            width: 120,
            render: (text) => <Tag color="volcano">{text}</Tag>,
        },
        {
            title: "Error Message",
            dataIndex: "message",
            key: "message",
            width: 200,
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: "Context",
            dataIndex: "context",
            key: "context",
            width: 150,
        },
        {
            title: "Target Role",
            dataIndex: "role",
            key: "role",
            width: 150,
        },
        {
            title: "Layman Meaning",
            dataIndex: "meaning",
            key: "meaning",
        },
        {
            title: "Resolution / Action",
            dataIndex: "resolution",
            key: "resolution",
        }
    ];

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("System Error Codes Manual", 14, 22);

        doc.setFontSize(11);
        doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);

        const tableColumn = ["Simple Code", "Tech Code", "Message", "Context", "Role", "Meaning", "Resolution"];
        const tableRows = [];

        filteredErrors.forEach((error) => {
            const errorData = [
                error.simpleCode || "-",
                error.code,
                error.message,
                error.context,
                error.role,
                error.meaning,
                error.resolution,
            ];
            tableRows.push(errorData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 20 },
                2: { cellWidth: 30 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 35 },
                6: { cellWidth: 40 },
            },
        });

        doc.save("AutoHub_Error_Codes_Manual.pdf");
    };

    return (
        <div>
            <TitleBox
                title="Error Codes Manual"
                routes={["Home", "Error Codes"]}
                current={"Error Codes Manual"}
            />

            <PageContentWrapper>
                <Card title="System Error Codes">
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <Space wrap>
                            <Input
                                placeholder="Search by code, message..."
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 300 }}
                            />
                            <Select
                                defaultValue="All"
                                value={selectedRole}
                                onChange={setSelectedRole}
                                style={{ width: 200 }}
                            >
                                {roles.map((role) => (
                                    <Option key={role} value={role}>{role}</Option>
                                ))}
                            </Select>
                        </Space>
                        <Button
                            type="primary"
                            icon={<FilePdfOutlined />}
                            onClick={generatePDF}
                        >
                            Download Manual (PDF)
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={filteredErrors}
                        rowKey="code"
                        pagination={{ pageSize: 10 }}
                        className="dark-table"
                        scroll={{ x: 1000 }}
                    />
                </Card>
            </PageContentWrapper>
        </div>
    );
};

export default ErrorCodes;
