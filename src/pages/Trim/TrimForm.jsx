import { Col, Form, Input, Modal, Row, Select } from "antd";
import React from "react";
import { makeAPI, modelAPI, trimAPI } from "../../utils/api";
import { MAX_DESCRIPTION_LENGTH, descriptionRule } from "../../utils/descriptionLimit";

// Search the dropdown by the visible name (case-insensitive, spaces around
// the typed text ignored). filterOption={true} matched the hidden _id value.
const filterByLabel = (input, option) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(String(input ?? "").trim().toLowerCase());

const TrimForm = ({ open, setOpen, trim, setTrim, setSuccess, setError }) => {
  const [form] = Form.useForm();

  const [makes, setMakes] = React.useState([]);
  const [models, setModels] = React.useState([]);

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

    const fetchModels = async () => {
      try {
        const { data } = await modelAPI.getAll({ limit: 100 }); // Fetch all models, adjust limit as needed
        setModels(data.models);
      } catch (error) {
        console.error("Error fetching models:", error);
        setError("Failed to fetch car models");
      }
    };

    fetchModels();
    fetchMakes();
  }, [setError]);
  const onFinish = async (values) => {
    try {
      if (trim) {
        await trimAPI.update(trim._id, values);
      } else {
        await trimAPI.create(values);
      }
      setOpen(false);
      setTrim(null);
      setSuccess(`Trim ${trim ? "updated" : "created"} successfully`);
      form.resetFields();
      form.setFieldsValue({});
    } catch (error) {
      console.error("Error saving trim:", error);
      setError(error.response?.data?.message || "Failed to save trim");
    }
  };

  React.useEffect(() => {
    if (trim) {
      form.setFieldsValue(trim);
      form.setFieldValue("make", trim.make?._id);
      form.setFieldValue("model", trim.model?._id);
    } else {
      form.resetFields();
      form.setFieldsValue({});
    }
  }, [trim, form]);

  React.useEffect(() => {
    if (open && !trim) {
      form.resetFields();
    }
  }, [open, trim, form]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        setTrim(null);
        form.resetFields();
      }}
      destroyOnHidden={true}
      width={600}
      title={trim ? "Edit Car Trim" : "Add Car Trim"}
      okText={trim ? "Update" : "Create"}
      cancelText="Close"
      maskClosable={false}
      onOk={() => form.submit()}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row>
          <Col span={12}>
            <Form.Item label="Select Car Make" name="make" required>
              <Select
                placeholder="Select car make"
                showSearch
                allowClear
                optionFilterProp="label"
                filterOption={filterByLabel}
                options={makes.map((make) => ({
                  label: make.name,
                  value: make._id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Select Car Model" name="model" required>
              <Select
                placeholder="Select car model"
                showSearch
                allowClear
                optionFilterProp="label"
                filterOption={filterByLabel}
                options={models.map((model) => ({
                  label: model.name,
                  value: model._id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Trim Name" name="name" required>
              <Input placeholder="Enter trim name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Short Name" name="shortName" required>
              <Input placeholder="Enter short name" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item rules={[descriptionRule]} label="Description" name="description">
              <Input.TextArea maxLength={MAX_DESCRIPTION_LENGTH} showCount placeholder="Enter description" rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TrimForm;
