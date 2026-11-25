import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  message,
  Row,
  Col,
  AutoComplete,
} from "antd";
import UnitInput from "./UnitInput";
import NumericInput from "./NumericInput";
import {
  TEXT_LIMITS,
  MAX_YEAR,
  cleanText,
  normalizeVin,
  optionalTextRules,
  vinRule,
  weightRule,
  yearRule,
} from "./inventory/fieldRules";
import {
  makeAPI,
  modelAPI,
  trimAPI,
  inventoryAPI,
  partAPI,
} from "../utils/api";

const { Option } = Select;

// Value of the "Other" choice in the Part select: lets the user type part
// details that are not in the parts catalog.
const OTHER_PART = "__other__";

const AddInventoryModal = ({ visible, onCancel, onSuccess, initial = {} }) => {
  const [form] = Form.useForm();
  const isOtherPart = Form.useWatch("partName", form) === OTHER_PART;
  const [parts, setParts] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [partMaxUnit, setPartMaxUnit] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load data only when modal becomes visible to avoid preloading while hidden.
  useEffect(() => {
    if (!visible) {
      // when modal closes, reset transient state (but keep form values cleared)
      form.resetFields();
      setParts([]);
      setMakes([]);
      setModels([]);
      setTrims([]);
      setPartMaxUnit(null);
      return;
    }

    // when visible becomes true, fetch necessary lists and prefill from `initial`
    (async () => {
      try {
        const partsRes = await partAPI.getAll({ page: 1, limit: 200 });
        const partsData = partsRes.data?.parts || partsRes.parts || [];
        setParts(partsData);
      } catch (err) {
        console.error("Failed to load parts", err);
      }

      try {
        const makesRes = await makeAPI.getAll({ page: 1, limit: 200 });
        const makesData = makesRes.data?.makes || makesRes.makes || [];
        setMakes(makesData);
      } catch (err) {
        console.error("Failed to load makes", err);
      }

      // If initial contains make/model/trim, load dependent lists so selects are populated
      try {
        if (initial.make) await loadModels(initial.make);
        if (initial.model) await loadTrims(initial.model);
      } catch (err) {
        // loadModels/loadTrims already console.error on fail; ignore here
        console.error(err);
      }

      // Prefill form fields after data is loaded
      try {
        const values = {};
        if (initial.partName) values.partName = initial.partName;
        if (initial.make) values.make = initial.make;
        if (initial.model) values.model = initial.model;
        if (initial.trim) values.trim = initial.trim;
        if (Object.keys(values).length) form.setFieldsValue(values);

        // If part prefilled, compute partMaxUnit
        if (initial.partName) onPartChange(initial.partName);
      } catch (err) {
        console.error("Failed to prefill AddInventoryModal", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadModels = async (makeId) => {
    if (!makeId) return setModels([]);
    try {
      const res = await modelAPI.getAll({ make: makeId, page: 1, limit: 500 });
      const data = res.data?.models || res.models || [];
      setModels(data);
    } catch (e) {
      console.error("Failed to load models", e);
    }
  };

  const loadTrims = async (modelId) => {
    if (!modelId) return setTrims([]);
    try {
      const res = await trimAPI.getAll({ model: modelId, page: 1, limit: 500 });
      const data = res.data?.trims || res.trims || [];
      setTrims(data);
    } catch (e) {
      console.error("Failed to load trims", e);
    }
  };

  const onPartChange = (partId) => {
    const p = parts.find((x) => String(x._id) === String(partId));
    if (p) {
      const max = p.maxQuantity ?? p.maxUnit ?? null;
      if (max == null) {
        // try numeric unit as fallback
        const maybe = Number(p.unit);
        setPartMaxUnit(
          !isNaN(maybe) && isFinite(maybe) && maybe > 0 ? maybe : null
        );
      } else {
        setPartMaxUnit(Number(max) || null);
      }
    } else {
      setPartMaxUnit(null);
    }
  };

  // "Other" parts: Make / Model / Trim are typed (or picked from the
  // existing lists) and optional; blanks are saved as "Unknown".
  const nameOptions = (list) =>
    [...new Set(list.map((x) => x.name).filter(Boolean))].map((name) => ({ value: name }));
  const matchName = (input, option) =>
    String(option?.value || "").toLowerCase().includes(String(input || "").toLowerCase());
  const findByName = (list, name) =>
    list.find((x) => String(x.name || "").toLowerCase() === String(name || "").trim().toLowerCase());

  const onOtherMakeChange = (value) => {
    form.setFieldsValue({ otherModel: undefined, otherTrim: undefined });
    setModels([]);
    setTrims([]);
    const known = findByName(makes, value);
    if (known) loadModels(known._id);
  };

  const onOtherModelChange = (value) => {
    form.setFieldsValue({ otherTrim: undefined });
    setTrims([]);
    const known = findByName(models, value);
    if (known) loadTrims(known._id);
  };

  const handleMakeChange = (value) => {
    form.setFieldsValue({ model: undefined, trim: undefined });
    setModels([]);
    setTrims([]);
    loadModels(value);
  };

  const handleModelChange = (value) => {
    form.setFieldsValue({ trim: undefined });
    setTrims([]);
    loadTrims(value);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // find selected part name if available
      const selectedPart = parts.find(
        (p) => String(p._id) === String(values.partName)
      );

      const otherPart = values.partName === OTHER_PART;

      const payload = {
        partId: otherPart ? undefined : values.partName,
        partName: otherPart
          ? values.otherPartName?.trim()
          : selectedPart?.name || values.partName,
        remarks: values.remarks?.trim() || undefined,
        otherPart: otherPart || undefined,
        unit: values.unit,
        cleaned: !!values.cleaned,
        quality: values.quality,
        location: cleanText(values.location),
        weight: cleanText(values.weight),
        dimensions: cleanText(values.dimensions),
        make: otherPart ? cleanText(values.otherMake) : values.make,
        model: otherPart ? cleanText(values.otherModel) : values.model,
        trim: otherPart ? cleanText(values.otherTrim) : values.trim,
        vin: cleanText(values.vin),
        year: values.year ?? undefined,
        color: cleanText(values.color),
      };

      await inventoryAPI.create(payload);
      message.success("Inventory item created");
      form.resetFields();
      if (onSuccess) onSuccess();
      onCancel();
    } catch (err) {
      if (err.errorFields) {
        // validation error - ignored here
      } else {
        console.error(err);
        message.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to create inventory"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Add Inventory Item"
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Create"
      confirmLoading={loading}
      width={800}
    >
      <Form layout="vertical" form={form} initialValues={{ unit: 1 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="partName"
              label="Part"
              rules={[{ required: true, message: "Please select a part" }]}
            >
              <Select
                showSearch
                placeholder="Select part"
                onChange={onPartChange}
                optionFilterProp="children"
              >
                {parts.map((p) => (
                  <Option key={p._id} value={p._id}>
                    {p.name}
                  </Option>
                ))}
                <Option key={OTHER_PART} value={OTHER_PART}>
                  Other
                </Option>
              </Select>
            </Form.Item>
          </Col>

          {isOtherPart && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="otherPartName"
                label="Part Details"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Please enter the part details",
                  },
                ]}
              >
                <Input placeholder="Enter the car part" maxLength={100} />
              </Form.Item>
            </Col>
          )}

          {isOtherPart && (
            <>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="otherMake"
                  label="Make (optional)"
                  rules={optionalTextRules("Make", TEXT_LIMITS.vehicleName)}
                >
                  <AutoComplete
                    allowClear
                    placeholder="Type or pick a make (leave blank if unknown)"
                    options={nameOptions(makes)}
                    filterOption={matchName}
                    onChange={onOtherMakeChange}
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="otherModel"
                  label="Model (optional)"
                  rules={optionalTextRules("Model", TEXT_LIMITS.vehicleName)}
                >
                  <AutoComplete
                    allowClear
                    placeholder="Type or pick a model (leave blank if unknown)"
                    options={nameOptions(models)}
                    filterOption={matchName}
                    onChange={onOtherModelChange}
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="otherTrim"
                  label="Trim (optional)"
                  rules={optionalTextRules("Trim", TEXT_LIMITS.vehicleName)}
                >
                  <AutoComplete
                    allowClear
                    placeholder="Type or pick a trim (leave blank if unknown)"
                    options={nameOptions(trims)}
                    filterOption={matchName}
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
            </>
          )}

          {!isOtherPart && (
          <>
          <Col xs={24} sm={12}>
            <Form.Item
              name="make"
              label="Make"
              rules={[{ required: true, message: "Please select a make" }]}
            >
              <Select
                showSearch
                placeholder="Select make"
                onChange={handleMakeChange}
                optionFilterProp="children"
              >
                {makes.map((m) => (
                  <Option key={m._id} value={m._id}>
                    {m.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="model"
              label="Model"
              rules={[{ required: true, message: "Please select a model" }]}
            >
              <Select
                showSearch
                placeholder="Select model"
                onChange={handleModelChange}
                optionFilterProp="children"
              >
                {models.map((m) => (
                  <Option key={m._id} value={m._id}>
                    {m.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="trim"
              label="Trim"
              rules={[{ required: true, message: "Please select a trim" }]}
            >
              <Select
                showSearch
                placeholder="Select trim"
                optionFilterProp="children"
              >
                {trims.map((t) => (
                  <Option key={t._id} value={t._id}>
                    {t.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          </>
          )}

          <Col xs={24} sm={12}>
            <Form.Item
              name="unit"
              label="Unit"
              rules={[{ required: true, message: "Enter unit quantity" }]}
            >
              <UnitInput
                style={{ width: "100%" }}
                min={1}
                max={partMaxUnit || undefined}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="quality" label="Quality">
              <Select placeholder="Select quality">
                <Option value="Good">Good</Option>
                <Option value="Average">Average</Option>
                <Option value="OK">OK</Option>
                <Option value="Broken">Broken</Option>
                <Option value="Scratches">Scratches</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={optionalTextRules("Location", TEXT_LIMITS.location)}
            >
              <Input maxLength={TEXT_LIMITS.location} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            {/* 0 - 10,000 lb, up to 2 decimals; no letters, "-" or units. */}
            <Form.Item name="weight" label="Weight (lb)" rules={[weightRule]}>
              <NumericInput placeholder="Enter weight" maxLength={8} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="dimensions"
              label="Dimensions"
              rules={optionalTextRules("Dimensions", TEXT_LIMITS.dimensions)}
            >
              <Input maxLength={TEXT_LIMITS.dimensions} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            {/* Optional; 17 letters/digits without I, O, Q. One VIN can have
                many parts, but the same part twice for one VIN is refused
                by the server. */}
            <Form.Item
              name="vin"
              label="VIN"
              normalize={normalizeVin}
              rules={[vinRule]}
            >
              <Input maxLength={17} placeholder="17-character VIN (optional)" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="year" label="Year" rules={[yearRule]}>
              <UnitInput style={{ width: "100%" }} maxLength={4} placeholder={`1900 - ${MAX_YEAR}`} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="color"
              label="Color"
              rules={optionalTextRules("Color", TEXT_LIMITS.color)}
            >
              <Input maxLength={TEXT_LIMITS.color} />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              name="remarks"
              label="Remarks"
              rules={optionalTextRules("Remarks", 2000)}
            >
              <Input.TextArea
                rows={3}
                maxLength={2000}
                showCount
                placeholder="Add remarks about this part (optional)"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddInventoryModal;
