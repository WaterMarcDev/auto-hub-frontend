import React from "react";
import { Tooltip } from "antd";

// Table cell text that never overflows: one line, "..." and the full text
// in a tooltip.
const CellText = ({ text, maxWidth = 200, children }) => {
  if (!text) return children ?? "N/A";
  return (
    <Tooltip title={text} placement="topLeft">
      <span
        style={{
          display: "inline-block",
          maxWidth,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          verticalAlign: "middle",
        }}
      >
        {children ?? text}
      </span>
    </Tooltip>
  );
};

export default CellText;
