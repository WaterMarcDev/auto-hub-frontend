// Single source of truth for the Waiver "Customer Type" selector.
// Values map to the optional `type` field persisted on the Customer document
// (Customer.type = "seller" | "buyer"). This is deliberately distinct from the
// legacy Waiver.customerType field, which is unused by the live Waiver UI.
export const CUSTOMER_TYPE_OPTIONS = [
  { value: "seller", label: "Seller" },
  { value: "buyer", label: "Buyer" },
];

// Default selection used to initialise the form (must be a valid value).
export const DEFAULT_CUSTOMER_TYPE = "seller";

// Returns the human-readable label for a stored type value.
// Non-destructive: unknown/absent values yield an empty string so callers can
// choose their own fallback (e.g. "N/A") without fabricating a type.
export const getCustomerTypeLabel = (type) =>
  CUSTOMER_TYPE_OPTIONS.find((option) => option.value === type)?.label || "";
