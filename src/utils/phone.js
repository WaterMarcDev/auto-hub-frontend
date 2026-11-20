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
