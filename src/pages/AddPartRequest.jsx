import React, { useState } from "react";
import { Card, Input, Button, Form, message, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";


const AddPartRequest = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const res = await fetch("http://localhost:5000/api/part-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
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
                            <Input placeholder="Enter part name" />
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
                            name="year">
                            <Input placeholder="Enter year (e.g. 2015)" />
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