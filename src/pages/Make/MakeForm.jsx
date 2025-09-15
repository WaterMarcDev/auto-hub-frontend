import { Form, Input, Modal } from "antd";
import React from "react";
import { makeAPI } from "../../utils/api";

const MakeForm = ({ open, setOpen, make, setMake, setSuccess, setError }) => {
  const [form] = Form.useForm();
  console.log("MakeForm render, make:", make);

  const onFinish = async (values) => {
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
      onOk={() => form.submit()}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item label="Make Name" name="name" required>
          <Input type="text" placeholder="Enter make name" />
        </Form.Item>
        <Form.Item label="Short Name" name="shortName" required>
          <Input type="text" placeholder="Enter short name" />
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

export default MakeForm;
