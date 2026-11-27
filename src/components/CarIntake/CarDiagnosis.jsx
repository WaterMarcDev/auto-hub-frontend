import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Table,
  Checkbox,
} from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { partAPI, makeAPI } from "../../utils/api";
import UnitInput from "../UnitInput";
import NumericInput from "../NumericInput";
import {
  partWeightError,
  partDimensionsError,
  MAX_PART_DIMENSIONS_LENGTH,
} from "./intakeConstants";

const { Text } = Typography;
const { Option } = Select;

// A1 (converter) and A2 (catalytic converter) are never selected at intake:
// they always start (and stay) off with 0 units. The backend enforces the
// same rule in utils/intakePartExclusions.js.
const INTAKE_DESELECTED_PARTS = new Set(["a1", "a2"]);
const isIntakeDeselectedPart = (key) =>
  INTAKE_DESELECTED_PARTS.has(String(key || "").trim().toLowerCase());

const QUALITY_OPTIONS = ["Good", "Average", "OK", "Broken", "Scratches"];

// Unit of a selected part: a whole number from 1 to 10, and never more than
// the catalog part's own unit when that is lower. Mirrors the server check in
// controllers/carIntake.controller.js (validateIntakeParts).
export const MIN_PART_UNIT = 1;
export const MAX_PART_UNIT = 10;
const partUnitMax = (record) => {
  const catalog = Number(record?.unit);
  return Number.isFinite(catalog) && catalog >= MIN_PART_UNIT
    ? Math.min(Math.floor(catalog), MAX_PART_UNIT)
    : MAX_PART_UNIT;
};

// The Unit box. Keeps its own text while typing, so backspace can clear it
// (it used to snap straight back to 0). Valid numbers are saved as typed;
// an empty box goes back to 1 when the user leaves it; more than the maximum
// is refused with a message.
const UnitCell = ({ value, max, disabled, onCommit }) => {
  const [text, setText] = useState(value ?? "");
  const [overMax, setOverMax] = useState(false);

  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  const commitIfValid = (v) => {
    const n = Number(v);
    if (Number.isInteger(n) && n >= MIN_PART_UNIT && n <= max) onCommit(n);
  };

  return (
    <>
      <UnitInput
        value={text === "" ? null : text}
        // No antd min/max: antd would hold values above the maximum back
        // silently; this cell clamps them and says why.
        disabled={disabled}
        status={overMax ? "error" : undefined}
        onChange={(v) => {
          if (v === null || v === undefined || v === "") {
            setText("");
            setOverMax(false);
            return;
          }
          const n = Number(v);
          if (n > max) {
            setOverMax(true);
            setText(max);
            onCommit(max);
            return;
          }
          setOverMax(false);
          setText(n);
          commitIfValid(n);
        }}
        onBlur={() => {
          setOverMax(false);
          const n = Number(text);
          if (text === "" || !Number.isInteger(n) || n < MIN_PART_UNIT) {
            setText(MIN_PART_UNIT);
            onCommit(MIN_PART_UNIT);
          }
        }}
        style={{
          width: "100%",
          backgroundColor: "#4b5563",
          borderColor: "#6b7280",
        }}
      />
      {overMax && (
        <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 2 }}>
          {`Unit must be from ${MIN_PART_UNIT} to ${max}`}
        </div>
      )}
    </>
  );
};

// These are defined OUTSIDE CarDiagnosis on purpose. When they were created
// inside the component (and inline in the Table `components` prop), every
// re-render - i.e. every keystroke in a Unit box, which updates formData -
// produced new component types, so React unmounted and remounted every table
// row / cell. The table briefly lost its height and the page jumped while
// typing or pressing Backspace in Unit (and the box lost focus).
const DiagnosisHeaderCell = (props) => (
  <th {...props} style={{ backgroundColor: "#374151", borderColor: "#6b7280" }} />
);
const DiagnosisBodyRow = (props) => (
  <tr {...props} style={{ backgroundColor: "#374151" }} />
);
const DiagnosisBodyCell = (props) => (
  <td {...props} style={{ backgroundColor: "#374151", borderColor: "#6b7280" }} />
);
const DIAGNOSIS_TABLE_COMPONENTS = {
  header: { cell: DiagnosisHeaderCell },
  body: { row: DiagnosisBodyRow, cell: DiagnosisBodyCell },
};

