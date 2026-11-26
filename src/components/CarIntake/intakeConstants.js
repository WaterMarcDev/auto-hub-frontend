/**
 * Shared constants for the Car Intake process
 */
import dayjs from "dayjs";
import { weightError } from "../inventory/fieldRules";

export const NEGOTIATION_OPTIONS = [
  { value: "0", label: "0% More" },
  { value: "In Between", label: "In Between" },
  { value: "10", label: "10% More" },
  { value: "20", label: "20% More" },
  { value: "25", label: "25% More" },
  { value: "30", label: "30% More" },
  { value: "40", label: "40% More" },
  { value: "50", label: "50% More" },
  { value: "60", label: "60% More" },
  { value: "70", label: "70% More" },
  { value: "75", label: "75% More" },
];

/**
 * Where the vehicle physically came from (provenance / handover fact).
 * Values must stay in sync with the `kyc.vehicleSource` enum on the backend
 * model (auto-hub-backend/models/carInTake.model.js).
 */
export const VEHICLE_SOURCE_OPTIONS = [
  { value: "Towing Company", label: "Towing Company" },
  { value: "Customer", label: "Customer" },
];

/**
 * Car Details (Step 1) text fields: maximum length, label and whether the
 * field is required. The backend enforces the same limits
 * (CAR_TEXT_LIMITS in auto-hub-backend/controllers/carIntake.controller.js).
 */
export const CAR_TEXT_FIELDS = {
  make: { label: "Make", max: 50, min: 2, required: true },
  model: { label: "Model", max: 50, min: 2, required: true },
  trim: { label: "Trim", max: 50, required: true },
  color: { label: "Color", max: 30, required: true },
  bodyClass: { label: "Body Class", max: 100, required: true },
  chassisNo: { label: "Chassis No.", max: 50, required: true },
  engine: { label: "Engine Size", max: 30 },
  engineVariant: { label: "Engine Variant", max: 100 },
  scrapYardName: { label: "Where", max: 100, required: true },
  scrapYardLocation: { label: "Location", max: 100, required: true },
  fuelType: { label: "Fuel Type", max: 50, required: true },
};

/**
 * Form rules for a Car Details text field: required fields reject blank /
 * spaces-only input; the length limits count the trimmed text.
 * @param {string} name key of CAR_TEXT_FIELDS
 */
export const carTextRules = (name) => {
  const { label, max, min, required } = CAR_TEXT_FIELDS[name];
  return [
    ...(required
      ? [{ required: true, whitespace: true, message: `${label} is required` }]
      : []),
    {
      validator: (_, value) => {
        const text = value === undefined || value === null ? "" : String(value).trim();
        if (!text) return Promise.resolve();
        if (min && text.length < min)
          return Promise.reject(new Error(`${label} must be at least ${min} characters`));
        if (text.length > max)
          return Promise.reject(new Error(`${label} must be at most ${max} characters`));
        return Promise.resolve();
      },
    },
  ];
};

/**
 * Returns a copy of `data` with the Car Details text fields trimmed.
 * @param {object} data
 */
export const trimCarText = (data) => {
  const out = { ...data };
  Object.keys(CAR_TEXT_FIELDS).forEach((name) => {
    if (typeof out[name] === "string") out[name] = out[name].trim();
  });
  return out;
};

/**
 * Helper to get the label for a negotiation key
 * @param {string} key
 * @returns {string}
 */
/**
 * Car Price step: Our Price and Customer Price are numbers from 0 to
 * MAX_CAR_PRICE with at most 2 decimal places. The boxes ignore typing above
 * the maximum or a 3rd decimal; this rule also catches pasted / loaded
 * values. The server checks the same (carPriceError in
 * auto-hub-backend/controllers/carIntake.controller.js).
 */
