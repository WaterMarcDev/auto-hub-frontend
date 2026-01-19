import React, { useRef } from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import GuidePDFPreview from "../../components/Guide/GuidePDFPreview";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const FrontDeskGuide = () => {
  const guideRef = useRef(null);

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
            {/* PDF Download Button */}
            <GuidePDFPreview
              contentRef={guideRef}
              title="Front Desk Staff User Guide"
              buttonText="Download PDF"
            />

            {/* Guide Content */}
            <div ref={guideRef}>
              <Typography>
                <Title level={2}>Front Desk Staff User Guide</Title>
                <Paragraph>
                  <Text strong>Welcome to AutoHub!</Text> This guide will help
                  you do your job. It is written in simple words so anyone can
                  understand.
                </Paragraph>

                <Alert
                  message="Your Job"
                  description="You are the first person customers see. Your job is to: Welcome customers, Check them in when they come, Check them out when they leave, Create waivers, and Keep track of who is in the building."
                  type="info"
                  style={{ marginBottom: 24 }}
                />

                <Divider />

                {/* Section 1: What You Can Do */}
                <Title level={3}>What You Can Do</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>✓ Your Access</Title>
                  <ul>
                    <li>
                      <Text strong>Check-In</Text> - Check customers in and out
                    </li>
                    <li>
                      <Text strong>Waiver</Text> - Create waivers for customers
                    </li>
                    <li>
                      <Text strong>Customer</Text> - View and add customers
                    </li>
                    <li>
                      <Text strong>User Guides</Text> - Help documents like this
                      one
                    </li>
                  </ul>
                </Card>

                <Divider />

                {/* Section 2: How to Log In */}
                <Title level={3}>How to Log In</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="green">Step by Step</Tag>
                  </Title>
                  <ol>
                    <li>Open your web browser (Chrome or Firefox)</li>
                    <li>Go to the AutoHub website</li>
                    <li>Type your email</li>
                    <li>Type your password</li>
                    <li>Click "Sign In"</li>
                  </ol>
                  <Alert
                    message="Remember"
                    description="Always log out when you leave your desk."
                    type="warning"
                    style={{ marginTop: 16 }}
                  />
                </Card>

                <Divider />

                {/* Section 3: How to Check In a Customer */}
                <Title level={3}>How to Check In a Customer</Title>
                <Paragraph>This is your main job. Do this when a customer comes in.</Paragraph>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 1</Tag> Click "Check-In" in the menu
                  </Title>
                  <Paragraph>
                    Look at the left side of your screen. Click on "Check-In".
                  </Paragraph>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 2</Tag> Create or Find Customer
                  </Title>
                  <Paragraph>
                    <Text strong>New Customer:</Text>
                  </Paragraph>
                  <ol>
                    <li>Click "Fill Waiver Form"</li>
                    <li>Type their first name</li>
                    <li>Type their last name</li>
                    <li>Type their phone number (if they give it)</li>
                    <li>Type their email (if they give it)</li>
                  </ol>
                  <Paragraph style={{ marginTop: 16 }}>
                    <Text strong>Customer Who Came Before:</Text>
                  </Paragraph>
                  <ol>
                    <li>Click "Select Existing Customer"</li>
                    <li>Type their name in the search box</li>
                    <li>Click on their name when you see it</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 3</Tag> Take Photo of Their ID
                  </Title>
                  <ol>
                    <li>Ask the customer for their ID (driver license or state ID)</li>
                    <li>Choose the ID type from the dropdown</li>
                    <li>Type the ID number</li>
                    <li>Click "Upload ID" and take a photo</li>
                    <li>Make sure the photo is clear</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 4</Tag> Get Their Signature
                  </Title>
                  <ol>
                    <li>Ask the customer to sign</li>
                    <li>They can sign on the screen or signature pad</li>
                    <li>Make sure the signature is visible</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 5</Tag> Fill In Check-In Details
                  </Title>
                  <Paragraph>A popup will appear. Fill in:</Paragraph>
                  <ul>
                    <li>
                      <Text strong>Number of People</Text> - How many people are
                      with them? (Enter 0 if alone)
                    </li>
                    <li>
                      <Text strong>Entry Fee</Text> - How much they pay to come
                      in (usually $10 or $25)
                    </li>
                    <li>
                      <Text strong>Payment Method</Text> - Cash, Card, or Check
                    </li>
                    <li>
                      <Text strong>Your Signature</Text> - You sign to say they
                      can come in
                    </li>
                  </ul>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 6</Tag> Give Them Their Token
                  </Title>
                  <Paragraph>
                    The system will show a 6-letter code like "A7K9M2". This is
                    their token.
                  </Paragraph>
                  <Alert
                    message="What to Do"
                    description={
                      <ul style={{ marginBottom: 0 }}>
                        <li>Write the token on a badge</li>
                        <li>Give the badge to the customer</li>
                        <li>Tell them: "Keep this with you. You need it to leave."</li>
                      </ul>
                    }
                    type="success"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Section 4: How to Check Out a Customer */}
                <Title level={3}>How to Check Out a Customer</Title>
                <Paragraph>Do this when a customer wants to leave.</Paragraph>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="orange">Step 1</Tag> Ask for Their Token
                  </Title>
                  <Paragraph>
                    Say: "May I have your token please?"
                  </Paragraph>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="orange">Step 2</Tag> Find Them in the System
                  </Title>
                  <Paragraph>
                    <Text strong>Way 1 - Use Token:</Text>
                  </Paragraph>
                  <ol>
                    <li>Go to "Check-In" → "All Check-Ins"</li>
                    <li>Type the token in the search box</li>
                    <li>Click on their name</li>
                  </ol>
                  <Paragraph style={{ marginTop: 16 }}>
                    <Text strong>Way 2 - Use Name:</Text>
                  </Paragraph>
                  <ol>
                    <li>Go to "Check-In" → "All Check-Ins"</li>
                    <li>Type their name in the search box</li>
                    <li>Find the one that says "Checked In"</li>
                    <li>Click on their name</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="orange">Step 3</Tag> Click Check Out
                  </Title>
                  <ol>
                    <li>Click the "Check Out" button</li>
                    <li>Click "Yes" to confirm</li>
                    <li>Tell the customer: "You're all set. Have a nice day!"</li>
                  </ol>
                </Card>

                <Alert
                  message="Customer Lost Their Token?"
                  description="No problem! Ask for their name and search by name instead. Make sure it's really them before checking them out."
                  type="info"
                  style={{ marginTop: 16, marginBottom: 24 }}
                />

                <Divider />

                {/* Section 5: How to Create a Waiver */}
                <Title level={3}>How to Create a Waiver</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>When to Create a Waiver</Title>
                  <ul>
                    <li>Customer is selling a car (but not coming inside)</li>
                    <li>You want to save their info for later</li>
                  </ul>

                  <Title level={5} style={{ marginTop: 16 }}>Steps:</Title>
                  <ol>
                    <li>Click "Waiver Form" in the left menu</li>
                    <li>Click "Fill Waiver Form"</li>
                    <li>Choose if they are Seller or Buyer</li>
                    <li>Fill in their name and contact info</li>
                    <li>Take photo of their ID</li>
                    <li>Get their signature</li>
                    <li>Click "Submit"</li>
                  </ol>
                </Card>

                <Divider />

                {/* Section 6: Tips */}
                <Title level={3}>Tips for Doing a Good Job</Title>
                <Card>
                  <Title level={5}>
                    <span style={{ color: "#52c41a" }}>✓</span> DO:
                  </Title>
                  <ul>
                    <li>
                      <Text strong>Always check the ID</Text> - Make sure it
                      matches the customer
                    </li>
                    <li>
                      <Text strong>Be friendly</Text> - Smile and say hello
                    </li>
                    <li>
                      <Text strong>Write clearly</Text> - Make sure the token is
                      easy to read
                    </li>
                    <li>
                      <Text strong>Ask if unsure</Text> - Better to ask than
                      guess
                    </li>
                    <li>
                      <Text strong>Log out</Text> - When you leave your desk
                    </li>
                  </ul>

                  <Title level={5}>
                    <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                  </Title>
                  <ul>
                    <li>
                      <Text strong>Skip ID check</Text> - Always check the ID
                    </li>
                    <li>
                      <Text strong>Rush</Text> - Take your time to be correct
                    </li>
                    <li>
                      <Text strong>Share your password</Text> - Keep it secret
                    </li>
                    <li>
                      <Text strong>Let people in without checking in</Text> -
                      Everyone must check in
                    </li>
                    <li>
                      <Text strong>Forget to check out</Text> - They will show
                      as still inside
                    </li>
                  </ul>
                </Card>

                <Divider />

                {/* Section 7: Common Problems */}
                <Title level={3}>Common Problems and Fixes</Title>
                <Card style={{ marginBottom: 16 }}>
                  <Alert
                    message="I can't find the customer"
                    description={
                      <ul style={{ marginBottom: 0 }}>
                        <li>Try typing their name differently</li>
                        <li>Check the spelling</li>
                        <li>Search by phone number</li>
                        <li>They might be new - create a new waiver</li>
                      </ul>
                    }
                    type="warning"
                    style={{ marginBottom: 16 }}
                  />

                  <Alert
                    message="Photo won't upload"
                    description={
                      <ul style={{ marginBottom: 0 }}>
                        <li>Check your internet</li>
                        <li>Try taking the photo again</li>
                        <li>Ask IT for help if it keeps failing</li>
                      </ul>
                    }
                    type="warning"
                  />
                </Card>

                <Divider />

                {/* Section 8: Quick Reference */}
                <Title level={3}>Quick Reference</Title>
                <Card
                  style={{
                    backgroundColor: "rgba(82, 196, 26, 0.1)",
                    border: "1px solid rgba(82, 196, 26, 0.3)",
                    marginBottom: 16,
                  }}
                >
                  <Title level={5}>Check-In (Quick Steps):</Title>
                  <ol>
                    <li>Fill Waiver Form → Enter customer info</li>
                    <li>Take photo of ID</li>
                    <li>Get signature</li>
                    <li>Enter entry fee and payment method</li>
                    <li>Give token to customer</li>
                  </ol>
                </Card>

                <Card
                  style={{
                    backgroundColor: "rgba(250, 173, 20, 0.1)",
                    border: "1px solid rgba(250, 173, 20, 0.3)",
                  }}
                >
                  <Title level={5}>Check-Out (Quick Steps):</Title>
                  <ol>
                    <li>Ask for token</li>
                    <li>Search by token or name</li>
                    <li>Click "Check Out"</li>
                    <li>Confirm</li>
                  </ol>
                </Card>

                <Divider />

                <Card
                  style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
                >
                  <Title level={4}>Need Help?</Title>
                  <Paragraph>
                    <ul>
                      <li>Ask your supervisor</li>
                      <li>Call IT Support</li>
                      <li>Read this guide again</li>
                    </ul>
                  </Paragraph>
                  <Paragraph>
                    <Text strong>
                      You are an important part of our team. Thank you for your work!
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

export default FrontDeskGuide;
