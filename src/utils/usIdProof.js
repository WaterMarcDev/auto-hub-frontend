// US ID proof types and the format of each one's number.
//
// Driver's license / state ID numbers differ by state: 4–15 letters and
// digits covers every state (e.g. New Jersey is 1 letter + 14 digits = 15,
// Florida 1 letter + 12 digits, Wisconsin 1 letter + 13 digits, many states
// 7–9 digits).
export const US_ID_PROOF_TYPES = [
  {
    value: "Driver's License",
    pattern: /^[A-Z0-9]{4,15}$/,
    maxLength: 15,
    hint: "4–15 letters and digits (as printed on the license)",
    placeholder: "e.g. A12345678901234",
  },
  {
    value: "State ID",
    pattern: /^[A-Z0-9]{4,15}$/,
    maxLength: 15,
    hint: "4–15 letters and digits (as printed on the ID)",
    placeholder: "e.g. A12345678901234",
  },
  {
    value: "US Passport",
    pattern: /^([0-9]{9}|[A-Z][0-9]{8})$/,
    maxLength: 9,
    hint: "9 digits, or 1 letter followed by 8 digits",
    placeholder: "e.g. 123456789 or A12345678",
  },
  {
    value: "US Passport Card",
    pattern: /^C[0-9]{8}$/,
    maxLength: 9,
    hint: "the letter C followed by 8 digits",
    placeholder: "e.g. C12345678",
  },
  {
    value: "Permanent Resident Card",
    pattern: /^[A-Z]{3}[0-9]{10}$/,
    maxLength: 13,
    hint: "3 letters followed by 10 digits",
    placeholder: "e.g. ABC1234567890",
  },
  {
    value: "Military ID",
    pattern: /^[0-9]{10}$/,
    maxLength: 10,
    hint: "10-digit DoD ID number",
    placeholder: "e.g. 1234567890",
  },
];

export const getIdProofType = (value) => US_ID_PROOF_TYPES.find((t) => t.value === value);

// Upper-case and drop spaces / dashes, so "a123-456 789" is stored as "A123456789".
export const normalizeIdProofNumber = (value) =>
  String(value ?? "").toUpperCase().replace(/[\s-]+/g, "");
