import React from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const FrontDeskGuide = () => {
  return (
    <div className="guide-container">
      <div className="page-title-box">
        <div className="page-title">
          <h4>Front Desk Staff User Guide</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Guide</a>
            </li>
            <li className="breadcrumb-item active">Front Desk</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card className="guide-card">
            <Typography>
              <Title level={2}>User Guide for Front Desk Staff</Title>
              <Paragraph>
                <Text strong>Welcome to AutoHub!</Text> This guide will help you
                use the AutoHub Dashboard system in your daily work as a Front
                Desk staff member.
              </Paragraph>

              <Alert
                message="Your Role"
                description="As a Front Desk staff member, you are the first person customers meet when they arrive. Your job is to: welcome customers, check them in when they arrive, check them out when they leave, create waivers and collect customer information, and keep track of who is in the facility. You are an important part of our team!"
                type="info"
                style={{ marginBottom: 24 }}
              />

              <Divider />

              <Title level={3}>What You Can Do</Title>
              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>✓ You Have Access To</Title>
                <ul>
                  <li>
                    <Text strong>Dashboard</Text> - See today's activity
                  </li>
                  <li>
                    <Text strong>Check-In System</Text> - Check customers in and
                    out
                  </li>
                  <li>
                    <Text strong>Waiver Creation</Text> - Create waivers for
                    customers
                  </li>
                  <li>
                    <Text strong>Customer Lists</Text> - View customer
                    information
                  </li>
                  <li>
                    <Text strong>User Guides</Text> - Help documents when you
                    need them
                  </li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Logging In</Title>
              <Card style={{ marginBottom: 24 }}>
                <ol>
                  <li>Open your web browser (Chrome, Firefox, or Edge)</li>
                  <li>Go to the AutoHub Dashboard website</li>
                  <li>
                    Enter your login information (your email address and
                    password)
                  </li>
                  <li>Click the "Sign In" button</li>
                  <li>You'll see your dashboard!</li>
                </ol>

                <Alert
                  message="Important"
                  description="Always log out when you leave your desk."
                  type="warning"
                  style={{ marginTop: 16 }}
                />
              </Card>

              <Divider />

              <Title level={3}>Your Dashboard</Title>
              <Card style={{ marginBottom: 24 }}>
                <Paragraph>
                  When you log in, you'll see your dashboard. This is your home
                  page.
                </Paragraph>

                <Title level={5}>What You'll See:</Title>
                <ul>
                  <li>
                    <Text strong>Menu on the Left</Text> - Your main navigation
                    (Check-In, Waiver, User Guides)
                  </li>
                  <li>
                    <Text strong>Top Bar</Text> - Shows AutoHub logo, "Guide"
                    button (click for help), your name, and logout button
                  </li>
                </ul>

                <Title level={5}>Quick Tips:</Title>
                <ul>
                  <li>
                    Click on menu items on the left to go to different sections
                  </li>
                  <li>Click "Guide" at the top to see help documents</li>
                  <li>Click your name to see profile options or logout</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Checking In Customers</Title>
              <Paragraph>This is what you'll do most often!</Paragraph>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>When to Check In a Customer</Title>
                <ul>
                  <li>Customer arrives to browse parts</li>
                  <li>Buyer comes to pick up items</li>
                  <li>Anyone needs to enter the secure area</li>
                </ul>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="green">Step-by-Step</Tag> Check-In Process
                </Title>

                <Paragraph>
                  <Text strong>Step 1:</Text> Click "Check-In" in the Left Menu
                </Paragraph>

                <Paragraph>
                  <Text strong>Step 2:</Text> Click "Create Waiver" or "Add
                  Customer"
                </Paragraph>

                <Paragraph>
                  <Text strong>Step 3:</Text> Fill in Customer Information
                </Paragraph>
                <ul>
                  <li>
                    <Text strong>For New Customers:</Text> First Name
                    (required), Last Name (required), Email (optional but
                    recommended), Phone Number (optional but recommended)
                  </li>
                  <li>
                    <Text strong>For Returning Customers:</Text> Click "Select
                    Existing Customer", search by name or phone, select the
                    customer
                  </li>
                </ul>

                <Paragraph>
                  <Text strong>Step 4:</Text> Take ID Photo
                </Paragraph>
                <ul>
                  <li>Ask customer for their ID</li>
                  <li>Select ID type (Driver's License, State ID, etc.)</li>
                  <li>Enter ID number</li>
                  <li>Take a photo of the ID</li>
                  <li>Make sure the photo is clear!</li>
                </ul>

                <Paragraph>
                  <Text strong>Step 5:</Text> Get Customer Signature
                </Paragraph>
                <ul>
                  <li>Ask customer to sign</li>
                  <li>They can sign on the tablet or signature pad</li>
                  <li>Make sure signature is visible</li>
                </ul>

                <Paragraph>
                  <Text strong>Step 6:</Text> Process Check-In
                </Paragraph>
                <Paragraph>
                  A popup will appear automatically. Fill in:
                </Paragraph>
                <ul>
                  <li>
                    <Text strong>Number of People</Text> - How many with
                    customer? Enter "0" if alone
                  </li>
                  <li>
                    <Text strong>Entry Fee</Text> - Enter the amount (usually
                    $10 or $25)
                  </li>
                  <li>
                    <Text strong>Payment Method</Text> - Cash, Card, Check
                  </li>
                  <li>
                    <Text strong>Your Signature</Text> - Sign to authorize entry
                  </li>
                </ul>

                <Paragraph>
                  <Text strong>Step 7:</Text> Give Customer Their Token
                </Paragraph>
                <Paragraph>
                  The system creates a 6-character token (like "A7K9M2").
                </Paragraph>
                <Alert
                  message="Important"
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Write the token on a badge</li>
                      <li>Give it to the customer</li>
                      <li>
                        Tell them: "Keep this token with you. You'll need it to
                        check out."
                      </li>
                    </ul>
                  }
                  type="error"
                  style={{ marginTop: 12 }}
                />
              </Card>

              <Divider />

              <Title level={3}>Checking Out Customers</Title>
              <Paragraph>When a customer is ready to leave:</Paragraph>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Check-Out Process</Title>

                <Paragraph>
                  <Text strong>Step 1:</Text> Ask for Their Token
                </Paragraph>
                <Paragraph>"May I have your check-in token please?"</Paragraph>

                <Paragraph>
                  <Text strong>Step 2:</Text> Find the Customer
                </Paragraph>
                <ul>
                  <li>
                    <Text strong>Method 1 - Search by Token:</Text> Go to "All
                    Check-Ins", type the token in the search box, click on their
                    record
                  </li>
                  <li>
                    <Text strong>Method 2 - Search by Name:</Text> Go to "All
                    Check-Ins", type their name, look for records showing
                    "Checked In", verify it's the right person
                  </li>
                </ul>

                <Paragraph>
                  <Text strong>Step 3:</Text> Check Them Out
                </Paragraph>
                <ul>
                  <li>Click the "Check Out" button</li>
                  <li>Confirm the action</li>
                  <li>The system records the time</li>
                  <li>Tell customer: "You're all set! Have a great day!"</li>
                </ul>

                <Alert
                  message="What If They Lost Their Token?"
                  description={
                    <>
                      No problem! Ask for their name, search by name, verify
                      their identity (ask for ID if needed), and check them out.
                    </>
                  }
                  type="info"
                  style={{ marginTop: 16 }}
                />
              </Card>

              <Divider />

              <Title level={3}>Creating Waivers</Title>
              <Paragraph>
                Sometimes you need to create a waiver without checking someone
                in immediately.
              </Paragraph>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>When to Create a Waiver</Title>
                <ul>
                  <li>Customer selling a car (but not entering facility)</li>
                  <li>Pre-registering someone</li>
                  <li>Creating records for later use</li>
                </ul>

                <Title level={4}>How to Create a Waiver</Title>
                <ol>
                  <li>Click "Waiver" in the left menu</li>
                  <li>Click "Create Waiver"</li>
                  <li>
                    Choose Customer Type (Seller - selling a car, or Buyer -
                    buying parts)
                  </li>
                  <li>
                    Fill in Customer Information (name, contact information, ID
                    details)
                  </li>
                  <li>Take ID photo and get signature</li>
                  <li>Click "Submit"</li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Finding Customer Information</Title>

              <Card style={{ marginBottom: 24 }}>
                <Title level={5}>View All Check-Ins:</Title>
                <ol>
                  <li>Click "Check-In" → "All Check-Ins"</li>
                  <li>Use the search box to find by token, name, or date</li>
                  <li>Click on any record to see details</li>
                </ol>

                <Title level={5}>View Waivers:</Title>
                <ol>
                  <li>Click "Waiver" → "Waiver Lists"</li>
                  <li>Browse or search for waivers</li>
                  <li>Click to view details</li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Tips for Success</Title>

              <Card>
                <Title level={5}>
                  <span style={{ color: "#52c41a" }}>✓</span> DO:
                </Title>
                <ul>
                  <li>
                    <Text strong>Always verify ID</Text> - Check that ID matches
                    the customer
                  </li>
                  <li>
                    <Text strong>Be friendly</Text> - Smile and welcome
                    customers
                  </li>
                  <li>
                    <Text strong>Keep tokens visible</Text> - Write clearly on
                    badges
                  </li>
                  <li>
                    <Text strong>Double-check information</Text> - Verify name
                    spelling
                  </li>
                  <li>
                    <Text strong>Ask if unsure</Text> - Better to ask than to
                    guess
                  </li>
                  <li>
                    <Text strong>Log out</Text> - When leaving your desk
                  </li>
                </ul>

                <Title level={5}>
                  <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                </Title>
                <ul>
                  <li>
                    <Text strong>Skip ID verification</Text> - Always check ID
                  </li>
                  <li>
                    <Text strong>Rush the process</Text> - Take time to be
                    accurate
                  </li>
                  <li>
                    <Text strong>Share your password</Text> - Keep it private
                  </li>
                  <li>
                    <Text strong>Allow entry without check-in</Text> - Everyone
                    must check in
                  </li>
                  <li>
                    <Text strong>Forget to check out customers</Text> - They'll
                    show as still in facility
                  </li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Daily Checklist</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>
                  <Text strong>When You Start Your Shift:</Text>
                </Paragraph>
                <ul>
                  <li>Log in to the system</li>
                  <li>Check for any notes from previous shift</li>
                  <li>Make sure badge printer works</li>
                  <li>Have signature pad ready</li>
                </ul>

                <Paragraph>
                  <Text strong>During Your Shift:</Text>
                </Paragraph>
                <ul>
                  <li>Check in customers promptly</li>
                  <li>Keep check-in area tidy</li>
                  <li>Monitor who's checked in</li>
                  <li>Check out customers when they leave</li>
                </ul>

                <Paragraph>
                  <Text strong>When You End Your Shift:</Text>
                </Paragraph>
                <ul>
                  <li>Check if anyone still checked in</li>
                  <li>Leave notes for next shift if needed</li>
                  <li>Log out of the system</li>
                  <li>Secure your workspace</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Quick Reference Guide</Title>

              <Card
                style={{
                  backgroundColor: "rgba(82, 196, 26, 0.1)",
                  border: "1px solid rgba(82, 196, 26, 0.3)",
                  marginBottom: 16,
                }}
              >
                <Title level={5}>Check-In Process (Quick):</Title>
                <ol>
                  <li>Click "Create Waiver"</li>
                  <li>Enter customer info</li>
                  <li>Take ID photo</li>
                  <li>Get signature</li>
                  <li>Enter entry fee</li>
                  <li>Give customer token</li>
                </ol>
              </Card>

              <Card
                style={{
                  backgroundColor: "rgba(250, 173, 20, 0.1)",
                  border: "1px solid rgba(250, 173, 20, 0.3)",
                }}
              >
                <Title level={5}>Check-Out Process (Quick):</Title>
                <ol>
                  <li>Ask for token</li>
                  <li>Search by token or name</li>
                  <li>Click "Check Out"</li>
                  <li>Confirm</li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Common Issues & Solutions</Title>

              <Card style={{ marginBottom: 16 }}>
                <Alert
                  message="I can't find the customer"
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Try different search terms</li>
                      <li>Check spelling</li>
                      <li>Search by phone or email</li>
                      <li>They might be a new customer</li>
                    </ul>
                  }
                  type="warning"
                  style={{ marginBottom: 16 }}
                />

                <Alert
                  message="Photo won't upload"
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Check internet connection</li>
                      <li>Make sure photo is under 5MB</li>
                      <li>Try taking a new photo</li>
                      <li>Ask IT for help</li>
                    </ul>
                  }
                  type="warning"
                  style={{ marginBottom: 16 }}
                />

                <Alert
                  message="Customer lost their token"
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Search by their name</li>
                      <li>Verify their identity</li>
                      <li>Check them out manually</li>
                    </ul>
                  }
                  type="warning"
                />
              </Card>

              <Divider />

              <Title level={3}>Your Responsibilities</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>
                  As a Front Desk staff member, you are responsible for:
                </Paragraph>
                <ul>
                  <li>✓ Greeting every customer professionally</li>
                  <li>✓ Checking in customers accurately</li>
                  <li>✓ Verifying identification properly</li>
                  <li>✓ Collecting entry fees correctly</li>
                  <li>✓ Issuing tokens clearly</li>
                  <li>✓ Checking out customers promptly</li>
                  <li>✓ Keeping accurate records</li>
                  <li>✓ Maintaining a clean workspace</li>
                  <li>✓ Following all safety procedures</li>
                  <li>✓ Protecting customer privacy</li>
                </ul>
              </Card>

              <Divider />

              <Card
                style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
              >
                <Title level={4}>Welcome to the AutoHub team!</Title>
                <Paragraph>
                  We're glad to have you. You play an important role in making
                  our customers feel welcome and keeping our facility secure.
                </Paragraph>
                <Paragraph>
                  <Text strong>Remember:</Text>
                  <ul>
                    <li>You're doing great!</li>
                    <li>It's okay to ask questions</li>
                    <li>Practice makes perfect</li>
                    <li>Customer service is your priority</li>
                    <li>Be accurate and friendly</li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  <Text strong>Need Help?</Text> Click "Guide" button in top
                  bar, ask your supervisor, call IT Support, or check this guide
                  again.
                </Paragraph>
              </Card>
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FrontDeskGuide;
