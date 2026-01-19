import React, { useRef } from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import GuidePDFPreview from "../../components/Guide/GuidePDFPreview";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const CarIntakeGuide = () => {
  const guideRef = useRef(null);

  return (
    <div className="guide-container">
      <div className="page-title-box">
        <div className="page-title">
          <h4>Car Intake User Guide</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Guide</a>
            </li>
            <li className="breadcrumb-item active">Car Intake</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card className="guide-card">
            {/* PDF Download Button */}
            <GuidePDFPreview
              contentRef={guideRef}
              title="Car Intake User Guide"
              buttonText="Download PDF"
            />

            {/* Guide Content */}
            <div ref={guideRef}>
              <Typography>
                <Title level={2}>Car Intake Process</Title>
                <Paragraph>
                  <Text strong>Welcome!</Text> This guide shows you how to add a
                  new car when someone sells it to us.
                </Paragraph>

                <Alert
                  message="What is Car Intake?"
                  description="Car Intake is when we buy a car from someone. We record the car details, take photos, check parts, set price, collect documents, and pay the seller."
                  type="info"
                  style={{ marginBottom: 24 }}
                />

                <Divider />

                {/* Overview */}
                <Title level={3}>7 Steps Overview</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <ol>
                    <li><Tag color="blue">Step 0</Tag> Enter VIN Number</li>
                    <li><Tag color="blue">Step 1</Tag> Car Details (Year, Make, Model)</li>
                    <li><Tag color="blue">Step 2</Tag> Car Photos (12 photos)</li>
                    <li><Tag color="blue">Step 3</Tag> Check Parts</li>
                    <li><Tag color="blue">Step 4</Tag> Set Price</li>
                    <li><Tag color="blue">Step 5</Tag> Documents & Seller Info</li>
                    <li><Tag color="blue">Step 6</Tag> Payment & Print</li>
                  </ol>
                </Card>

                <Divider />

                {/* Step 0 */}
                <Title level={3}>
                  <Tag color="blue">Step 0</Tag> Enter VIN Number
                </Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Paragraph>
                    <Text strong>What is VIN?</Text> It's a 17-character code on
                    every car. Like a car ID number.
                  </Paragraph>
                  <Title level={5}>Where to Find VIN:</Title>
                  <ul>
                    <li>Dashboard (driver side, look through window)</li>
                    <li>Driver door frame</li>
                    <li>Car title paper</li>
                  </ul>
                  <Title level={5}>Steps:</Title>
                  <ol>
                    <li>Click "Car Intake" → "Add New Car"</li>
                    <li>Popup appears asking for VIN</li>
                    <li>Type the 17-character VIN</li>
                    <li>Click "Fetch VIN"</li>
                    <li>System fills in car details automatically</li>
                  </ol>
                  <Alert
                    message="VIN Doesn't Work?"
                    description="Click 'Skip' and enter car details manually in Step 1."
                    type="warning"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Step 1 */}
                <Title level={3}>
                  <Tag color="blue">Step 1</Tag> Car Details
                </Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={5}>Required (Must Fill):</Title>
                  <ul>
                    <li><Text strong>Year</Text> - 2015, 2018, etc.</li>
                    <li><Text strong>Make</Text> - Toyota, Ford, Honda</li>
                    <li><Text strong>Model</Text> - Camry, F-150, Civic</li>
                    <li><Text strong>Trim</Text> - LE, XLE, Sport</li>
                    <li><Text strong>Color</Text> - Red, Blue, Silver</li>
                  </ul>
                  <Title level={5}>Additional:</Title>
                  <ul>
                    <li>Body type (Sedan, SUV, Truck)</li>
                    <li>Transmission (Automatic/Manual)</li>
                    <li>Drive (2WD, 4WD, AWD)</li>
                    <li>Fuel Type</li>
                    <li>Keys (Yes/No)</li>
                  </ul>
                  <Paragraph>Click "Next" when done.</Paragraph>
                </Card>

                <Divider />

                {/* Step 2 */}
                <Title level={3}>
                  <Tag color="blue">Step 2</Tag> Car Photos
                </Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Paragraph>
                    Take <Text strong>12 photos</Text> of the car.
                  </Paragraph>
                  <Title level={5}>8 General Photos:</Title>
                  <ol>
                    <li>Front</li>
                    <li>Back</li>
                    <li>Driver side</li>
                    <li>Passenger side</li>
                    <li>Front driver corner</li>
                    <li>Front passenger corner</li>
                    <li>Back driver corner</li>
                    <li>Back passenger corner</li>
                  </ol>
                  <Title level={5}>4 Special Photos:</Title>
                  <ol start={9}>
                    <li>Engine (open hood)</li>
                    <li>Trunk (open trunk)</li>
                    <li>Under the car</li>
                    <li>Full car in one shot</li>
                  </ol>
                  <Alert
                    message="Tips"
                    description="Good lighting, clear focus, show any damage"
                    type="success"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Step 3 */}
                <Title level={3}>
                  <Tag color="blue">Step 3</Tag> Check Parts
                </Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Paragraph>Check which parts are good and usable.</Paragraph>
                  <Title level={5}>Parts to Check:</Title>
                  <ul>
                    <li>Engine, Transmission, Radiator</li>
                    <li>Doors (4), Hood, Trunk</li>
                    <li>Bumpers, Fenders</li>
                    <li>Headlights, Taillights</li>
                    <li>Seats, Dashboard</li>
                    <li>Wheels (4), Tires</li>
                    <li>Windows, Mirrors</li>
                  </ul>
                  <Title level={5}>How:</Title>
                  <ol>
                    <li>Walk around car</li>
                    <li>Check each part</li>
                    <li>If good, check the box</li>
                    <li>Enter quantity (usually 1)</li>
                    <li>Add notes about condition</li>
                  </ol>
                </Card>

                <Divider />

                {/* Step 4 */}
                <Title level={3}>
                  <Tag color="blue">Step 4</Tag> Set Price
                </Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={5}>Fill In:</Title>
                  <ul>
                    <li><Text strong>Actual Weight</Text> - in pounds</li>
                    <li><Text strong>Rate Per Pound</Text> - usually $6</li>
                    <li><Text strong>Actual Price</Text> - calculated automatically</li>
                    <li><Text strong>Our Price</Text> - what we think it's worth</li>
                    <li><Text strong>Customer Price</Text> - what they want</li>
                    <li><Text strong>Negotiate To</Text> - lowest we can go</li>
                    <li><Text strong>Final Price</Text> - agreed price</li>
                  </ul>
                </Card>

                <Divider />

                {/* Step 5 */}
                <Title level={3}>
                  <Tag color="blue">Step 5</Tag> Documents & Seller
                </Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={5}>Select Seller:</Title>
                  <ul>
                    <li>Choose from existing customers, OR</li>
                    <li>Seller info from waiver</li>
                  </ul>
                  <Title level={5}>Upload 3 Documents:</Title>
                  <ol>
                    <li>
                      <Text strong>Title Certificate</Text> - Car title (REQUIRED)
                    </li>
                    <li>
                      <Text strong>Driver's License</Text> - Seller's ID
                    </li>
                    <li>
                      <Text strong>Physical Paper</Text> - Registration
                    </li>
                  </ol>
                  <Title level={5}>Also:</Title>
                  <ul>
                    <li>Selling Date</li>
                    <li>Pickup Type</li>
                    <li>Seller Signature</li>
                  </ul>
                  <Alert
                    message="Important"
                    description="Title Certificate is required. You cannot continue without it."
                    type="error"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Step 6 */}
                <Title level={3}>
                  <Tag color="blue">Step 6</Tag> Payment & Print
                </Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={5}>Fill In:</Title>
                  <ol>
                    <li><Text strong>Payment Method</Text> - Cash, Check, Bank Transfer</li>
                    <li><Text strong>Amount</Text> - Should match Final Price</li>
                    <li><Text strong>Notes</Text> - Check number, etc.</li>
                  </ol>
                  
                  <Divider />
                  
                  <Title level={5}>Print Documents:</Title>
                  <Paragraph>After saving payment, you can print documents.</Paragraph>
                  <ol>
                    <li>Click "Print Documents" button</li>
                    <li>Preview opens showing all documents</li>
                    <li>Review the preview</li>
                    <li>Click to download or print</li>
                  </ol>
                  
                  <Alert
                    message="What Gets Printed"
                    description={
                      <ul style={{ marginBottom: 0 }}>
                        <li>Page 1: Payment Slip</li>
                        <li>Page 2: Title Certificate</li>
                        <li>Page 3: Driver's License</li>
                        <li>Page 4: Physical Paper</li>
                      </ul>
                    }
                    type="info"
                    style={{ marginTop: 12 }}
                  />
                  
                  <Alert
                    message="Important"
                    description="Give one copy to seller. Keep one for records."
                    type="warning"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* Tips */}
                <Title level={3}>Tips</Title>
                <Card>
                  <Title level={5}>
                    <span style={{ color: "#52c41a" }}>✓</span> DO:
                  </Title>
                  <ul>
                    <li>Start with VIN - fills details automatically</li>
                    <li>Take clear photos</li>
                    <li>Check all parts carefully</li>
                    <li>Double-check documents</li>
                    <li>Save after each step</li>
                    <li>Print documents for seller</li>
                  </ul>

                  <Title level={5}>
                    <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                  </Title>
                  <ul>
                    <li>Skip required fields</li>
                    <li>Guess at info - ask seller</li>
                    <li>Accept unclear documents</li>
                    <li>Forget to give seller their copy</li>
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
                  <ol>
                    <li>VIN → Fetch details</li>
                    <li>Details → Year, Make, Model</li>
                    <li>Photos → 12 pictures</li>
                    <li>Parts → Check good ones</li>
                    <li>Price → Final amount</li>
                    <li>Documents → Title (required), DL, Paper</li>
                    <li>Payment → Print docs for seller</li>
                  </ol>
                </Card>

                <Divider />

                <Card
                  style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
                >
                  <Title level={4}>Need Help?</Title>
                  <ul>
                    <li>Ask your supervisor</li>
                    <li>Call IT Support</li>
                    <li>Read this guide again</li>
                  </ul>
                </Card>
              </Typography>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarIntakeGuide;
