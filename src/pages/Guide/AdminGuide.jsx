import React, { useRef } from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import GuidePDFPreview from "../../components/Guide/GuidePDFPreview";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const AdminGuide = () => {
  const guideRef = useRef(null);

  return (
    <div className="guide-container">
      <div className="page-title-box">
        <div className="page-title">
          <h4>Administrator User Guide</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Guide</a>
            </li>
            <li className="breadcrumb-item active">Administrator</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card className="guide-card">
            {/* PDF Download Button */}
            <GuidePDFPreview
              contentRef={guideRef}
              title="Administrator User Guide"
              buttonText="Download PDF"
            />

            {/* Guide Content */}
            <div ref={guideRef}>
              <Typography>
                <Title level={2}>Administrator User Guide</Title>
                <Paragraph>
                  <Text strong>Welcome, Administrator!</Text> You have full
                  access to everything in the system.
                </Paragraph>

                <Alert
                  message="Your Role"
                  description="You control the whole system. You can: Manage all users, Change system settings, Upload data in bulk, Do everything other roles can do."
                  type="info"
                  style={{ marginBottom: 24 }}
                />

                <Divider />

                {/* What You Can Access */}
                <Title level={3}>What You Can Access</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>✓ Full System Access</Title>
                  <Paragraph>You can do everything:</Paragraph>
                  <ul>
                    <li><Text strong>Dashboard</Text> - See all activity</li>
                    <li><Text strong>Master Data</Text> - Makes, Models, Trims, Parts, Elements</li>
                    <li><Text strong>Car Intake</Text> - Add and manage cars</li>
                    <li><Text strong>Inventory</Text> - Cars and Parts</li>
                    <li><Text strong>Scrap</Text> - Handle scrap cars</li>
                    <li><Text strong>Customer</Text> - Manage customers</li>
                    <li><Text strong>Check-In</Text> - Customer check-in</li>
                    <li><Text strong>Waiver</Text> - Create waivers</li>
                    <li><Text strong>User Management</Text> - Add/edit users</li>
                    <li><Text strong>Entry Fee Settings</Text> - Change entry fee</li>
                    <li><Text strong>Bulk Upload</Text> - Upload many cars at once</li>
                  </ul>
                </Card>

                <Divider />

                {/* User Management */}
                <Title level={3}>User Management</Title>
                
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>How to Add a New User</Title>
                  <ol>
                    <li>Click "User Management" → "Add New User"</li>
                    <li>Fill in First Name</li>
                    <li>Fill in Last Name</li>
                    <li>Fill in Email</li>
                    <li>Choose Role:
                      <ul>
                        <li><Tag color="cyan">Front Desk</Tag> - Check-in, waiver, customers</li>
                        <li><Tag color="gold">Staff</Tag> - Car intake, inventory, scrap</li>
                        <li><Tag color="blue">Manager</Tag> - Almost everything except bulk upload</li>
                        <li><Tag color="purple">Admin</Tag> - Full access</li>
                      </ul>
                    </li>
                    <li>Enter Password</li>
                    <li>Click "Submit"</li>
                  </ol>
                  <Alert
                    message="Important"
                    description="Choose the right role. Role decides what the user can see and do."
                    type="warning"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>How to Edit a User</Title>
                  <ol>
                    <li>Click "User Management" → "User Lists"</li>
                    <li>Find the user</li>
                    <li>Click "Edit" button</li>
                    <li>Change what you need (role, name, etc.)</li>
                    <li>Click "Save"</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>How to Reset Password</Title>
                  <ol>
                    <li>Go to User Lists</li>
                    <li>Find the user</li>
                    <li>Click "Reset Password"</li>
                    <li>Enter new password</li>
                    <li>Click "Save"</li>
                    <li>Tell the user their new password</li>
                  </ol>
                </Card>

                <Divider />

                {/* Master Data */}
                <Title level={3}>Master Data Management</Title>
                <Paragraph>
                  Master data is the foundation. It controls what options appear in the system.
                </Paragraph>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Add Car Make (Brand)</Title>
                  <ol>
                    <li>Click "Master" → "Add Car Make"</li>
                    <li>Click "Add New"</li>
                    <li>Type the make name (Toyota, Ford, etc.)</li>
                    <li>Click "Submit"</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Add Car Model</Title>
                  <ol>
                    <li>Click "Master" → "Add Car Model"</li>
                    <li>Select the Make first</li>
                    <li>Type the Model name</li>
                    <li>Click "Submit"</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Add Car Trim</Title>
                  <ol>
                    <li>Click "Master" → "Add Car Trim"</li>
                    <li>Select Make, then Model</li>
                    <li>Type the Trim name (LE, Sport, Limited)</li>
                    <li>Click "Submit"</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Add Inventory Parts</Title>
                  <ol>
                    <li>Click "Master" → "Add Inventory Parts"</li>
                    <li>Click "Add New"</li>
                    <li>Type part name (Engine, Door, etc.)</li>
                    <li>Add category if needed</li>
                    <li>Click "Submit"</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>Add Scrap Elements</Title>
                  <ol>
                    <li>Click "Master" → "Add Scrap Elements"</li>
                    <li>Click "Add New"</li>
                    <li>Type element name (Metal, Plastic, etc.)</li>
                    <li>Set value if needed</li>
                    <li>Click "Submit"</li>
                  </ol>
                </Card>

                <Divider />

                {/* Entry Fee Settings */}
                <Title level={3}>Entry Fee Settings</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>How to Change Entry Fee</Title>
                  <ol>
                    <li>Click "Entry Fee Settings" in menu</li>
                    <li>See current entry fee amount</li>
                    <li>Type new amount</li>
                    <li>Click "Save"</li>
                  </ol>
                  <Alert
                    message="Note"
                    description="This changes the entry fee for all new check-ins."
                    type="info"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Bulk Upload */}
                <Title level={3}>Bulk Upload Cars</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="red">Admin Only</Tag> Upload Many Cars at Once
                  </Title>
                  <Paragraph>Use this to add many cars from an Excel file.</Paragraph>
                  
                  <Title level={5}>How to Bulk Upload:</Title>
                  <ol>
                    <li>Prepare an Excel file with car data</li>
                    <li>Required column: VIN</li>
                    <li>Optional: Make, Model, Year, Trim, Color, etc.</li>
                    <li>Go to "Car Intake" → "Lists"</li>
                    <li>Click "Bulk Upload"</li>
                    <li>Select your Excel file</li>
                    <li>Click "Upload"</li>
                    <li>Review results (successful, failed, skipped)</li>
                  </ol>
                  <Alert
                    message="Warning"
                    description="Bulk upload creates many records at once. Test with a small file first."
                    type="error"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Best Practices */}
                <Title level={3}>Best Practices</Title>
                <Card>
                  <Title level={5}>
                    <span style={{ color: "#52c41a" }}>✓</span> DO:
                  </Title>
                  <ul>
                    <li>Give users the correct role - not more than needed</li>
                    <li>Keep your password safe</li>
                    <li>Check system regularly</li>
                    <li>Train new users properly</li>
                    <li>Test bulk uploads with small files first</li>
                  </ul>

                  <Title level={5}>
                    <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                  </Title>
                  <ul>
                    <li>Share your admin password</li>
                    <li>Give admin access to everyone</li>
                    <li>Delete users - deactivate instead</li>
                    <li>Skip testing before bulk upload</li>
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
                  <Title level={5}>Common Admin Tasks:</Title>
                  <ul>
                    <li>Add User: User Management → Add New User</li>
                    <li>Edit User: User Management → User Lists → Edit</li>
                    <li>Add Make: Master → Add Car Make</li>
                    <li>Add Model: Master → Add Car Model</li>
                    <li>Change Entry Fee: Entry Fee Settings</li>
                    <li>Bulk Upload: Car Intake → Lists → Bulk Upload</li>
                  </ul>
                </Card>

                <Divider />

                <Card
                  style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
                >
                  <Title level={4}>Remember</Title>
                  <Paragraph>
                    You have great power. Use it carefully.
                  </Paragraph>
                  <ul>
                    <li>Think before making changes</li>
                    <li>Double-check before deleting</li>
                    <li>Keep the system secure</li>
                  </ul>
                  <Paragraph>
                    <Text strong>Need Help? Contact IT Support.</Text>
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

export default AdminGuide;
