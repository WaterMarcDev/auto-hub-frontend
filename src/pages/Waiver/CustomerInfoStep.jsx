import React, { useState } from "react";
import { Card, Form, Input, Row, Col, Button, Radio } from "antd";
import { uploadAPI } from "../../utils/api";
import CameraUpload from "../../components/CameraUpload";
import SignatureCanvas from "../../components/SignatureCanvas";

// Seller-style customer form: radio on first row, two-column layout from second row
const CustomerInfoStep = ({ initialValues = {}, onComplete }) => {
  const [form] = Form.useForm();
  const [uploadedIdProof, setUploadedIdProof] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);

  const handleFinish = (values) => {
    const payload = {
      type: values.type || "seller",
      firstName: values.firstName,
      lastName: values.lastName,
      mobileNo: values.mobileNo,
      email: values.email || "",
      idProofType: values.idProofType || "",
      idProofNumber: values.idProofNumber || "",
      idProofImage: values.idProofImage || "",
      signature: values.signature || "",
      description: values.description || "",
    };

    if (onComplete) onComplete(payload);
  };

  return (
    <Card title="Waiver form">
      <Form
        layout="vertical"
        form={form}
        name="customerInfo"
        initialValues={{ type: "seller", ...initialValues }}
        onFinish={handleFinish}
      >
        {/* First row: radio full width */}
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="type"
              label="Customer type"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value="seller">Seller</Radio>
                <Radio value="buyer">Buyer</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        {/* Two-column layout from here */}
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input placeholder="Enter First Name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input placeholder="Enter Last Name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Mobile No." name="mobileNo">
              <Input placeholder="Enter Mobile No (optional)" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Email" name="email">
              <Input placeholder="Enter a valid e-mail (optional)" />
            </Form.Item>
          </Col>
        </Row>

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
                { required: true, message: "Please enter ID proof number" },
              ]}
            >
              <Input placeholder="Enter ID proof number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24} align="middle">
          <Col span={12}>
            <Form.Item
              label="ID Proof Image"
              name="idProofImage"
              rules={[
                { required: true, message: "Please upload ID proof image" },
              ]}
            >
              <div style={{ minHeight: 220 }}>
                {!uploadedIdProof ? (
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
                ) : (
                  <div>
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
              name="signature"
              rules={[{ required: true, message: "Please provide signature" }]}
            >
              <div style={{ minHeight: 220 }}>
                <SignatureCanvas
                  value={signatureUrl}
                  onChange={(val) => {
                    setSignatureUrl(val);
                    form.setFieldsValue({ signature: val });
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
          <Button style={{ marginRight: 12 }}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CustomerInfoStep;
