import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
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
  DatePicker,
  Typography,
} from "antd";
import { uploadAPI } from "../../utils/api";
import CameraUpload from "../../components/CameraUpload";
import SignatureCanvas from "../../components/SignatureCanvas";
import {
  CUSTOMER_TYPE_OPTIONS,
  DEFAULT_CUSTOMER_TYPE,
  getCustomerTypeLabel,
} from "./customerTypeOptions";
// Formats 10 digits as (XXX) XXX-XXXX (shared with Sell in store).
import { formatPhoneNumber } from "../../utils/phone";
import { MAX_DESCRIPTION_LENGTH, descriptionRule } from "../../utils/descriptionLimit";
import { emailError } from "../../utils/email";
import {
  US_ID_PROOF_TYPES,
  getIdProofType,
  normalizeIdProofNumber,
} from "../../utils/usIdProof";
import {
  NAME_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  notOnlySpacesRule,
  canDecodeImage,
  showCorruptImageError,
} from "../Customer/customerFormUtils";

const { Title, Text } = Typography;

// The waiver follows the paper U-PULL FORM: Full Name, Phone Number, Date,
// ID Proof type, ID Number and Signature (all required). Email, ID Proof
// Image and Description are not on the paper form; they are hidden (not
// removed) and come back by setting this to true.
const SHOW_EXTRA_WAIVER_FIELDS = false;

export const WAIVER_DATE_FORMAT = "MM/DD/YYYY";

// "John  Michael Smith" -> { firstName: "John", lastName: "Michael Smith" }.
// A one-word name keeps lastName empty (the Customer model allows that).
const splitFullName = (fullName) => {
  const words = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return { firstName: words[0] || "", lastName: words.slice(1).join(" ") };
};

