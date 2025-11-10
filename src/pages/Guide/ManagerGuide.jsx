import React from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const ManagerGuide = () => {
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
            <Typography>
              <Title level={2}>User Guide for Managers</Title>
              <Paragraph>
                <Text strong>Welcome to AutoHub!</Text> This guide will help you
                use the AutoHub Dashboard system effectively in your management
                role.
              </Paragraph>

              <Alert
                message="Your Role"
                description="As a Manager, you oversee all daily operations: supervise staff and front desk personnel, manage master data (makes, models, trims, parts), oversee car intake, inventory, and scrap operations, handle seller and buyer relationships, monitor check-ins and facility access, ensure quality and accuracy, and generate and review reports. You have the most comprehensive access except for bulk uploads (admin only)."
                type="info"
                style={{ marginBottom: 24 }}
              />

              <Divider />

              <Title level={3}>What You Can Do</Title>
              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>✓ You Have Full Access To</Title>

                <Title level={5}>Front Desk Operations:</Title>
                <ul>
                  <li>Check-In/Check-Out</li>
                  <li>Waiver creation and management</li>
                  <li>Customer management</li>
                </ul>

                <Title level={5}>Staff Operations:</Title>
                <ul>
                  <li>Car Intake</li>
                  <li>Car Inventory</li>
                  <li>Parts Inventory</li>
                  <li>Scrap Management</li>
                </ul>

                <Title level={5}>Manager-Specific:</Title>
                <ul>
                  <li>Master Data (Make, Model, Trim, Part, Element)</li>
                  <li>Seller Management</li>
                  <li>Buyer Management</li>
                  <li>All reports and analytics</li>
                  <li>User Guides</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Your Dashboard</Title>

              <Card style={{ marginBottom: 24 }}>
                <Title level={5}>Navigation Menu (Left Sidebar):</Title>
                <Paragraph>You'll see ALL sections:</Paragraph>
                <ul>
                  <li>Dashboard</li>
                  <li>
                    Master Data (Car Make, Car Model, Car Trim, Inventory Parts,
                    Scrap Elements)
                  </li>
                  <li>Car Intake</li>
                  <li>Parts Inventory</li>
                  <li>Car Inventory</li>
                  <li>Scrap Car</li>
                  <li>Seller</li>
                  <li>Buyer</li>
                  <li>Waiver</li>
                  <li>Check-In</li>
                  <li>User Guides</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Supervising Operations</Title>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Daily Management Tasks</Title>

                <Paragraph>
                  <Text strong>Morning Review:</Text>
                </Paragraph>
                <ol>
                  <li>Check dashboard for overnight activity</li>
                  <li>Review pending car intakes</li>
                  <li>Check current check-ins</li>
                  <li>Review inventory levels</li>
                  <li>Note any issues</li>
                </ol>

                <Paragraph>
                  <Text strong>During the Day:</Text>
                </Paragraph>
                <ol>
                  <li>Monitor staff performance</li>
                  <li>Assist with complex situations</li>
                  <li>Approve pricing decisions</li>
                  <li>Resolve customer issues</li>
                  <li>Ensure quality standards</li>
                </ol>

                <Paragraph>
                  <Text strong>End of Day:</Text>
                </Paragraph>
                <ol>
                  <li>Review completed work</li>
                  <li>Check all customers checked out</li>
                  <li>Review financial transactions</li>
                  <li>Prepare next-day assignments</li>
                  <li>Document any issues</li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Managing Master Data</Title>

              <Paragraph>
                Master data is the foundation of the system. You control what
                options appear throughout the system.
              </Paragraph>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Car Makes</Title>
                <Paragraph>
                  <Text strong>What it is:</Text> Car brands (Toyota, Ford,
                  Honda, etc.)
                </Paragraph>

                <Paragraph>
                  <Text strong>How to manage:</Text>
                </Paragraph>
                <ol>
                  <li>Click "Master Data" → "Car Make"</li>
                  <li>View all makes in system</li>
                  <li>Click "Add New" to add a make</li>
                  <li>Enter make name</li>
                  <li>Save</li>
                </ol>

                <Paragraph>
                  <Text strong>When to add:</Text> New brand comes to facility,
                  customer has uncommon brand, or expanding inventory.
                </Paragraph>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Car Models</Title>
                <Paragraph>
                  <Text strong>What it is:</Text> Specific models (Camry, F-150,
                  Civic)
                </Paragraph>

                <Paragraph>
                  <Text strong>How to manage:</Text>
                </Paragraph>
                <ol>
                  <li>Click "Master Data" → "Car Model"</li>
                  <li>Select make first</li>
                  <li>Add model under that make</li>
                  <li>Save</li>
                </ol>

                <Alert
                  message="Important"
                  description="Models must be linked to a make."
                  type="warning"
                  style={{ marginTop: 12 }}
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Car Trims</Title>
                <Paragraph>
                  <Text strong>What it is:</Text> Trim levels (LE, XLE, Sport,
                  Limited)
                </Paragraph>

                <Paragraph>
                  <Text strong>How to manage:</Text>
                </Paragraph>
                <ol>
                  <li>Click "Master Data" → "Car Trim"</li>
                  <li>Select make and model</li>
                  <li>Add trim level</li>
                  <li>Save</li>
                </ol>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Inventory Parts & Scrap Elements</Title>

                <Paragraph>
                  <Text strong>Inventory Parts:</Text> Parts that can be
                  inventoried (engine, transmission, doors, etc.)
                </Paragraph>
                <ul>
                  <li>Click "Master Data" → "Inventory Parts"</li>
                  <li>View all part types</li>
                  <li>Add new part type if needed</li>
                  <li>Define what parts staff can track in inventory</li>
                </ul>

                <Paragraph>
                  <Text strong>Scrap Elements:</Text> Elements/materials from
                  scrapped cars (metal, plastic, glass)
                </Paragraph>
                <ul>
                  <li>Click "Master Data" → "Scrap Elements"</li>
                  <li>View all element types</li>
                  <li>Add new element type</li>
                  <li>Define scrap value</li>
                  <li>Track what materials come from scrapped vehicles</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Seller & Buyer Management</Title>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Seller Management</Title>
                <Paragraph>
                  <Text strong>What is it:</Text> People/companies who sell us
                  cars.
                </Paragraph>

                <Paragraph>
                  <Text strong>Add New Seller:</Text>
                </Paragraph>
                <ol>
                  <li>Click "Seller" in sidebar</li>
                  <li>Click "Add New Seller"</li>
                  <li>
                    Enter information (name, contact details, address, ID
                    information, notes)
                  </li>
                  <li>Upload documents</li>
                  <li>Save</li>
                </ol>

                <Paragraph>
                  <Text strong>View/Update Seller:</Text>
                </Paragraph>
                <ul>
                  <li>Click "Seller Lists"</li>
                  <li>See all sellers, search or filter</li>
                  <li>Click to view details or edit</li>
                </ul>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Buyer Management</Title>
                <Paragraph>
                  <Text strong>What is it:</Text> Customers who buy parts from
                  us.
                </Paragraph>

                <Paragraph>
                  <Text strong>Add New Buyer:</Text>
                </Paragraph>
                <ol>
                  <li>Click "Buyer" in sidebar</li>
                  <li>Click "Add New Buyer"</li>
                  <li>
                    Enter information (name, contact details, company if
                    business, purchase history)
                  </li>
                  <li>Save</li>
                </ol>

                <Paragraph>
                  <Text strong>View Buyer Lists:</Text>
                </Paragraph>
                <ul>
                  <li>Click "Buyer Lists"</li>
                  <li>See all buyers, search or filter</li>
                  <li>Track purchase history</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Overseeing All Processes</Title>

              <Card style={{ marginBottom: 24 }}>
                <Title level={5}>Monitoring Car Intake:</Title>
                <ul>
                  <li>Click "Car Intake" → "Car Intake Lists"</li>
                  <li>Filter by status</li>
                  <li>Review incomplete intakes</li>
                  <li>
                    Check for quality issues (missing photos, incomplete parts
                    assessment, pricing discrepancies, missing documents)
                  </li>
                  <li>Approve pricing if needed</li>
                </ul>

                <Paragraph>
                  <Text strong>Your Role:</Text> Review before payment, approve
                  unusual situations, ensure quality standards.
                </Paragraph>
              </Card>

              <Card style={{ marginBottom: 24 }}>
                <Title level={5}>Monitoring Inventory:</Title>

                <Paragraph>
                  <Text strong>Car Inventory:</Text>
                </Paragraph>
                <ol>
                  <li>Click "Car Inventory"</li>
                  <li>Review stock levels</li>
                  <li>Check for aging inventory</li>
                  <li>Identify fast-moving items</li>
                  <li>Plan purchasing</li>
                </ol>

                <Paragraph>
                  <Text strong>Parts Inventory:</Text>
                </Paragraph>
                <ol>
                  <li>Click "Parts Inventory" → "Master Parts"</li>
                  <li>See all parts availability</li>
                  <li>Identify shortages</li>
                  <li>Plan restocking</li>
                  <li>Review pricing</li>
                </ol>
              </Card>

              <Card style={{ marginBottom: 24 }}>
                <Title level={5}>Monitoring Check-Ins:</Title>
                <Paragraph>
                  Access: Click "Check-In" → "All Check-Ins"
                </Paragraph>

                <Paragraph>
                  <Text strong>What to monitor:</Text>
                </Paragraph>
                <ul>
                  <li>Current checked-in customers</li>
                  <li>Daily traffic patterns</li>
                  <li>Average visit duration</li>
                  <li>Revenue from entry fees</li>
                  <li>Any issues or incidents</li>
                </ul>

                <Paragraph>
                  <Text strong>Your Role:</Text> Ensure proper check-in
                  procedures, resolve customer issues, monitor front desk
                  performance, ensure security protocols.
                </Paragraph>
              </Card>

              <Divider />

              <Title level={3}>Decision Making</Title>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Pricing Decisions</Title>

                <Paragraph>
                  <Text strong>When staff needs approval:</Text>
                </Paragraph>
                <ul>
                  <li>Unusual vehicle types</li>
                  <li>High-value cars</li>
                  <li>Pricing disputes</li>
                  <li>Below-minimum offers</li>
                </ul>

                <Paragraph>
                  <Text strong>Your Process:</Text>
                </Paragraph>
                <ol>
                  <li>Review car details</li>
                  <li>Check market values</li>
                  <li>Assess condition</li>
                  <li>Make fair decision</li>
                  <li>Document reasoning</li>
                </ol>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Policy Exceptions</Title>

                <Paragraph>
                  <Text strong>When needed:</Text> Special customer situations,
                  unusual circumstances, system limitations, emergency
                  situations.
                </Paragraph>

                <Paragraph>
                  <Text strong>Your Authority:</Text> Approve exceptions,
                  document decisions, inform admin if needed, update procedures.
                </Paragraph>
              </Card>

              <Divider />

              <Title level={3}>Quality Assurance</Title>

              <Card style={{ marginBottom: 24 }}>
                <Title level={5}>Checklist for Quality:</Title>

                <Paragraph>
                  <Text strong>Car Intakes:</Text>
                </Paragraph>
                <ul>
                  <li>VIN verified</li>
                  <li>All photos clear and complete</li>
                  <li>Parts accurately assessed</li>
                  <li>Documents valid and complete</li>
                  <li>Pricing appropriate</li>
                  <li>Payment processed correctly</li>
                </ul>

                <Paragraph>
                  <Text strong>Inventory:</Text>
                </Paragraph>
                <ul>
                  <li>Items properly categorized</li>
                  <li>Quantities accurate</li>
                  <li>Conditions noted</li>
                  <li>Pricing current</li>
                  <li>Records up to date</li>
                </ul>

                <Paragraph>
                  <Text strong>Check-Ins:</Text>
                </Paragraph>
                <ul>
                  <li>All customers checked in</li>
                  <li>IDs verified</li>
                  <li>Payments collected</li>
                  <li>Tokens issued</li>
                  <li>Check-outs processed</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Best Practices for Managers</Title>

              <Card>
                <Title level={5}>
                  <span style={{ color: "#52c41a" }}>✓</span> DO:
                </Title>
                <ul>
                  <li>
                    <Text strong>Lead by example</Text> - Follow all procedures
                  </li>
                  <li>
                    <Text strong>Be available</Text> - Help your team
                  </li>
                  <li>
                    <Text strong>Stay organized</Text> - Keep good records
                  </li>
                  <li>
                    <Text strong>Communicate clearly</Text> - With staff and
                    customers
                  </li>
                  <li>
                    <Text strong>Make fair decisions</Text> - Consistently
                  </li>
                  <li>
                    <Text strong>Monitor quality</Text> - Regular spot checks
                  </li>
                  <li>
                    <Text strong>Provide feedback</Text> - Help team improve
                  </li>
                  <li>
                    <Text strong>Document important decisions</Text>
                  </li>
                </ul>

                <Title level={5}>
                  <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                </Title>
                <ul>
                  <li>
                    <Text strong>Micromanage</Text> - Trust your trained staff
                  </li>
                  <li>
                    <Text strong>Skip quality checks</Text> - Maintain standards
                  </li>
                  <li>
                    <Text strong>Make hasty decisions</Text> - Think through
                    impacts
                  </li>
                  <li>
                    <Text strong>Ignore problems</Text> - Address issues
                    promptly
                  </li>
                  <li>
                    <Text strong>Play favorites</Text> - Be fair to all
                  </li>
                  <li>
                    <Text strong>Forget documentation</Text> - Record important
                    items
                  </li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Daily Manager Checklist</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>
                  <Text strong>Opening Procedures:</Text>
                </Paragraph>
                <ul>
                  <li>Review overnight activity</li>
                  <li>Check for pending approvals</li>
                  <li>Review schedule and assignments</li>
                  <li>Note any special situations</li>
                  <li>Brief team on priorities</li>
                </ul>

                <Paragraph>
                  <Text strong>During Day:</Text>
                </Paragraph>
                <ul>
                  <li>Monitor operations</li>
                  <li>Handle escalations</li>
                  <li>Approve transactions as needed</li>
                  <li>Address customer issues</li>
                  <li>Support staff</li>
                  <li>Review quality</li>
                </ul>

                <Paragraph>
                  <Text strong>Closing Procedures:</Text>
                </Paragraph>
                <ul>
                  <li>Review day's work</li>
                  <li>Verify all check-outs</li>
                  <li>Check financial summaries</li>
                  <li>Note any issues</li>
                  <li>Plan for tomorrow</li>
                  <li>Secure facility</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Your Scope</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>
                  <Text strong>You CAN:</Text>
                </Paragraph>
                <ul>
                  <li>Approve most transactions</li>
                  <li>Make operational decisions</li>
                  <li>Manage master data</li>
                  <li>Oversee all processes</li>
                  <li>Handle customer issues</li>
                  <li>Train and guide staff</li>
                </ul>

                <Paragraph>
                  <Text strong>You CANNOT:</Text>
                </Paragraph>
                <ul>
                  <li>Bulk upload (admin only)</li>
                  <li>Change system settings (admin only)</li>
                  <li>Create new user roles (admin only)</li>
                  <li>Override certain system rules (admin only)</li>
                </ul>

                <Paragraph>
                  <Text strong>When to Contact Admin:</Text> System
                  configuration needs, user permission issues, bulk data
                  import/export, technical system problems, or policy changes
                  needed.
                </Paragraph>
              </Card>

              <Divider />

              <Card
                style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
              >
                <Title level={4}>Remember</Title>
                <Paragraph>
                  <Text strong>You are the leader</Text>
                  <ul>
                    <li>Your team looks to you</li>
                    <li>Be fair and consistent</li>
                    <li>Make good decisions</li>
                    <li>Communicate well</li>
                    <li>Lead by example</li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  <Text strong>Quality matters</Text>
                  <ul>
                    <li>Maintain high standards</li>
                    <li>Check work regularly</li>
                    <li>Address issues promptly</li>
                    <li>Recognize good work</li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  Managing operations effectively keeps our business running
                  smoothly and profitably. Take pride in leading your team well.
                </Paragraph>
              </Card>
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerGuide;
