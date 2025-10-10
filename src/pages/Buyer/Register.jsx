import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Row, Col, notification, Spin } from "antd";
import { buyerAPI, customerAPI, uploadAPI } from "../../utils/api";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import { useParams, useNavigate } from "react-router-dom";
import CameraUpload from "../../components/CameraUpload";
import SignatureCanvas from "../../components/SignatureCanvas";

const BuyerRegister = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [form] = Form.useForm();
  const [uploadedIdProof, setUploadedIdProof] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const fetchBuyerData = async () => {
    setFetchLoading(true);
    try {
      const response = await buyerAPI.getById(id);
      const buyer = response.data || response;
      form.setFieldsValue({
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        mobileNo: buyer.mobileNo,
        email: buyer.email,
        description: buyer.description,
      });
    } catch (err) {
      console.error(err);
      api.error({
        message: "Error",
        description: "Failed to load buyer data",
        placement: "topRight",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchBuyerData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values };
      if (isEditMode) {
        await buyerAPI.update(id, payload);
        api.success({
          message: "Success",
          description: "Buyer updated successfully",
          placement: "topRight",
        });
        setTimeout(() => navigate("/buyer/list"), 1000);
      } else {
        // Create customer record (no separate buyer entity)
        const customerPayload = {
          type: "buyer",
          firstName: values.firstName,
          lastName: values.lastName,
          mobileNo: values.mobileNo,
          email: values.email,
          idProofType: values.idProofType,
          idProofNumber: values.idProofNumber,
        };

        if (uploadedIdProof) {
          customerPayload.idProofImage = uploadedIdProof;
        }

        if (signatureUrl) customerPayload.signatureImage = signatureUrl;

        try {
          await customerAPI.create(customerPayload);
          api.success({
            message: "Success",
            description: "Buyer created successfully",
            placement: "topRight",
          });
          // clear previews
          setUploadedIdProof("");
          setSignatureUrl(null);
          form.resetFields();
        } catch (custErr) {
          console.error("Customer creation failed:", custErr);
          api.error({
            message: "Error",
            description:
              custErr?.response?.data?.error ||
              custErr.message ||
              "Failed to create customer",
            placement: "topRight",
          });
        }
      }
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        `Failed to ${isEditMode ? "update" : "create"} buyer`;
      api.error({
        message: "Error",
        description: errMsg,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <TitleBox
        title={isEditMode ? "Edit Buyer" : "Register Buyer"}
        routes={["Buyers"]}
        current={isEditMode ? "Edit" : "Register"}
      />

      <PageContentWrapper>
        <Card title={isEditMode ? "Edit Buyer" : "Register New Buyer"}>
          {fetchLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[
                      { required: true, message: "First name is required" },
                    ]}
                  >
                    <Input placeholder="Enter First Name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[
                      { required: true, message: "Last name is required" },
                    ]}
                  >
                    <Input placeholder="Enter Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="Mobile No."
                    name="mobileNo"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          // Normalize: strip spaces, dashes, parentheses
                          const digits = String(value).replace(/[^0-9]/g, "");
                          // Accept 10 digits (US) or 11 digits starting with '1'
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
                              "Enter a valid US mobile number (10 digits, optionally prefixed with '1')"
                            )
                          );
                        },
                      },
                    ]}
                  >
                    <Input placeholder="Enter Mobile No (optional)" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      {
                        type: "email",
                        message: "Enter a valid e-mail",
                      },
                    ]}
                  >
                    <Input placeholder="Enter a valid e-mail (optional)" />
                  </Form.Item>
                </Col>
              </Row>

              {/* New Customer fields: ID proof type/number, image and signature (order matches Seller) */}
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="ID Proof Type"
                    name="idProofType"
                    rules={[
                      { required: true, message: "Please enter ID proof type" },
                    ]}
                  >
                    <Input placeholder="e.g. NIC, Passport" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="ID Proof Number"
                    name="idProofNumber"
                    rules={[
                      {
                        required: true,
                        message: "Please enter ID proof number",
                      },
                    ]}
                  >
                    <Input placeholder="Enter ID proof number" />
                  </Form.Item>
                </Col>
              </Row>

              {/* ID proof and signature for customer record */}
              <Row gutter={24} align="middle">
                <Col span={12}>
                  <Form.Item
                    label="ID Proof Image"
                    name="idProofImage"
                    rules={[
                      {
                        required: true,
                        message: "Please upload ID proof image",
                      },
                    ]}
                  >
                    <div
                      style={{
                        minHeight: 220,
                        display: "flex",
                      }}
                    >
                      {!uploadedIdProof ? (
                        <div style={{ width: "100%" }}>
                          <CameraUpload
                            onImageUpload={(res) => {
                              const imageUrl = res?.imageUrl || res?.url || res;
                              setUploadedIdProof(imageUrl);
                              form.setFieldsValue({ idProofImage: imageUrl });
                            }}
                            autoUpload={true}
                            multiple={false}
                            showPreview={true}
                          />
                        </div>
                      ) : (
                        <div style={{ width: "100%" }}>
                          <div
                            style={{
                              border: "1px solid #d9d9d9",
                              borderRadius: "4px",
                              backgroundColor: "#f5f5f5",
                              textAlign: "center",
                              marginTop: "4px",
                              height: "160px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={uploadAPI.getImageUrl(uploadedIdProof)}
                              alt="ID Proof"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                          <Button
                            size="small"
                            onClick={() => {
                              setUploadedIdProof("");
                              form.setFieldsValue({ idProofImage: "" });
                            }}
                            style={{ marginTop: "16px" }}
                          >
                            Clear & Re-upload
                          </Button>
                        </div>
                      )}
                    </div>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Signature"
                    name="signatureImage"
                    rules={[
                      { required: true, message: "Please provide signature" },
                    ]}
                  >
                    <div style={{ minHeight: 220 }}>
                      <SignatureCanvas
                        value={signatureUrl}
                        onChange={(val) => {
                          setSignatureUrl(val);
                          form.setFieldsValue({ signatureImage: val });
                        }}
                      />
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Description" name="description">
                <Input.TextArea rows={6} />
              </Form.Item>

              <Form.Item>
                <Button
                  style={{ marginRight: 12 }}
                  onClick={() => navigate("/buyer/list")}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {isEditMode ? "Update" : "Save"}
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
        <div style={{ padding: "10px" }}></div>
      </PageContentWrapper>
    </div>
  );
};

export default BuyerRegister;
