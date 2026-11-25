// "1 + n" persons for a check-in (customer + people entering with them).
// Hover shows each extra person's name and mobile number.
import React from "react";
import { Tooltip, Tag } from "antd";
import { personsList } from "../../utils/checkInPersons";

const PersonsCell = ({ checkIn }) => {
  const n = Number(checkIn?.numberOfPersons) || 0;
  const list = personsList(checkIn);
  const tag = <Tag color={n > 0 ? "blue" : "default"}>{`1 + ${n}`}</Tag>;
  if (!list.length) return tag;
  return (
    <Tooltip
      title={
        <div>
          {list.map((p, i) => (
            <div key={i}>
              {i + 1}. {p.fullName} · {p.mobileNo}
            </div>
          ))}
        </div>
      }
    >
      {tag}
    </Tooltip>
  );
};

export default PersonsCell;
