import React from "react";
import { Tag } from "antd";

// Colored tag for a car's pickup type (CarIntake.kyc.pickupType), so
// "You Pull" and "We Pull" cars are easy to tell apart in lists and details.
const PICKUP_COLORS = {
  "You Pull": "blue",
  "We Pull": "purple",
  Bulk: "orange",
  Location: "cyan",
  "Brought In": "green",
};

const PickupTypeTag = ({ value }) => {
  if (!value) return <span style={{ color: "#999" }}>N/A</span>;
  return <Tag color={PICKUP_COLORS[value] || "default"}>{value}</Tag>;
};

export default PickupTypeTag;
