// Form rule: a weight can have at most 2 decimal places (every weight in the
// CRM). Blank values are left to the `required` rule. Mirrors the server
// check in auto-hub-backend/utils/vehicleWeight.js (weightDecimalsError).
export const MAX_WEIGHT_DECIMALS = 2;

// Every weight in the CRM is at most this many lbs (server: weightLimitError
// in auto-hub-backend/utils/vehicleWeight.js).
export const MAX_CRM_WEIGHT_LBS = 15000;
export const weightLimitRule = (label = "Weight") => ({
  validator: (_, value) => {
    if (value === undefined || value === null || String(value).trim() === "") return Promise.resolve();
    return Number(value) > MAX_CRM_WEIGHT_LBS
      ? Promise.reject(new Error(`${label} can be at most ${MAX_CRM_WEIGHT_LBS.toLocaleString("en-US")} lbs`))
      : Promise.resolve();
  },
});

// Car Intake Height / Width / Length (optional, inches): 0 to
// MAX_DIMENSION_IN, at most 2 decimals (server: carDimensionsError).
export const MAX_DIMENSION_IN = 1000;
export const dimensionRule = (label) => ({
  validator: (_, value) => {
    if (value === undefined || value === null || String(value).trim() === "") return Promise.resolve();
    const text = String(value).trim();
    if (!/^\d+(\.\d+)?$/.test(text)) return Promise.reject(new Error(`${label} must be a number of 0 or more`));
    if (Number(text) > MAX_DIMENSION_IN) {
      return Promise.reject(new Error(`${label} can be at most ${MAX_DIMENSION_IN.toLocaleString("en-US")} in`));
    }
    const dec = text.split(".")[1] || "";
    return dec.length > MAX_WEIGHT_DECIMALS
      ? Promise.reject(new Error(`${label} can have at most ${MAX_WEIGHT_DECIMALS} decimal places`))
      : Promise.resolve();
  },
});

export const weightDecimalsRule = (label = "Weight") => ({
  validator: (_, value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return Promise.resolve();
    }
    const match = String(value).trim().match(/^\d*\.(\d+)$/);
    return match && match[1].length > MAX_WEIGHT_DECIMALS
      ? Promise.reject(new Error(`${label} can have at most ${MAX_WEIGHT_DECIMALS} decimal places`))
      : Promise.resolve();
  },
});