const CustomerInfoStep = ({ initialValues = {}, onComplete }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [uploadedIdProof, setUploadedIdProof] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);

  // Single source of truth for the contextual heading: the same `type` field
  // bound to the dropdown. Form.useWatch re-renders on every change so the
  // indicator can never go stale relative to the selection.
  const watchedType = Form.useWatch("type", form);
  const selectedType = watchedType || DEFAULT_CUSTOMER_TYPE;
  const selectedLabel = getCustomerTypeLabel(selectedType) || "Buyer";

  // ID proof number format follows the selected US ID type.
  const idProofType = getIdProofType(Form.useWatch("idProofType", form));

  // True while the parent is saving: Save is disabled so a double click
  // cannot create the customer twice.
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const handleFinish = async (values) => {
    if (savingRef.current) return;
    const { firstName, lastName } = splitFullName(values.fullName);
    const payload = {
      type: values.type || DEFAULT_CUSTOMER_TYPE,
      firstName,
      lastName,
      mobileNo: values.mobileNo,
      waiverDate: values.waiverDate ? values.waiverDate.format("YYYY-MM-DD") : undefined,
      email: values.email || "",
      idProofType: values.idProofType || "",
      idProofNumber: values.idProofNumber || "",
      idProofImage: values.idProofImage || "",
      signature: values.signature || "",
      // Only-spaces descriptions are not saved.
      description: (values.description || "").trim(),
    };

    if (!onComplete) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await onComplete(payload);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const initialFullName =
    initialValues.fullName ||
    [initialValues.firstName, initialValues.lastName].filter(Boolean).join(" ");

  return (
    <Card title="Waiver Form">
      <Form
        layout="vertical"
        form={form}
        name="customerInfo"
        initialValues={{
          type: DEFAULT_CUSTOMER_TYPE,
          ...initialValues,
          fullName: initialFullName || undefined,
          waiverDate: initialValues.waiverDate ? dayjs(initialValues.waiverDate) : dayjs(),
          ...(initialValues.mobileNo ? { mobileNo: formatPhoneNumber(initialValues.mobileNo) } : {}),
        }}
        onFinish={handleFinish}
      >
        {/* Customer Type: a dropdown only while more than one type is enabled. */}
        {CUSTOMER_TYPE_OPTIONS.length === 1 ? (
          // Only one type (Buyer): no field shown, the "Buyer Waiver Form"
          // banner below already says it. The value is still submitted.
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>
        ) : (
          <Form.Item
            name="type"
            label="Customer Type"
            rules={[{ required: true, message: "Please select customer type" }]}
          >
            <Select placeholder="Select customer type" options={CUSTOMER_TYPE_OPTIONS} />
          </Form.Item>
        )}

        {/* Dynamic context indicator — derives from the same `type` value */}
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={`${selectedLabel} Waiver Form`}
          description={`You are completing this waiver for a ${selectedLabel}`}
        />

        {/* Header and release text, as at the top of the paper U-PULL FORM */}
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ marginBottom: 0 }}>
            WAIVER FORM
          </Title>
          <Text style={{ display: "block", fontSize: 15 }}>Autohub Express</Text>
          <Text strong style={{ display: "block", marginBottom: 12 }}>
            242 Monmouth Rd, Wrightstown, NJ 08562
          </Text>
          <div
            style={{
              backgroundColor: "#fff8e1",
              border: "2px solid #ffc107",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <h4 style={{ color: "#d84315", marginBottom: "16px", fontWeight: "bold" }}>
              WAIVER AND LIABILITY RELEASE
            </h4>
            <div style={{ lineHeight: "1.8", color: "#424242" }}>
              <p style={{ marginBottom: "12px" }}>
                <strong>All parts are sold 'as is,' with no warranties, expressed or implied.</strong> By entering the premises, individuals do so at their own risk and agree to release Autohub Management, its employees, and agents from any liability for physical injuries or incidents that may occur while on-site.
              </p>
              <p style={{ marginBottom: "12px" }}>
                Customers further agree to hold Autohub Management, its employees, and agents harmless from any liability related to part malfunctions or any incidents involving a vehicle or person after part installation.
              </p>
              <p style={{ marginBottom: "12px", color: "#d84315", fontWeight: "600" }}>
                For your safety, closed-toe shoes, shirts, and long pants are required to enter the yard.
              </p>
              <p style={{ marginBottom: "0", fontWeight: "600" }}>
                This form must be completed in full before a customer enters the yard.
              </p>
            </div>
          </div>
        </div>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Full Name"
              name="fullName"
              normalize={(v) => (typeof v === "string" ? v.replace(/\s{2,}/g, " ") : v)}
              rules={[
                { required: true, whitespace: true, message: "Full name is required" },
                {
                  max: FULL_NAME_MAX_LENGTH,
                  message: `Full name can be at most ${FULL_NAME_MAX_LENGTH} characters`,
                },
                {
                  // Saved as first name (first word) + last name (the rest),
                  // each at most NAME_MAX_LENGTH characters.
                  validator: (_, value) => {
                    const { firstName, lastName } = splitFullName(value);
                    if (firstName.length > NAME_MAX_LENGTH) {
                      return Promise.reject(
                        new Error(`The first name can be at most ${NAME_MAX_LENGTH} characters`)
                      );
                    }
                    if (lastName.length > NAME_MAX_LENGTH) {
                      return Promise.reject(
                        new Error(`The last name can be at most ${NAME_MAX_LENGTH} characters`)
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Enter Full Name" maxLength={FULL_NAME_MAX_LENGTH} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name="mobileNo"
              rules={[
                { required: true, message: "Phone number is required" },
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const digits = String(value).replace(/\D/g, "");
                    if (digits.length !== 10) {
                      return Promise.reject(
                        new Error("Phone number must be exactly 10 digits")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder="(XXX) XXX-XXXX"
                maxLength={14}
                inputMode="tel"
                onChange={(e) => {
                  const prev = form.getFieldValue("mobileNo") || "";
                  const formatted = formatPhoneNumber(e.target.value, prev);
                  form.setFieldsValue({ mobileNo: formatted });
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Date"
              name="waiverDate"
              rules={[{ required: true, message: "Date is required" }]}
            >
              <DatePicker
                format={WAIVER_DATE_FORMAT}
                placeholder={WAIVER_DATE_FORMAT}
                style={{ width: "100%" }}
                disabledDate={(d) => d && d.isAfter(dayjs(), "day")}
              />
            </Form.Item>
          </Col>

          {SHOW_EXTRA_WAIVER_FIELDS && (
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                normalize={(v) => (typeof v === "string" ? v.trim() : v)}
                validateTrigger={["onChange", "onBlur"]}
                rules={[
                  {
                    validator: (_, value) => {
                      const error = value ? emailError(value) : null;
                      return error ? Promise.reject(new Error(error)) : Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  type="email"
                  inputMode="email"
                  maxLength={254}
                  placeholder="Enter a valid e-mail (optional)"
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="ID Proof Type"
              name="idProofType"
              rules={[{ required: true, message: "ID proof type is required" }]}
            >
              <Select
                placeholder="Select a US ID type"
                options={US_ID_PROOF_TYPES.map((t) => ({ value: t.value, label: t.value }))}
                onChange={() => {
                  // Re-check the number against the new type.
                  if (form.getFieldValue("idProofNumber")) form.validateFields(["idProofNumber"]);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="ID Number"
              name="idProofNumber"
              dependencies={["idProofType"]}
              normalize={normalizeIdProofNumber}
              extra={idProofType ? `${idProofType.value}: ${idProofType.hint}` : undefined}
              rules={[
                { required: true, message: "ID number is required" },
                ({ getFieldValue }) => ({
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const type = getIdProofType(getFieldValue("idProofType"));
                    if (!type) {
                      return Promise.reject(new Error("Select the ID Proof Type first"));
                    }
                    return type.pattern.test(value)
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(`Enter a valid ${type.value} number: ${type.hint}`)
                        );
                  },
                }),
              ]}
            >
              <Input
                placeholder={idProofType ? idProofType.placeholder : "Select the ID Proof Type first"}
                maxLength={idProofType?.maxLength ?? 15}
                disabled={!idProofType}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24} align="middle">
          {SHOW_EXTRA_WAIVER_FIELDS && (
            <Col span={12}>
              {/* ID Proof Image is optional (backend validates .optional()). */}
              <Form.Item label="ID Proof Image" name="idProofImage">
                <div style={{ minHeight: 220 }}>
                  {!uploadedIdProof ? (
                    <CameraUpload
                      onImageUpload={async (res) => {
                        const imageUrl = res?.imageUrl || res?.url || res;
                        // Reject a corrupted file that only has an image extension.
                        if (!(await canDecodeImage(uploadAPI.getImageUrl(imageUrl)))) {
                          showCorruptImageError();
                          return;
                        }
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
          )}

          <Col span={SHOW_EXTRA_WAIVER_FIELDS ? 12 : 24}>
            <Form.Item
              label="Signature"
              name="signature"
              rules={[
                {
                  required: true,
                  message: "Please draw your signature and click Save Signature",
                },
              ]}
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

        {SHOW_EXTRA_WAIVER_FIELDS && (
          <Form.Item
            rules={[descriptionRule, notOnlySpacesRule("Description")]}
            label="Description"
            name="description"
          >
            <Input.TextArea maxLength={MAX_DESCRIPTION_LENGTH} showCount rows={6} />
          </Form.Item>
        )}

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
            <strong>I have read and agreed to the above waiver and liability release terms</strong>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button style={{ marginRight: 12 }} onClick={() => navigate("/waivers")}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={saving} disabled={saving}>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CustomerInfoStep;
