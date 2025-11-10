import React from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const AdminGuide = () => {
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
            <Typography>
              <Title level={2}>Administrator Guide</Title>
              <Paragraph>
                <Text strong>Welcome, Administrator!</Text> This guide covers
                your complete system access and administrative responsibilities
                in the AutoHub Dashboard.
              </Paragraph>

              <Alert
                message="Your Role"
                description="As an Administrator, you have complete system control: full access to all features and data, user account management, system configuration, bulk data operations, master data management, all operational features, system maintenance, security oversight, backup and recovery, and technical support. You are the ultimate authority in the system."
                type="info"
                style={{ marginBottom: 24 }}
              />

              <Divider />

              <Title level={3}>Complete System Access</Title>
              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>✓ You Have Access To EVERYTHING</Title>

                <Title level={5}>All User Roles:</Title>
                <ul>
                  <li>Everything Front Desk can do</li>
                  <li>Everything Staff can do</li>
                  <li>Everything Manager can do</li>
                </ul>

                <Title level={5}>Plus Admin-Only Features:</Title>
                <ul>
                  <li>
                    <Text strong>Bulk Upload</Text> - Import multiple records at
                    once
                  </li>
                  <li>
                    <Text strong>User Management</Text> - Create, edit, delete
                    users
                  </li>
                  <li>
                    <Text strong>System Settings</Text> - Configure system
                    parameters
                  </li>
                  <li>
                    <Text strong>Advanced Reports</Text> - Deep analytics
                  </li>
                  <li>
                    <Text strong>System Logs</Text> - Audit trails
                  </li>
                  <li>
                    <Text strong>Database Management</Text> - Data cleanup and
                    optimization
                  </li>
                  <li>
                    <Text strong>Backup/Restore</Text> - System backup
                    operations
                  </li>
                </ul>

                <Paragraph>
                  <Text strong>No Restrictions:</Text> You can access and modify
                  anything in the system.
                </Paragraph>
              </Card>

              <Divider />

              <Title level={3}>User Management</Title>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Creating New Users</Title>
                <ol>
                  <li>Access user management section</li>
                  <li>Click "Add New User"</li>
                  <li>
                    Enter user details:
                    <ul>
                      <li>First Name</li>
                      <li>Last Name</li>
                      <li>Email</li>
                      <li>
                        <Text strong>Role</Text> (Critical!) - front-desk,
                        staff, manager, or admin
                      </li>
                      <li>Password</li>
                      <li>Contact information</li>
                    </ul>
                  </li>
                  <li>Assign permissions</li>
                  <li>Save user</li>
                </ol>

                <Alert
                  message="Important"
                  description="Role determines what user can access! Choose carefully."
                  type="warning"
                  style={{ marginTop: 16 }}
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>User Roles Explained</Title>

                <Paragraph>
                  <Tag color="cyan">Front-Desk</Tag>
                  <ul>
                    <li>Check-In/Check-Out</li>
                    <li>Waiver</li>
                    <li>Dashboard</li>
                  </ul>
                </Paragraph>

                <Paragraph>
                  <Tag color="gold">Staff</Tag>
                  <ul>
                    <li>Car Intake</li>
                    <li>Inventories</li>
                    <li>Scrap</li>
                    <li>Dashboard</li>
                  </ul>
                </Paragraph>

                <Paragraph>
                  <Tag color="blue">Manager</Tag>
                  <ul>
                    <li>Everything except Bulk Upload</li>
                    <li>Seller/Buyer management</li>
                    <li>Master Data</li>
                    <li>Oversight of all operations</li>
                  </ul>
                </Paragraph>

                <Paragraph>
                  <Tag color="purple">Admin</Tag>
                  <ul>
                    <li>Full system access</li>
                    <li>Bulk operations</li>
                    <li>User management</li>
                    <li>System configuration</li>
                  </ul>
                </Paragraph>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Editing Users</Title>
                <ol>
                  <li>Find user in user list</li>
                  <li>Click "Edit"</li>
                  <li>
                    Modify information (can change role, reset password, update
                    contact info, enable/disable account)
                  </li>
                  <li>Save changes</li>
                </ol>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Deactivating Users</Title>
                <Alert
                  message="Don't delete users!"
                  description="Instead: Mark as inactive, disable login, and keep records for audit trail. Only delete if user was created by mistake and has no associated data."
                  type="warning"
                />
              </Card>

              <Divider />

              <Title level={3}>System Configuration & Master Data</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>
                  You're responsible for maintaining accurate master data:
                </Paragraph>

                <ul>
                  <li>
                    <Text strong>Car Makes</Text> - Add new manufacturers,
                    update existing, merge duplicates, remove obsolete
                  </li>
                  <li>
                    <Text strong>Car Models</Text> - Organize by make, add new
                    models, update specifications
                  </li>
                  <li>
                    <Text strong>Car Trims</Text> - Define trim levels and
                    associate with models
                  </li>
                  <li>
                    <Text strong>Parts Master</Text> - Define all trackable
                    parts, organize by category
                  </li>
                  <li>
                    <Text strong>Scrap Elements</Text> - Define material types,
                    set scrap values, update pricing
                  </li>
                </ul>

                <Title level={5} style={{ marginTop: 16 }}>
                  System Settings:
                </Title>
                <ul>
                  <li>Entry fee amounts</li>
                  <li>Pricing rules</li>
                  <li>Payment methods</li>
                  <li>Default values</li>
                  <li>Email and receipt templates</li>
                  <li>System preferences</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Bulk Operations</Title>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="red">Admin Only</Tag> Bulk Upload Feature
                </Title>

                <Paragraph>
                  <Text strong>What it does:</Text> Import multiple car intakes
                  at once from Excel file.
                </Paragraph>

                <Paragraph>
                  <Text strong>When to use:</Text>
                </Paragraph>
                <ul>
                  <li>Importing from other systems</li>
                  <li>Loading historical data</li>
                  <li>Mass updates</li>
                  <li>Initial system setup</li>
                </ul>

                <Title level={5}>How to Bulk Upload:</Title>
                <ol>
                  <li>
                    <Text strong>Prepare Excel file</Text> - Use provided
                    template, follow exact format, verify all data
                  </li>
                  <li>
                    <Text strong>Access bulk upload</Text> - Go to Car Intake,
                    find "Bulk Upload" button
                  </li>
                  <li>
                    <Text strong>Review validation</Text> - System checks data,
                    shows errors if any
                  </li>
                  <li>
                    <Text strong>Confirm import</Text> - Review summary, confirm
                    to proceed
                  </li>
                  <li>
                    <Text strong>Verify imported data</Text> - Check sample
                    records, verify accuracy
                  </li>
                </ol>

                <Alert
                  message="Important Notes"
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Only admins can bulk upload</li>
                      <li>Creates many records at once</li>
                      <li>Cannot easily undo</li>
                      <li>Test with small file first</li>
                    </ul>
                  }
                  type="error"
                  style={{ marginTop: 16 }}
                />
              </Card>

              <Divider />

              <Title level={3}>Data Management</Title>

              <Card style={{ marginBottom: 24 }}>
                <Title level={5}>Your Responsibilities:</Title>
                <ul>
                  <li>Ensure data accuracy</li>
                  <li>Remove duplicates</li>
                  <li>Fix inconsistencies</li>
                  <li>Maintain referential integrity</li>
                  <li>Clean old/obsolete data</li>
                </ul>

                <Title level={5}>Data Export:</Title>
                <Paragraph>
                  You can export: all car intakes, all inventory, all check-ins,
                  all waivers, financial data, and user activity logs for
                  backup, analysis, external reporting, data migration, and
                  compliance.
                </Paragraph>

                <ol>
                  <li>Navigate to section</li>
                  <li>Use export function</li>
                  <li>Select format (Excel, CSV, PDF)</li>
                  <li>Choose date range</li>
                  <li>Download file</li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Security and Backup</Title>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Security Responsibilities</Title>

                <Title level={5}>Access Control:</Title>
                <ul>
                  <li>Manage user accounts</li>
                  <li>Assign appropriate roles</li>
                  <li>Review permissions regularly</li>
                  <li>Disable inactive accounts</li>
                  <li>Monitor login attempts</li>
                </ul>

                <Title level={5}>Data Security:</Title>
                <ul>
                  <li>Protect sensitive information</li>
                  <li>Ensure encryption</li>
                  <li>Control data export</li>
                  <li>Monitor data access</li>
                  <li>Audit changes</li>
                </ul>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Backup Procedures</Title>

                <Title level={5}>What to Backup:</Title>
                <ul>
                  <li>Database (daily)</li>
                  <li>Uploaded files (daily)</li>
                  <li>System configuration (weekly)</li>
                  <li>User data (weekly)</li>
                  <li>Logs (monthly)</li>
                </ul>

                <Title level={5}>Backup Schedule:</Title>
                <ul>
                  <li>
                    <Text strong>Daily:</Text> Automated database backup
                  </li>
                  <li>
                    <Text strong>Weekly:</Text> Full system backup
                  </li>
                  <li>
                    <Text strong>Monthly:</Text> Archived backup
                  </li>
                </ul>

                <Alert
                  message="Backup Verification"
                  description="Test restores monthly, verify backup integrity, check backup logs, monitor storage space, and update backup procedures."
                  type="info"
                  style={{ marginTop: 16 }}
                />
              </Card>

              <Divider />

              <Title level={3}>System Maintenance</Title>

              <Card style={{ marginBottom: 24 }}>
                <Title level={5}>Daily Maintenance:</Title>
                <Paragraph>
                  <Text strong>Morning:</Text>
                </Paragraph>
                <ul>
                  <li>Check system status</li>
                  <li>Review overnight activity</li>
                  <li>Check for errors/alerts</li>
                  <li>Verify backups completed</li>
                  <li>Monitor performance</li>
                </ul>

                <Paragraph>
                  <Text strong>During Day:</Text>
                </Paragraph>
                <ul>
                  <li>Monitor user issues</li>
                  <li>Address support tickets</li>
                  <li>Handle escalations</li>
                  <li>Assist managers</li>
                  <li>Update configurations as needed</li>
                </ul>

                <Paragraph>
                  <Text strong>Evening:</Text>
                </Paragraph>
                <ul>
                  <li>Review day's activity</li>
                  <li>Check data integrity</li>
                  <li>Initiate backups</li>
                  <li>Review logs</li>
                  <li>Plan next day</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Best Practices for Admins</Title>

              <Card>
                <Title level={5}>
                  <span style={{ color: "#52c41a" }}>✓</span> DO:
                </Title>
                <ul>
                  <li>
                    <Text strong>Backup regularly</Text> - Can't stress enough
                  </li>
                  <li>
                    <Text strong>Test backups</Text> - Verify they work
                  </li>
                  <li>
                    <Text strong>Document everything</Text> - Changes, issues,
                    solutions
                  </li>
                  <li>
                    <Text strong>Train users properly</Text> - Assign correct
                    roles
                  </li>
                  <li>
                    <Text strong>Monitor system</Text> - Watch for issues
                  </li>
                  <li>
                    <Text strong>Keep secure</Text> - Protect system access
                  </li>
                  <li>
                    <Text strong>Plan ahead</Text> - Maintenance, updates,
                    growth
                  </li>
                  <li>
                    <Text strong>Communicate</Text> - Keep team informed
                  </li>
                </ul>

                <Title level={5}>
                  <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                </Title>
                <ul>
                  <li>
                    <Text strong>Make changes without backup</Text> - Always
                    backup first
                  </li>
                  <li>
                    <Text strong>Share admin password</Text> - Keep it secure
                  </li>
                  <li>
                    <Text strong>Skip testing</Text> - Test before production
                  </li>
                  <li>
                    <Text strong>Ignore errors</Text> - Address promptly
                  </li>
                  <li>
                    <Text strong>Delete without verification</Text> - Be certain
                  </li>
                  <li>
                    <Text strong>Give excessive permissions</Text> - Least
                    privilege principle
                  </li>
                  <li>
                    <Text strong>Forget documentation</Text> - Document all
                    changes
                  </li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Troubleshooting Common Issues</Title>

              <Card style={{ marginBottom: 16 }}>
                <Alert
                  message="User Can't Login"
                  description={
                    <ol>
                      <li>Verify account active</li>
                      <li>Check password</li>
                      <li>Verify role assigned</li>
                      <li>Check for system errors</li>
                      <li>Reset password if needed</li>
                    </ol>
                  }
                  type="warning"
                  style={{ marginBottom: 16 }}
                />

                <Alert
                  message="Missing Data"
                  description={
                    <ol>
                      <li>Check if deleted</li>
                      <li>Review logs</li>
                      <li>Check filters</li>
                      <li>Verify user permissions</li>
                      <li>Restore from backup if needed</li>
                    </ol>
                  }
                  type="warning"
                  style={{ marginBottom: 16 }}
                />

                <Alert
                  message="System Slow"
                  description={
                    <ol>
                      <li>Check server resources</li>
                      <li>Review active users</li>
                      <li>Check database size</li>
                      <li>Optimize queries</li>
                      <li>Clear cache</li>
                      <li>Contact IT if needed</li>
                    </ol>
                  }
                  type="warning"
                />
              </Card>

              <Divider />

              <Card
                style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
              >
                <Title level={4}>Remember</Title>
                <Paragraph>
                  <Text strong>You have great power:</Text>
                  <ul>
                    <li>Use it responsibly</li>
                    <li>Think before acting</li>
                    <li>Backup before changes</li>
                    <li>Document everything</li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  <Text strong>You have great responsibility:</Text>
                  <ul>
                    <li>System uptime</li>
                    <li>Data integrity</li>
                    <li>User support</li>
                    <li>Security</li>
                    <li>Compliance</li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  <Text strong>
                    You're the guardian of the system, the data, the users, and
                    the business.
                  </Text>
                </Paragraph>
                <Paragraph>
                  The system and business depend on your expertise and
                  diligence. Take pride in maintaining excellence.
                </Paragraph>
              </Card>
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminGuide;
