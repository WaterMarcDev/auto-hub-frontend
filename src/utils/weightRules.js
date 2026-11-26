// Form rule: a weight can have at most 2 decimal places (every weight in the
// CRM). Blank values are left to the `required` rule. Mirrors the server
// check in auto-hub-backend/utils/vehicleWeight.js (weightDecimalsError).
export const MAX_WEIGHT_DECIMALS = 2;

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
