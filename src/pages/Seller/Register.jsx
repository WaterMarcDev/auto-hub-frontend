import React, { useState } from "react";
import { Card, Form, Input, Button, message, Row, Col } from "antd";
import { sellerAPI } from "../../utils/api";
import CameraUpload from "../../components/CameraUpload";

const SellerRegister = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [uploadedDL, setUploadedDL] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values };

      // If FileUpload has uploaded data, it sets `uploadedDL` state (object or string).
      if (uploadedDL) {
        // allow either a string (url/filename) or object
        if (typeof uploadedDL === "string") payload.driversLicense = uploadedDL;
        else
          payload.driversLicense =
            uploadedDL.filename ||
            uploadedDL.file ||
            uploadedDL.path ||
            uploadedDL.url ||
            uploadedDL;
      }

      await sellerAPI.create(payload);
      message.success("Seller created successfully");
      form.resetFields();
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.error || err.message || "Failed to create seller";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title-box">
        <div className="page-title">
          <h4>Register Seller</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="javascript: void(0);">Sellers</a>
            </li>
            <li className="breadcrumb-item active">Register</li>
          </ol>
        </div>
      </div>

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card title="Register New Seller">
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
                      { required: true, message: "Mobile number is required" },
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
                    <Input placeholder="Enter Mobile No" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Enter a valid e-mail",
                      },
                    ]}
                  >
                    <Input placeholder="Enter a valid e-mail" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Upload DL - DMB">
                <CameraUpload
                  onImageUpload={(res) => {
                    // res is the uploaded result object (from uploadAPI)
                    setUploadedDL(res);
                    form.setFieldsValue({ driversLicense: res });
                  }}
                  autoUpload={true}
                  multiple={false}
                  showPreview={false}
                />
              </Form.Item>

              <Form.Item label="Description" name="description">
                <Input.TextArea rows={6} />
              </Form.Item>

              <Form.Item>
                <Button style={{ marginRight: 12 }}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
