import { Form, Input, Modal, Select } from "antd";
import React from "react";
import { modelAPI, makeAPI } from "../../utils/api";

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
        const { data } = await makeAPI.getAll({ limit: 100 }); // Fetch all makes, adjust limit as needed
        setMakes(data.makes);
      } catch (error) {
        console.error("Error fetching makes:", error);
        setError("Failed to fetch car makes");
      }
    };

    fetchMakes();
  }, []);

  const onFinish = async (values) => {
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
            filterOption={true}
            placeholder="Select a car make"
            options={makes.map((make) => ({
              label: make.name,
              value: make._id,
            }))}
          />
        </Form.Item>
        <Form.Item label="Model Name" name="name" required>
          <Input placeholder="Enter model name" />
        </Form.Item>
        <Form.Item label="Short Name" name="shortName" required>
          <Input placeholder="Enter short name" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea
            placeholder="Enter description"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelForm;
