// antd Form rules for inventory parts and in-store sales. The server applies
// the same limits (auto-hub-backend/utils/inventoryFieldRules.js).

export const MAX_PART_WEIGHT = 10000; // lb
export const MAX_SALE_PRICE = 1000000;
export const TEXT_LIMITS = {
  location: 100,
  dimensions: 100,
  color: 50,
  vehicleName: 100,
  buyerName: 100,
  saleNote: 500,
  adjustReason: 500,
};

const WEIGHT_PATTERN = /^(\d{1,5}(\.\d{0,2})?|\.\d{1,2})$/;
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const PERSON_NAME_PATTERN = /^[\p{L}][\p{L} .'\-,&]*$/u;

const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";

// Optional text: may be left empty, but not spaces only; max length.
export const optionalTextRules = (label, max) => [
  {
    validator: (_, v) =>
      v && String(v).length > 0 && !String(v).trim()
        ? Promise.reject(new Error(`${label} cannot be only spaces`))
        : Promise.resolve(),
  },
  { max, message: `${label} must be at most ${max} characters` },
];

// Trimmed text, or undefined when blank / spaces only.
export const cleanText = (v) => (isBlank(v) ? undefined : String(v).trim().replace(/\s+/g, " "));

export const weightError = (v) => {
  if (isBlank(v)) return null;
  const text = String(v).trim();
  if (!WEIGHT_PATTERN.test(text)) {
    return `Weight must be a number from 0 to ${MAX_PART_WEIGHT.toLocaleString("en-US")} with up to 2 decimals`;
  }
  if (Number(text) > MAX_PART_WEIGHT) {
    return `Weight cannot be more than ${MAX_PART_WEIGHT.toLocaleString("en-US")}`;
  }
  return null;
};

export const weightRule = {
  validator: (_, v) => {
    const err = weightError(v);
    return err ? Promise.reject(new Error(err)) : Promise.resolve();
  },
};

// Optional VIN: 17 letters/digits, never I, O or Q.
export const vinRule = {
  validator: (_, v) =>
    isBlank(v) || VIN_PATTERN.test(String(v).trim().toUpperCase())
      ? Promise.resolve()
      : Promise.reject(new Error("VIN must be exactly 17 letters and digits (I, O and Q are not allowed)")),
};

// Upper-case and drop anything that cannot be in a VIN while typing.
export const normalizeVin = (v) => String(v ?? "").toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17);

export const MAX_YEAR = new Date().getFullYear() + 1;
export const yearRule = {
  validator: (_, v) =>
    isBlank(v) || (Number.isInteger(Number(v)) && Number(v) >= 1900 && Number(v) <= MAX_YEAR)
      ? Promise.resolve()
      : Promise.reject(new Error(`Year must be between 1900 and ${MAX_YEAR}`)),
};

export const buyerNameRules = [
  ...optionalTextRules("Buyer name", TEXT_LIMITS.buyerName),
  {
    validator: (_, v) =>
      isBlank(v) || PERSON_NAME_PATTERN.test(String(v).trim())
        ? Promise.resolve()
        : Promise.reject(new Error("Buyer name can contain only letters, spaces and . ' - , &")),
  },
];

export const priceRule = {
  validator: (_, v) => {
    if (isBlank(v)) return Promise.resolve();
    const n = Number(v);
    const ok = /^\d+(\.\d{1,2})?$/.test(String(v).trim()) && n <= MAX_SALE_PRICE;
    return ok
      ? Promise.resolve()
      : Promise.reject(
          new Error(`Sale price must be from 0 to ${MAX_SALE_PRICE.toLocaleString("en-US")} with up to 2 decimals`)
        );
  },
};
