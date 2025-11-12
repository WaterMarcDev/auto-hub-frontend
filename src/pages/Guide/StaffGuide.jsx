import React from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const StaffGuide = () => {
  return (
    <div className="guide-container">
      <div className="page-title-box">
        <div className="page-title">
          <h4>Staff Member User Guide</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Guide</a>
            </li>
            <li className="breadcrumb-item active">Staff</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card className="guide-card">
            <Typography>
              <Title level={2}>User Guide for Staff Members</Title>
              <Paragraph>
                <Text strong>Welcome to AutoHub!</Text> This guide will help you
                use the AutoHub Dashboard system in your daily work as a Staff
                member.
              </Paragraph>

              <Alert
                message="Your Role"
                description="As a Staff member, you handle the core operations of our business: processing car intakes when we buy vehicles, managing car inventory, managing parts inventory, processing scrap cars, and keeping accurate records. You are essential to our operations!"
                type="info"
                style={{ marginBottom: 24 }}
              />

              <Divider />

              <Title level={3}>What You Can Do</Title>
              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>✓ You Have Access To</Title>
                <ul>
                  <li>
                    <Text strong>Dashboard</Text> - See your work overview
                  </li>
                  <li>
                    <Text strong>Car Intake</Text> - Add and manage cars we
                    purchase
                  </li>
                  <li>
                    <Text strong>Car Inventory</Text> - Track cars in our
                    inventory
                  </li>
                  <li>
                    <Text strong>Parts Inventory</Text> - Manage car parts
                  </li>
                  <li>
                    <Text strong>Scrap Management</Text> - Process cars for
                    scrapping
                  </li>
                  <li>
                    <Text strong>User Guides</Text> - Help when you need it
                  </li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Car Intake Process</Title>
              <Paragraph>
                This is your main job! When someone sells us a car, you process
                it.
              </Paragraph>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>Overview: 7 Steps</Title>
                <ol>
                  <li>
                    <Tag color="blue">Step 0</Tag> Enter VIN
                  </li>
                  <li>
                    <Tag color="blue">Step 1</Tag> Car Details
                  </li>
                  <li>
                    <Tag color="blue">Step 2</Tag> Car Images (12 photos)
                  </li>
                  <li>
                    <Tag color="blue">Step 3</Tag> Parts Assessment
                  </li>
                  <li>
                    <Tag color="blue">Step 4</Tag> Pricing
                  </li>
                  <li>
                    <Tag color="blue">Step 5</Tag> Documents (KYC)
                  </li>
                  <li>
                    <Tag color="blue">Step 6</Tag> Payment
                  </li>
                </ol>

                <Alert
                  message="Detailed Guide Available"
                  description='For complete step-by-step instructions on Car Intake, see the "Car Intake Guide" in the Guide menu.'
                  type="info"
                  style={{ marginTop: 16 }}
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 0</Tag> Enter the VIN
                </Title>
                <Paragraph>
                  <Text strong>VIN = Vehicle Identification Number</Text> (17
                  characters, no spaces)
                </Paragraph>

                <Paragraph>
                  <Text strong>Where to find it:</Text>
                </Paragraph>
                <ul>
                  <li>Driver's side dashboard (through windshield)</li>
                  <li>Driver's side door jamb</li>
                  <li>On the title or registration</li>
                </ul>

                <Paragraph>
                  <Text strong>What to do:</Text>
                </Paragraph>
                <ol>
                  <li>Click "Car Intake" → "Add New Car"</li>
                  <li>A popup appears asking for VIN</li>
                  <li>Type the 17-character VIN</li>
                  <li>Click "Fetch VIN"</li>
                  <li>The system fills in car details automatically!</li>
                </ol>

                <Paragraph>
                  <Text strong>If VIN doesn't work:</Text> Click "Skip" and
                  you'll enter details manually.
                </Paragraph>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 1</Tag> Car Details
                </Title>
                <Paragraph>Fill in information about the vehicle.</Paragraph>

                <Title level={5}>Required Information:</Title>
                <ul>
                  <li>Year (e.g., 2015)</li>
                  <li>Make (e.g., Toyota)</li>
                  <li>Model (e.g., Camry)</li>
                  <li>Trim (e.g., LE, XLE)</li>
                  <li>Color</li>
                </ul>

                <Title level={5}>Additional Information:</Title>
                <ul>
                  <li>Body type (Sedan, SUV, Truck)</li>
                  <li>Transmission (Automatic or Manual)</li>
                  <li>Drive (2WD, 4WD, AWD, FWD)</li>
                  <li>Fuel Type</li>
                  <li>Keys available? (Yes/No)</li>
                  <li>Scrap Yard Name (usually "RTX")</li>
                  <li>Scrap Yard Location (usually "New Jersey")</li>
                </ul>

                <Paragraph>
                  When done: Review everything and click "Next" or "Save"
                </Paragraph>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 2</Tag> Car Images
                </Title>
                <Paragraph>
                  Take <Text strong>12 photos</Text> of the vehicle.
                </Paragraph>

                <Title level={5}>8 General Photos:</Title>
                <ol>
                  <li>Front view</li>
                  <li>Back view</li>
                  <li>Driver side</li>
                  <li>Passenger side</li>
                  <li>Front driver corner</li>
                  <li>Front passenger corner</li>
                  <li>Rear driver corner</li>
                  <li>Rear passenger corner</li>
                </ol>

                <Title level={5}>4 Specific Photos:</Title>
                <ol start={9}>
                  <li>Engine bay (open hood)</li>
                  <li>Trunk/Boot (open trunk)</li>
                  <li>Below vehicle (underneath)</li>
                  <li>Full vehicle (entire car in frame)</li>
                </ol>

                <Alert
                  message="✓ Tips for Good Photos"
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Use good lighting</li>
                      <li>Make sure car is visible</li>
                      <li>Clear and focused</li>
                      <li>Show any damage</li>
                    </ul>
                  }
                  type="success"
                  style={{ marginTop: 12 }}
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 3</Tag> Parts Assessment
                </Title>
                <Paragraph>
                  Check which parts are available and working.
                </Paragraph>

                <Title level={5}>Parts to Check:</Title>
                <ul>
                  <li>Engine, Transmission, Radiator</li>
                  <li>Doors (4), Hood, Trunk</li>
                  <li>Bumpers (2), Fenders</li>
                  <li>Headlights, Taillights</li>
                  <li>Seats, Dashboard, Steering Wheel</li>
                  <li>Wheels (4), Tires</li>
                  <li>Windows, Mirrors</li>
                  <li>Radio, AC unit</li>
                </ul>

                <Paragraph>
                  <Text strong>What to do:</Text>
                </Paragraph>
                <ol>
                  <li>Walk around the car</li>
                  <li>Check each part</li>
                  <li>If part is good, check the box</li>
                  <li>Enter quantity (usually "1")</li>
                  <li>Add notes about condition</li>
                </ol>

                <Paragraph>
                  <Text strong>Example:</Text>
                </Paragraph>
                <ul>
                  <li>✓ Engine - Qty: 1 - "Runs well"</li>
                  <li>✓ Front Bumper - Qty: 1 - "Small dent on right"</li>
                  <li>✗ Rear Bumper - (too damaged)</li>
                </ul>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 4</Tag> Pricing
                </Title>
                <Paragraph>Determine how much we'll pay for the car.</Paragraph>

                <Title level={5}>Method 1: By Weight</Title>
                <ol>
                  <li>Weigh the car</li>
                  <li>Enter weight in pounds</li>
                  <li>Enter rate per pound (usually $6)</li>
                  <li>System calculates price automatically</li>
                </ol>

                <Title level={5}>Method 2: By Value</Title>
                <ol>
                  <li>Assess car's condition</li>
                  <li>Check similar cars</li>
                  <li>Enter our price</li>
                  <li>Set customer price</li>
                  <li>Set negotiate price</li>
                  <li>Enter final agreed price</li>
                </ol>

                <Title level={5}>Pricing Fields:</Title>
                <ul>
                  <li>Actual Weight</li>
                  <li>Rate Per Pound</li>
                  <li>Actual Price (auto-calculated)</li>
                  <li>Our Price</li>
                  <li>Customer Price</li>
                  <li>Negotiate To</li>
                  <li>Final Price</li>
                </ul>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 5</Tag> Documents (KYC)
                </Title>
                <Paragraph>
                  Collect legal documents and seller information.
                </Paragraph>

                <Title level={5}>Seller Information:</Title>
                <ul>
                  <li>Select the seller (customer)</li>
                  <li>Selling date (today)</li>
                  <li>Pickup type (You Pull, We Pull, Bulk, Location)</li>
                </ul>

                <Title level={5}>Required Documents (Upload 3):</Title>
                <ol>
                  <li>
                    <Text strong>Driver's License</Text> - Clear photo of
                    seller's license, must be readable
                  </li>
                  <li>
                    <Text strong>Physical Paper</Text>
                    <ul>
                      <li>Current vehicle registration paper</li>
                      <li>Must match the VIN</li>
                    </ul>
                  </li>
                  <li>
                    <Text strong>Title Certificate</Text> - Original car title,
                    signed by owner
                  </li>
                </ol>

                <Alert
                  message="Important Checks"
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>All documents match seller's name</li>
                      <li>VIN on registration matches car</li>
                      <li>Title is clear (no liens)</li>
                    </ul>
                  }
                  type="warning"
                  style={{ marginTop: 12 }}
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 6</Tag> Payment
                </Title>
                <Paragraph>Process payment to the seller.</Paragraph>

                <Title level={5}>What to enter:</Title>
                <ol>
                  <li>Payment method (Cash, Check, Bank Transfer)</li>
                  <li>Amount paid (should match Final Price from Step 4)</li>
                  <li>Payment notes (e.g., "Check #12345")</li>
                </ol>

                <Title level={5}>When done:</Title>
                <ol>
                  <li>Click "Submit" or "Complete"</li>
                  <li>System creates record</li>
                  <li>
                    <Text strong>Print payment slip</Text>
                  </li>
                  <li>Give copy to seller</li>
                  <li>Keep copy for records</li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Managing Car Inventory</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>View and manage cars in inventory.</Paragraph>
                <Paragraph>
                  <Text strong>Access:</Text> Click "Car Inventory" in left menu
                </Paragraph>

                <Title level={5}>What you can do:</Title>
                <ul>
                  <li>View all cars in inventory</li>
                  <li>Search for specific cars</li>
                  <li>Filter by make, model, year</li>
                  <li>Update car information</li>
                  <li>See car status</li>
                </ul>

                <Title level={5}>Finding a car:</Title>
                <ol>
                  <li>Click "Car Inventory Lists"</li>
                  <li>Use search box (VIN, make, model)</li>
                  <li>Click on car to see details</li>
                </ol>

                <Title level={5}>Updating car info:</Title>
                <ol>
                  <li>Find the car</li>
                  <li>Click "Edit"</li>
                  <li>Update information</li>
                  <li>Click "Save"</li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Managing Parts Inventory</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>Manage individual car parts in inventory.</Paragraph>
                <Paragraph>
                  <Text strong>Access:</Text> Click "Parts Inventory" in left
                  menu
                </Paragraph>

                <Title level={5}>Add New Inventory:</Title>
                <ol>
                  <li>Click "Add Inventory"</li>
                  <li>Select the car</li>
                  <li>Select parts to add</li>
                  <li>Enter quantities</li>
                  <li>Add notes</li>
                  <li>Save</li>
                </ol>

                <Title level={5}>View Inventory:</Title>
                <ol>
                  <li>Click "Inventory Lists"</li>
                  <li>See all parts</li>
                  <li>Search or filter</li>
                  <li>Update as needed</li>
                </ol>

                <Title level={5}>Master Parts:</Title>
                <ol>
                  <li>Click "Master Parts"</li>
                  <li>See parts by category</li>
                  <li>Check availability</li>
                  <li>Update status</li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Scrap Management</Title>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>When to scrap a car</Title>
                <ul>
                  <li>Car is beyond repair</li>
                  <li>Only good for parts</li>
                  <li>Customer wants car scrapped</li>
                  <li>End of life vehicle</li>
                </ul>

                <Title level={4}>How to add a scrap car</Title>
                <ol>
                  <li>Click "Scrap Car" in left menu</li>
                  <li>Click "Add New"</li>
                  <li>
                    Select or enter car details (VIN, Make, Model, Year,
                    Condition, Scrap yard info)
                  </li>
                  <li>
                    Enter scrap details (Scrap elements, Weight, Scrap value,
                    Date)
                  </li>
                  <li>Upload any required documents</li>
                  <li>Save the record</li>
                </ol>

                <Title level={4}>View scrap lists</Title>
                <ol>
                  <li>Click "Scrap Lists"</li>
                  <li>See all scrapped cars</li>
                  <li>Search or filter</li>
                  <li>Generate reports</li>
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
                    <Text strong>Start with VIN</Text> - It fills in most
                    details
                  </li>
                  <li>
                    <Text strong>Take clear photos</Text> - Good lighting,
                    focused
                  </li>
                  <li>
                    <Text strong>Be thorough</Text> - Check all parts carefully
                  </li>
                  <li>
                    <Text strong>Double-check documents</Text> - Accuracy
                    matters
                  </li>
                  <li>
                    <Text strong>Save often</Text> - After each step
                  </li>
                  <li>
                    <Text strong>Print payment slip</Text> - Give to seller
                  </li>
                </ul>

                <Title level={5}>
                  <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                </Title>
                <ul>
                  <li>
                    <Text strong>Skip required fields</Text>
                  </li>
                  <li>
                    <Text strong>Guess at information</Text> - Ask instead
                  </li>
                  <li>
                    <Text strong>Accept bad documents</Text> - Must be clear and
                    valid
                  </li>
                  <li>
                    <Text strong>Rush the process</Text> - Take time to be
                    accurate
                  </li>
                  <li>
                    <Text strong>Forget payment slip</Text> - Seller needs it
                  </li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Quality Checklist</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>Before completing a car intake:</Paragraph>
                <ul>
                  <li>VIN entered correctly</li>
                  <li>All car details complete</li>
                  <li>All 12 photos uploaded and clear</li>
                  <li>Parts assessment complete</li>
                  <li>Price calculated and agreed</li>
                  <li>All 3 documents uploaded and verified</li>
                  <li>Payment processed correctly</li>
                  <li>Payment slip printed and given to seller</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Daily Workflow</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>
                  <Text strong>Starting Your Day:</Text>
                </Paragraph>
                <ul>
                  <li>Log in to system</li>
                  <li>Check for pending work</li>
                  <li>Review any notes</li>
                  <li>Prepare workspace</li>
                </ul>

                <Paragraph>
                  <Text strong>During Your Shift:</Text>
                </Paragraph>
                <ul>
                  <li>Process car intakes</li>
                  <li>Update inventory</li>
                  <li>Check parts</li>
                  <li>Process scrap as needed</li>
                  <li>Keep records accurate</li>
                </ul>

                <Paragraph>
                  <Text strong>Ending Your Day:</Text>
                </Paragraph>
                <ul>
                  <li>Complete any pending work</li>
                  <li>Update status of cars</li>
                  <li>Leave notes for next shift</li>
                  <li>Log out</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Your Responsibilities</Title>

              <Card style={{ marginBottom: 24 }}>
                <Paragraph>
                  As a Staff member, you are responsible for:
                </Paragraph>
                <ul>
                  <li>✓ Accurate car intake processing</li>
                  <li>✓ Proper photo documentation</li>
                  <li>✓ Thorough parts assessment</li>
                  <li>✓ Fair and accurate pricing</li>
                  <li>✓ Document verification</li>
                  <li>✓ Correct payment processing</li>
                  <li>✓ Inventory management</li>
                  <li>✓ Maintaining quality standards</li>
                  <li>✓ Following all procedures</li>
                  <li>✓ Keeping records up to date</li>
                </ul>
              </Card>

              <Divider />

              <Card
                style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
              >
                <Title level={4}>You're an important part of our team!</Title>
                <Paragraph>
                  Your work in car intake and inventory management keeps our
                  business running smoothly. Take pride in doing it well!
                </Paragraph>
                <Paragraph>
                  <Text strong>Remember:</Text>
                  <ul>
                    <li>Quality over speed</li>
                    <li>Accuracy is essential</li>
                    <li>Ask when unsure</li>
                    <li>Document everything</li>
                    <li>Customer service matters</li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  <Text strong>Need Help?</Text> Click "Guide" in top bar, check
                  User Guides menu, ask your supervisor, call IT Support, or
                  review this guide.
                </Paragraph>
              </Card>
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffGuide;
