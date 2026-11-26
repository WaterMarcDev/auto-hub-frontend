import { Col, Form, Input, Modal, Row, Select } from "antd";
import React from "react";
import { makeAPI, modelAPI, trimAPI } from "../../utils/api";
import { MAX_DESCRIPTION_LENGTH, descriptionRule } from "../../utils/descriptionLimit";

// Same limits as the backend (trim.controller.js) and Car Make / Car Model.
const MAX_TRIM_NAME_LENGTH = 50;
const MAX_TRIM_SHORT_NAME_LENGTH = 10;

const clean = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v);

// Search the dropdown by the visible name (case-insensitive, spaces around
// the typed text ignored). filterOption={true} matched the hidden _id value.
const filterByLabel = (input, option) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(String(input ?? "").trim().toLowerCase());

const refId = (v) => (v && typeof v === "object" ? v._id : v);

const TrimForm = ({ open, setOpen, trim, setTrim, setSuccess, setError }) => {
  const [form] = Form.useForm();

  const [makes, setMakes] = React.useState([]);
  const [models, setModels] = React.useState([]);
  const [modelsLoading, setModelsLoading] = React.useState(false);
  const selectedMake = Form.useWatch("make", form);

  React.useEffect(() => {
    const fetchMakes = async () => {
      try {
        const { data } = await makeAPI.getAll({ limit: 1000 }); // Fetch all makes so every make is listed
        setMakes(data.makes);
      } catch (error) {
        console.error("Error fetching makes:", error);
        setError("Failed to fetch car makes");
      }
    };

    fetchMakes();
  }, [setError]);

  // Only the models of the selected make (all of them, not the first page).
  // On edit the trim's make is set first, so its models load the same way.
  React.useEffect(() => {
    let active = true;
    if (!selectedMake) {
      setModels([]);
      return undefined;
    }
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const { data } = await modelAPI.getAll({ make: selectedMake, limit: 1000 });
        if (active) setModels(data.models || []);
      } catch (error) {
        console.error("Error fetching models:", error);
        if (active) {
          setModels([]);
          setError("Failed to fetch car models");
        }
      } finally {
        if (active) setModelsLoading(false);
      }
    };
    fetchModels();
    return () => {
      active = false;
    };
  }, [selectedMake, setError]);

  const [saving, setSaving] = React.useState(false);
  // Ref (not state) so rapid double clicks before the re-render are also
  // ignored: one click = one request = one message.
  const savingRef = React.useRef(false);

  const onFinish = async (formValues) => {
    if (savingRef.current) return;
    savingRef.current = true;
    const values = {
      make: formValues.make,
      model: formValues.model,
      name: clean(formValues.name),
      shortName: clean(formValues.shortName),
      description:
        typeof formValues.description === "string"
          ? formValues.description.trim()
          : formValues.description,
    };
    setSaving(true);
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
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  React.useEffect(() => {
    if (trim) {
      form.setFieldsValue({
        name: trim.name,
        shortName: trim.shortName,
        description: trim.description,
        make: refId(trim.make),
        model: refId(trim.model),
      });
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

  // The edited trim's model, shown until the make's models have loaded
  // (and if it is no longer in the list, e.g. deleted).
  const modelOptions = models.map((model) => ({
    label: model.name,
    value: model._id,
  }));
  const trimModelId = refId(trim?.model);
  if (
    trim?.model?.name &&
    String(refId(trim.make)) === String(selectedMake) &&
    !modelOptions.some((o) => String(o.value) === String(trimModelId))
  ) {
    modelOptions.push({ label: trim.model.name, value: trimModelId });
  }

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
      confirmLoading={saving}
      onOk={() => form.submit()}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row>
          <Col span={12}>
            <Form.Item
              label="Select Car Make"
              name="make"
              required
              rules={[{ required: true, message: "Please select a car make" }]}
            >
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
                // A model belongs to one make: clear it when the make changes.
                onChange={() => form.setFieldValue("model", undefined)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Select Car Model"
              name="model"
              required
              rules={[{ required: true, message: "Please select a car model" }]}
            >
              <Select
                placeholder={selectedMake ? "Select car model" : "Select a car make first"}
                showSearch
                allowClear
                disabled={!selectedMake}
                loading={modelsLoading}
                optionFilterProp="label"
                filterOption={filterByLabel}
                options={modelOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trim Name"
              name="name"
              required
              rules={[
                { required: true, whitespace: true, message: "Please enter the trim name" },
                { max: MAX_TRIM_NAME_LENGTH, message: `Trim name can be at most ${MAX_TRIM_NAME_LENGTH} characters` },
              ]}
            >
              <Input placeholder="Enter trim name" maxLength={MAX_TRIM_NAME_LENGTH} showCount />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Short Name"
              name="shortName"
              required
              rules={[
                { required: true, whitespace: true, message: "Please enter the short name" },
                { max: MAX_TRIM_SHORT_NAME_LENGTH, message: `Short name can be at most ${MAX_TRIM_SHORT_NAME_LENGTH} characters` },
              ]}
            >
              <Input placeholder="Enter short name" maxLength={MAX_TRIM_SHORT_NAME_LENGTH} showCount />
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
