// "Active Business Records (Document Estimates)" — moved here from the
// Analytics page (src/pages/Analytics.jsx, now commented out of the menu).
// Same six counts and colours; data from GET /api/dashboard/record-counts.
import React, { useEffect, useState } from "react";
import { Row, Col, Spin } from "antd";
import { dashboardAPI } from "../../utils/api";

const RECORDS = [
  { key: "checkIns", label: "Check-Ins", color: "#1890ff" },
  { key: "customers", label: "Customers", color: "#52c41a" },
  { key: "waivers", label: "Signed Waivers", color: "#722ed1" },
  { key: "inventory", label: "Inventory Parts", color: "#fa8c16" },
  { key: "transactions", label: "Transactions", color: "#13c2c2" },
  { key: "users", label: "Staff Accounts", color: "#eb2f96" },
];

const BusinessRecordCounts = () => {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    dashboardAPI
      .getRecordCounts()
      .then((res) => mounted && setCounts(res.data || {}))
      .catch((err) => console.error("Failed to load business record counts:", err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="card" style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}>
      <div className="card-body">
        <h4 className="card-title mb-3" style={{ color: "#D6D9E6" }}>
          Active Business Records (Document Estimates)
        </h4>
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            {RECORDS.map((r) => (
              <Col xs={12} sm={8} md={4} key={r.key}>
                <div
                  style={{
                    textAlign: "center",
                    borderRadius: 8,
                    padding: "12px 8px",
                    backgroundColor: "#273246",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>{r.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: r.color, marginTop: 4 }}>
                    {Number(counts[r.key] || 0).toLocaleString()}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
    </div>
  );
};

export default BusinessRecordCounts;
