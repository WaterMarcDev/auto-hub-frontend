// US phone numbers: shown and stored as (XXX) XXX-XXXX.

export const US_PHONE_REGEX = /^\(\d{3}\) \d{3}-\d{4}$/;

// Max length of a formatted number, "(XXX) XXX-XXXX".
export const US_PHONE_MAX_LENGTH = 14;

// Formats what the user typed as (XXX) XXX-XXXX, capped at 10 digits.
// previousValue lets backspace over ") ", ")" or "-" also remove the digit
// before it, so the user is never stuck on a separator.
export const formatPhoneNumber = (value, previousValue = "") => {
  if (!value) return "";
  let raw = value;
  if (previousValue && previousValue.length > value.length) {
    if (previousValue.endsWith(") ") && value === previousValue.slice(0, -1)) {
      raw = value.slice(0, -2);
    } else if (previousValue.endsWith(")") && value === previousValue.slice(0, -1)) {
      raw = value.slice(0, -1);
    } else if (previousValue.endsWith("-") && value === previousValue.slice(0, -1)) {
      raw = value.slice(0, -1);
    }
  }
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.length < 3) return `(${digits}`;
  if (digits.length === 3) {
    return value.length > (previousValue || "").length ? `(${digits}) ` : `(${digits}`;
  }
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

// antd Form.Item helpers for every phone / mobile field in the CRM:
//   <Form.Item normalize={normalizePhone} rules={[usPhoneRule]}>
//     <Input placeholder={US_PHONE_PLACEHOLDER} maxLength={US_PHONE_MAX_LENGTH} inputMode="tel" />
export const US_PHONE_PLACEHOLDER = "(XXX) XXX-XXXX";
export const US_PHONE_MESSAGE = "Enter a 10-digit US phone number: (XXX) XXX-XXXX";

export const normalizePhone = (value, prevValue) => formatPhoneNumber(value, prevValue || "");

// Optional field: blank is fine; anything typed must be a full US number.
export const usPhoneRule = {
  validator: (_, value) =>
    !value || US_PHONE_REGEX.test(String(value))
      ? Promise.resolve()
      : Promise.reject(new Error(US_PHONE_MESSAGE)),
};

// Shows a stored number in the US format when it is a 10-digit US number
// (or 11 digits starting with 1); anything else is shown as stored.
export const displayPhone = (value, empty = "N/A") => {
  if (value === undefined || value === null || String(value).trim() === "" || value === "none") return empty;
  let digits = String(value).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : String(value);
};
