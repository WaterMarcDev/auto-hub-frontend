import React, { useState, useEffect, useRef } from "react";
import { Card, Input, Button, Form, message, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLeadCapture } from "../hooks/useLeadCapture";

const PHONE_PATTERN = /^[0-9]{10}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const YEAR_PATTERN = /^\d{4}$/;

// Customer fields saved progressively while the form is being filled in.
// Status/source are only sent on the final submit.
const DRAFT_FIELDS = ["name", "phone", "email", "partName", "make", "model", "year", "condition", "message"];

const toPartName = (partName) =>
    Array.isArray(partName) ? partName.join(", ") : partName;  // we can also do this | -> Engine|Alternator

// Returns the values that are safe to save right now, or null when there's
// no valid phone/email yet (the API needs one to create the lead). Fields
// that currently fail validation are left out, so they never overwrite what
// was saved before.
const buildDraft = (values) => {
    const draft = {};

    DRAFT_FIELDS.forEach((field) => {
        let value = field === "partName" ? toPartName(values[field]) : values[field];
        value = typeof value === "string" ? value.trim() : value ?? "";

        if (value !== "") {
            if (field === "phone" && !PHONE_PATTERN.test(value)) return;
            if (field === "email" && !EMAIL_PATTERN.test(value)) return;
            if (field === "year" && !YEAR_PATTERN.test(String(value))) return;
        }

        draft[field] = value;
    });

    const hasContact = PHONE_PATTERN.test(draft.phone || "") || EMAIL_PATTERN.test(draft.email || "");

    return hasContact ? draft : null;
};


const AddPartRequest = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const submittingRef = useRef(false);

    // One lead per form session: created on the first valid autosave, then
    // updated by every later autosave and by the final submit.
    const lead = useLeadCapture("/part-request", { source: "Offline" });

    const handleValuesChange = () => {
        if (submittingRef.current) return;
        lead.scheduleAutosave(() => buildDraft(form.getFieldsValue()));
    };

    // Added by shiva
    const [parts, setParts] = useState([]);

    useEffect(() => {
        setParts([
            "Wiring Harness",
            "Fuel Tank",
            "Steering",
            "Dashboard (Complete)",
            "Windscreen (Windshield)",
            "Coolant Bottle (Reservoir)",
            "Radiator",
            "Fuel Pump",
            "Latches",
            "Trunk Gate",
            "Transmission",
            "Window Switches",
            "Fuse Box",
            "Battery",
            "Air Intake Manifold",
            "Alternator",
            "AC Compressor",
            "Tyre",
            "Rims",
            "Odometer (Cluster)",
            "Rear / Back Seat",
            "Co-Passenger Seat",
            "Driver Seat",
            "Right Side Mirror",
            "Left Side Mirror",
            "Rear Left Door",
            "Rear Right Door",
            "Front Right Door",
            "Front Left Door",
            "Hood",
            "Right Headlights",
            "Left Headlights",
            "Right Fender",
            "Left Fender",
            "Rear Bumper",
            "Engine",
            "Brake Disc",
            "Base Chassis Plate",
            "Brake Drum",
            "Chassis",
            "Engine Control Module",
            "Floor Carpet",
            "Foot Rest",
            "Front Bumper",
            "Heated Seats",
            "Heated Side Mirrors",
            "Heated Steering",
            "Heated Windshield",
            "Rear Windshield"
        ].sort((a, b) => a.localeCompare(b)));
    }, []);
    //end here

    const handleSubmit = async (values) => {
        try {
            submittingRef.current = true;
            setLoading(true);

            // Updates the lead autosave already created (if any) instead of
            // creating a second one.
            const result = await lead.submit({
                ...values,
                // Added by shiva
                partName: toPartName(values.partName),
                // end here
                source: "Offline",
            });

            if (!result.ok) throw new Error(result.data?.message);

            message.success("Part Request Created Successfully");
            form.resetFields();
            lead.reset();

        } catch (error) {
            message.error(error.message || "Something went wrong");
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    };

    return (
        <div 
            className="container-fluid"
            style={{
                paddingTop: "100px",
                paddingBottom: "30px"
            }}>
            <div className="page-content-wrapper">
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                    <Button
                        type="primary"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/part-requests")}
                        style={{
                            background: "#1677ff",
                            borderColor: "#1677ff",
                            fontWeight: 500
                        }}
                    >
                        Back
                    </Button>
                </div>
                <Card title="Add Part Request">
                    <Form form={form} layout="vertical" onFinish={handleSubmit} onValuesChange={handleValuesChange}>

                        {/* Name */}
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: "Name is required" }]}
                        >
                            <Input placeholder="Enter name" />
                        </Form.Item>

                        {/* Phone */}
                        <Form.Item
                            label="Phone"
                            name="phone"
                            rules={[
                                {
                                    pattern: /^[0-9]{10}$/,
                                    message: "Phone must be 10 digits",
                                },
                            ]}
                        >
                            <Input placeholder="Enter phone" />
                        </Form.Item>

                        {/* Email */}
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { type: "email", message: "Invalid email" },
                            ]}
                        >
                            <Input placeholder="Enter email" />
                        </Form.Item>

                        {/* Part Name */}
                        <Form.Item
                            label="Part Name"
                            name="partName"
                            rules={[
                                { required: true, message: "Part name required" }
                            ]}
                        >
                            {/* Added by shiva */}
                            <Select
                                showSearch
                                mode="tags"
                                placeholder="Search part name"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option?.children?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {parts.map((part) => (
                                    <Select.Option key={part} value={part}>
                                        {part}
                                    </Select.Option>
                                ))}                            
                            </Select>
                            {/* end here */}
                            {/* <Input placeholder="Enter part name" /> */}
                        </Form.Item>

                        {/* Make */}
                        <Form.Item
                            label="Make" 
                            name="make">
                            <Input placeholder="Enter make (e.g. Toyota)" />
                        </Form.Item>

                        {/* Model */}
                        <Form.Item 
                            label="Model" 
                            name="model">
                            <Input placeholder="Enter model (e.g. Camry)" />
                        </Form.Item>

                        {/* Year */}
                        <Form.Item 
                            label="Year" 
                            name="year"
                            rules={[
                                {
                                    pattern: /^\d{4}$/,
                                    message: "Enter valid 4 digit year",
                                },
                            ]}
                        >
                            <Input 
                                placeholder="Enter year (e.g. 2015)" 
                                maxLength={4}
                                type="number"
                            />
                        </Form.Item>

                        {/* Condition */}
                        <Form.Item 
                            label="Condition" 
                            name="condition">
                            <Input placeholder="New / Used / Damaged" />
                        </Form.Item>

                        {/* Message */}
                        <Form.Item 
                            label="Message" 
                            name="message">
                            <Input.TextArea placeholder="Additional details" />
                        </Form.Item>

                        {/* Status */}
                        <Form.Item label="Status" name="status" initialValue="Pending">
                            <Select>
                                <Select.Option value="Pending">Pending</Select.Option>
                                <Select.Option value="In Progress">In Progress</Select.Option>
                                <Select.Option value="Completed">Completed</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default AddPartRequest;