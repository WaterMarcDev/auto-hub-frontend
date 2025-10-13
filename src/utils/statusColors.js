// Shared status -> Tag color mapping for the app
// Use Ant Design tag color names: magenta, red, volcano, orange, gold, lime, green, cyan, blue, geekblue, purple
export const STATUS_COLORS = {
  // intake flow
  intake: "blue",
  "vin-fetched": "cyan",
  "details-uploaded": "geekblue",
  "images-uploaded": "magenta",
  "parts-uploaded": "gold",
  "price-uploaded": "orange",
  "kyc-uploaded": "purple",

  // payment / inventory / lifecycle
  "payment-done": "green",
  "part-added-to-inventory": "lime",
  "car-added-to-inventory": "lime",
  "elements-scraped": "gold",

  // final outcomes
  scraped: "red",
  sold: "volcano",
  towed: "orange",

  // checkin flow
  "checked-in": "blue",
  "checked-out": "green",

  // fallback statuses that may appear in the UI
  default: "default",
};

export function getStatusColor(status) {
  if (!status) return STATUS_COLORS["intake"] || "blue";
  return STATUS_COLORS[status] || STATUS_COLORS["default"] || "default";
}

export default getStatusColor;
