import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Button,
  Select,
  Checkbox,
  Alert,
} from "antd";
import { uploadAPI } from "../../utils/api";
import CameraUpload from "../../components/CameraUpload";
import SignatureCanvas from "../../components/SignatureCanvas";
import {
  CUSTOMER_TYPE_OPTIONS,
  DEFAULT_CUSTOMER_TYPE,
  getCustomerTypeLabel,
} from "./customerTypeOptions";

// Waiver customer form: Customer Type dropdown on first row, two-column layout from second row
const CustomerInfoStep = ({ initialValues = {}, onComplete }) => {
  const [form] = Form.useForm();
  const [uploadedIdProof, setUploadedIdProof] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);

  // Single source of truth for the contextual heading: the same `type` field
  // bound to the dropdown. Form.useWatch re-renders on every change so the
  // indicator can never go stale relative to the selection.
  const watchedType = Form.useWatch("type", form);
  const selectedType = watchedType || DEFAULT_CUSTOMER_TYPE;
  const selectedLabel = getCustomerTypeLabel(selectedType) || "Seller";

  const handleFinish = (values) => {
    const payload = {
      type: values.type || DEFAULT_CUSTOMER_TYPE,
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
        initialValues={{ type: DEFAULT_CUSTOMER_TYPE, ...initialValues }}
        onFinish={handleFinish}
      >
        {/* First row: Customer Type dropdown (full width) */}
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="type"
              label="Customer Type"
              rules={[
                { required: true, message: "Please select customer type" },
              ]}
            >
              <Select
                placeholder="Select customer type"
                options={CUSTOMER_TYPE_OPTIONS}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Dynamic context indicator — derives from the same `type` value */}
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={`${selectedLabel} Waiver Form`}
          description={`You are completing this waiver for a ${selectedLabel}`}
        />

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
            {/* ID Proof Image is optional (backend validates .optional()).
                Previous rule preserved for recovery:
                rules={[{ required: true, message: "Please upload ID proof image" }]} */}
            <Form.Item label="ID Proof Image" name="idProofImage">
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

        {/* Waiver Terms and Conditions */}
        <div
          style={{
            backgroundColor: "#fff8e1",
            border: "2px solid #ffc107",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ color: "#d84315", marginBottom: "16px", fontWeight: "bold" }}>
            WAIVER AND LIABILITY RELEASE
          </h4>
          <div style={{ lineHeight: "1.8", color: "#424242" }}>
            <p style={{ marginBottom: "12px" }}>
              <strong>All parts are sold 'as is,' with no warranties, expressed or implied.</strong> By entering the premises, individuals do so at their own risk and agree to release RTX Management, its employees, and agents from any liability for physical injuries or incidents that may occur while on-site.
            </p>
            <p style={{ marginBottom: "12px" }}>
              Customers further agree to hold RTX Management, its employees, and agents harmless from any liability related to part malfunctions or any incidents involving a vehicle or person after part installation.
            </p>
            <p style={{ marginBottom: "0", color: "#d84315", fontWeight: "600" }}>
              For your safety, closed-toe shoes, shirts, and long pants are required to enter the yard.
            </p>
          </div>
        </div>

        <Form.Item
          name="agreeToTerms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("You must agree to the terms and conditions to proceed")),
            },
          ]}
        >
          <Checkbox>
            <strong>I have read and agree to the above waiver and liability release terms</strong>
          </Checkbox>
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
