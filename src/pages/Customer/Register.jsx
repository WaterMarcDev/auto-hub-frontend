import React, { useState } from "react";
import { Card, Form, Input, Button, notification, Row, Col } from "antd";
import { customerAPI, uploadAPI } from "../../utils/api";
import CameraUpload from "../../components/CameraUpload";
import SignatureCanvas from "../../components/SignatureCanvas";

const CustomerRegister = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [uploadedIdProof, setUploadedIdProof] = useState(null);
    const [signatureUrl, setSignatureUrl] = useState(null);
    const [notificationApi, contextHolder] = notification.useNotification();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const customerPayload = {
                firstName: values.firstName,
                lastName: values.lastName,
                mobileNo: values.mobileNo,
                email: values.email,
                idProofType: values.idProofType,
                idProofNumber: values.idProofNumber,
                description: values.description,
            };

            if (uploadedIdProof) {
                customerPayload.idProofImage = uploadedIdProof;
            }

            if (signatureUrl) customerPayload.signatureImage = signatureUrl;

            try {
                await customerAPI.create(customerPayload);
                notificationApi.success({
                    message: "Success",
                    description: "Customer registered successfully",
                    duration: 3,
                });
                setUploadedIdProof("");
                setSignatureUrl(null);
                form.resetFields();
            } catch (custErr) {
                console.error("Customer creation failed:", custErr);
                notificationApi.error({
                    message: "Error",
                    description:
                        custErr?.response?.data?.error ||
                        custErr.message ||
                        "Failed to register customer",
                    duration: 3,
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
            setLoading(false);
        }
    };

    return (
        <div>
            {contextHolder}
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
                                                    const digits = String(value).replace(/[^0-9]/g, "");
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

                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        label="ID Proof Type"
                                        name="idProofType"
                                        rules={[
                                            { required: true, message: "Please enter ID proof type" },
                                        ]}
                                    >
                                        <Input placeholder="e.g. NIC, Passport, DL" />
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
                                <Button style={{ marginRight: 12 }} onClick={() => form.resetFields()}>Cancel</Button>
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

export default CustomerRegister;
