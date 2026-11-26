import { useRef, useState } from "react";
import { Form, Input, Button, Row, Col, message } from "antd";
import api from "../utils/api";
import { emailRule, normalizeEmail } from "../utils/email";
import { normalizePhone, usPhoneRule, US_PHONE_PLACEHOLDER, US_PHONE_MAX_LENGTH } from "../utils/phone";
import { yearRule, leadNameRules, LEAD_NAME_MAX_LENGTH, cleanText } from "../utils/leadFormRules";
import NumericInput from "./NumericInput";

// Same limits as the server (junkCar.controller.js: JUNK_CAR_TEXT_LIMITS /
// JUNK_CAR_CRM_LIMITS / MAX_LOCATION_LENGTH).
const LIMITS = {
    email: 100,
    make: 50,
    model: 50,
    engineOrVin: 17,
    condition: 50,
    location: 200,
};

const maxRule = (max, label) => ({ max, message: `${label} can be at most ${max} characters` });

// Engine / VIN: letters and digits only (stored in capitals).
const engineOrVinRule = {
    pattern: /^[A-Za-z0-9]*$/,
    message: "Enter letters and digits only (no spaces or symbols)",
};
const toEngineOrVin = (value) =>
    typeof value === "string" ? value.replace(/[^A-Za-z0-9]/g, "").toUpperCase() : value;

const JunkCarRequest = (props) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const submittingRef = useRef(false);

    // Saved only when Submit is pressed (no autosave while typing, so an
    // unfinished request never appears in the list or the badge count), as one
    // request: further clicks are ignored until it finishes, so only one
    // message is shown. Requests added here (in the CRM) are tagged "offline";
    // the website form gets "website" from the backend.
    const handleSubmit = async (values) => {
        if (submittingRef.current) return; // one click = one request
        submittingRef.current = true;
        setLoading(true);
        try {
            const payload = {
                name: cleanText(values.name),
                email: cleanText(values.email),
                phone: cleanText(values.phone),
                year: values.year ? parseInt(values.year, 10) : undefined,
                make: cleanText(values.make),
                model: cleanText(values.model),
                engineOrVin: cleanText(values.engineOrVin),
                condition: cleanText(values.condition),
                location: cleanText(values.location),
                source: "offline",
            };
            Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

            const res = await api.post("/junk-car", payload);
            if (!res.data?.success) {
                message.error(res.data?.message || "Something went wrong");
                return;
            }
            message.success("Credentials added successfully");

            form.resetFields();

            // by shiva
            if (props.onSuccess) {
                props.onSuccess();
            }
        } catch (err) {
            console.error(err);
            message.error(err.response?.data?.message || err.message || "Something went wrong");
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Add Junk Car</h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        {/* Optional; Name, Phone or Email is needed. */}
                        <Form.Item
                            name="name"
                            label="Name"
                            dependencies={["phone", "email"]}
                            rules={leadNameRules}
                        >
                            <Input placeholder="Enter name" maxLength={LEAD_NAME_MAX_LENGTH} showCount />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="email"
                                label="Email"
                                normalize={normalizeEmail}
                                rules={[emailRule, maxRule(LIMITS.email, "Email")]}
                            >
                                <Input placeholder="Enter email" maxLength={LIMITS.email} />
                            </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="phone"
                            label="Phone"
                            normalize={normalizePhone}
                            rules={[usPhoneRule]}
                        >
                            <Input placeholder={US_PHONE_PLACEHOLDER} maxLength={US_PHONE_MAX_LENGTH} inputMode="tel" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        {/* 4 digits, 1900 to the current year (no future years). */}
                        <Form.Item
                            name="year"
                            label="Year"
                            rules={[yearRule]}
                        >
                            <NumericInput
                                decimals={false}
                                placeholder="e.g. 2013"
                                maxLength={4}
                                errorMessage="Enter digits only"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="make"
                            label="Make"
                            rules={[maxRule(LIMITS.make, "Make")]}
                        >
                            <Input placeholder="Toyota, Honda..." maxLength={LIMITS.make} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                         <Form.Item
                            name="model"
                            label="Model"
                            rules={[maxRule(LIMITS.model, "Model")]}
                        >
                            <Input placeholder="Civic, Corolla..." maxLength={LIMITS.model} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        {/* Letters and digits only; symbols and spaces are removed as typed. */}
                        <Form.Item
                            name="engineOrVin"
                            label="Engine / VIN Number"
                            normalize={toEngineOrVin}
                            rules={[engineOrVinRule, maxRule(LIMITS.engineOrVin, "Engine / VIN number")]}
                        >
                            <Input placeholder="Optional" maxLength={LIMITS.engineOrVin} showCount />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="condition"
                            label="Condition"
                            rules={[maxRule(LIMITS.condition, "Condition")]}
                        >
                            <Input placeholder="e.g. Running, Not Running" maxLength={LIMITS.condition} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="location"
                            label="Location"
                            rules={[maxRule(LIMITS.location, "Location")]}
                        >
                            <Input placeholder="Pickup location (optional)" maxLength={LIMITS.location} showCount />
                        </Form.Item>
                    </Col>
                </Row>

                <Col xs={24}>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={loading}
                            style={{ maxWidth: 200 }}
                        >
                            Submit Request
                        </Button>
                    </Form.Item>
                </Col>
            </Form>
        </div>
    );
};

export default JunkCarRequest;
