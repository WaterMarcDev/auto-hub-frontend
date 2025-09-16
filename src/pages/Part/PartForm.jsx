import { Col, Form, Input, Modal, Row } from "antd";
import React from "react";
import { partAPI } from "../../utils/api";

const PartForm = ({ open, setOpen, part, setPart, setSuccess, setError }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      if (part) {
        await partAPI.update(part._id, values);
      } else {
        await partAPI.create(values);
      }
      setOpen(false);
      setPart(null);
      setSuccess(`Part ${part ? "updated" : "created"} successfully`);
      form.resetFields();
      form.setFieldsValue({});
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save part");
    }
  };

  React.useEffect(() => {
    if (part) {
      form.setFieldsValue(part);
    } else {
      form.resetFields();
      form.setFieldsValue({});
    }
  }, [part, form]);

  React.useEffect(() => {
    if (open && !part) {
      form.resetFields();
      form.setFieldsValue({});
    }
  }, [open, part, form]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        setPart(null);
        form.resetFields();
      }}
      destroyOnHidden={true}
      width={600}
      title={part ? "Edit Part" : "Add Part"}
      okText={part ? "Update" : "Create"}
      cancelText="Close"
      maskClosable={false}
      onOk={() => form.submit()}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row>
          <Col span={12}>
            <Form.Item
              label="Part Name"
              name="name"
              rules={[{ required: true, message: "Please enter part name" }]}
            >
              <Input placeholder="Enter part name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Short Name"
              name="shortName"
              rules={[{ required: true, message: "Please enter short name" }]}
            >
              <Input placeholder="Enter short name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Part Unit"
              name="unit"
              rules={[{ required: true, message: "Please enter part unit" }]}
            >
              <Input placeholder="Enter part unit" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Part Weight" name="weight">
              <Input placeholder="Enter part weight" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Part Dimensions" name="dimensions">
              <Input placeholder="Enter part dimensions" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Description" name="description">
              <Input.TextArea
                placeholder="Enter description"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PartForm;
