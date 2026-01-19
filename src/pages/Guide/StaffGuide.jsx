import React, { useRef } from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import GuidePDFPreview from "../../components/Guide/GuidePDFPreview";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const StaffGuide = () => {
  const guideRef = useRef(null);

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
            {/* PDF Download Button */}
            <GuidePDFPreview
              contentRef={guideRef}
              title="Staff Member User Guide"
              buttonText="Download PDF"
            />

            {/* Guide Content */}
            <div ref={guideRef}>
              <Typography>
                <Title level={2}>Staff Member User Guide</Title>
                <Paragraph>
                  <Text strong>Welcome to AutoHub!</Text> This guide will help
                  you do your job. It is written in simple words.
                </Paragraph>

                <Alert
                  message="Your Job"
                  description="You handle cars. Your job is to: Add new cars when people sell them to us, Take photos, Check car parts, Set prices, Handle payment, and Keep track of inventory."
                  type="info"
                  style={{ marginBottom: 24 }}
                />

                <Divider />

                {/* What You Can Do */}
                <Title level={3}>What You Can Do</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>✓ Your Access</Title>
                  <ul>
                    <li>
                      <Text strong>Car Intake</Text> - Add new cars we buy
                    </li>
                    <li>
                      <Text strong>Car Inventory</Text> - See all cars we have
                    </li>
                    <li>
                      <Text strong>Parts Inventory</Text> - Manage car parts
                    </li>
                    <li>
                      <Text strong>Scrap</Text> - Handle scrap cars
                    </li>
                    <li>
                      <Text strong>User Guides</Text> - Help documents like this
                    </li>
                  </ul>
                </Card>

                <Divider />

                {/* Car Intake Process */}
                <Title level={3}>How to Add a New Car (Car Intake)</Title>
                <Paragraph>
                  This is your main job. Do this when someone sells us a car.
                </Paragraph>

                <Alert
                  message="7 Steps Total"
                  description="Adding a car has 7 steps. Follow each step carefully."
                  type="info"
                  style={{ marginBottom: 24 }}
                />

                {/* Step 0 */}
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 0</Tag> Enter the VIN
                  </Title>
                  <Paragraph>
                    <Text strong>What is VIN?</Text> A 17-character code found on
                    every car. It is like the car's ID number.
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Where to Find It:</Text>
                  </Paragraph>
                  <ul>
                    <li>On the dashboard (driver's side, look through the window)</li>
                    <li>On the driver's door frame</li>
                    <li>On the car title paper</li>
                  </ul>
                  <Paragraph>
                    <Text strong>What to Do:</Text>
                  </Paragraph>
                  <ol>
                    <li>Click "Car Intake" → "Add New Car"</li>
                    <li>Type the 17-character VIN</li>
                    <li>Click "Fetch VIN"</li>
                    <li>The system will fill in car details automatically</li>
                  </ol>
                  <Alert
                    message="If VIN doesn't work"
                    description="Click 'Skip' and type the car details yourself."
                    type="warning"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                {/* Step 1 */}
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 1</Tag> Car Details
                  </Title>
                  <Paragraph>Fill in information about the car:</Paragraph>
                  <Title level={5}>Required (Must Fill):</Title>
                  <ul>
                    <li><Text strong>Year</Text> - Example: 2015</li>
                    <li><Text strong>Make</Text> - Example: Toyota, Ford, Honda</li>
                    <li><Text strong>Model</Text> - Example: Camry, F-150, Civic</li>
                    <li><Text strong>Trim</Text> - Example: LE, XLE, Sport</li>
                    <li><Text strong>Color</Text> - The car's color</li>
                  </ul>
                  <Title level={5}>Additional (Fill if you know):</Title>
                  <ul>
                    <li>Body type (Sedan, SUV, Truck)</li>
                    <li>Transmission (Automatic or Manual)</li>
                    <li>Drive (2WD, 4WD, AWD)</li>
                    <li>Fuel Type</li>
                    <li>Does it have keys? (Yes/No)</li>
                  </ul>
                  <Paragraph>Click "Next" when done.</Paragraph>
                </Card>

                {/* Step 2 */}
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 2</Tag> Car Photos (12 Photos)
                  </Title>
                  <Paragraph>
                    Take <Text strong>12 photos</Text> of the car.
                  </Paragraph>
                  <Title level={5}>8 General Photos:</Title>
                  <ol>
                    <li>Front of car</li>
                    <li>Back of car</li>
                    <li>Driver side</li>
                    <li>Passenger side</li>
                    <li>Front driver corner</li>
                    <li>Front passenger corner</li>
                    <li>Back driver corner</li>
                    <li>Back passenger corner</li>
                  </ol>
                  <Title level={5}>4 Special Photos:</Title>
                  <ol start={9}>
                    <li>Engine (open the hood)</li>
                    <li>Trunk (open the trunk)</li>
                    <li>Under the car</li>
                    <li>Full car in one photo</li>
                  </ol>
                  <Alert
                    message="Tips for Good Photos"
                    description={
                      <ul style={{ marginBottom: 0 }}>
                        <li>Good lighting</li>
                        <li>Clear and focused</li>
                        <li>Show any damage</li>
                      </ul>
                    }
                    type="success"
                  />
                </Card>

                {/* Step 3 */}
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 3</Tag> Check Car Parts
                  </Title>
                  <Paragraph>Check which parts are good and usable.</Paragraph>
                  <Title level={5}>Parts to Check:</Title>
                  <ul>
                    <li>Engine, Transmission, Radiator</li>
                    <li>4 Doors, Hood, Trunk</li>
                    <li>Front and Back Bumpers</li>
                    <li>Headlights and Taillights</li>
                    <li>Seats, Dashboard, Steering Wheel</li>
                    <li>4 Wheels and Tires</li>
                    <li>Windows and Mirrors</li>
                    <li>Radio, AC Unit</li>
                  </ul>
                  <Paragraph>
                    <Text strong>What to Do:</Text>
                  </Paragraph>
                  <ol>
                    <li>Walk around the car</li>
                    <li>Check each part</li>
                    <li>If part is good, check the box</li>
                    <li>Enter quantity (usually 1)</li>
                    <li>Add notes about condition</li>
                  </ol>
                </Card>

                {/* Step 4 */}
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 4</Tag> Set the Price
                  </Title>
                  <Paragraph>Decide how much to pay for the car.</Paragraph>
                  <Title level={5}>Fill In:</Title>
                  <ul>
                    <li><Text strong>Actual Weight</Text> - Car weight in pounds</li>
                    <li><Text strong>Rate Per Pound</Text> - Usually $6</li>
                    <li><Text strong>Actual Price</Text> - System calculates this</li>
                    <li><Text strong>Our Price</Text> - What we think it's worth</li>
                    <li><Text strong>Customer Price</Text> - What customer wants</li>
                    <li><Text strong>Negotiate To</Text> - Lowest we can pay</li>
                    <li><Text strong>Final Price</Text> - Agreed price</li>
                  </ul>
                </Card>

                {/* Step 5 */}
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 5</Tag> Documents and Seller Info
                  </Title>
                  <Paragraph>Collect papers and seller information.</Paragraph>
                  <Title level={5}>Select the Seller:</Title>
                  <ul>
                    <li>Choose existing seller from list, OR</li>
                    <li>Seller info is already in waiver</li>
                  </ul>
                  <Title level={5}>Upload 3 Documents:</Title>
                  <ol>
                    <li>
                      <Text strong>Title Certificate</Text> - The car title paper (REQUIRED)
                    </li>
                    <li>
                      <Text strong>Driver's License</Text> - Photo of seller's license
                    </li>
                    <li>
                      <Text strong>Physical Paper</Text> - Registration paper
                    </li>
                  </ol>
                  <Title level={5}>Also Fill:</Title>
                  <ul>
                    <li>Selling Date (today)</li>
                    <li>Pickup Type (You Pull, We Pull, Bulk, Location)</li>
                    <li>Get seller's signature</li>
                  </ul>
                  <Alert
                    message="Important"
                    description="Title Certificate is required. Cannot continue without it."
                    type="warning"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                {/* Step 6 */}
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 6</Tag> Payment
                  </Title>
                  <Paragraph>Pay the seller for their car.</Paragraph>
                  <Title level={5}>Fill In:</Title>
                  <ol>
                    <li><Text strong>Payment Method</Text> - Cash, Check, or Bank Transfer</li>
                    <li><Text strong>Amount</Text> - Should match Final Price from Step 4</li>
                    <li><Text strong>Notes</Text> - Add any notes (like check number)</li>
                  </ol>
                  <Title level={5}>After Clicking Submit:</Title>
                  <ol>
                    <li>Click "Print Documents" to see print preview</li>
                    <li>Review the documents</li>
                    <li>Print them</li>
                    <li>Give copy to seller</li>
                    <li>Keep copy for records</li>
                  </ol>
                  <Alert
                    message="Print Documents"
                    description="This will show payment slip plus all uploaded documents (Title Certificate, Driver's License, Physical Paper) on separate pages."
                    type="info"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Car Inventory */}
                <Title level={3}>Car Inventory</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Paragraph>View and manage all cars we have.</Paragraph>
                  <Title level={5}>What You Can Do:</Title>
                  <ul>
                    <li>View all cars</li>
                    <li>Search by VIN, make, or model</li>
                    <li>See car details</li>
                    <li>Update car information</li>
                  </ul>
                  <Title level={5}>How to Find a Car:</Title>
                  <ol>
                    <li>Click "Car Inventory" in menu</li>
                    <li>Type in search box</li>
                    <li>Click on the car you want</li>
                  </ol>
                </Card>

                <Divider />

                {/* Parts Inventory */}
                <Title level={3}>Parts Inventory</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Paragraph>Manage car parts separately.</Paragraph>
                  <Title level={5}>Add New Inventory:</Title>
                  <ol>
                    <li>Click "Car Parts Inventory" → "Add Inventory"</li>
                    <li>Select the car</li>
                    <li>Select parts to add</li>
                    <li>Enter quantities</li>
                    <li>Save</li>
                  </ol>
                  <Title level={5}>View Parts:</Title>
                  <ol>
                    <li>Click "Inventory Lists"</li>
                    <li>Search or filter</li>
                    <li>Click to see details</li>
                  </ol>
                </Card>

                <Divider />

                {/* Scrap */}
                <Title level={3}>Scrap Cars</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Paragraph>Handle cars that will be scrapped.</Paragraph>
                  <Title level={5}>When to Scrap:</Title>
                  <ul>
                    <li>Car is too damaged</li>
                    <li>Only good for metal</li>
                    <li>End of life vehicle</li>
                  </ul>
                  <Title level={5}>How to Add Scrap:</Title>
                  <ol>
                    <li>Click "Scrap a Car" → "Add New"</li>
                    <li>Select car or enter details</li>
                    <li>Enter scrap info (weight, value)</li>
                    <li>Save</li>
                  </ol>
                </Card>

                <Divider />

                {/* Tips */}
                <Title level={3}>Tips for Doing a Good Job</Title>
                <Card>
                  <Title level={5}>
                    <span style={{ color: "#52c41a" }}>✓</span> DO:
                  </Title>
                  <ul>
                    <li>Always start with VIN - it fills in details automatically</li>
                    <li>Take clear photos</li>
                    <li>Check all parts carefully</li>
                    <li>Double-check documents</li>
                    <li>Save after each step</li>
                    <li>Print payment slip for seller</li>
                  </ul>

                  <Title level={5}>
                    <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                  </Title>
                  <ul>
                    <li>Skip required fields</li>
                    <li>Guess at information - ask instead</li>
                    <li>Accept unclear documents</li>
                    <li>Rush the process</li>
                    <li>Forget to give seller payment slip</li>
                  </ul>
                </Card>

                <Divider />

                {/* Quick Reference */}
                <Title level={3}>Quick Reference - Car Intake</Title>
                <Card
                  style={{
                    backgroundColor: "rgba(82, 196, 26, 0.1)",
                    border: "1px solid rgba(82, 196, 26, 0.3)",
                  }}
                >
                  <ol>
                    <li>Step 0: Enter VIN → Fetch car details</li>
                    <li>Step 1: Fill car details → Year, Make, Model</li>
                    <li>Step 2: Take 12 photos</li>
                    <li>Step 3: Check parts</li>
                    <li>Step 4: Set price</li>
                    <li>Step 5: Upload documents + seller signature</li>
                    <li>Step 6: Payment → Print documents for seller</li>
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
                      You are important to our team. Your work keeps the
                      business running!
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

export default StaffGuide;
