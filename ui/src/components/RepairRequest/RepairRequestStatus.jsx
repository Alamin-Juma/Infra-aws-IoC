import React from "react";

function RepairRequestStatus({ label = "" }) {
  const colorsMap = {
    submitted: "bg-blue-500/30 text-blue-500",
    in_progress: "bg-purple-500/30 text-purple-500",
    completed: "bg-green-500/30 text-green-500",
  };

  const key = String(label).toLowerCase();
  const classes = colorsMap[key] ?? "bg-gray-200";

  const normalizedStatus = label
    .split("_")
    .map((value) => {
      return value.toLowerCase();
    })
    .join(" ");

  return (
    <div
      className={`rounded-full inline-block px-3 py-1 text-xs font-semibold capitalize ${classes}`}
    >
      {normalizedStatus || "-"}
    </div>
  );
}

export default RepairRequestStatus;
