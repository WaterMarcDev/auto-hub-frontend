import React from "react";
import { Card, Typography, Divider } from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./GuideStyles.css";

import adminMd from "./guides/USER_GUIDE_ADMIN.md?raw";
import managerMd from "./guides/USER_GUIDE_MANAGER.md?raw";
import frontDeskMd from "./guides/USER_GUIDE_FRONT_DESK.md?raw";
import staffMd from "./guides/USER_GUIDE_STAFF.md?raw";

const { Title } = Typography;

const mapping = {
  admin: { title: "Administrator Guide", content: adminMd },
  manager: { title: "Manager Guide", content: managerMd },
  "front-desk": { title: "Front Desk Guide", content: frontDeskMd },
  staff: { title: "Staff Guide", content: staffMd },
};

const RoleBasedUserGuide = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  if (role && mapping[role]) {
    const { title, content } = mapping[role];
    return (
      <div className="guide-container">
        <div className="page-title-box">
          <div className="page-title">
            <h4>{title}</h4>
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li className="breadcrumb-item">
                <a href="javascript: void(0);">Guide</a>
              </li>
              <li className="breadcrumb-item active">Role-Based Access</li>
            </ol>
          </div>
        </div>

        <div className="container-fluid">
          <div className="page-content-wrapper">
            <Card className="guide-card">
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-sm"
                  style={{ marginRight: 8 }}
                >
                  ← Back
                </button>
                <Link to="/guide/role-based">All Role Guides</Link>
              </div>
              <Divider />
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="guide-container">
      <div className="page-title-box">
        <div className="page-title">
          <h4>Role-Based User Guides</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Guide</a>
            </li>
            <li className="breadcrumb-item active">Role-Based Access</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card className="guide-card">
            <Title level={2}>Role-Based Guides</Title>
            <Divider />
            <div style={{ display: "grid", gap: 12 }}>
              <Card className="step-card">
                <h4>Administrator</h4>
                <p>Full system access and administrative responsibilities.</p>
                <Link to="/guide/role-based/admin">Open Admin Guide</Link>
              </Card>

              <Card className="step-card">
                <h4>Manager</h4>
                <p>Supervising operations, master data, reports.</p>
                <Link to="/guide/role-based/manager">Open Manager Guide</Link>
              </Card>

              <Card className="step-card">
                <h4>Front Desk</h4>
                <p>Check-In, waivers, customer-facing workflows.</p>
                <Link to="/guide/role-based/front-desk">
                  Open Front Desk Guide
                </Link>
              </Card>

              <Card className="step-card">
                <h4>Staff</h4>
                <p>Car intake, inventory, scrap operations.</p>
                <Link to="/guide/role-based/staff">Open Staff Guide</Link>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedUserGuide;