export const MAX_CAR_PRICE = 999999.99;
export const carPriceRule = (label) => ({
  validator: (_, value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return Promise.resolve(); // the required rule reports blanks
    }
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      return Promise.reject(new Error(`${label} must be a number of 0 or more`));
    }
    if (n > MAX_CAR_PRICE) {
      return Promise.reject(new Error(`${label} can be at most $${MAX_CAR_PRICE.toLocaleString("en-US")}`));
    }
    if (!/^\d+(\.\d{1,2})?$/.test(String(value).trim())) {
      return Promise.reject(new Error(`${label} can have at most 2 decimal places`));
    }
    return Promise.resolve();
  },
});

export const getNegotiationLabel = (key) => {
  if (!key) return "Not selected";
  const option = NEGOTIATION_OPTIONS.find((opt) => opt.value === String(key));
  return option ? option.label : key;
};

/**
 * Step 3 (Car Diagnosis) part Weight and Dimensions. The parts later go to
 * inventory (Add To Inventory), so these must be values the inventory
 * accepts (auto-hub-backend/utils/inventoryFieldRules.js):
 *  - Weight: optional, a number from 0 to 15,000 with up to 2 decimals
 *    (the inventory rule: weightError in components/inventory/fieldRules.js).
 *  - Dimensions: optional free text such as `24 x 12.5 x 6 in`, at most 100
 *    characters (the inventory limit); every number in it has at most 5
 *    digits before and 2 after one decimal point ("12.345", "1.2.3" and
 *    "1..2" are rejected).
 * The backend checks the same (validateIntakeParts in
 * auto-hub-backend/controllers/carIntake.controller.js).
 */
export const partWeightError = weightError;

export const MAX_PART_DIMENSIONS_LENGTH = 100;
const DIMENSION_NUMBER = /^(\d{1,5}(\.\d{0,2})?|\.\d{0,2})$/;

export const partDimensionsError = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (text.length > MAX_PART_DIMENSIONS_LENGTH) {
    return `Dimensions must be at most ${MAX_PART_DIMENSIONS_LENGTH} characters`;
  }
  const numbers = text.split(/[^\d.]+/).filter(Boolean);
  if (numbers.some((n) => !DIMENSION_NUMBER.test(n))) {
    return "Dimensions: each number can have only one decimal point and up to 2 decimals (e.g. 24 x 12.5 x 6 in)";
  }
  return null;
};

const partLabel = (key) =>
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * First problem with a selected part's Weight / Dimensions in the Step 3
 * diagnosis (`{ partKey: { selected, unit, weight, dimensions, ... } }`), as a
 * message naming the part, or null when all are valid. Parts that are not
 * selected are not checked (their boxes are disabled and they never go to
 * inventory).
 */
export const findDiagnosisPartError = (diagnosis) => {
  for (const [key, part] of Object.entries(diagnosis || {})) {
    if (!part || typeof part !== "object" || part.selected !== true) continue;
    const err = weightError(part.weight) || partDimensionsError(part.dimensions);
    if (err) return `${partLabel(key)}: ${err}`;
  }
  return null;
};

/**
 * Step 5 Date of Selling: today or earlier, never a future day. The backend
 * rejects a future date too (validateSellingDate in carIntake.controller.js).
 */
export const SELLING_DATE_FUTURE_MESSAGE = "Date of Selling cannot be a future date";
export const isFutureSellingDate = (value) => {
  if (value === undefined || value === null || value === "") return false;
  const d = dayjs(value);
  return d.isValid() && d.isAfter(dayjs(), "day");
};
export const sellingDateRule = {
  validator: (_, value) =>
    isFutureSellingDate(value)
      ? Promise.reject(new Error(SELLING_DATE_FUTURE_MESSAGE))
      : Promise.resolve(),
};

/**
 * Helper to get the label for a vehicle source value
 * @param {string} value
 * @returns {string}
 */
export const getVehicleSourceLabel = (value) => {
  if (!value) return "Not selected";
  const option = VEHICLE_SOURCE_OPTIONS.find((opt) => opt.value === String(value));
  return option ? option.label : value;
};
