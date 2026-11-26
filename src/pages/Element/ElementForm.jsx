import { Col, Form, Input, Modal, Row } from "antd";
import React from "react";
import { elementAPI } from "../../utils/api";
import NumericInput from "../../components/NumericInput";
import { MAX_DESCRIPTION_LENGTH, descriptionRule } from "../../utils/descriptionLimit";

// Same limits as the backend (elements.controller.js).
const MAX_ELEMENT_NAME_LENGTH = 50;
const MAX_ELEMENT_SHORT_NAME_LENGTH = 10;
const MAX_ELEMENT_DIMENSIONS_LENGTH = 100;
const MAX_ELEMENT_WEIGHT = 15000;
// "15000.00" is the longest valid weight.
const MAX_ELEMENT_WEIGHT_LENGTH = 8;

const clean = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v);
const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";

const weightRule = {
  validator: (_, value) => {
    if (isBlank(value)) return Promise.resolve();
    const text = String(value).trim();
    if (!/^(\d{1,5}(\.\d{0,2})?|\.\d{1,2})$/.test(text) || Number(text) > MAX_ELEMENT_WEIGHT) {
      return Promise.reject(
        new Error(`Weight must be a number from 0 to ${MAX_ELEMENT_WEIGHT.toLocaleString("en-US")} with up to 2 decimals`)
      );
    }
    return Promise.resolve();
  },
};

// Dimensions are free text ("10 x 20 x 5 in"); a "-" would mean a negative size.
const dimensionsRule = {
  validator: (_, value) =>
    typeof value === "string" && value.includes("-")
      ? Promise.reject(new Error("Dimensions cannot be negative (the - sign is not allowed)"))
      : Promise.resolve(),
};

const ElementForm = ({
  open,
  setOpen,
  element,
  setElement,
  setSuccess,
  setError,
}) => {
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
      weight: isBlank(formValues.weight) ? "" : String(formValues.weight).trim(),
      dimensions: typeof formValues.dimensions === "string" ? clean(formValues.dimensions) : "",
      description:
        typeof formValues.description === "string" ? formValues.description.trim() : "",
    };
    setSaving(true);
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
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  React.useEffect(() => {
    if (element) {
      form.setFieldsValue({
        ...element,
        weight: element.weight === undefined || element.weight === null ? "" : String(element.weight),
      });
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
      confirmLoading={saving}
      onOk={() => form.submit()}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row>
          <Col span={12}>
            <Form.Item
              label="Element Name"
              name="name"
              rules={[
                { required: true, whitespace: true, message: "Please enter element name" },
                { max: MAX_ELEMENT_NAME_LENGTH, message: `Element name can be at most ${MAX_ELEMENT_NAME_LENGTH} characters` },
              ]}
            >
              <Input placeholder="Enter element name" maxLength={MAX_ELEMENT_NAME_LENGTH} showCount />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Short Name"
              name="shortName"
              rules={[
                { required: true, whitespace: true, message: "Please enter short name" },
                { max: MAX_ELEMENT_SHORT_NAME_LENGTH, message: `Short name can be at most ${MAX_ELEMENT_SHORT_NAME_LENGTH} characters` },
              ]}
            >
              <Input placeholder="Enter short name" maxLength={MAX_ELEMENT_SHORT_NAME_LENGTH} showCount />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Element Weight" name="weight" rules={[weightRule]}>
              <NumericInput placeholder="Enter element weight" maxLength={MAX_ELEMENT_WEIGHT_LENGTH} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Element Dimensions"
              name="dimensions"
              rules={[
                dimensionsRule,
                { max: MAX_ELEMENT_DIMENSIONS_LENGTH, message: `Dimensions can be at most ${MAX_ELEMENT_DIMENSIONS_LENGTH} characters` },
              ]}
            >
              <Input placeholder="e.g. 10 x 20 x 5 in" maxLength={MAX_ELEMENT_DIMENSIONS_LENGTH} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item rules={[descriptionRule]} label="Description" name="description">
              <Input.TextArea maxLength={MAX_DESCRIPTION_LENGTH} showCount
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
