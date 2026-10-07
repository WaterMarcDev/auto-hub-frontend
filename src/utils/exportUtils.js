import * as XLSX from "xlsx";

/**
 * Cleanly format dates for exports
 */
export const formatExportDate = (dateVal) => {
    if (!dateVal) return "-";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Trigger browser file download from Blob
 */
const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Export data to CSV with UTF-8 BOM for Microsoft Excel compatibility
 * @param {Object} options
 * @param {string} options.filename
 * @param {Array} options.columns - [{ header: string, key?: string, render?: (item) => any, width?: number }]
 * @param {Array} options.data
 */
export const exportToCsv = ({ filename, columns, data }) => {
    if (!data || data.length === 0) return false;

    // Header row
    const headers = columns.map((col) => `"${(col.header || "").replace(/"/g, '""')}"`);

    // Data rows
    const rows = data.map((item) => {
        return columns.map((col) => {
            let val = col.render ? col.render(item) : (col.key ? item[col.key] : "");
            if (val === null || val === undefined) val = "";
            if (typeof val === "object") {
                try {
                    val = JSON.stringify(val);
                } catch {
                    val = String(val);
                }
            }
            const cleanStr = String(val).replace(/\r?\n|\r/g, " ").replace(/"/g, '""');
            return `"${cleanStr}"`;
        }).join(",");
    });

    // UTF-8 BOM + CSV string
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, `${filename}.csv`);
    return true;
};

/**
 * Export data to XLSX with spacious column widths and formatted cells
 * @param {Object} options
 * @param {string} options.filename
 * @param {string} [options.sheetName="Requests"]
 * @param {Array} options.columns - [{ header: string, key?: string, render?: (item) => any, width?: number }]
 * @param {Array} options.data
 */
export const exportToXlsx = ({ filename, sheetName = "Requests", columns, data }) => {
    if (!data || data.length === 0) return false;

    // Build headers and row data
    const headers = columns.map((col) => col.header || "");
    const rows = data.map((item) => {
        return columns.map((col) => {
            let val = col.render ? col.render(item) : (col.key ? item[col.key] : "");
            if (val === null || val === undefined) return "";
            if (typeof val === "object") {
                try {
                    return JSON.stringify(val);
                } catch {
                    return String(val);
                }
            }
            return typeof val === "string" ? val.replace(/\r?\n|\r/g, " ") : val;
        });
    });

    const aoa = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Compute generous column widths to ensure spacious layout
    const colWidths = columns.map((col) => {
        const headerLen = (col.header || "").length;
        let maxLen = headerLen;

        // Sample up to 100 rows for performance while ensuring sufficient width
        const sampleSize = Math.min(data.length, 100);
        for (let i = 0; i < sampleSize; i++) {
            const item = data[i];
            const val = col.render ? col.render(item) : (col.key ? item[col.key] : "");
            if (val !== null && val !== undefined) {
                const len = String(val).length;
                if (len > maxLen) maxLen = len;
            }
        }

        const baseWidth = col.width || 18;
        // Padding of +4 chars, clamped between baseWidth and 55
        return { wch: Math.min(Math.max(baseWidth, maxLen + 4), 55) };
    });

    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
};
