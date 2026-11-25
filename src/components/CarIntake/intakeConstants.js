/**
 * Shared constants for the Car Intake process
 */

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
export const getNegotiationLabel = (key) => {
  if (!key) return "Not selected";
  const option = NEGOTIATION_OPTIONS.find((opt) => opt.value === String(key));
  return option ? option.label : key;
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