// Editable cell: keeps local typing state and commits on blur / Enter.
const EditableCell = ({
  value: initial,
  onCommit,
  disabled,
  placeholder,
  numeric = false, // weight: numbers only
  validate, // (value) => error message or null
  maxLength,
}) => {
  const [val, setVal] = useState(initial ?? "");

  useEffect(() => {
    setVal(initial ?? "");
  }, [initial]);

  const commit = () => {
    if (onCommit) onCommit(val);
  };

  const style = {
    backgroundColor: disabled ? undefined : "#4b5563",
    borderColor: "#6b7280",
    color: "white",
  };
  // Weight / Dimensions rules (intakeConstants.js): the same limits the
  // inventory accepts, so the part can be added to inventory later.
  const error = disabled ? null : validate ? validate(val) : null;
  const errorText = error ? (
    <div role="alert" style={{ color: "#ff4d4f", fontSize: 12, marginTop: 2 }}>
      {error}
    </div>
  ) : null;
  if (numeric) {
    return (
      <>
        <NumericInput
          value={val}
          onChange={setVal}
          onBlur={commit}
          onPressEnter={commit}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          status={error ? "error" : undefined}
          style={style}
        />
        {errorText}
      </>
    );
  }
  return (
    <>
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onPressEnter={commit}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        status={error ? "error" : undefined}
        style={style}
      />
      {errorText}
    </>
  );
};

