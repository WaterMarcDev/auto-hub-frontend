import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { errorCodes } from "../data/ErrorCodesData";

const ErrorCodes = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All");

    const roles = ["All", "Admin", "Inventory Manager", "Staff", "Sales", "Inventory"];

    const filteredErrors = errorCodes.filter((error) => {
        const matchesSearch =
            error.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            error.meaning.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole =
            selectedRole === "All" ||
            error.role.includes(selectedRole) ||
            error.role === "All Roles";

        return matchesSearch && matchesRole;
    });

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("System Error Codes Manual", 14, 22);

        doc.setFontSize(11);
        doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);

        const tableColumn = ["Code", "Message", "Context", "Role", "Meaning", "Resolution"];
        const tableRows = [];

        filteredErrors.forEach((error) => {
            const errorData = [
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
                1: { cellWidth: 30 },
                2: { cellWidth: 25 },
                3: { cellWidth: 20 },
                4: { cellWidth: 40 },
                5: { cellWidth: 45 },
            },
        });

        doc.save("AutoHub_Error_Codes_Manual.pdf");
    };

    return (
        <div className="page-content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-flex align-items-center justify-content-between">
                            <h4 className="mb-0 font-size-18">Error Codes Manual</h4>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                    <div className="d-flex gap-3 flex-grow-1">
                                        <input
                                            type="text"
                                            placeholder="Search by code, message, or meaning..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="form-control"
                                            style={{ maxWidth: "300px" }}
                                        />
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="form-select"
                                            style={{ maxWidth: "200px" }}
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button className="btn btn-primary" onClick={generatePDF}>
                                        <i className="bx bxs-file-pdf font-size-16 align-middle me-2"></i>{" "}
                                        Download Manual (PDF)
                                    </button>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-striped mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Code</th>
                                                <th>Error Message</th>
                                                <th>Context</th>
                                                <th>Target Role</th>
                                                <th>Layman Meaning</th>
                                                <th>Resolution / Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredErrors.length > 0 ? (
                                                filteredErrors.map((error, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <span className="badge bg-danger text-white font-size-12">
                                                                {error.code}
                                                            </span>
                                                        </td>
                                                        <td className="fw-bold">{error.message}</td>
                                                        <td>{error.context}</td>
                                                        <td>{error.role}</td>
                                                        <td>{error.meaning}</td>
                                                        <td>{error.resolution}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4">
                                                        No error codes found matching criteria.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorCodes;
