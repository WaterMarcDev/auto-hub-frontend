import { useRef } from "react";
import { Form, Input, Button, Row, Col, message } from "antd";
import { useLeadCapture } from "../hooks/useLeadCapture";

const PHONE_PATTERN = /^[0-9]{10}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const YEAR_PATTERN = /^\d{4}$/;

// Customer fields saved progressively while the form is being filled in.
const DRAFT_FIELDS = ["name", "email", "phone", "year", "make", "model", "engineOrVin", "condition", "location"];

// Returns the values that are safe to save right now, or null when there's
// no name / valid phone / valid email yet (the API needs one to create the
// lead). Fields that currently fail validation are left out, so they never
// overwrite what was saved before.
const buildDraft = (values) => {
    const draft = {};

    DRAFT_FIELDS.forEach((field) => {
        const raw = values[field];
        const value = typeof raw === "string" ? raw.trim() : raw ?? "";

        if (value !== "") {
            if (field === "phone" && !PHONE_PATTERN.test(value)) return;
            if (field === "email" && !EMAIL_PATTERN.test(value)) return;
            if (field === "year" && !YEAR_PATTERN.test(String(value))) return;
        }

        draft[field] = field === "year" && value !== "" ? parseInt(value, 10) : value;
    });

    const hasContact =
        draft.name ||
        PHONE_PATTERN.test(draft.phone || "") ||
        EMAIL_PATTERN.test(draft.email || "");

    return hasContact ? draft : null;
};

const JunkCarRequest = (props) => {
    const [form] = Form.useForm();
    const submittingRef = useRef(false);

    // One lead per form session: created on the first valid autosave, then
    // updated by every later autosave and by the final submit.
    const lead = useLeadCapture("/junk-car");   // added by shiva (from "/api/junk-car")

    const handleValuesChange = () => {
        if (submittingRef.current) return;
        lead.scheduleAutosave(() => buildDraft(form.getFieldsValue()));
    };

    const handleSubmit = async (values) => {
        try {
            submittingRef.current = true;

            // Updates the lead autosave already created (if any) instead of
            // creating a second one.
            const result = await lead.submit({
                ...values,
                year: values.year ? parseInt(values.year) : null,
                source: "Manual",
            });

            if (!result.ok || !result.data?.success) {
                message.error(result.data?.message || "Something went wrong");
                return;
            }
            message.success("Credentials added successfully");

            form.resetFields();
            lead.reset();

            // by shiva
            if (props.onSuccess) {
                props.onSuccess();
            }
        } catch (err) {
            console.error(err);
            message.error("Something went wrong");
        } finally {
            submittingRef.current = false;
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Add Junk Car</h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[
                                { required: true, message: "Name is required" }
                            ]}
                        >
                            <Input placeholder="Enter name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { type: "email", message: "Enter valid email" },
                                ]}
                            >
                                <Input placeholder="Enter email" />
                            </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="phone"
                            label="Phone"
                            rules={[
                                {
                                    pattern: /^[0-9]{10}$/,
                                    message: "Enter valid 10 digit phone",
                                },
                            ]}
                        >
                            <Input placeholder="Enter phone" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="year"
                            label="Year"
                            rules={[
                                
                                {
                                    pattern: /^\d{4}$/,
                                    message: "Enter valid 4 digit year",
                                },
                                
                            ]}
                        >
                            <Input 
                                type="number"               // added by shiva
                                placeholder="e.g. 2013"
                                maxLength={4}
                             />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="make"
                            label="Make"
                            rules={[]}
                        >
                            <Input placeholder="Toyota, Honda..." />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                         <Form.Item
                            name="model"
                            label="Model"
                            rules={[]}
                        >
                            <Input placeholder="Civic, Corolla..." />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="engineOrVin"
                            label="Engine / VIN Number"
                        >
                            <Input placeholder="Optional" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="condition"
                            label="Condition"
                        >
                            <Input placeholder="e.g. Running, Not Running" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                        <Form.Item
                            name="location"
                            label="Location"
                        >
                            <Input placeholder="Pickup location (optional)" />
                        </Form.Item>
                    </Col>
                </Row>

                <Col xs={24}>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
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