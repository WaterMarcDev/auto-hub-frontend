import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    Form,
    InputNumber,
    message,
    Row,
    Col,
    Typography,
} from "antd";
import {
    assetTagsAPI
} from "../utils/api";

// Same asset tag format as the server (auto-hub-backend/utils/barcode.js):
// "AUT" + the number padded to 6 digits, e.g. 123 -> AUT000123.
const TAG_PREFIX = "AUT";
const TAG_DIGITS = 6;
const MAX_TAG_NUMBER = 10 ** TAG_DIGITS - 1; // 999999
const MAX_TAGS_PER_BATCH = 1000;

const formatTagCode = (n) => `${TAG_PREFIX}${String(n).padStart(TAG_DIGITS, "0")}`;

// Only digits can be typed into the range boxes.
const digitsOnly = (v) => String(v ?? "").replace(/\D/g, "");

const GenerateTagsModal = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    // Blocks a second submit (double-click / Enter) while one is in flight.
    const submitting = useRef(false);
    const start = Form.useWatch("startRange", form);
    const end = Form.useWatch("endRange", form);

    // Start with an empty form every time the modal opens.
    useEffect(() => {
        if (visible) form.resetFields();
    }, [visible, form]);

    const handleSubmit = async () => {
        if (submitting.current) return;
        submitting.current = true;
        try {
            let values;
            try {
                values = await form.validateFields();
            } catch {
                return; // field errors are shown on the form
            }
            setLoading(true);

            const payload = {
                start: Number(values.startRange),
                end: Number(values.endRange),
            };

            const res = await assetTagsAPI.generate(payload);
            const data = res?.data || {};
            message.success(
                `Generated ${data.inserted ?? payload.end - payload.start + 1} tags (${formatTagCode(payload.start)} – ${formatTagCode(payload.end)})`
            );

            onCancel?.();
            onSuccess?.();
        } catch (err) {
            console.error("Failed to generate tags", err);
            // Show the server's reason, e.g. "Asset tags 1–10 (...) already exist".
            message.error(err?.response?.data?.message || err?.message || "Failed to generate tags");
        } finally {
            submitting.current = false;
            setLoading(false);
        }
    };

    const wholeNumberRules = (label) => [
        { required: true, message: `${label} is required` },
        {
            validator: (_, value) => {
                if (value == null || value === "") return Promise.resolve();
                const n = Number(value);
                if (!Number.isInteger(n) || n < 1 || n > MAX_TAG_NUMBER) {
                    return Promise.reject(new Error(`Enter a whole number from 1 to ${MAX_TAG_NUMBER}`));
                }
                return Promise.resolve();
            },
        },
    ];

    const validRange = Number.isInteger(start) && Number.isInteger(end) && start <= end;

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
            <Form layout="vertical" form={form}>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item name="startRange" label="Start" rules={wholeNumberRules("Start")}>
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                max={MAX_TAG_NUMBER}
                                precision={0}
                                parser={digitsOnly}
                                placeholder="e.g. 1"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="endRange"
                            label="End"
                            dependencies={["startRange"]}
                            rules={[
                                ...wholeNumberRules("End"),
                                ({ getFieldValue }) => ({
                                    validator: (_, value) => {
                                        const s = getFieldValue("startRange");
                                        if (value == null || s == null) return Promise.resolve();
                                        if (value < s) {
                                            return Promise.reject(new Error("End must be greater than or equal to Start"));
                                        }
                                        if (value - s + 1 > MAX_TAGS_PER_BATCH) {
                                            return Promise.reject(new Error(`At most ${MAX_TAGS_PER_BATCH} tags can be generated at a time`));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                max={MAX_TAG_NUMBER}
                                precision={0}
                                parser={digitsOnly}
                                placeholder="e.g. 100"
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Typography.Text type="secondary">
                    {validRange
                        ? `Will create ${end - start + 1} tag(s): ${formatTagCode(start)} – ${formatTagCode(end)}`
                        : `Tags are numbered ${formatTagCode(1)}, ${formatTagCode(2)}, … (up to ${MAX_TAGS_PER_BATCH} per batch).`}
                </Typography.Text>
            </Form>

        </Modal>
    );
}



export default GenerateTagsModal
