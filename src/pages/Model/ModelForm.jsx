import { Form, Input, Modal, Select } from "antd";
import React from "react";
import { modelAPI, makeAPI } from "../../utils/api";
import { MAX_DESCRIPTION_LENGTH, descriptionRule } from "../../utils/descriptionLimit";

// Same limits as the backend (model.controller.js).
const MAX_MODEL_NAME_LENGTH = 50;
const MAX_MODEL_SHORT_NAME_LENGTH = 10;

const clean = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v);

// Search the Car Make dropdown by the visible name (case-insensitive, spaces
// around the typed text ignored). filterOption={true} matched the hidden _id.
const filterByLabel = (input, option) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(String(input ?? "").trim().toLowerCase());

const ModelForm = ({
  open,
  setOpen,
  model,
  setModel,
  setSuccess,
  setError,
}) => {
  const [form] = Form.useForm();
  const [makes, setMakes] = React.useState([]);

  React.useEffect(() => {
    const fetchMakes = async () => {
      try {
        const { data } = await makeAPI.getAll({ limit: 1000 }); // Fetch all makes so every make is searchable
        setMakes(data.makes);
      } catch (error) {
        console.error("Error fetching makes:", error);
        setError("Failed to fetch car makes");
      }
    };

    fetchMakes();
  }, []);

  const [saving, setSaving] = React.useState(false);
  // Ref (not state) so rapid double clicks before the re-render are also
  // ignored: one click = one request = one message.
  const savingRef = React.useRef(false);

  const onFinish = async (formValues) => {
    if (savingRef.current) return;
    savingRef.current = true;
    const values = {
      make: formValues.make,
      name: clean(formValues.name),
      shortName: clean(formValues.shortName),
      description:
        typeof formValues.description === "string"
          ? formValues.description.trim()
          : formValues.description,
    };
    setSaving(true);
    try {
      if (model) {
        await modelAPI.update(model._id, values);
      } else {
        await modelAPI.create(values);
      }
      setOpen(false);
      setModel(null);
      setSuccess(`Model ${model ? "updated" : "created"} successfully`);
      form.resetFields();
      form.setFieldsValue({});
    } catch (error) {
      console.error("Error saving model:", error);
      setError(error.response?.data?.message || "Failed to save model");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  React.useEffect(() => {
    if (model) {
      form.setFieldsValue(model);
      form.setFieldValue("make", model.make?._id);
    } else {
      form.resetFields();
      form.setFieldsValue({});
    }
  }, [model, form]);

  React.useEffect(() => {
    if (open && !model) {
      form.resetFields();
      form.setFieldsValue({});
    }
  }, [open, model, form]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        setModel(null);
        form.resetFields();
      }}
      destroyOnHidden={true}
      width={600}
      title={model ? "Edit Car Model" : "Add Car Model"}
      okText={model ? "Update" : "Create"}
      cancelText="Close"
      maskClosable={false}
      confirmLoading={saving}
      onOk={() => form.submit()}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Car Make"
          name="make"
          required
          rules={[{ required: true, message: "Please select a car make" }]}
        >
          <Select
            showSearch
            allowClear
            optionFilterProp="label"
            filterOption={filterByLabel}
            placeholder="Select a car make"
            options={makes.map((make) => ({
              label: make.name,
              value: make._id,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Model Name"
          name="name"
          rules={[
            { required: true, whitespace: true, message: "Please enter the model name" },
            { max: MAX_MODEL_NAME_LENGTH, message: `Model name can be at most ${MAX_MODEL_NAME_LENGTH} characters` },
          ]}
        >
          <Input placeholder="Enter model name" maxLength={MAX_MODEL_NAME_LENGTH} showCount />
        </Form.Item>
        <Form.Item
          label="Short Name"
          name="shortName"
          rules={[
            { required: true, whitespace: true, message: "Please enter the short name" },
            { max: MAX_MODEL_SHORT_NAME_LENGTH, message: `Short name can be at most ${MAX_MODEL_SHORT_NAME_LENGTH} characters` },
          ]}
        >
          <Input placeholder="Enter short name" maxLength={MAX_MODEL_SHORT_NAME_LENGTH} showCount />
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

export default ModelForm;
