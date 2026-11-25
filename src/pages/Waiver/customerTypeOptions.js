// Single source of truth for the Waiver "Customer Type".
// Values map to the optional `type` field persisted on the Customer document
// (Customer.type = "seller" | "buyer"). This is deliberately distinct from the
// legacy Waiver.customerType field, which is unused by the live Waiver UI.

// The waiver form is for buyers only. The seller-side waiver is switched off
// (set to true to bring the Seller option back).
export const SHOW_SELLER_WAIVER = false;

// Every known type, so existing seller records still show a label in the
// Waiver List / Details pages.
export const ALL_CUSTOMER_TYPE_OPTIONS = [
  { value: "seller", label: "Seller" },
  { value: "buyer", label: "Buyer" },
];

// Options offered in the waiver form.
export const CUSTOMER_TYPE_OPTIONS = SHOW_SELLER_WAIVER
  ? ALL_CUSTOMER_TYPE_OPTIONS
  : ALL_CUSTOMER_TYPE_OPTIONS.filter((option) => option.value === "buyer");

// Default selection used to initialise the form (must be a valid value).
export const DEFAULT_CUSTOMER_TYPE = "buyer";

// Returns the human-readable label for a stored type value.
// Non-destructive: unknown/absent values yield an empty string so callers can
// choose their own fallback (e.g. "N/A") without fabricating a type.
export const getCustomerTypeLabel = (type) =>
  ALL_CUSTOMER_TYPE_OPTIONS.find((option) => option.value === type)?.label || "";
