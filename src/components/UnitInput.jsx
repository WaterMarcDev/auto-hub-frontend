// Number box for every "Unit" field in the CRM: whole numbers made of digits
// only. Letters, "-", "+", "." , "e" and other symbols cannot be typed or
// pasted. Accepts every antd <InputNumber> prop (min, max, value, onChange...).
import React from "react";
import { InputNumber } from "antd";

// Keys that do not insert a character (navigation, editing, shortcuts).
const isControlKey = (e) => e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey;

const digitsOnly = (v) => String(v ?? "").replace(/\D/g, "");

const UnitInput = ({ onKeyDown, onPaste, ...props }) => (
  <InputNumber
    precision={0}
    inputMode="numeric"
    {...props}
    parser={digitsOnly}
    onKeyDown={(e) => {
      if (!isControlKey(e) && !/^\d$/.test(e.key)) e.preventDefault();
      onKeyDown?.(e);
    }}
    onPaste={(e) => {
      const text = e.clipboardData?.getData("text") ?? "";
      if (/\D/.test(text.trim())) e.preventDefault();
      onPaste?.(e);
    }}
  />
);

export default UnitInput;
