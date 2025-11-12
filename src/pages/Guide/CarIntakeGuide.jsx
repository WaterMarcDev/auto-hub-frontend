import React from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const CarIntakeGuide = () => {
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
            <Typography>
              <Title level={2}>Car Intake Process</Title>
              <Paragraph>
                <Text strong>Welcome!</Text> This guide will help you learn how
                to add a new vehicle when someone sells their car to us.
              </Paragraph>

              <Alert
                message="What is Car Intake?"
                description="Car Intake is the process of recording a new vehicle. You'll collect information about the car, take photos, assess its condition, determine the price, complete paperwork, and process payment."
                type="info"
                style={{ marginBottom: 24 }}
              />

              <Divider />

              <Title level={3}>When to Use Car Intake</Title>
              <Paragraph>
                Use the Car Intake process when:
                <ul>
                  <li>A customer wants to sell us their vehicle</li>
                  <li>We're purchasing a car from a scrap yard</li>
                  <li>We need to add a new vehicle to our system</li>
                </ul>
              </Paragraph>

              <Divider />

              <Title level={3}>Step-by-Step Process</Title>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 0</Tag> Enter the VIN
                </Title>
                <Paragraph>
                  When you open the Car Intake page, a popup will appear asking
                  for the VIN.
                </Paragraph>

                <Alert
                  message="What is a VIN?"
                  description="A Vehicle Identification Number - a unique 17-character code found on every vehicle."
                  type="default"
                  style={{ marginBottom: 16 }}
                />

                <Paragraph>
                  <Text strong>Where to find the VIN:</Text>
                  <ul>
                    <li>
                      On the driver's side dashboard (visible through
                      windshield)
                    </li>
                    <li>On the driver's side door jamb</li>
                    <li>On the vehicle's title or registration</li>
                  </ul>
                </Paragraph>

                <Paragraph>
                  <Text strong>How to enter it:</Text>
                  <ol>
                    <li>Type or paste the 17-character VIN</li>
                    <li>Click "Fetch VIN"</li>
                    <li>
                      The system will automatically fill in many car details
                    </li>
                    <li>
                      If it doesn't work, click "Skip" and enter details
                      manually
                    </li>
                  </ol>
                </Paragraph>

                <Alert
                  message="✓ Tip"
                  description="Make sure you enter the VIN correctly - no spaces, exactly 17 characters!"
                  type="success"
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 1</Tag> Car Details
                </Title>
                <Paragraph>
                  Fill in the basic information about the vehicle.
                </Paragraph>

                <Title level={5}>Required Information:</Title>
                <ul>
                  <li>
                    <Text strong>Year</Text> - The year the car was manufactured
                    (e.g., 2015)
                  </li>
                  <li>
                    <Text strong>Make</Text> - The car brand (e.g., Toyota,
                    Ford, Honda)
                  </li>
                  <li>
                    <Text strong>Model</Text> - The specific model (e.g., Camry,
                    F-150, Civic)
                  </li>
                  <li>
                    <Text strong>Trim</Text> - The car's trim level (e.g., LX,
                    Sport, Limited)
                  </li>
                  <li>
                    <Text strong>Color</Text> - The car's exterior color
                  </li>
                </ul>

                <Title level={5}>Additional Information:</Title>
                <ul>
                  <li>
                    <Text strong>Body Class</Text> - Type of vehicle (Sedan,
                    SUV, Truck, etc.)
                  </li>
                  <li>
                    <Text strong>Transmission</Text> - Choose "Automatic" or
                    "Manual"
                  </li>
                  <li>
                    <Text strong>Drive</Text> - Choose 2WD, 4WD, AWD, or FWD
                  </li>
                  <li>
                    <Text strong>Fuel Type</Text> - Gasoline, Diesel, Electric,
                    Hybrid, etc.
                  </li>
                  <li>
                    <Text strong>Keys Available</Text> - Check "Yes" if the car
                    has keys with it
                  </li>
                </ul>

                <Title level={5}>When you're done:</Title>
                <ol>
                  <li>Review all information</li>
                  <li>Click "Next" or "Save" to continue</li>
                </ol>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 2</Tag> Car Images
                </Title>
                <Paragraph>Take or upload photos of the vehicle.</Paragraph>

                <Title level={5}>Required Photos (12 total):</Title>

                <Text strong>General Photos (8 photos):</Text>
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

                <Text strong>Specific Photos (4 photos):</Text>
                <ol start={9}>
                  <li>
                    <Text strong>Engine Bay</Text> - Open hood, photograph
                    engine
                  </li>
                  <li>
                    <Text strong>Boot/Trunk</Text> - Open trunk, photograph
                    interior
                  </li>
                  <li>
                    <Text strong>Below Vehicle</Text> - Photograph underneath
                  </li>
                  <li>
                    <Text strong>Full Vehicle</Text> - Complete car in frame
                  </li>
                </ol>

                <Alert
                  message="✓ Tips for Good Photos"
                  description={
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                      <li>Take photos in good lighting</li>
                      <li>Make sure the whole car/part is visible</li>
                      <li>Take clear, focused photos</li>
                      <li>Show any damage or unique features</li>
                    </ul>
                  }
                  type="success"
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 3</Tag> Car Diagnosis (Parts
                  Assessment)
                </Title>
                <Paragraph>
                  Record which parts are available and in good condition.
                </Paragraph>

                <Title level={5}>Common Parts to Check:</Title>
                <ul>
                  <li>
                    <Text strong>Major Components:</Text> Engine, Transmission,
                    Radiator
                  </li>
                  <li>
                    <Text strong>Body Parts:</Text> Doors (4), Hood, Trunk,
                    Bumpers (2), Fenders
                  </li>
                  <li>
                    <Text strong>Lights:</Text> Headlights, Taillights, Turn
                    signals
                  </li>
                  <li>
                    <Text strong>Interior:</Text> Seats, Dashboard, Steering
                    wheel, Console
                  </li>
                  <li>
                    <Text strong>Wheels:</Text> All 4 wheels and tires
                  </li>
                  <li>
                    <Text strong>Glass:</Text> Windows, Windshield, Mirrors
                  </li>
                  <li>
                    <Text strong>Electronics:</Text> Radio, AC unit, Navigation
                    system
                  </li>
                </ul>

                <Title level={5}>How to Record:</Title>
                <ol>
                  <li>Walk around the car</li>
                  <li>Check each part</li>
                  <li>If the part is there and usable, check its box</li>
                  <li>Enter quantity (usually "1" for most parts)</li>
                  <li>Add any notes about condition</li>
                </ol>

                <Paragraph>
                  <Text strong>Example:</Text>
                  <ul>
                    <li>
                      <span style={{ color: "#52c41a" }} /> Engine - Quantity: 1
                      - Note: "Runs well, no issues"
                    </li>
                    <li>
                      <span style={{ color: "#52c41a" }} /> Front Bumper -
                      Quantity: 1 - Note: "Small dent on right side"
                    </li>
                    <li>
                      <span style={{ color: "#ff4d4f" }} /> Rear Bumper - (Not
                      available or too damaged)
                    </li>
                  </ul>
                </Paragraph>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 4</Tag> Pricing
                </Title>
                <Paragraph>
                  Determine how much we'll pay for the vehicle.
                </Paragraph>

                <Title level={5}>Pricing Fields:</Title>

                <Text strong>Weight-Based Pricing:</Text>
                <ol>
                  <li>
                    <Text strong>Actual Weight</Text> - Enter the car's weight
                    in pounds
                  </li>
                  <li>
                    <Text strong>Rate Per Pound</Text> - Our rate (usually $6
                    per 100 lbs)
                  </li>
                  <li>
                    <Text strong>Actual Price</Text> - Automatically calculated
                  </li>
                </ol>

                <Text strong>Our Pricing:</Text>
                <ol start={4}>
                  <li>
                    <Text strong>Our Price</Text> - What we initially think the
                    car is worth
                  </li>
                  <li>
                    <Text strong>Customer Price</Text> - What we're willing to
                    offer
                  </li>
                  <li>
                    <Text strong>Negotiate To</Text> - The lowest we can go
                  </li>
                </ol>

                <Text strong>Final Price:</Text>
                <ol start={7}>
                  <li>
                    <Text strong>Final Price</Text> - The agreed-upon price
                    after negotiation
                  </li>
                </ol>

                <Alert
                  message="Example Pricing"
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Actual Weight: 3,500 lbs</li>
                      <li>Rate: $6 per 100 lbs</li>
                      <li>Actual Price: $210 (automatic)</li>
                      <li>Our Price: $500</li>
                      <li>Customer Price: $550</li>
                      <li>Negotiate To: $450</li>
                      <li>Final Price: $500 (after negotiation)</li>
                    </ul>
                  }
                  type="info"
                  style={{ marginTop: 16 }}
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 5</Tag> Documents & Verification (KYC)
                </Title>
                <Paragraph>
                  Collect legal documents and seller information.
                </Paragraph>

                <Title level={5}>
                  Required Documents (Must upload 3 documents):
                </Title>
                <ol>
                  <li>
                    <Text strong>Driver's License</Text>
                    <ul>
                      <li>Photo of seller's valid driver's license</li>
                      <li>Must be clear and readable</li>
                    </ul>
                  </li>
                  <li>
                    <Text strong>Physical Paper</Text>
                    <ul>
                      <li>Current vehicle registration paper</li>
                      <li>Must match the VIN</li>
                    </ul>
                  </li>
                  <li>
                    <Text strong>Title Certificate</Text>
                    <ul>
                      <li>Original car title</li>
                      <li>Must be signed by owner</li>
                    </ul>
                  </li>
                </ol>

                <Alert
                  message="✓ Important Checks"
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Check that all documents match the seller's name</li>
                      <li>Verify the VIN on registration matches the car</li>
                      <li>Make sure signature is clear</li>
                    </ul>
                  }
                  type="warning"
                  s
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="blue">Step 6</Tag> Payment
                </Title>
                <Paragraph>Process the payment to the seller.</Paragraph>

                <Title level={5}>Payment Information:</Title>
                <ol>
                  <li>
                    <Text strong>Payment Method</Text> - How are we paying?
                    <ul>
                      <li>Cash</li>
                      <li>Check</li>
                      <li>Bank Transfer</li>
                      <li>Credit Card</li>
                    </ul>
                  </li>
                  <li>
                    <Text strong>Amount Paid</Text> - Enter the exact amount
                    (usually matches Final Price from Step 4)
                  </li>
                  <li>
                    <Text strong>Payment Notes</Text> - Add notes (e.g., "Check
                    #12345")
                  </li>
                </ol>

                <Title level={5}>When you're done:</Title>
                <ol>
                  <li>Review all payment information</li>
                  <li>Click "Submit" or "Complete"</li>
                  <li>The system will create the car intake record</li>
                  <li>A payment slip will be generated</li>
                </ol>

                <Alert
                  message={
                    <>
                      <span /> Important
                    </>
                  }
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Always get seller's acknowledgment of payment</li>
                      <li>Print and give seller the payment slip</li>
                      <li>Keep a copy for our records</li>
                    </ul>
                  }
                  type="error"
                />
              </Card>

              <Divider />

              <Title level={3}>After Completing Car Intake</Title>
              <Card>
                <Paragraph>
                  <Text strong>What Happens Next:</Text>
                  <ol>
                    <li>
                      <Text strong>Payment Slip Generated</Text> - Print this
                      for the seller
                    </li>
                    <li>
                      <Text strong>Car Added to System</Text> - Searchable by
                      VIN
                    </li>
                    <li>
                      <Text strong>Status Updated</Text> - Shows "Payment Done"
                    </li>
                    <li>
                      <Text strong>Transaction Recorded</Text> - In the system
                      for accounting
                    </li>
                  </ol>
                </Paragraph>

                <Title level={5}>Printing Payment Slip:</Title>
                <ol>
                  <li>Look for "Print Payment Slip" button</li>
                  <li>Click to open print preview</li>
                  <li>Review the slip</li>
                  <li>Print two copies (one for seller, one for file)</li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Best Practices</Title>
              <Card>
                <Title level={5}>
                  <span style={{ color: "#52c41a" }} /> DO:
                </Title>
                <ul>
                  <li>
                    Always start with the VIN - it fills in most details
                    automatically
                  </li>
                  <li>Take clear, well-lit photos</li>
                  <li>Check all parts carefully and honestly</li>
                  <li>Double-check document accuracy</li>
                  <li>Print payment slip for customer</li>
                  <li>Save after each step</li>
                </ul>

                <Title level={5}>
                  <span style={{ color: "#ff4d4f" }} /> DON'T:
                </Title>
                <ul>
                  <li>Skip required fields</li>
                  <li>Guess at information - ask the customer or supervisor</li>
                  <li>Accept unclear or expired documents</li>
                  <li>Process payment without proper documentation</li>
                  <li>Forget to give customer their payment slip</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Common Issues</Title>
              <Card>
                <Alert
                  message="VIN Already Exists"
                  description={
                    <>
                      <Text strong>Solution:</Text>
                      <ol>
                        <li>Search for the existing VIN</li>
                        <li>Check if it's a duplicate entry</li>
                        <li>
                          If it's the same car, update the existing record
                          instead
                        </li>
                        <li>If it's an error, contact supervisor</li>
                      </ol>
                    </>
                  }
                  type="warning"
                  style={{ marginBottom: 16 }}
                />

                <Alert
                  message="Upload Failed"
                  description={
                    <>
                      <Text strong>Solution:</Text>
                      <ol>
                        <li>Check file size - must be under 5MB</li>
                        <li>Ensure it's a valid image format (JPG, PNG)</li>
                        <li>Try taking a new photo if image is corrupted</li>
                        <li>Check internet connection</li>
                        <li>Contact IT if problem persists</li>
                      </ol>
                    </>
                  }
                  type="warning"
                />
              </Card>

              <Divider />

              <Card
                style={{ background: "#f0f5ff", border: "1px solid #adc6ff" }}
              >
                <Title level={4}>Need Help?</Title>
                <Paragraph>
                  <ul>
                    <li>
                      <Text strong>Ask a Supervisor</Text> - For policy
                      questions or complex situations
                    </li>
                    <li>
                      <Text strong>Contact IT Support</Text> - For technical
                      issues
                    </li>
                    <li>
                      <Text strong>Ask Colleagues</Text> - They may have
                      encountered the same issue
                    </li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  <Text strong>Remember:</Text> Be accurate, be thorough, be
                  professional, and ask for help when needed!
                </Paragraph>
              </Card>
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarIntakeGuide;
