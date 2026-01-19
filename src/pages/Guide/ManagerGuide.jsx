import React, { useRef } from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import GuidePDFPreview from "../../components/Guide/GuidePDFPreview";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const ManagerGuide = () => {
  const guideRef = useRef(null);

  return (
    <div className="guide-container">
      <div className="page-title-box">
        <div className="page-title">
          <h4>Manager User Guide</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Guide</a>
            </li>
            <li className="breadcrumb-item active">Manager</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card className="guide-card">
            {/* PDF Download Button */}
            <GuidePDFPreview
              contentRef={guideRef}
              title="Manager User Guide"
              buttonText="Download PDF"
            />

            {/* Guide Content */}
            <div ref={guideRef}>
              <Typography>
                <Title level={2}>Manager User Guide</Title>
                <Paragraph>
                  <Text strong>Welcome, Manager!</Text> You oversee daily
                  operations. This guide will help you.
                </Paragraph>

                <Alert
                  message="Your Role"
                  description="You supervise the team and manage operations. You can: See the dashboard, Manage master data, Monitor car intake, Check inventory, Oversee check-ins, Manage users."
                  type="info"
                  style={{ marginBottom: 24 }}
                />

                <Divider />

                {/* What You Can Access */}
                <Title level={3}>What You Can Access</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>✓ Your Access</Title>
                  
                  <Title level={5}>Front Desk Tasks:</Title>
                  <ul>
                    <li>Check-In / Check-Out</li>
                    <li>Waiver creation</li>
                    <li>Customer management</li>
                  </ul>

                  <Title level={5}>Staff Tasks:</Title>
                  <ul>
                    <li>Car Intake</li>
                    <li>Car Inventory</li>
                    <li>Parts Inventory</li>
                    <li>Scrap Management</li>
                  </ul>

                  <Title level={5}>Manager Tasks:</Title>
                  <ul>
                    <li>Dashboard</li>
                    <li>Master Data (Make, Model, Trim, Part, Element)</li>
                    <li>User Management</li>
                    <li>All reports</li>
                  </ul>

                  <Alert
                    message="Note"
                    description="You cannot do Bulk Upload or change Entry Fee Settings. Only Admin can do those."
                    type="warning"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Dashboard */}
                <Title level={3}>Dashboard</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Paragraph>The dashboard shows you what's happening today.</Paragraph>
                  <Title level={5}>What You See:</Title>
                  <ul>
                    <li>Total cars in inventory</li>
                    <li>Recent car intakes</li>
                    <li>Check-in count for today</li>
                    <li>Activity summary</li>
                  </ul>
                  <Title level={5}>How to Use:</Title>
                  <ol>
                    <li>Click "Dashboard" in menu</li>
                    <li>Review the numbers</li>
                    <li>Click any widget to see more details</li>
                  </ol>
                </Card>

                <Divider />

                {/* Master Data */}
                <Title level={3}>Master Data</Title>
                <Paragraph>
                  Master data controls what options appear in the system.
                </Paragraph>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Add Car Make</Title>
                  <ol>
                    <li>Click "Master" → "Add Car Make"</li>
                    <li>Click "Add New"</li>
                    <li>Type make name (Toyota, Ford)</li>
                    <li>Submit</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Add Car Model</Title>
                  <ol>
                    <li>Click "Master" → "Add Car Model"</li>
                    <li>Select Make first</li>
                    <li>Type Model name</li>
                    <li>Submit</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Add Car Trim</Title>
                  <ol>
                    <li>Click "Master" → "Add Car Trim"</li>
                    <li>Select Make and Model</li>
                    <li>Type Trim name</li>
                    <li>Submit</li>
                  </ol>
                </Card>

                <Divider />

                {/* User Management */}
                <Title level={3}>User Management</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Add a New User</Title>
                  <ol>
                    <li>Click "User Management" → "Add New User"</li>
                    <li>Fill in name and email</li>
                    <li>Choose role (Front Desk, Staff, Manager)</li>
                    <li>Set password</li>
                    <li>Submit</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>View and Edit Users</Title>
                  <ol>
                    <li>Click "User Management" → "User Lists"</li>
                    <li>Find the user</li>
                    <li>Click "Edit" to change details</li>
                    <li>Save changes</li>
                  </ol>
                </Card>

                <Divider />

                {/* Monitoring */}
                <Title level={3}>Daily Monitoring</Title>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Monitor Car Intake</Title>
                  <ol>
                    <li>Click "Car Intake" → "Lists"</li>
                    <li>Filter by status if needed</li>
                    <li>Review incomplete intakes</li>
                    <li>Check for quality issues</li>
                  </ol>
                  <Title level={5}>What to Check:</Title>
                  <ul>
                    <li>Are photos clear?</li>
                    <li>Are parts marked correctly?</li>
                    <li>Is pricing correct?</li>
                    <li>Are documents uploaded?</li>
                  </ul>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Monitor Inventory</Title>
                  <ol>
                    <li>Click "Car Inventory" for all cars</li>
                    <li>Click "Car Parts Inventory" for parts</li>
                    <li>Review stock levels</li>
                    <li>Look for old inventory</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Monitor Check-Ins</Title>
                  <ol>
                    <li>Click "Check-In" → "All Check-Ins"</li>
                    <li>See who is currently inside</li>
                    <li>Check for long visits</li>
                    <li>Make sure everyone checks out</li>
                  </ol>
                </Card>

                <Divider />

                {/* Daily Tasks */}
                <Title level={3}>Daily Manager Tasks</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={5}>Morning:</Title>
                  <ul>
                    <li>Check dashboard</li>
                    <li>Review yesterday's work</li>
                    <li>Look for pending items</li>
                    <li>Brief the team</li>
                  </ul>

                  <Title level={5}>During Day:</Title>
                  <ul>
                    <li>Monitor operations</li>
                    <li>Help with problems</li>
                    <li>Approve pricing if needed</li>
                    <li>Support staff and front desk</li>
                  </ul>

                  <Title level={5}>End of Day:</Title>
                  <ul>
                    <li>Review completed work</li>
                    <li>Check everyone is checked out</li>
                    <li>Note any issues</li>
                    <li>Plan for tomorrow</li>
                  </ul>
                </Card>

                <Divider />

                {/* Best Practices */}
                <Title level={3}>Best Practices</Title>
                <Card>
                  <Title level={5}>
                    <span style={{ color: "#52c41a" }}>✓</span> DO:
                  </Title>
                  <ul>
                    <li>Check dashboard daily</li>
                    <li>Lead by example</li>
                    <li>Be available to help</li>
                    <li>Make fair decisions</li>
                    <li>Document important things</li>
                  </ul>

                  <Title level={5}>
                    <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                  </Title>
                  <ul>
                    <li>Ignore problems</li>
                    <li>Skip quality checks</li>
                    <li>Make hasty decisions</li>
                    <li>Forget to follow up</li>
                  </ul>
                </Card>

                <Divider />

                {/* Quick Reference */}
                <Title level={3}>Quick Reference</Title>
                <Card
                  style={{
                    backgroundColor: "rgba(82, 196, 26, 0.1)",
                    border: "1px solid rgba(82, 196, 26, 0.3)",
                  }}
                >
                  <Title level={5}>Common Tasks:</Title>
                  <ul>
                    <li>Dashboard: Click "Dashboard"</li>
                    <li>Add User: User Management → Add New User</li>
                    <li>Add Make: Master → Add Car Make</li>
                    <li>View Intakes: Car Intake → Lists</li>
                    <li>View Inventory: Car Inventory</li>
                    <li>View Check-Ins: Check-In → All Check-Ins</li>
                  </ul>
                </Card>

                <Divider />

                <Card
                  style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
                >
                  <Title level={4}>Remember</Title>
                  <Paragraph>
                    You are the leader. Your team looks to you.
                  </Paragraph>
                  <ul>
                    <li>Be fair and consistent</li>
                    <li>Make good decisions</li>
                    <li>Support your team</li>
                    <li>Keep quality high</li>
                  </ul>
                  <Paragraph>
                    <Text strong>Need Help? Ask the Admin or IT Support.</Text>
                  </Paragraph>
                </Card>
              </Typography>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerGuide;
