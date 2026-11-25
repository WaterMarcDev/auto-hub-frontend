// Number-only box (used for every Weight field in the CRM). Letters and
// symbols cannot be typed or pasted; trying it shows `errorMessage` under the
// box until a valid number is typed.
//
//   mode="text"   antd <Input>, value is a string ("12.5"): for fields that
//                 were plain text boxes (and table cells).
//   mode="number" antd <InputNumber>, value is a number: for fields that
//                 already were number boxes.
// `decimals` allows one decimal point (default true). Every other prop goes to
// the antd box, so it works inside <Form.Item> like the box it replaces.
import React, { useState } from "react";
import { Input, InputNumber } from "antd";

const isControlKey = (e) => e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey;

const NumericInput = ({
  mode = "text",
  decimals = true,
  errorMessage = "Please enter a numeric weight",
  value,
  onChange,
  onKeyDown,
  onPaste,
  ...props
}) => {
  const [invalid, setInvalid] = useState(false);
  const pastePattern = decimals ? /^\d*\.?\d*$/ : /^\d*$/;

  // Digits plus (once) a decimal point.
  const sanitize = (text) => {
    const raw = String(text ?? "");
    if (!decimals) return raw.replace(/\D/g, "");
    const cleaned = raw.replace(/[^\d.]/g, "");
    const dot = cleaned.indexOf(".");
    return dot === -1 ? cleaned : cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, "");
  };

  const handleKeyDown = (e) => {
    if (!isControlKey(e)) {
      const current = String(e.currentTarget.value ?? "");
      const ok = /^\d$/.test(e.key) || (decimals && e.key === "." && !current.includes("."));
      if (ok) setInvalid(false);
      else {
        e.preventDefault();
        setInvalid(true);
      }
    }
    onKeyDown?.(e);
  };

  const handlePaste = (e) => {
    const text = e.clipboardData?.getData("text")?.trim() ?? "";
    const bad = !pastePattern.test(text);
    if (bad) e.preventDefault();
    setInvalid(bad);
    onPaste?.(e);
  };

  const box =
    mode === "number" ? (
      <InputNumber
        min={0}
        precision={decimals ? undefined : 0}
        {...props}
        value={value}
        status={invalid ? "error" : props.status}
        inputMode={decimals ? "decimal" : "numeric"}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={(v) => {
          setInvalid(false);
          onChange?.(v);
        }}
      />
    ) : (
      <Input
        {...props}
        value={value ?? ""}
        status={invalid ? "error" : props.status}
        inputMode={decimals ? "decimal" : "numeric"}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={(e) => {
          setInvalid(false);
          onChange?.(sanitize(e.target.value));
        }}
      />
    );

  return (
    <>
      {box}
      {invalid && (
        <div role="alert" style={{ color: "#ff4d4f", fontSize: 12, marginTop: 2 }}>
          {errorMessage}
        </div>
      )}
    </>
  );
};

export default NumericInput;
