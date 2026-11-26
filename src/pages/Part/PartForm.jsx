import { Button, Col, Form, Image, Input, Modal, Row } from "antd";
import React from "react";
import { partAPI, uploadAPI } from "../../utils/api";
import FileUpload from "../../components/FileUpload";
import UnitInput from "../../components/UnitInput";
import NumericInput from "../../components/NumericInput";
import { MAX_DESCRIPTION_LENGTH, descriptionRule } from "../../utils/descriptionLimit";
import {
  TEXT_LIMITS,
  cleanText,
  optionalTextRules,
  weightRule,
} from "../../components/inventory/fieldRules";

// Same limits and formats as the backend (part.controller.js).
const MAX_PART_NAME_LENGTH = 100;
// Short names go into inventory SKUs (make/model/year-PART/color).
const MAX_SHORT_NAME_LENGTH = 10;
const MAX_UNIT = 999999;
const PART_NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} \-/&().',]*$/u;
const SHORT_NAME_PATTERN = /^[A-Za-z0-9-]+$/;
const DIM_NUM = String.raw`\d{1,6}(?:\.\d{1,2})?(?:\s*(?:mm|cm|m|inches|inch|in|feet|ft|"|'))?`;
const DIMENSIONS_PATTERN = new RegExp(`^${DIM_NUM}(?:\\s*[x×*]\\s*${DIM_NUM}){0,2}$`, "i");

const clean = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v);

// Path of the image field value: a stored path string, or the upload
// response object ({ imageUrl, filename, originalName }).
const imagePath = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.imageUrl || img.filename || "";
};

// Format rule that skips a value equal to the stored one, so an older part
// saved before these rules existed can still be edited (the server does the
// same).
const formatRule = (pattern, message, stored) => ({
  validator: (_, v) => {
    const text = clean(v);
    if (!text || (stored !== undefined && stored !== null && text === clean(String(stored)))) {
      return Promise.resolve();
    }
    return pattern.test(text) ? Promise.resolve() : Promise.reject(new Error(message));
  },
});

const PartForm = ({ open, setOpen, part, setPart, setSuccess, setError }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);
  // Ref (not state) so rapid double clicks before the re-render are also
  // ignored: one click = one request = one message.
  const savingRef = React.useRef(false);
  const image = Form.useWatch("image", form);

  const onFinish = async (formValues) => {
    if (savingRef.current) return;
    savingRef.current = true;
    const values = {
      name: clean(formValues.name),
      shortName: clean(formValues.shortName),
      unit: formValues.unit,
      // Blank / spaces-only weight and dimensions are sent as "" (cleared).
      weight: cleanText(formValues.weight) ?? "",
      dimensions: cleanText(formValues.dimensions) ?? "",
      // Upload response object -> stored path; removed image -> null.
      image: imagePath(formValues.image) || null,
      description:
        typeof formValues.description === "string"
          ? formValues.description.trim()
          : formValues.description,
    };
    setSaving(true);
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
    } finally {
      savingRef.current = false;
      setSaving(false);
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

  const currentImage = imagePath(image);

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
      confirmLoading={saving}
      onOk={() => form.submit()}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="Part Name"
              name="name"
              rules={[
                { required: true, whitespace: true, message: "Please enter part name" },
                { max: MAX_PART_NAME_LENGTH, message: `Part name can be at most ${MAX_PART_NAME_LENGTH} characters` },
                formatRule(
                  PART_NAME_PATTERN,
                  "Part name can contain only letters, digits, spaces and - / & ( ) . ' ,",
                  part?.name
                ),
              ]}
            >
              <Input placeholder="Enter part name" maxLength={MAX_PART_NAME_LENGTH} showCount />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Short Name"
              name="shortName"
              rules={[
                { required: true, whitespace: true, message: "Please enter short name" },
                { max: MAX_SHORT_NAME_LENGTH, message: `Short name can be at most ${MAX_SHORT_NAME_LENGTH} characters` },
                formatRule(
                  SHORT_NAME_PATTERN,
                  "Short name can contain only letters, digits and - (no spaces)",
                  part?.shortName
                ),
              ]}
            >
              <Input placeholder="Enter short name (e.g. FB)" maxLength={MAX_SHORT_NAME_LENGTH} showCount />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Part Unit"
              name="unit"
              rules={[{ required: true, message: "Please enter part unit (1 - 999,999)" }]}
            >
              <UnitInput
                min={1}
                max={MAX_UNIT}
                maxLength={6}
                style={{ width: "100%" }}
                placeholder="Enter part unit"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* 0 - 15,000 lb, up to 2 decimals (server rejects anything else). */}
            <Form.Item label="Part Weight" name="weight" rules={[weightRule]}>
              <NumericInput placeholder="Enter part weight" maxLength={8} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Part Dimensions"
              name="dimensions"
              extra='e.g. 12 x 8 x 4 in'
              rules={[
                ...optionalTextRules("Part dimensions", TEXT_LIMITS.dimensions),
                formatRule(
                  DIMENSIONS_PATTERN,
                  'Use up to 3 positive numbers separated by "x" (e.g. 12 x 8 x 4 or 30 cm x 20 cm)',
                  part?.dimensions
                ),
              ]}
            >
              <Input placeholder="Enter part dimensions" maxLength={TEXT_LIMITS.dimensions} showCount />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Part Image" name="image">
              <FileUpload />
            </Form.Item>
            {/* The uploaded / saved image stays visible until it is removed
                (FileUpload alone only flashes "File(s) uploaded" for 3 s). */}
            {currentImage && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -12, marginBottom: 12 }}>
                <Image
                  src={uploadAPI.getImageUrl(currentImage)}
                  width={64}
                  height={64}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
                <span
                  style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  title={image?.originalName || currentImage.split("/").pop()}
                >
                  {image?.originalName || currentImage.split("/").pop()}
                </span>
                <Button size="small" danger onClick={() => form.setFieldsValue({ image: null })}>
                  Remove
                </Button>
              </div>
            )}
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

export default PartForm;
