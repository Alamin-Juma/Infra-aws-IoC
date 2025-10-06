import React from "react";

function RepairRequestSeverity({ label = "" }) {
  const severityColors = {
    high: "bg-orange-500",
    critical: "bg-red-500",
    low: "bg-blue-500",
  };

  const key = String(label).toLowerCase();
  const bgClass = severityColors[key] ?? "bg-gray-200";
  const textClass = Object.hasOwn(severityColors, key)
    ? "text-white"
    : "text-gray-700";

  return (
    <div
      className={`rounded-full inline-block px-3 py-1 text-xs font-semibold capitalize ${bgClass} ${textClass}`}
    >
      {label || "-"}
    </div>
  );
}

export default RepairRequestSeverity;
