import { Form, Input, Button, Row, Col, message } from "antd";

const JunkCarRequest = (props) => {
    const [form] = Form.useForm();
    
    const handleSubmit = async (values) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/junk-car`, {   // added by shiva (from "/api/junk-car")
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    year: values.year ? parseInt(values.year) : null,
                    source: "Manual",
                }),
                
            });

            const data = await res.json();

            if (!data.success) {
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