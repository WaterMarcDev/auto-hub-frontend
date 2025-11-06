import React from "react";
import { Card, Typography, Divider, Tag, Alert } from "antd";
import "./GuideStyles.css";

const { Title, Paragraph, Text } = Typography;

const CheckInGuide = () => {
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
            <Typography>
              <Title level={2}>Customer Check-In Process</Title>
              <Paragraph>
                <Text strong>Welcome!</Text> This guide will help you learn how to check in customers when they arrive at our facility.
              </Paragraph>

              <Alert
                message="What is Customer Check-In?"
                description="Check-In is how we track customers entering our facility. Every customer must check in before browsing parts or conducting business. The system creates a unique token for each visit and records payment."
                type="info"
                icon={<span />}
                
                style={{ marginBottom: 24 }}
              />

              <Divider />

              <Title level={3}>When to Use Check-In</Title>
              <Paragraph>
                Use Check-In when:
                <ul>
                  <li>A customer arrives to browse parts</li>
                  <li>A buyer comes to pick up purchased items</li>
                  <li>Anyone needs to enter the secure area</li>
                  <li>A seller returns for any reason</li>
                </ul>
              </Paragraph>

              <Divider />

              <Title level={3}>Step-by-Step: Checking In a Customer</Title>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="green">Step 1</Tag> Create/Select Customer
                </Title>

                <Title level={5}>For New Customers:</Title>
                <ol>
                  <li>Click "Create Waiver" or "Add Customer"</li>
                  <li>Fill in customer information:
                    <ul>
                      <li><Text strong>First Name</Text> (required)</li>
                      <li><Text strong>Last Name</Text> (required)</li>
                      <li><Text strong>Email</Text> (optional but recommended)</li>
                      <li><Text strong>Phone Number</Text> (optional but recommended)</li>
                    </ul>
                  </li>
                </ol>

                <Title level={5}>For Returning Customers:</Title>
                <ol>
                  <li>Click "Select Existing Customer"</li>
                  <li>Search by name, email, or phone</li>
                  <li>Select the customer from the list</li>
                </ol>

                <Alert
                  message={<><span>✓</span> Tip</>}
                  description="Always search for the customer first to avoid creating duplicate records!"
                  type="success"
                  
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="green">Step 2</Tag> Verify Identity
                </Title>

                <Title level={5}>ID Verification:</Title>
                <ol>
                  <li><Text strong>Ask for ID</Text> - Request government-issued ID</li>
                  <li><Text strong>ID Type</Text> - Select type from dropdown:
                    <ul>
                      <li>Driver's License</li>
                      <li>State ID</li>
                      <li>Passport</li>
                      <li>Other</li>
                    </ul>
                  </li>
                  <li><Text strong>ID Number</Text> - Enter the ID number</li>
                  <li><Text strong>Upload ID Photo</Text>:
                    <ul>
                      <li>Click "Upload ID"</li>
                      <li>Take photo of the ID or select file</li>
                      <li>Make sure photo is clear</li>
                    </ul>
                  </li>
                </ol>

                <Title level={5}>Signature:</Title>
                <ol>
                  <li>Ask customer to sign</li>
                  <li>They can sign on tablet/signature pad</li>
                  <li>Or upload a signature image</li>
                </ol>

                <Alert
                  message={<><span /> Important</>}
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Always verify the ID matches the customer</li>
                      <li>Photo should be clear enough to read</li>
                      <li>Keep signature on file</li>
                    </ul>
                  }
                  type="warning"
                  
                />
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="green">Step 3</Tag> Process Check-In
                </Title>
                <Paragraph>
                  After customer information is saved, the Check-In popup opens automatically.
                </Paragraph>

                <Title level={5}>Entry Information:</Title>
                <ol>
                  <li>
                    <Text strong>Number of Additional Persons</Text>
                    <ul>
                      <li>How many people are with the customer?</li>
                      <li>Enter "0" if customer is alone</li>
                      <li>Enter "1" if customer has 1 person with them</li>
                      <li>The display shows as "1 + X" (customer + additional)</li>
                    </ul>
                  </li>
                  <li>
                    <Text strong>Entry Fee/Payment:</Text>
                    <ul>
                      <li><Text strong>Amount</Text> (required) - Enter the entry fee
                        <ul>
                          <li>Usually a set amount (e.g., $10, $25)</li>
                          <li>Check current entry fee policy</li>
                        </ul>
                      </li>
                      <li><Text strong>Payment Method</Text> (required) - How they're paying
                        <ul>
                          <li>Cash, Card, Check, etc.</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Text strong>Employee Signature</Text>
                    <ul>
                      <li>Your signature authorizing entry</li>
                      <li>Sign on pad or upload signature</li>
                    </ul>
                  </li>
                </ol>

                <Title level={5}>How to Complete Check-In:</Title>
                <ol>
                  <li>Enter all required information</li>
                  <li>Verify the amount paid</li>
                  <li>Sign as the authorizing employee</li>
                  <li>Click "Check In" button</li>
                </ol>

                <Paragraph>
                  <Text strong>What Happens:</Text>
                  <ul>
                    <li>System creates a check-in record</li>
                    <li>Generates a unique 6-character token</li>
                    <li>Records entry time</li>
                    <li>Processes payment transaction</li>
                    <li>Customer status set to "Checked In"</li>
                  </ul>
                </Paragraph>
              </Card>

              <Card className="step-card" style={{ marginBottom: 24 }}>
                <Title level={4}>
                  <Tag color="green">Step 4</Tag> Give Customer Their Token
                </Title>

                <Alert
                  message="The Token"
                  description="A unique 6-character code (e.g., 'A7K9M2') that identifies the customer during their visit. They'll need it for check-out."
                  type="info"
                  
                  style={{ marginBottom: 16 }}
                />

                <Title level={5}>What to Do:</Title>
                <ol>
                  <li>Show customer their token on screen</li>
                  <li>Write token on a badge or card</li>
                  <li>Give badge to customer</li>
                  <li>Ask customer to keep it until check-out</li>
                  <li>Optional: Print a receipt with the token</li>
                </ol>

                <Card style={{ backgroundColor: 'rgba(24, 144, 255, 0.1)', border: '1px solid rgba(24, 144, 255, 0.3)' }}>
                  <Paragraph>
                    <Text strong>Tell the Customer:</Text>
                    <ul style={{ marginBottom: 0 }}>
                      <li>"Your check-in token is <Text code>[TOKEN]</Text>"</li>
                      <li>"Please keep this token with you"</li>
                      <li>"You'll need it when you check out"</li>
                      <li>"Present this at the counter when you're ready to leave"</li>
                    </ul>
                  </Paragraph>
                </Card>
              </Card>

              <Divider />

              <Title level={3}>Checking Out a Customer</Title>
              <Paragraph>
                When a customer is ready to leave:
              </Paragraph>

              <Card style={{ marginBottom: 24 }}>
                <Title level={4}>Finding the Customer</Title>

                <Title level={5}>Method 1 - By Token:</Title>
                <ol>
                  <li>Ask customer for their token</li>
                  <li>Go to "All Check-Ins" or "Checked In List"</li>
                  <li>Type the token in the search box</li>
                  <li>Find the matching record</li>
                </ol>

                <Title level={5}>Method 2 - By Name:</Title>
                <ol>
                  <li>Ask customer's name</li>
                  <li>Search by first or last name</li>
                  <li>Look for records with status "Checked In"</li>
                  <li>Verify it's the right person</li>
                </ol>

                <Title level={4}>Processing Check-Out</Title>
                <ol>
                  <li>Click on the customer's record</li>
                  <li>Click "Check Out" button</li>
                  <li>Confirm the action</li>
                  <li>System records:
                    <ul>
                      <li>Check-out time</li>
                      <li>Your name (who processed it)</li>
                      <li>Total visit duration</li>
                    </ul>
                  </li>
                  <li>Status changes to "Checked Out"</li>
                  <li>Customer can leave facility</li>
                </ol>

                <Alert
                  message={<><span /> Important</>}
                  description={
                    <ul style={{ marginBottom: 0 }}>
                      <li>Always verify customer identity</li>
                      <li>Check if they purchased anything (handle separately)</li>
                      <li>Update any notes if needed</li>
                    </ul>
                  }
                  type="info"
                  
                />
              </Card>

              <Divider />

              <Title level={3}>Common Tasks</Title>

              <Card style={{ marginBottom: 24 }}>
                <Title level={4}>Searching for Check-Ins</Title>
                <ol>
                  <li>Go to "All Check-Ins"</li>
                  <li>Use search box to find by:
                    <ul>
                      <li>Token</li>
                      <li>Customer name</li>
                      <li>Email</li>
                      <li>Phone</li>
                    </ul>
                  </li>
                  <li>Filter by status:
                    <ul>
                      <li>Checked In (currently in facility)</li>
                      <li>Checked Out (completed visits)</li>
                    </ul>
                  </li>
                </ol>
              </Card>

              <Divider />

              <Title level={3}>Best Practices</Title>

              <Card>
                <Title level={5}>
                  <span style={{ color: '#52c41a' }} /> DO:
                </Title>
                <ul>
                  <li>Always verify customer ID</li>
                  <li>Collect payment before issuing token</li>
                  <li>Write token clearly on badge</li>
                  <li>Remind customer to keep their token</li>
                  <li>Check out customers promptly when they're ready</li>
                  <li>Search for customer before creating duplicate</li>
                </ul>

                <Title level={5}>
                  <span style={{ color: '#ff4d4f' }} /> DON'T:
                </Title>
                <ul>
                  <li>Allow entry without check-in</li>
                  <li>Lose or misplace tokens</li>
                  <li>Forget to check out customers (they'll show as still in facility)</li>
                  <li>Skip ID verification</li>
                  <li>Check in without payment</li>
                </ul>
              </Card>

              <Divider />

              <Title level={3}>Troubleshooting</Title>

              <Card style={{ marginBottom: 16 }}>
                <Alert
                  message="Cannot Find Customer"
                  description={
                    <>
                      <Text strong>Solution:</Text>
                      <ol>
                        <li>Try searching by different fields (name, email, phone)</li>
                        <li>Check spelling - try variations of name</li>
                        <li>Ask customer for any previous receipts or tokens</li>
                        <li>If truly new, create a new customer record</li>
                      </ol>
                    </>
                  }
                  type="warning"
                  style={{ marginBottom: 16 }}
                />

                <Alert
                  message="Customer Still Shows 'Checked In'"
                  description={
                    <>
                      <Text strong>Solution:</Text>
                      <ol>
                        <li>Find the customer's check-in record</li>
                        <li>Manually check them out</li>
                        <li>Note the time they actually left</li>
                        <li>This happens if check-out was forgotten</li>
                      </ol>
                    </>
                  }
                  type="warning"
                  style={{ marginBottom: 16 }}
                />

                <Alert
                  message="Token Lost"
                  description={
                    <>
                      <Text strong>Solution:</Text>
                      <ol>
                        <li>Ask for customer's name</li>
                        <li>Search in check-in list</li>
                        <li>Find records with status "Checked In"</li>
                        <li>Verify customer identity (ask for ID if needed)</li>
                        <li>Process check-out once verified</li>
                      </ol>
                    </>
                  }
                  type="warning"
                />
              </Card>

              <Divider />

              <Title level={3}>Quick Reference</Title>

              <Card style={{ backgroundColor: 'rgba(82, 196, 26, 0.1)', border: '1px solid rgba(82, 196, 26, 0.3)' }}>
                <Title level={4}>Check-In Quick Steps</Title>
                <ol>
                  <li><span style={{ color: '#52c41a' }} /> Create/Select customer → Name and contact</li>
                  <li><span style={{ color: '#52c41a' }} /> Verify ID → Upload photo of ID</li>
                  <li><span style={{ color: '#52c41a' }} /> Get signature → Customer signs</li>
                  <li><span style={{ color: '#52c41a' }} /> Enter payment → Entry fee amount and method</li>
                  <li><span style={{ color: '#52c41a' }} /> Generate token → 6-character code</li>
                  <li><span style={{ color: '#52c41a' }} /> Give token to customer → Badge or receipt</li>
                </ol>
              </Card>

              <Card style={{ backgroundColor: 'rgba(250, 173, 20, 0.1)', border: '1px solid rgba(250, 173, 20, 0.3)', marginTop: 16 }}>
                <Title level={4}>Check-Out Quick Steps</Title>
                <ol>
                  <li><span style={{ color: '#faad14' }} /> Get token from customer</li>
                  <li><span style={{ color: '#faad14' }} /> Search by token or name</li>
                  <li><span style={{ color: '#faad14' }} /> Click "Check Out"</li>
                  <li><span style={{ color: '#faad14' }} /> Confirm action</li>
                  <li><span style={{ color: '#faad14' }} /> Customer may leave</li>
                </ol>
              </Card>

              <Divider />

              <Card style={{ backgroundColor: 'rgba(24, 144, 255, 0.1)', border: '1px solid rgba(24, 144, 255, 0.3)' }}>
                <Title level={4}>Need Help?</Title>
                <Paragraph>
                  <ul>
                    <li><Text strong>Ask a Supervisor</Text> - For policy questions or complex situations</li>
                    <li><Text strong>Contact IT Support</Text> - For technical issues</li>
                    <li><Text strong>Ask Colleagues</Text> - They may have encountered the same issue</li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  <Text strong>Remember:</Text> Be accurate, be professional, verify identity, and always collect payment before issuing tokens!
                </Paragraph>
              </Card>
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckInGuide;
