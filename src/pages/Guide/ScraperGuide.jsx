import React, { useRef } from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import GuidePDFPreview from "../../components/Guide/GuidePDFPreview";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const ScraperGuide = () => {
  const guideRef = useRef(null);

  return (
    <div className="guide-container">
      <div className="page-title-box">
        <div className="page-title">
          <h4>Scraper User Guide</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Guide</a>
            </li>
            <li className="breadcrumb-item active">Scraper</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card className="guide-card">
            {/* PDF Download Button */}
            <GuidePDFPreview
              contentRef={guideRef}
              title="Scraper User Guide"
              buttonText="Download PDF"
            />

            {/* Guide Content */}
            <div ref={guideRef}>
              <Typography>
                <Title level={2}>Scraper User Guide</Title>
                <Paragraph>
                  <Text strong>Welcome to AutoHub!</Text> This guide will help
                  you do your job. It is written in simple words.
                </Paragraph>

                <Alert
                  message="Your Job"
                  description="You scrap cars. When a car is marked Ready To Scrap, you crush it, record the elements (metals and materials) you took out of it, and mark which parts went to the crusher with the car."
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
                      <Text strong>Scrap a Car → Ready To Scrap</Text> - Cars
                      waiting to be scrapped. You move them to Scrapped.
                    </li>
                    <li>
                      <Text strong>Scrap a Car → Scrap Car Lists</Text> - Cars
                      already scrapped and their elements
                    </li>
                    <li>
                      <Text strong>Scrap a Car → Element Hub</Text> - See how
                      much of each element we have in stock (view only)
                    </li>
                    <li>
                      <Text strong>Scrap a Car → Add New</Text> - Bulk upload
                      of old scrapped records from Excel
                    </li>
                    <li>
                      <Text strong>User Guides</Text> - Help documents like this
                    </li>
                  </ul>
                  <Alert
                    message="Only Scrapers and Admins can do this"
                    description="Moving a car to Scrapped and adding extracted elements can only be done by a Scraper or an Admin."
                    type="success"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Divider />

                {/* How a car reaches you */}
                <Title level={3}>How a Car Gets to You</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <ol>
                    <li>
                      An Admin or Manager picks a car in{" "}
                      <Text strong>Car Inventory for Scrap</Text> and clicks{" "}
                      <Text strong>Ready To Scrap</Text>.
                    </li>
                    <li>
                      The car then shows up in your{" "}
                      <Text strong>Ready To Scrap</Text> list.
                    </li>
                    <li>
                      You scrap it and click{" "}
                      <Text strong>Move To Scrapped</Text> (steps below).
                    </li>
                    <li>
                      The car moves to <Text strong>Scrap Car Lists</Text> with
                      its elements, and the element weights are added to the{" "}
                      <Text strong>Element Hub</Text>.
                    </li>
                  </ol>
                </Card>

                <Divider />

                {/* Move To Scrapped */}
                <Title level={3}>How to Scrap a Car (Move To Scrapped)</Title>
                <Paragraph>
                  This is your main job. Do this after the car is crushed.
                </Paragraph>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 1</Tag> Find the Car
                  </Title>
                  <ol>
                    <li>Click "Scrap a Car" → "Ready To Scrap"</li>
                    <li>Search by VIN, make or model</li>
                    <li>Click "View" if you want to check the car details first</li>
                    <li>Click the red "Move To Scrapped" button on that car</li>
                  </ol>
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 2</Tag> Enter the Elements Extracted
                  </Title>
                  <Paragraph>
                    A window opens with the list of elements (for example
                    Aluminum, Copper, Steel). For each element you took out of
                    the car:
                  </Paragraph>
                  <ol>
                    <li>Tick <Text strong>Select</Text></li>
                    <li>
                      Enter the <Text strong>Unit</Text> (how many, usually 1)
                    </li>
                    <li>
                      Enter the <Text strong>Weight</Text> (required for every
                      ticked element)
                    </li>
                    <li>
                      Add <Text strong>Quality</Text> and{" "}
                      <Text strong>Dimensions</Text> if you know them
                    </li>
                  </ol>
                  <Alert
                    message="Weight is required"
                    description="You cannot save until every ticked element has a weight."
                    type="warning"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 3</Tag> Parts Still in Inventory
                  </Title>
                  <Paragraph>
                    This list shows parts of this car that are still in our
                    parts inventory.
                  </Paragraph>
                  <ul>
                    <li>
                      Tick <Text strong>Went to crusher</Text> only for parts
                      that were crushed with the car. They are removed from
                      inventory.
                    </li>
                    <li>
                      Leave a part unticked if it was pulled off the car before
                      crushing. It stays in inventory.
                    </li>
                  </ul>
                  <Alert
                    message="Parts listed on eBay / Wix"
                    description="If a ticked part shows an eBay or Wix tag, tell your manager. Those online listings must be ended by hand."
                    type="warning"
                    style={{ marginTop: 12 }}
                  />
                </Card>

                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Title level={4}>
                    <Tag color="blue">Step 4</Tag> Remarks and Save
                  </Title>
                  <ol>
                    <li>Add remarks if needed (optional)</li>
                    <li>
                      Click <Text strong>Save &amp; Move To Scrapped</Text>
                    </li>
                    <li>
                      The car leaves Ready To Scrap and appears in Scrap Car
                      Lists
                    </li>
                  </ol>
                </Card>

                <Divider />

                {/* Scrap Car Lists */}
                <Title level={3}>Scrap Car Lists</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Paragraph>See every car that has been scrapped.</Paragraph>
                  <ul>
                    <li>Click "View" to see the car details</li>
                    <li>
                      Click "Scrap Details" to see the elements and parts
                      recorded for that car
                    </li>
                    <li>
                      If a car has no elements recorded, open Scrap Details and
                      click "Add Elements" to add them
                    </li>
                  </ul>
                </Card>

                <Divider />

                {/* Element Hub */}
                <Title level={3}>Element Hub</Title>
                <Card className="step-card" style={{ marginBottom: 24 }}>
                  <Paragraph>
                    Shows the total weight of each element in stock, from all
                    scrapped cars and scrap purchases.
                  </Paragraph>
                  <ul>
                    <li>You can see the stock and the sell history</li>
                    <li>
                      The <Text strong>Sell</Text> button is turned off for
                      Scrapers. Selling elements is done by an Admin, Manager or
                      Staff member.
                    </li>
                  </ul>
                </Card>

                <Divider />

                {/* Tips */}
                <Title level={3}>Tips for Doing a Good Job</Title>
                <Card>
                  <Title level={5}>
                    <span style={{ color: "#52c41a" }}>✓</span> DO:
                  </Title>
                  <ul>
                    <li>Check the VIN before you click Move To Scrapped</li>
                    <li>Weigh each element and enter the real weight</li>
                    <li>Tick only the parts that really went to the crusher</li>
                    <li>Write remarks if something is unusual</li>
                  </ul>

                  <Title level={5}>
                    <span style={{ color: "#ff4d4f" }}>✗</span> DON'T:
                  </Title>
                  <ul>
                    <li>Move a car to Scrapped before it is actually crushed</li>
                    <li>Guess weights - ask instead</li>
                    <li>Tick parts that were pulled off the car</li>
                  </ul>
                </Card>

                <Divider />

                {/* Quick Reference */}
                <Title level={3}>Quick Reference - Scrapping a Car</Title>
                <Card
                  style={{
                    backgroundColor: "rgba(82, 196, 26, 0.1)",
                    border: "1px solid rgba(82, 196, 26, 0.3)",
                  }}
                >
                  <ol>
                    <li>Scrap a Car → Ready To Scrap → find the car</li>
                    <li>Click Move To Scrapped</li>
                    <li>Tick elements → enter unit and weight</li>
                    <li>Tick parts that went to the crusher</li>
                    <li>Add remarks → Save &amp; Move To Scrapped</li>
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

export default ScraperGuide;
