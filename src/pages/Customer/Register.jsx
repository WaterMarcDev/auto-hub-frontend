import React, { useRef, useState } from "react";
import { Card, Form, Input, Button, notification, Row, Col, Select } from "antd";
import { uploadAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import CameraUpload from "../../components/CameraUpload";
import SignatureCanvas from "../../components/SignatureCanvas";
import { useCustomerCreate } from "../../hooks/useCustomerCreate";
import { MAX_DESCRIPTION_LENGTH, descriptionRule } from "../../utils/descriptionLimit";
import { emailRule, normalizeEmail } from "../../utils/email";
import {
    US_ID_PROOF_TYPES,
    getIdProofType,
    normalizeIdProofNumber,
} from "../../utils/usIdProof";
import {
    NAME_MAX_LENGTH,
    MOBILE_MAX_LENGTH,
    EMAIL_MAX_LENGTH,
    notOnlySpacesRule,
    cleanText,
    canDecodeImage,
    showCorruptImageError,
} from "./customerFormUtils";
import { normalizePhone, usPhoneRule, US_PHONE_PLACEHOLDER, US_PHONE_MAX_LENGTH } from "../../utils/phone";

const CustomerRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const savingRef = useRef(false); // blocks a second submit while saving
    const [form] = Form.useForm();
    const [uploadedIdProof, setUploadedIdProof] = useState(null);
    const [signatureUrl, setSignatureUrl] = useState(null);
    // Bumped to remount the upload / signature widgets, so clearing the form
    // also clears their previews (SignatureCanvas keeps its own preview).
    const [widgetsKey, setWidgetsKey] = useState(0);
    const [notificationApi, contextHolder] = notification.useNotification();
    // Same name as an existing customer: staff compare the profiles first.
    const { createCustomer, sameNameModal } = useCustomerCreate();

    const idProofType = getIdProofType(Form.useWatch("idProofType", form));

    const clearForm = () => {
        form.resetFields();
        setUploadedIdProof(null);
        setSignatureUrl(null);
        setWidgetsKey((k) => k + 1);
    };

    const onFinish = async (values) => {
        if (savingRef.current) return;
        savingRef.current = true;
        setLoading(true);
        try {
            const customerPayload = {
                firstName: cleanText(values.firstName),
                lastName: cleanText(values.lastName),
                mobileNo: cleanText(values.mobileNo),
                email: cleanText(values.email),
                idProofType: values.idProofType,
                idProofNumber: values.idProofNumber,
                description: cleanText(values.description),
            };

            if (uploadedIdProof) {
                customerPayload.idProofImage = uploadedIdProof;
            }

            if (signatureUrl) customerPayload.signatureImage = signatureUrl;

            try {
                const result = await createCustomer(customerPayload);
                if (result.cancelled) return; // popup closed: nothing saved
                if (result.existing) {
                    // Staff confirmed it is the existing customer: no new record.
                    const key = "existing-customer";
                    notificationApi.info({
                        key,
                        message: "Existing customer used",
                        description: `${[result.customer.firstName, result.customer.lastName].filter(Boolean).join(" ")} is already registered. No new customer was created.`,
                        duration: 8,
                        btn: (
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => {
                                    notificationApi.destroy(key);
                                    navigate(`/waivers/${result.customer._id}`);
                                }}
                            >
                                View existing customer
                            </Button>
                        ),
                    });
                    clearForm();
                    return;
                }
                notificationApi.success({
                    message: "Success",
                    description: "Customer registered successfully",
                    duration: 3,
                });
                clearForm();
            } catch (custErr) {
                console.error("Customer creation failed:", custErr);
                // Duplicate: no new customer is created; point to the existing one.
                const existing =
                    custErr?.response?.status === 409 ? custErr?.response?.data?.existingCustomer : null;
                if (existing) {
                    const name =
                        [existing.firstName, existing.lastName].filter(Boolean).join(" ") || "This customer";
                    const key = "existing-customer";
                    notificationApi.info({
                        key,
                        message: "Customer already exists",
                        description: `${name}${existing.mobileNo ? ` (${existing.mobileNo})` : ""} is already registered. No duplicate was created; please use the existing customer.`,
                        duration: 8,
                        btn: (
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => {
                                    notificationApi.destroy(key);
                                    navigate(`/waivers/${existing._id}`);
                                }}
                            >
                                View existing customer
                            </Button>
                        ),
                    });
                    return;
                }
                const duplicate = custErr?.response?.status === 409;
                notificationApi.error({
                    message: duplicate ? "Customer already exists" : "Error",
                    description:
                        custErr?.response?.data?.error ||
                        custErr?.response?.data?.message ||
                        custErr.message ||
                        "Failed to register customer",
                    duration: duplicate ? 6 : 3,
                });
            }
        } catch (err) {
            console.error(err);
            notificationApi.error({
                message: "Error",
                description: err.message || "An unexpected error occurred",
                duration: 3,
            });
        } finally {
            savingRef.current = false;
            setLoading(false);
        }
    };

    return (
        <div>
            {contextHolder}
            {sameNameModal}
            <div className="page-title-box">
                <div className="page-title">
                    <h4>Register Customer</h4>
                    <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item">
                            <a href="javascript: void(0);">Customers</a>
                        </li>
                        <li className="breadcrumb-item active">Register</li>
                    </ol>
                </div>
            </div>

            <div className="container-fluid">
                <div className="page-content-wrapper">
                    <Card title="Register New Customer">
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        label="First Name"
                                        name="firstName"
                                        rules={[
                                            { required: true, whitespace: true, message: "First name is required" },
                                            { max: NAME_MAX_LENGTH, message: `First name can be at most ${NAME_MAX_LENGTH} characters` },
                                        ]}
                                    >
                                        <Input placeholder="Enter First Name" maxLength={NAME_MAX_LENGTH} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Last Name"
                                        name="lastName"
                                        rules={[
                                            { required: true, whitespace: true, message: "Last name is required" },
                                            { max: NAME_MAX_LENGTH, message: `Last name can be at most ${NAME_MAX_LENGTH} characters` },
                                        ]}
                                    >
                                        <Input placeholder="Enter Last Name" maxLength={NAME_MAX_LENGTH} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Mobile No."
                                        name="mobileNo"
                                        normalize={normalizePhone}
                                        rules={[usPhoneRule]}
                                    >
                                        <Input placeholder={`${US_PHONE_PLACEHOLDER} (optional)`} maxLength={US_PHONE_MAX_LENGTH} inputMode="tel" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        normalize={normalizeEmail}
                                        rules={[emailRule]}
                                    >
                                        <Input placeholder="Enter a valid e-mail (optional)" maxLength={EMAIL_MAX_LENGTH} inputMode="email" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        label="ID Proof Type"
                                        name="idProofType"
                                        rules={[
                                            { required: true, message: "Please select the ID proof type" },
                                        ]}
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
                                        label="ID Proof Number"
                                        name="idProofNumber"
                                        dependencies={["idProofType"]}
                                        normalize={normalizeIdProofNumber}
                                        extra={idProofType ? `${idProofType.value}: ${idProofType.hint}` : undefined}
                                        rules={[
                                            { required: true, message: "Please enter ID proof number" },
                                            ({ getFieldValue }) => ({
                                                validator: (_, value) => {
                                                    if (!value) return Promise.resolve();
                                                    const type = getIdProofType(getFieldValue("idProofType"));
                                                    if (!type) {
                                                        return Promise.reject(new Error("Select the ID Proof Type first"));
                                                    }
                                                    return type.pattern.test(value)
                                                        ? Promise.resolve()
                                                        : Promise.reject(new Error(`Enter a valid ${type.value} number: ${type.hint}`));
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
                                                        key={widgetsKey}
                                                        onImageUpload={async (res) => {
                                                            const imageUrl = res?.imageUrl || res?.url || res;
                                                            // A file with an image extension but unreadable
                                                            // content (corrupted) is not accepted as ID proof.
                                                            if (!(await canDecodeImage(uploadAPI.getImageUrl(imageUrl)))) {
                                                                showCorruptImageError();
                                                                return;
                                                            }
                                                            setUploadedIdProof(imageUrl);
                                                            form.setFieldsValue({ idProofImage: imageUrl });
                                                            form.validateFields(["idProofImage"]).catch(() => {});
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
                                                            setUploadedIdProof(null);
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
                                            { required: true, message: "Please draw the signature and click Save Signature" },
                                        ]}
                                    >
                                        <div style={{ minHeight: 220 }}>
                                            <SignatureCanvas
                                                key={widgetsKey}
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

                            <Form.Item
                                rules={[descriptionRule, notOnlySpacesRule("Description")]}
                                label="Description"
                                name="description"
                            >
                                <Input.TextArea maxLength={MAX_DESCRIPTION_LENGTH} showCount rows={6} />
                            </Form.Item>

                            <Form.Item>
                                <Button style={{ marginRight: 12 }} onClick={clearForm} disabled={loading}>Cancel</Button>
                                <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
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

export default CustomerRegister;
