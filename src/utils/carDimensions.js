// Car Intake dimensions: three optional fields, in inches.
// carDetails.dimensions (free text) is kept for older intakes; when any of
// the three fields is filled a matching summary is saved there too.

const isSet = (v) => v !== undefined && v !== null && v !== "";

// "H 58 x W 70 x L 180 in" (only the filled fields), or "" when none.
export const dimensionsSummary = ({ height, width, length } = {}) => {
  const parts = [
    isSet(height) && `H ${height}`,
    isSet(width) && `W ${width}`,
    isSet(length) && `L ${length}`,
  ].filter(Boolean);
  return parts.length ? `${parts.join(" x ")} in` : "";
};

// Fields to send to the backend from the Step 1 form data. Blank values are
// sent as "" so a cleared field is cleared on the record.
export const dimensionsPayload = (data = {}) => ({
  height: isSet(data.height) ? data.height : "",
  width: isSet(data.width) ? data.width : "",
  length: isSet(data.length) ? data.length : "",
  dimensions: dimensionsSummary(data) || data.dimensions || "",
});

// Upper weight limit from the VIN decode (GVWR class maximum), or null when
// there is none / the class is open-ended ("greater than 33,000 lb").
export const vehicleWeightMax = (vinData) => {
  const max = Number(vinData?.weightMax);
  return Number.isFinite(max) && max > 0 && max < Number.MAX_SAFE_INTEGER ? max : null;
};

// carDetails.weight is a string. Older intakes filled by the VIN job hold the
// GVWR class text there ("Class 1C: 4,001 - 5,000 lb ...") instead of a real
// weight, so only a plain number counts as a weight. Returns a number or null.
export const parseCarWeight = (weight) => {
  if (weight === undefined || weight === null) return null;
  const s = String(weight).trim().replace(/,/g, "").replace(/\s*lbs?$/i, "");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return n > 0 ? n : null;
};

// "3,200 lbs", or "" when no real weight was entered.
export const formatCarWeight = (weight) => {
  const n = parseCarWeight(weight);
  return n === null ? "" : `${n.toLocaleString()} lbs`;
};

// Text for lists / details: the three fields, else the old free text.
export const formatCarDimensions = (carDetails = {}) =>
  dimensionsSummary(carDetails) || carDetails.dimensions || "";
