import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Radio,
  Tabs,
  Button,
  Row,
  Col,
  message,
  AutoComplete,
  Card,
} from "antd";
import CameraUpload from "../../components/CameraUpload";
import SignatureCanvas from "../../components/SignatureCanvas";
import { sellerAPI, buyerAPI, uploadAPI } from "../../utils/api";

const { Option } = Select;
const { TabPane } = Tabs;

const CustomerInfoStep = ({ data, onComplete }) => {
  const [form] = Form.useForm();
  const [customerType, setCustomerType] = useState(
    data.customerType || "seller"
  );
  const [customerMode, setCustomerMode] = useState(
    data.customerMode || "select"
  );
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  // Image uploads
  const [idProofImage, setIdProofImage] = useState(data.idProofImage || "");
  const [signatureImage, setSignatureImage] = useState(
    data.signatureImage || ""
  );

  useEffect(() => {
    if (customerType === "seller" && customerMode === "select") {
      fetchSellers();
    } else if (customerType === "buyer" && customerMode === "select") {
      fetchBuyers();
    }
  }, [customerType, customerMode]);

  const fetchSellers = async (search = "") => {
    setLoadingSellers(true);
    try {
      const response = await sellerAPI.getAll({ search, limit: 50 });
      setSellers(response.data.sellers || []);
    } catch (err) {
      console.error("Error fetching sellers:", err);
      message.error("Failed to fetch sellers");
    } finally {
      setLoadingSellers(false);
    }
  };

  const fetchBuyers = async (search = "") => {
    setLoadingBuyers(true);
    try {
      const response = await buyerAPI.getAll({ search, limit: 50 });
      setBuyers(response.data.buyers || []);
    } catch (err) {
      console.error("Error fetching buyers:", err);
      message.error("Failed to fetch buyers");
    } finally {
      setLoadingBuyers(false);
    }
  };

  const handleCustomerTypeChange = (e) => {
    const newType = e.target.value;
    setCustomerType(newType);
    form.resetFields();
    setSearchValue("");
    setSelectedSeller(null);
    setSelectedBuyer(null);
  };

  const handleCustomerModeChange = (key) => {
    setCustomerMode(key);
    form.resetFields([
      "sellerId",
      "buyerId",
      "firstName",
      "lastName",
      "email",
      "mobileNo",
      "description",
    ]);
    setSearchValue("");
    setSelectedSeller(null);
    setSelectedBuyer(null);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    if (customerType === "seller") {
      fetchSellers(value);
    } else {
      fetchBuyers(value);
    }
  };

  const handleSellerSelect = (sellerId) => {
    const seller = sellers.find((s) => s._id === sellerId);
    setSelectedSeller(seller);
  };

  const handleBuyerSelect = (buyerId) => {
    const buyer = buyers.find((b) => b._id === buyerId);
    setSelectedBuyer(buyer);
  };

  const onFinish = (values) => {
    // Validate images
    if (!idProofImage) {
      message.error("Please upload ID proof image");
      return;
    }
    if (!signatureImage) {
      message.error("Please upload customer signature");
      return;
    }

    const result = {
      customerType,
      customerMode,
      idProofType: values.idProofType,
      idProofNumber: values.idProofNumber,
      idProofImage,
      signatureImage,
    };

    if (customerType === "seller") {
      if (customerMode === "select") {
        result.sellerId = values.sellerId;
        result.sellerData = null;
      } else {
        result.sellerId = null;
        result.sellerData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          mobileNo: values.mobileNo,
          description: values.description || "",
        };
      }
    } else {
      if (customerMode === "select") {
        result.buyerId = values.buyerId;
        result.buyerData = null;
      } else {
        result.buyerId = null;
        result.buyerData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email || "",
          mobileNo: values.mobileNo || "",
          description: values.description || "",
        };
      }
    }

    onComplete(result);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {/* Customer Type Selection */}
      <Form.Item label="Customer Type" required>
        <Radio.Group value={customerType} onChange={handleCustomerTypeChange}>
          <Radio.Button value="seller">Seller</Radio.Button>
          <Radio.Button value="buyer">Buyer</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {/* Select or Create Tabs */}
      <Form.Item
        label={`${customerType === "seller" ? "Seller" : "Buyer"} Information`}
        required
      >
        <Tabs activeKey={customerMode} onChange={handleCustomerModeChange}>
          <TabPane tab="Select Existing" key="select">
            {customerType === "seller" ? (
              <>
                <Form.Item
                  name="sellerId"
                  rules={[
                    { required: true, message: "Please select a seller" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Search and select seller"
                    loading={loadingSellers}
                    onSearch={handleSearch}
                    onChange={handleSellerSelect}
                    filterOption={false}
                    value={searchValue}
                    style={{ width: "100%" }}
                  >
                    {sellers.map((seller) => (
                      <Option key={seller._id} value={seller._id}>
                        {seller.firstName} {seller.lastName} - {seller.email} -{" "}
                        {seller.mobileNo}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {selectedSeller && (
                  <Card
                    size="small"
                    style={{ marginTop: 16, backgroundColor: "#f0f7ff" }}
                  >
                    <div>
                      <strong>Name:</strong> {selectedSeller.firstName}{" "}
                      {selectedSeller.lastName}
                    </div>
                    {selectedSeller.email && (
                      <div>
                        <strong>Email:</strong> {selectedSeller.email}
                      </div>
                    )}
                    {selectedSeller.mobileNo && (
                      <div>
                        <strong>Mobile:</strong> {selectedSeller.mobileNo}
                      </div>
                    )}
                    {selectedSeller.description && (
                      <div>
                        <strong>Description:</strong>{" "}
                        {selectedSeller.description}
                      </div>
                    )}
                  </Card>
                )}
              </>
            ) : (
              <>
                <Form.Item
                  name="buyerId"
                  rules={[{ required: true, message: "Please select a buyer" }]}
                >
                  <Select
                    showSearch
                    placeholder="Search and select buyer"
                    loading={loadingBuyers}
                    onSearch={handleSearch}
                    onChange={handleBuyerSelect}
                    filterOption={false}
                    value={searchValue}
                    style={{ width: "100%" }}
                  >
                    {buyers.map((buyer) => (
                      <Option key={buyer._id} value={buyer._id}>
                        {buyer.firstName} {buyer.lastName} -{" "}
                        {buyer.email || "No email"} -{" "}
                        {buyer.mobileNo || "No phone"}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {selectedBuyer && (
                  <Card
                    size="small"
                    style={{ marginTop: 16, backgroundColor: "#f0fff4" }}
                  >
                    <div>
                      <strong>Name:</strong> {selectedBuyer.firstName}{" "}
                      {selectedBuyer.lastName}
                    </div>
                    {selectedBuyer.email && (
                      <div>
                        <strong>Email:</strong> {selectedBuyer.email}
                      </div>
                    )}
                    {selectedBuyer.mobileNo && (
                      <div>
                        <strong>Mobile:</strong> {selectedBuyer.mobileNo}
                      </div>
                    )}
                    {selectedBuyer.description && (
                      <div>
                        <strong>Description:</strong>{" "}
                        {selectedBuyer.description}
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}
          </TabPane>

          <TabPane tab="Create New" key="create">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    { required: true, message: "First name is required" },
                  ]}
                >
                  <Input placeholder="Enter first name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: "Last name is required" }]}
                >
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ type: "email", message: "Enter a valid email" }]}
                >
                  <Input placeholder="Enter email (optional)" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Mobile No."
                  name="mobileNo"
                  rules={
                    customerType === "buyer"
                      ? [
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              const digits = String(value).replace(
                                /[^0-9]/g,
                                ""
                              );
                              if (
                                /^1[0-9]{10}$/.test(digits) &&
                                digits.length === 11
                              )
                                return Promise.resolve();
                              if (
                                /^[0-9]{10}$/.test(digits) &&
                                digits.length === 10
                              )
                                return Promise.resolve();
                              return Promise.reject(
                                new Error(
                                  "Enter a valid US mobile number (10 digits)"
                                )
                              );
                            },
                          },
                        ]
                      : []
                  }
                >
                  <Input placeholder="Enter mobile number (optional)" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Description" name="description">
              <Input.TextArea
                rows={3}
                placeholder="Enter any additional notes"
              />
            </Form.Item>
          </TabPane>
        </Tabs>
      </Form.Item>

      {/* ID Proof Information */}
      <div style={{ marginTop: 32, marginBottom: 16 }}>
        <h5>ID Proof Information</h5>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="ID Proof Type"
            name="idProofType"
            rules={[{ required: true, message: "Please enter ID proof type" }]}
          >
            <Input placeholder="Enter ID proof type (e.g., Driver's License, Passport)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="ID Proof Number"
            name="idProofNumber"
            rules={[
              { required: true, message: "Please enter ID proof number" },
            ]}
          >
            <Input placeholder="Enter ID proof number" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="ID Proof Image" required>
            {!idProofImage ? (
              <CameraUpload
                onImageUpload={(res) => {
                  const imageUrl = res?.imageUrl || res?.url || res;
                  setIdProofImage(imageUrl);
                }}
                autoUpload={true}
                multiple={false}
                showPreview={true}
              />
            ) : (
              <div>
                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    marginBottom: 8,
                    height: "160px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={uploadAPI.getImageUrl(idProofImage)}
                    alt="ID Proof"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <Button size="small" onClick={() => setIdProofImage("")}>
                  Clear & Re-upload
                </Button>
              </div>
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Customer Signature" required>
            <SignatureCanvas
              value={signatureImage}
              onChange={(url) => setSignatureImage(url)}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" size="large">
          Next: Transaction Details
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CustomerInfoStep;
