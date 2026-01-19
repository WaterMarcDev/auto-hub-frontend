import React, { useRef } from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import GuidePDFPreview from "../../components/Guide/GuidePDFPreview";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const CheckInGuide = () => {
  const guideRef = useRef(null);

  return (
    <div className="guide-container">
      <div className="page-title-box">
        <div className="page-title">
          <h4>Customer Check-In User Guide</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Guide</a>
            </li>
            <li className="breadcrumb-item active">Check-In</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card className="guide-card">
            {/* PDF Download Button */}
            <GuidePDFPreview
              contentRef={guideRef}
              title="Customer Check-In User Guide"
              buttonText="Download PDF"
            />

            {/* Guide Content */}
            <div ref={guideRef}>
              <Typography>
                <Title level={2}>Customer Check-In Process</Title>
                <Paragraph>
                  <Text strong>Welcome!</Text> This guide shows how to check in
                  and check out customers.
                </Paragraph>

                <Alert
                  message="What is Check-In?"
                  description="Check-In tracks who enters our building. Every customer must check in before going inside. They get a token and must check out when leaving."
                  type="info"
                  style={{ marginBottom: 24 }}
                />

                <Divider />

                {/* When to Use */}
                <Title level={3}>When to Check In</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <ul>
                    <li>Customer comes to browse parts</li>
                    <li>Buyer comes to pick up items</li>
                    <li>Anyone needs to enter secure area</li>
                    <li>Seller returns for any reason</li>
                  </ul>
                  <Alert
                    message="Rule"
                    description="Everyone must check in. No exceptions."
                    type="warning"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Check-In Steps */}
                <Title level={3}>How to Check In a Customer</Title>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="green">Step 1</Tag> Create or Find Customer
                  </Title>
                  <Title level={5}>New Customer:</Title>
                  <ol>
                    <li>Click "Waiver Form" → "Fill Waiver Form"</li>
                    <li>Enter first name</li>
                    <li>Enter last name</li>
                    <li>Enter phone (if given)</li>
                    <li>Enter email (if given)</li>
                  </ol>
                  <Title level={5}>Returning Customer:</Title>
                  <ol>
                    <li>Click "Select Existing Customer"</li>
                    <li>Search by name or phone</li>
                    <li>Click to select</li>
                  </ol>
                  <Alert
                    message="Tip"
                    description="Always search first to avoid duplicates!"
                    type="success"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="green">Step 2</Tag> Verify ID
                  </Title>
                  <ol>
                    <li>Ask for government ID</li>
                    <li>Select ID type (Driver License, State ID, etc.)</li>
                    <li>Enter ID number</li>
                    <li>Click "Upload ID"</li>
                    <li>Take clear photo of ID</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="green">Step 3</Tag> Get Signature
                  </Title>
                  <ol>
                    <li>Ask customer to sign</li>
                    <li>Customer signs on screen or pad</li>
                    <li>Make sure signature is visible</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="green">Step 4</Tag> Fill Check-In Details
                  </Title>
                  <Paragraph>Popup appears after saving waiver.</Paragraph>
                  <ul>
                    <li>
                      <Text strong>Number of People</Text> - How many with them?
                      (0 if alone)
                    </li>
                    <li>
                      <Text strong>Entry Fee</Text> - Amount to pay (usually $10
                      or $25)
                    </li>
                    <li>
                      <Text strong>Payment Method</Text> - Cash, Card, or Check
                    </li>
                    <li>
                      <Text strong>Your Signature</Text> - You sign to authorize
                    </li>
                  </ul>
                  <Paragraph>Click "Check In" button.</Paragraph>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="green">Step 5</Tag> Give Token
                  </Title>
                  <Paragraph>
                    System shows 6-character token (like "A7K9M2")
                  </Paragraph>
                  <ol>
                    <li>Write token on badge</li>
                    <li>Give badge to customer</li>
                    <li>Tell them: "Keep this. You need it to leave."</li>
                  </ol>
                </Card>

                <Divider />

                {/* Check-Out */}
                <Title level={3}>How to Check Out a Customer</Title>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="orange">Step 1</Tag> Ask for Token
                  </Title>
                  <Paragraph>
                    Say: "May I have your token please?"
                  </Paragraph>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="orange">Step 2</Tag> Find Customer
                  </Title>
                  <Title level={5}>By Token:</Title>
                  <ol>
                    <li>Go to "Check-In" → "All Check-Ins"</li>
                    <li>Type token in search</li>
                    <li>Click on customer</li>
                  </ol>
                  <Title level={5}>By Name:</Title>
                  <ol>
                    <li>Go to "Check-In" → "All Check-Ins"</li>
                    <li>Type name in search</li>
                    <li>Find one that says "Checked In"</li>
                    <li>Click on customer</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="orange">Step 3</Tag> Check Out
                  </Title>
                  <ol>
                    <li>Click "Check Out" button</li>
                    <li>Click "Yes" to confirm</li>
                    <li>Say: "You're all set. Have a nice day!"</li>
                  </ol>
                </Card>

                <Alert
                  message="Lost Token?"
                  description="Ask for name. Search by name. Check their ID to verify. Then check them out."
                  type="info"
                  style={{ marginBottom: 24 }}
                />

                <Divider />

                {/* Quick Reference */}
                <Title level={3}>Quick Reference</Title>
                
                <Card
                  style={{
                    backgroundColor: "rgba(82, 196, 26, 0.1)",
                    border: "1px solid rgba(82, 196, 26, 0.3)",
                    marginBottom: 16,
                  }}
                >
                  <Title level={5}>Check-In (Quick):</Title>
                  <ol>
                    <li>Fill waiver → Name, contact</li>
                    <li>Take ID photo</li>
                    <li>Get signature</li>
                    <li>Enter fee and payment</li>
                    <li>Give token to customer</li>
                  </ol>
                </Card>

                <Card
                  style={{
                    backgroundColor: "rgba(250, 173, 20, 0.1)",
                    border: "1px solid rgba(250, 173, 20, 0.3)",
                  }}
                >
                  <Title level={5}>Check-Out (Quick):</Title>
                  <ol>
                    <li>Get token</li>
                    <li>Search by token or name</li>
                    <li>Click "Check Out"</li>
                    <li>Confirm</li>
                  </ol>
                </Card>

                <Divider />

                {/* Tips */}
                <Title level={3}>Tips</Title>
                <Card>
                  <Title level={5}>
                    <span style={{ color: "#52c41a" }}>✓</span> DO:
                  </Title>
                  <ul>
                    <li>Always verify ID</li>
                    <li>Collect payment first</li>
                    <li>Write token clearly</li>
                    <li>Remind them to keep token</li>
                    <li>Check out promptly</li>
                  </ul>

                  <Title level={5}>
                    <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                  </Title>
                  <ul>
                    <li>Let anyone in without check-in</li>
                    <li>Skip ID verification</li>
                    <li>Forget to check out customers</li>
                    <li>Check in without payment</li>
                  </ul>
                </Card>

                <Divider />

                <Card
                  style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
                >
                  <Title level={4}>Need Help?</Title>
                  <ul>
                    <li>Ask your supervisor</li>
                    <li>Call IT Support</li>
                  </ul>
                  <Paragraph>
                    <Text strong>
                      Be accurate, be friendly, verify identity!
                    </Text>
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

export default CheckInGuide;