const CarDiagnosis = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [partsList, setPartsList] = useState([]);
  const [makesList, setMakesList] = useState([]);

  // Fetch 'makes' list for fitment dropdown
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await makeAPI.getAll({ limit: 1000 });
        const makes = res?.data?.makes || res?.data || [];
        if (mounted && Array.isArray(makes)) {
          setMakesList(makes);
        }
      } catch (e) {
        console.warn("Failed to load makes list:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch master parts list from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await partAPI.getAll({ limit: 1000 });
        const apiParts = res?.data?.parts || res?.data || [];
        if (mounted && Array.isArray(apiParts) && apiParts.length) {
          // Map backend parts into the shape expected by this component
          const normalizeKey = (s) => {
            if (!s) return "";
            // remove non-alphanum, split words
            const cleaned = String(s).replace(/[^a-zA-Z0-9 ]+/g, " ");
            const parts = cleaned.trim().split(/\s+/).filter(Boolean);
            if (parts.length === 0) return "";
            return (
              parts[0].toLowerCase() +
              parts
                .slice(1)
                .map(
                  (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
                )
                .join("")
            );
          };

          // The catalog can hold the same part twice (e.g. two "Transmission"
          // records). Rows are keyed by the normalised name, so duplicates
          // would share one key and tick / untick together: keep only the
          // first part per key.
          const seenKeys = new Set();
          const uniqueParts = apiParts.filter((p) => {
            const k = normalizeKey(p.name);
            if (!k || seenKeys.has(k)) return false;
            seenKeys.add(k);
            return true;
          });

          const mapped = uniqueParts.map((p) => {
            const rawKey = p.name;
            const key = normalizeKey(rawKey);
            const parsed = Number(p.unit);
            const unit = Number.isFinite(parsed) ? parsed : 1;
            return {
              key,
              name: p.name,
              id: p._id,
              unit,
            };
          });
          setPartsList(mapped);
        }
      } catch (e) {
        // If API fails, keep local defaults
        console.warn("Failed to load parts list, using defaults:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Ensure all parts have default diagnosis entries (selected: true, unit from API or 1)
  useEffect(() => {
    const currentDiagnosis = formData.diagnosis || {};
    const updated = { ...currentDiagnosis };
    let changed = false;

    partsList.forEach((p) => {
      const key = p.key;
      if (isIntakeDeselectedPart(key)) {
        // Always off with 0 units, including on cars saved before this rule
        const current = updated[key] || {};
        if (current.selected !== false || current.unit !== 0) {
          updated[key] = { ...current, selected: false, unit: 0 };
          changed = true;
        }
        return;
      }
      if (!updated[key]) {
        // If missing entirely, set defaults: selected true and unit from API (or 1)
        updated[key] = {
          selected: true,
          unit: p.unit !== undefined && p.unit !== null ? p.unit : 1,
        };
        changed = true;
      } else {
        // Do not override explicit user choice for `selected` (only set when undefined)
        if (updated[key].selected === undefined) {
          updated[key].selected = true;
          changed = true;
        }
        // If unit is missing/undefined, set from part default
        if (
          (updated[key].unit === undefined || updated[key].unit === null) &&
          p.unit !== undefined &&
          p.unit !== null
        ) {
          const parsed = Number(p.unit);
          updated[key].unit = Number.isFinite(parsed)
            ? Math.min(Math.max(Math.floor(parsed), MIN_PART_UNIT), MAX_PART_UNIT)
            : 1;
          changed = true;
        }
      }
    });

    if (changed) updateFormData({ diagnosis: updated });
  }, [partsList, formData.diagnosis, updateFormData]);

  // EditableCell and the table's cell components (DIAGNOSIS_TABLE_COMPONENTS)
  // live at module level, see the note there.

  const updatePartData = (partKey, field, value) => {
    const currentDiagnosis = formData.diagnosis || {};
    const currentPart = currentDiagnosis[partKey] || {};

    // Coerce unit values to a valid number (default 0) to avoid undefined/null
    let newValue = value;
    if (field === "unit") {
      if (newValue === "" || newValue === undefined || newValue === null) {
        newValue = 0;
      } else {
        // ensure numeric
        newValue = Number(newValue) || 0;
      }
    }

    updateFormData({
      diagnosis: {
        ...currentDiagnosis,
        [partKey]: {
          ...currentPart,
          [field]: newValue,
        },
      },
    });
  };

  const getPartData = (partKey, field) => {
    // return raw value (could be boolean, number, string, or undefined)
    return formData.diagnosis?.[partKey]?.[field];
  };

  // "Select all" for Quality: applies to every part that is switched on.
  const selectedPartKeys = partsList
    .map((p) => p.key)
    .filter((k) => getPartData(k, "selected") === true);

  const qualityState = (quality) => {
    const count = selectedPartKeys.filter((k) => getPartData(k, "quality") === quality).length;
    return {
      checked: selectedPartKeys.length > 0 && count === selectedPartKeys.length,
      indeterminate: count > 0 && count < selectedPartKeys.length,
    };
  };

  // Checked: every selected part gets this quality. Unchecked: parts that
  // have this quality are cleared (so all can be deselected again).
  const setAllQuality = (quality, checked) => {
    const currentDiagnosis = formData.diagnosis || {};
    const next = { ...currentDiagnosis };
    selectedPartKeys.forEach((k) => {
      const part = currentDiagnosis[k] || {};
      if (checked) next[k] = { ...part, quality };
      else if (part.quality === quality) next[k] = { ...part, quality: undefined };
    });
    updateFormData({ diagnosis: next });
  };

  const columns = [
    {
      title: <Text style={{ color: "white", fontWeight: "bold" }}>Select</Text>,
      dataIndex: "selected",
      key: "selected",
      width: 80,
      render: (_, record) => {
        const selected = getPartData(record.key, "selected") === true;
        const locked = isIntakeDeselectedPart(record.key);
        return (
          <Switch
            checked={selected}
            disabled={locked}
            title={locked ? "A1 and A2 are not selected at intake" : undefined}
            onChange={(checked) => {
              if (locked) return;
              // compute new unit in one go to avoid state race where
              // two consecutive updates overwrite each other
              const curUnit = getPartData(record.key, "unit");
              let newUnit;
              const max = partUnitMax(record);
              if (!checked) {
                newUnit = 0;
              } else {
                if (
                  curUnit === "" ||
                  curUnit === undefined ||
                  curUnit === null ||
                  Number(curUnit) === 0
                ) {
                  newUnit = max;
                } else {
                  newUnit = Number(curUnit) || max;
                }
              }

              // clamp to [0, max]
              if (newUnit > max) newUnit = max;
              if (newUnit < 0) newUnit = 0;

              const currentDiagnosis = formData.diagnosis || {};
              const currentPart = currentDiagnosis[record.key] || {};

              updateFormData({
                diagnosis: {
                  ...currentDiagnosis,
                  [record.key]: {
                    ...currentPart,
                    selected: checked,
                    unit: newUnit,
                  },
                },
              });
            }}
            size="small"
          />
        );
      },
    },
    {
      title: (
        <Text style={{ color: "white", fontWeight: "bold" }}>Parts Name</Text>
      ),
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <Text style={{ color: "white" }}>{text}</Text>,
    },
    {
      title: <Text style={{ color: "white", fontWeight: "bold" }}>Unit</Text>,
      dataIndex: "unit",
      key: "unit",
      width: 100,
      render: (_, record) => (
        <UnitCell
          value={getPartData(record.key, "unit") ?? 0}
          max={partUnitMax(record)}
          disabled={getPartData(record.key, "selected") !== true}
          onCommit={(v) => updatePartData(record.key, "unit", v)}
        />
      ),
    },
    {
      title: (
        <Text style={{ color: "white", fontWeight: "bold" }}>Quality</Text>
      ),
      dataIndex: "quality",
      key: "quality",
      width: 150,
      render: (_, record) => (
        <Select
          placeholder="Select Quality"
          allowClear
          value={getPartData(record.key, "quality") || undefined}
          onChange={(value) => updatePartData(record.key, "quality", value)}
          disabled={getPartData(record.key, "selected") !== true}
          style={{ width: "100%" }}
          dropdownStyle={{ backgroundColor: "#374151" }}
        >
          {QUALITY_OPTIONS.map((q) => (
            <Option key={q} value={q}>
              {q}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: (
        <Text style={{ color: "white", fontWeight: "bold" }}>Parts Weight</Text>
      ),
      dataIndex: "weight",
      key: "weight",
      width: 150,
      render: (_, record) => (
        <EditableCell
          value={getPartData(record.key, "weight")}
          onCommit={(v) => updatePartData(record.key, "weight", v)}
          numeric
          validate={partWeightError}
          maxLength={8}
          disabled={getPartData(record.key, "selected") !== true}
          placeholder={`Enter ${record.name} Weight`}
        />
      ),
    },
    {
      title: (
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Parts Dimensions
        </Text>
      ),
      dataIndex: "dimensions",
      key: "dimensions",
      width: 180,
      render: (_, record) => (
        <EditableCell
          value={getPartData(record.key, "dimensions")}
          onCommit={(v) => updatePartData(record.key, "dimensions", v)}
          validate={partDimensionsError}
          maxLength={MAX_PART_DIMENSIONS_LENGTH}
          disabled={getPartData(record.key, "selected") !== true}
          placeholder={`Enter ${record.name} Dimensions`}
        />
      ),
    },
    {
      title: <Text style={{ color: "white", fontWeight: "bold" }}>Fitment</Text>,
      dataIndex: "fitment",
      key: "fitment",
      width: 250,
      render: (_, record) => (
        <Select
          mode="multiple"
          allowClear
          showSearch
          placeholder="Select Make(s)"
          value={getPartData(record.key, "fitment") || []}
          onChange={(value) => updatePartData(record.key, "fitment", value)}
          disabled={getPartData(record.key, "selected") !== true}
          style={{ width: "100%" }}
          dropdownStyle={{ backgroundColor: "#374151" }}
          // Spaces before / after the search are ignored (" Toyota"); any case.
          filterOption={(input, option) =>
            String(option?.children ?? "")
              .toLowerCase()
              .includes(String(input ?? "").trim().toLowerCase())
          }
        >
          {makesList.map((make) => (
            <Option key={make._id} value={make._id}>
              {make.name}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          backgroundColor: "#374151",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Select all quality:
          </Text>
          {QUALITY_OPTIONS.map((q) => {
            const { checked, indeterminate } = qualityState(q);
            return (
              <Checkbox
                key={q}
                checked={checked}
                indeterminate={indeterminate}
                disabled={!selectedPartKeys.length}
                onChange={(e) => setAllQuality(q, e.target.checked)}
                style={{ color: "white" }}
              >
                All {q}
              </Checkbox>
            );
          })}
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>
            Applies to the selected parts; untick to clear it.
          </Text>
        </div>
        <Table
          columns={columns}
          dataSource={partsList}
          pagination={false}
          size="middle"
          rowKey="key"
          style={{
            backgroundColor: "#374151",
            border: "1px solid #6b7280",
          }}
          className="diagnosis-table"
          components={DIAGNOSIS_TABLE_COMPONENTS}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "24px",
          }}
        >
          <Button
            size="large"
            onClick={prevStep}
            icon={<ArrowLeftOutlined />}
            style={{
              backgroundColor: "#6b7280",
              borderColor: "#6b7280",
              color: "white",
            }}
          >
            Car Images
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={nextStep}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            Car Price
          </Button>
        </div>
      </div>
      <style jsx>{`
        .diagnosis-table .ant-table-thead > tr > th {
          background-color: #374151 !important;
          border-color: #6b7280 !important;
          color: white !important;
        }
        .diagnosis-table .ant-table-tbody > tr > td {
          background-color: #374151 !important;
          border-color: #6b7280 !important;
        }
        .diagnosis-table .ant-table {
          background-color: #374151 !important;
        }
        .diagnosis-table .ant-table-container {
          border-color: #6b7280 !important;
        }
      `}</style>
    </>
  );
};

export default CarDiagnosis;
