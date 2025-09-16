import { Col, Form, Input, Modal, Row } from "antd";
import React from "react";
import { elementAPI } from "../../utils/api";

const ElementForm = ({
  open,
  setOpen,
  element,
  setElement,
  setSuccess,
  setError,
}) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      if (element) {
        await elementAPI.update(element._id, values);
      } else {
        await elementAPI.create(values);
      }
      setOpen(false);
      setElement(null);
      setSuccess(`Element ${element ? "updated" : "created"} successfully`);
      form.resetFields();
      form.setFieldsValue({});
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save element");
    }
  };

  React.useEffect(() => {
    if (element) {
      form.setFieldsValue(element);
    } else {
      form.resetFields();
      form.setFieldsValue({});
    }
  }, [element, form]);

  React.useEffect(() => {
    if (open && !element) {
      form.resetFields();
      form.setFieldsValue({});
    }
  }, [open, element, form]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        setElement(null);
        form.resetFields();
      }}
      destroyOnHidden={true}
      width={600}
      title={element ? "Edit Element" : "Add Element"}
      okText={element ? "Update" : "Create"}
      cancelText="Close"
      maskClosable={false}
      onOk={() => form.submit()}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row>
          <Col span={12}>
            <Form.Item
              label="Element Name"
              name="name"
              rules={[{ required: true, message: "Please enter element name" }]}
            >
              <Input placeholder="Enter element name" />
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
            <Form.Item label="Element Weight" name="weight">
              <Input placeholder="Enter element weight" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Element Dimensions" name="dimensions">
              <Input placeholder="Enter element dimensions" />
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

export default ElementForm;
