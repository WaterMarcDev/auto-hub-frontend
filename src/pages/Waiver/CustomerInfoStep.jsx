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

// Formats 10 digits as (XXX) XXX-XXXX
const formatPhoneNumber = (value, previousValue = "") => {
  if (!value) return "";
  let raw = value;
  // If user hit backspace on ') ' or '-' or ')', remove the preceding digit
  if (previousValue && previousValue.length > value.length) {
    if (previousValue.endsWith(") ") && value === previousValue.slice(0, -1)) {
      raw = value.slice(0, -2);
    } else if (previousValue.endsWith(")") && value === previousValue.slice(0, -1)) {
      raw = value.slice(0, -1);
    } else if (previousValue.endsWith("-") && value === previousValue.slice(0, -1)) {
      raw = value.slice(0, -1);
    }
  }
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.length < 3) return `(${digits}`;
  if (digits.length === 3) {
    return value.length > (previousValue || "").length ? `(${digits}) ` : `(${digits}`;
  }
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

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
        initialValues={{
          type: DEFAULT_CUSTOMER_TYPE,
          ...initialValues,
          ...(initialValues.mobileNo ? { mobileNo: formatPhoneNumber(initialValues.mobileNo) } : {}),
        }}
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
            <Form.Item
              label="Mobile No."
              name="mobileNo"
              rules={[
                { required: true, message: "Mobile number is required" },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const digits = String(value).replace(/\D/g, "");
                    if (digits.length !== 10) {
                      return Promise.reject(
                        new Error("Mobile number must be exactly 10 digits")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder="Please enter your mobile number"
                maxLength={14}
                onChange={(e) => {
                  const prev = form.getFieldValue("mobileNo") || "";
                  const formatted = formatPhoneNumber(e.target.value, prev);
                  form.setFieldsValue({ mobileNo: formatted });
                }}
              />
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
            <Form.Item label="ID Proof Type" name="idProofType">
              <Input placeholder="e.g. NIC, Passport (optional)" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="ID Proof Number" name="idProofNumber">
              <Input placeholder="Enter ID proof number (optional)" />
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
            <Form.Item label="Signature (optional)" name="signature">
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
