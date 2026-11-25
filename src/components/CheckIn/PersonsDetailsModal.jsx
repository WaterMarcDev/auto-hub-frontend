// Popup in Create Check-In: Full Name, Mobile No. and Signature of every
// person entering the yard with the customer (Number of Persons).
import React, { useEffect } from "react";
import { Modal, Form, Input, Card, Alert, Button, Space } from "antd";
import SignatureCanvas from "../SignatureCanvas";
import { formatPhoneNumber, US_PHONE_MAX_LENGTH, US_PHONE_REGEX } from "../../utils/phone";

const PersonsDetailsModal = ({ open, persons, onSave, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.setFieldsValue({ persons });
  }, [open, persons, form]);

  const save = async () => {
    try {
      const values = await form.validateFields();
      onSave(
        (values.persons || []).map((p) => ({
          fullName: String(p.fullName || "").trim().replace(/\s{2,}/g, " "),
          mobileNo: p.mobileNo,
          signature: p.signature,
        }))
      );
    } catch {
      // Errors are shown next to each field.
    }
  };

  return (
    <Modal
      open={open}
      title={`Persons' details (${persons.length} ${persons.length === 1 ? "person" : "persons"})`}
      width={640}
      zIndex={1100}
      maskClosable={false}
      onCancel={onCancel}
      destroyOnHidden
      styles={{ body: { maxHeight: "calc(85vh - 120px)", overflowY: "auto", paddingRight: 8 } }}
      footer={
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={save}>
            Save details
          </Button>
        </Space>
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Every person entering the yard with the customer must give these details."
        description="By signing, each person agrees to the waiver and liability release."
      />
      <Form form={form} layout="vertical" initialValues={{ persons }}>
        <Form.List name="persons">
          {(fields) =>
            fields.map((field, index) => (
              <Card
                key={field.key}
                size="small"
                title={`Person ${index + 1}`}
                style={{ marginBottom: 12 }}
              >
                <Form.Item
                  name={[field.name, "fullName"]}
                  label="Full Name"
                  rules={[
                    { required: true, whitespace: true, message: "Full name is required" },
                    { max: 100, message: "Full name can be at most 100 characters" },
                  ]}
                >
                  <Input placeholder="Enter Full Name" maxLength={100} />
                </Form.Item>
                <Form.Item
                  name={[field.name, "mobileNo"]}
                  label="Mobile No."
                  normalize={(value, prev) => formatPhoneNumber(value, prev || "")}
                  rules={[
                    { required: true, message: "Mobile number is required" },
                    {
                      pattern: US_PHONE_REGEX,
                      message: "Enter a 10-digit US phone number: (XXX) XXX-XXXX",
                    },
                  ]}
                >
                  <Input
                    placeholder="(XXX) XXX-XXXX"
                    maxLength={US_PHONE_MAX_LENGTH}
                    inputMode="tel"
                  />
                </Form.Item>
                <Form.Item
                  name={[field.name, "signature"]}
                  label="Signature"
                  rules={[
                    { required: true, message: "Please draw the signature and click Save Signature" },
                  ]}
                >
                  <PersonSignature />
                </Form.Item>
              </Card>
            ))
          }
        </Form.List>
      </Form>
    </Modal>
  );
};

// SignatureCanvas as a Form control (value / onChange from Form.Item).
const PersonSignature = ({ value, onChange }) => (
  <SignatureCanvas value={value || null} onChange={(v) => onChange?.(v || "")} />
);

export default PersonsDetailsModal;
