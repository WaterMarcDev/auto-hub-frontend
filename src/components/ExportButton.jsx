import React from "react";
import { Dropdown, Button, message } from "antd";
import {
    DownloadOutlined,
    DownOutlined,
    FileTextOutlined,
    FileExcelOutlined,
} from "@ant-design/icons";
import { exportToCsv, exportToXlsx } from "../utils/exportUtils";

/**
 * Reusable dropdown button to export data to CSV or Excel (.xlsx)
 * @param {Object} props
 * @param {Array} props.data - Current data list to export
 * @param {Array} props.columns - Column export mapping [{ header, key?, render?, width? }]
 * @param {string} props.baseFilename - File prefix (e.g. "Part_Requests")
 * @param {string} [props.sheetName="Requests"] - Excel worksheet name
 * @param {string} [props.label="Download"] - Button text
 * @param {string} [props.size="middle"] - Button size
 * @param {Object} [props.style] - Custom styles
 */
const ExportButton = ({
    data = [],
    columns = [],
    baseFilename = "export",
    sheetName = "Requests",
    label = "Download",
    size = "middle",
    style,
}) => {
    const handleMenuClick = ({ key }) => {
        if (!data || data.length === 0) {
            message.warning("No records to export");
            return;
        }

        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `${baseFilename}_${dateStr}`;

        try {
            if (key === "csv") {
                exportToCsv({ filename, columns, data });
                message.success(`Downloaded ${data.length} records as CSV`);
            } else if (key === "xlsx") {
                exportToXlsx({ filename, sheetName, columns, data });
                message.success(`Downloaded ${data.length} records as Excel (.xlsx)`);
            }
        } catch (error) {
            console.error("Export error:", error);
            message.error("Failed to export data");
        }
    };

    const items = [
        {
            key: "csv",
            icon: <FileTextOutlined style={{ color: "#2563eb", fontSize: "14px" }} />,
            label: <span>Download as CSV (.csv)</span>,
        },
        {
            key: "xlsx",
            icon: <FileExcelOutlined style={{ color: "#16a34a", fontSize: "14px" }} />,
            label: <span>Download as Excel (.xlsx)</span>,
        },
    ];

    return (
        <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
            <Button
                icon={<DownloadOutlined />}
                size={size}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: 500,
                    ...style,
                }}
            >
                <span>{label}</span>
                <DownOutlined style={{ fontSize: "10px", marginLeft: "2px" }} />
            </Button>
        </Dropdown>
    );
};

export default ExportButton;
