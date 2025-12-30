import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Select,
    InputNumber,
    message,
    Input,
    Button,
    Row,
    Col,
} from "antd";
import {
    assetTagsAPI
} from "../utils/api";

const GenerateTagsModal = ({ visible, onCancel, onSuccess, initial = {} }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        form.setFieldsValue(initial);
        if (!visible) {
            form.resetFields();
        }
    }, [form, initial]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                start: Number(values.startRange),
                end: Number(values.endRange),
                digits: Number(values.digits),
            };

            // 1️⃣ API call
            await assetTagsAPI.generate(payload);

            message.success("Tags generated successfully");

            // 2️⃣ Close modal
            onCancel?.();

            // 3️⃣ Refresh list (parent-controlled)
            onSuccess?.();
        } catch (err) {
            console.error("Failed to generate tags", err);
            message.error("Failed to generate tags");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            title="Generate Tags"
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Generate"
            confirmLoading={loading}
            width={800}
        >
            <Form layout="vertical" form={form} initialValues={{ unit: 1 }}>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item name="startRange" label="Start">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name="endRange" label="End">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name="digits" label="Digits">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

        </Modal>
    );
}



export default GenerateTagsModal