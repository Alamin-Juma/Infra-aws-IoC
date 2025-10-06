import React from "react";
import { formatDate } from "../../../../utils/formatDate";
import { Link } from "react-router-dom";
import { RowActions } from "./RowActions";

const repairDeviceColumns = [
  {
    header: "Device ID",
    accessorKey: "deviceId",
    cell: ({ getValue }) => {
      const deviceId = `DEV-${getValue()}`;
      return (
        <Link
          className="text-blue-500 hover:text-blue-500/80 font-medium"
          to={`/app/inventory/device-details/${getValue()}`}
        >
          {deviceId}
        </Link>
      );
    },
  },
  {
    header: "Device",
    accessorKey: "device.serialNumber",
  },
  {
    header: "Status",
    accessorKey: "currentStatus",
    cell: ({ getValue }) => {
      const colorsMap = {
        pending: "bg-blue-500/30 text-blue-500",
        fixed: "bg-green-500/30 text-green-500",
        retired: "bg-red-500/30 text-red-500",
        assigned_to_vendor: "bg-purple-500/30 text-purple-500",
      };

      const label = getValue() ?? "";
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
    },
  },
  {
    header: "Date Submitted",
    accessorKey: "createdOn",
    cell: ({ getValue }) => {
      const createdAt = getValue();
      return (
        <div className="flex flex-row gap-2 items-center">
          {formatDate(createdAt)}
        </div>
      );
    },
  },
  {
    header: "Actions",
    accessorKey: "id",
    cell: () => {
      return <RowActions />;
    },
  },
];

export default repairDeviceColumns;
