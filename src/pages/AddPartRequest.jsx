import React, { useState, useEffect, useRef } from "react";
import { Card, Input, Button, Form, message, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { emailRule, normalizeEmail } from "../utils/email";
import NumericInput from "../components/NumericInput";
import { normalizePhone, usPhoneRule, US_PHONE_PLACEHOLDER, US_PHONE_MAX_LENGTH } from "../utils/phone";
import { yearRule, leadNameRules, LEAD_NAME_MAX_LENGTH, cleanText as clean } from "../utils/leadFormRules";

// Same limits and choices as the server (controllers/partRequest.controller.js).
const MAX_MESSAGE_LENGTH = 500;
const MAX_EMAIL_LENGTH = 30;
const MAX_MAKE_LENGTH = 30;
const MAX_MODEL_LENGTH = 30;
const MAX_PART_LENGTH = 30;        // each part name
const MAX_PART_NAMES_LENGTH = 200; // all part names together ("A, B, C")
const CONDITIONS = ["New", "Used", "Damaged"];

const maxRule = (max, label) => ({ max, message: `${label} can be at most ${max} characters` });

// Part Name (tags): each part at most 50 characters, all together at most 200.
const partNameLimitRule = {
    validator: (_, value) => {
        const parts = (Array.isArray(value) ? value : value ? [value] : []).map((p) => String(p).trim());
        if (parts.some((p) => p.length > MAX_PART_LENGTH)) {
            return Promise.reject(new Error(`Each part name can be at most ${MAX_PART_LENGTH} characters`));
        }
        if (parts.filter(Boolean).join(", ").length > MAX_PART_NAMES_LENGTH) {
            return Promise.reject(new Error(`Part names can be at most ${MAX_PART_NAMES_LENGTH} characters in total`));
        }
        return Promise.resolve();
    },
};

const toPartName = (partName) =>
    Array.isArray(partName) ? partName.join(", ") : partName;  // we can also do this | -> Engine|Alternator



const AddPartRequest = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const submittingRef = useRef(false);

    // The CRM form saves only when Submit is pressed (no autosave while
    // typing, so an unfinished request never appears in the list). It is
    // sent with the staff login, so the server applies the CRM rules: Part
    // Name required; Name (max 15), phone and email optional but at least one
    // of them needed.

    // Added by shiva
    const [parts, setParts] = useState([]);

    useEffect(() => {
        setParts([
            "Wiring Harness",
            "Fuel Tank",
            "Steering",
            "Dashboard (Complete)",
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
            "Rear Windshield"
        ].sort((a, b) => a.localeCompare(b)));
    }, []);
    //end here

    const handleSubmit = async (values) => {
        if (submittingRef.current) return; // one click = one request
        try {
            submittingRef.current = true;
            setLoading(true);

            const payload = {
                name: clean(values.name),
                phone: clean(values.phone),
                email: clean(values.email),
                // Added by shiva
                partName: clean(toPartName(values.partName)),
                // end here
                make: clean(values.make),
                model: clean(values.model),
                year: clean(values.year),
                condition: values.condition || undefined,
                message: clean(values.message),
                status: values.status,
                source: "Offline",
            };
            Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

            await api.post("/part-request", payload);

            message.success("Part Request Created Successfully");
            form.resetFields();

        } catch (error) {
            message.error(error.response?.data?.message || error.message || "Something went wrong");
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
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>

                        {/* Name */}
                        <Form.Item
                            label="Name"
                            name="name"
                            dependencies={["phone", "email"]}
                            rules={leadNameRules}
                        >
                            <Input placeholder="Enter name" maxLength={LEAD_NAME_MAX_LENGTH} showCount />
                        </Form.Item>

                        {/* Phone */}
                        <Form.Item
                            label="Phone"
                            name="phone"
                            normalize={normalizePhone}
                            rules={[usPhoneRule]}
                        >
                            <Input placeholder={US_PHONE_PLACEHOLDER} maxLength={US_PHONE_MAX_LENGTH} inputMode="tel" />
                        </Form.Item>

                        {/* Email */}
                        <Form.Item
                            label="Email"
                            name="email"
                            normalize={normalizeEmail}
                            rules={[emailRule, maxRule(MAX_EMAIL_LENGTH, "Email")]}
                        >
                            <Input placeholder="Enter email" maxLength={MAX_EMAIL_LENGTH} />
                        </Form.Item>

                        {/* Part Name */}
                        <Form.Item
                            label="Part Name"
                            name="partName"
                            rules={[
                                { required: true, message: "Part name required" },
                                partNameLimitRule,
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
                            name="make"
                            rules={[maxRule(MAX_MAKE_LENGTH, "Make")]}>
                            <Input placeholder="Enter make (e.g. Toyota)" maxLength={MAX_MAKE_LENGTH} showCount />
                        </Form.Item>

                        {/* Model */}
                        <Form.Item 
                            label="Model" 
                            name="model"
                            rules={[maxRule(MAX_MODEL_LENGTH, "Model")]}>
                            <Input placeholder="Enter model (e.g. Camry)" maxLength={MAX_MODEL_LENGTH} showCount />
                        </Form.Item>

                        {/* Year */}
                        <Form.Item 
                            label="Year" 
                            name="year"
                            rules={[yearRule]}
                        >
                            {/* Digits only, 4 at most (type="number" ignored maxLength). */}
                            <NumericInput
                                decimals={false}
                                placeholder="Enter year (e.g. 2015)"
                                maxLength={4}
                                errorMessage="Enter digits only"
                            />
                        </Form.Item>

                        {/* Condition */}
                        <Form.Item 
                            label="Condition" 
                            name="condition">
                            <Select
                                allowClear
                                placeholder="Select condition"
                                options={CONDITIONS.map((c) => ({ value: c, label: c }))}
                            />
                        </Form.Item>

                        {/* Message */}
                        <Form.Item 
                            label="Message" 
                            name="message"
                            rules={[{ max: MAX_MESSAGE_LENGTH, message: `Message can be at most ${MAX_MESSAGE_LENGTH} characters` }]}>
                            <Input.TextArea placeholder="Additional details" maxLength={MAX_MESSAGE_LENGTH} showCount />
                        </Form.Item>

                        {/* Status */}
                        <Form.Item label="Status" name="status" initialValue="Pending">
                            <Select>
                                {/* Same statuses as the Part Requests list (backend: utils/partRequestLeads.js). */}
                                <Select.Option value="Pending">Pending</Select.Option>
                                <Select.Option value="Lead Converted">Lead Converted</Select.Option>
                                <Select.Option value="Lead Lost">Lead Lost</Select.Option>
                                <Select.Option value="Lead Closed">Lead Closed</Select.Option>
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