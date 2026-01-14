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
 * Helper to get the label for a negotiation key
 * @param {string} key
 * @returns {string}
 */
export const getNegotiationLabel = (key) => {
  if (!key) return "Not selected";
  const option = NEGOTIATION_OPTIONS.find((opt) => opt.value === String(key));
  return option ? option.label : key;
};
