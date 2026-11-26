// Number-only box (used for every Weight field in the CRM, and for money
// amounts). Letters and symbols cannot be typed or pasted, and at most
// `maxDecimals` digits (default 2) can follow the decimal point; trying either
// shows a message under the box until a valid number is typed.
//
//   mode="text"   antd <Input>, value is a string ("12.5"): for fields that
//                 were plain text boxes (and table cells).
//   mode="number" antd <InputNumber>, value is a number: for fields that
//                 already were number boxes.
// `decimals` allows one decimal point (default true). With `max`, a key or
// paste that would make the number bigger than `max` is ignored (the number
// already in the box stays) and `maxMessage` shows under the box. Every other
// prop goes to the antd box, so it works inside <Form.Item> like the box it
// replaces.
import React, { useState } from "react";
import { Input, InputNumber } from "antd";

// Every weight in the CRM allows at most 2 decimal places.
export const MAX_WEIGHT_DECIMALS = 2;

const isControlKey = (e) => e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey;

// The text the box would hold after inserting `text` at the cursor.
const textAfterInsert = (el, text) => {
  const current = String(el?.value ?? "");
  const start = typeof el?.selectionStart === "number" ? el.selectionStart : current.length;
  const end = typeof el?.selectionEnd === "number" ? el.selectionEnd : current.length;
  return current.slice(0, start) + text + current.slice(end);
};

const NumericInput = ({
  mode = "text",
  decimals = true,
  maxDecimals = MAX_WEIGHT_DECIMALS,
  errorMessage = "Please enter a numeric weight",
  maxMessage,
  value,
  onChange,
  onKeyDown,
  onPaste,
  ...props
}) => {
  const [problem, setProblem] = useState(null); // null | "chars" | "decimals" | "max"
  const max = typeof props.max === "number" && Number.isFinite(props.max) ? props.max : null;
  const overMaxMessage = maxMessage || (max !== null ? `Maximum is ${max}` : "");

  // True when `text` would be a number bigger than `max`.
  const aboveMax = (text) => {
    if (max === null) return false;
    const n = Number(String(text).replace(/,/g, ""));
    return Number.isFinite(n) ? n > max : String(text).replace(/\D/g, "").length > 15;
  };
  const pastePattern = decimals ? /^\d*\.?\d*$/ : /^\d*$/;
  const decimalsMessage = `At most ${maxDecimals} decimal places`;

  // True when `text` has more than `maxDecimals` digits after the point.
  const tooManyDecimals = (text) => {
    if (!decimals) return false;
    const dot = String(text).indexOf(".");
    return dot !== -1 && String(text).length - dot - 1 > maxDecimals;
  };

  // Digits plus (once) a decimal point, cut to `maxDecimals` decimals.
  const sanitize = (text) => {
    const raw = String(text ?? "");
    if (!decimals) return raw.replace(/\D/g, "");
    const cleaned = raw.replace(/[^\d.]/g, "");
    const dot = cleaned.indexOf(".");
    if (dot === -1) return cleaned;
    const fraction = cleaned.slice(dot + 1).replace(/\./g, "").slice(0, maxDecimals);
    return cleaned.slice(0, dot + 1) + fraction;
  };

  const handleKeyDown = (e) => {
    if (!isControlKey(e)) {
      const current = String(e.currentTarget.value ?? "");
      const isDigit = /^\d$/.test(e.key);
      const isPoint = decimals && e.key === "." && !current.includes(".");
      if (!isDigit && !isPoint) {
        e.preventDefault();
        setProblem("chars");
      } else if (tooManyDecimals(textAfterInsert(e.currentTarget, e.key))) {
        e.preventDefault();
        setProblem("decimals");
      } else if (aboveMax(textAfterInsert(e.currentTarget, e.key))) {
        e.preventDefault();
        setProblem("max");
      } else {
        setProblem(null);
      }
    }
    onKeyDown?.(e);
  };

  const handlePaste = (e) => {
    const text = e.clipboardData?.getData("text")?.trim() ?? "";
    if (!pastePattern.test(text)) {
      e.preventDefault();
      setProblem("chars");
    } else if (tooManyDecimals(textAfterInsert(e.currentTarget, text))) {
      e.preventDefault();
      setProblem("decimals");
    } else if (aboveMax(textAfterInsert(e.currentTarget, text))) {
      e.preventDefault();
      setProblem("max");
    } else {
      setProblem(null);
    }
    onPaste?.(e);
  };

  const status = problem ? "error" : props.status;

  const box =
    mode === "number" ? (
      <InputNumber
        min={0}
        precision={decimals ? undefined : 0}
        {...props}
        value={value}
        status={status}
        inputMode={decimals ? "decimal" : "numeric"}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={(v) => {
          setProblem(null);
          onChange?.(v);
        }}
      />
    ) : (
      <Input
        {...props}
        value={value ?? ""}
        status={status}
        inputMode={decimals ? "decimal" : "numeric"}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={(e) => {
          setProblem(null);
          onChange?.(sanitize(e.target.value));
        }}
      />
    );

  return (
    <>
      {box}
      {problem && (
        <div role="alert" style={{ color: "#ff4d4f", fontSize: 12, marginTop: 2 }}>
          {problem === "decimals" ? decimalsMessage : problem === "max" ? overMaxMessage : errorMessage}
        </div>
      )}
    </>
  );
};

export default NumericInput;
