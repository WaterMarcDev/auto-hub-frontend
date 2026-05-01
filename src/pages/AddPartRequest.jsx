import React, { useState, useEffect } from "react";
import { Card, Input, Button, Form, message, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";


const AddPartRequest = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

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
            setLoading(true);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/part-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    // Added by shiva
                    partName: Array.isArray(values.partName)
                        ? values.partName.join(", ")  // we can also do this | -> Engine|Alternator
                        : values.partName,
                    // end here
                    source: "crm",
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            message.success("Part Request Created Successfully");
            form.resetFields();

        } catch (error) {
            message.error(error.message || "Something went wrong");
        } finally {
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