import { Form, Input, Modal } from "antd";
import React from "react";
import { makeAPI } from "../../utils/api";
import { MAX_DESCRIPTION_LENGTH, descriptionRule } from "../../utils/descriptionLimit";

// Same limits as the backend (make.controller.js).
const MAX_MAKE_NAME_LENGTH = 50;
const MAX_MAKE_SHORT_NAME_LENGTH = 10;

const clean = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v);

const MakeForm = ({ open, setOpen, make, setMake, setSuccess, setError }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);
  // Ref (not state) so rapid double clicks before the re-render are also
  // ignored: one click = one request = one message.
  const savingRef = React.useRef(false);

  const onFinish = async (formValues) => {
    if (savingRef.current) return;
    savingRef.current = true;
    const values = {
      name: clean(formValues.name),
      shortName: clean(formValues.shortName),
      description:
        typeof formValues.description === "string"
          ? formValues.description.trim()
          : formValues.description,
    };
    setSaving(true);
    try {
      if (make) {
        await makeAPI.update(make._id, values);
      } else {
        await makeAPI.create(values);
      }
      setOpen(false);
      setMake(null);
      setSuccess(`Make ${make ? "updated" : "created"} successfully`);
      form.resetFields();
      form.setFieldsValue({});
    } catch (error) {
      console.error("Error saving make:", error);
      setError(error.response?.data?.message || "Failed to save make");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  React.useEffect(() => {
    if (make) {
      form.setFieldsValue(make);
    } else {
      form.resetFields();
      form.setFieldsValue({});
    }
  }, [make, form]);

  React.useEffect(() => {
    if (open && !make) {
      form.resetFields();
      form.setFieldsValue({});
    }
  }, [open, make, form]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        setMake(null);
        form.resetFields();
      }}
      destroyOnHidden={true}
      width={600}
      title={make ? "Edit Car Make" : "Add Car Make"}
      okText={make ? "Update" : "Create"}
      cancelText="Close"
      maskClosable={false}
      confirmLoading={saving}
      onOk={() => form.submit()}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Make Name"
          name="name"
          rules={[
            { required: true, whitespace: true, message: "Please enter the make name" },
            { max: MAX_MAKE_NAME_LENGTH, message: `Make name can be at most ${MAX_MAKE_NAME_LENGTH} characters` },
          ]}
        >
          <Input type="text" placeholder="Enter make name" maxLength={MAX_MAKE_NAME_LENGTH} showCount />
        </Form.Item>
        <Form.Item
          label="Short Name"
          name="shortName"
          rules={[
            { required: true, whitespace: true, message: "Please enter the short name" },
            { max: MAX_MAKE_SHORT_NAME_LENGTH, message: `Short name can be at most ${MAX_MAKE_SHORT_NAME_LENGTH} characters` },
          ]}
        >
          <Input type="text" placeholder="Enter short name (e.g. TO)" maxLength={MAX_MAKE_SHORT_NAME_LENGTH} showCount />
        </Form.Item>
        <Form.Item rules={[descriptionRule]} label="Description" name="description">
          <Input.TextArea maxLength={MAX_DESCRIPTION_LENGTH} showCount
            placeholder="Enter description"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MakeForm;
