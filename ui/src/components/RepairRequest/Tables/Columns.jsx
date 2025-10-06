import React from "react"
import { CiLocationOn } from "react-icons/ci";
import { formatDate } from "../../../utils/formatDate";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { AiOutlineUser } from "react-icons/ai";
import {truncate} from "lodash"

const repairRequestTableColumns = ({openQuickViewModal,deleteRepairRequest}) => ([
  {
    header: 'Request ID',
    accessorKey: 'id',
    cell: ({ getValue }) => `RR-${getValue()}`
  },
  {
    header: 'Device Count',
    accessorKey: '_count.repairDevices',
  },
  {
    header: 'Device Type',
    accessorKey: 'deviceType.name',
  },
  {
    header: 'Severity',
    accessorKey: "severity",
    cell: ({ getValue }) => {
      const severityColors = {
        high: "bg-orange-500",
        critical: "bg-red-500",
        low: "bg-blue-500",
      };

      const label = getValue() ?? "";
      const key = String(label).toLowerCase();
      const bgClass = severityColors[key] ?? "bg-gray-200";
      const textClass = Object.hasOwn(severityColors, key) ? "text-white" : "text-gray-700";

      return (
        <div
          className={`rounded-full inline-block px-3 py-1 text-xs font-semibold capitalize ${bgClass} ${textClass}`}
        >
          {label || "-"}
        </div>
      );
    },
  },
  {
    header: 'Location',
    accessorKey: 'location',
    cell: ({ getValue }) => {
      const location = getValue() ?? "";
      return (
        <div className="flex flex-row gap-2 items-center"><CiLocationOn className="size-4" />
         {truncate(location, {length:30})}
         </div>
      );
    },
  },
  {
    header: 'Assigned To',
    accessorKey: 'assignedTo',
    cell: ({ getValue }) => {
      const user = getValue() ?? "";
      const names = `${user?.firstName || ""} ${user?.lastName || ""}`;
      const hasName = names.trim() != "";

      return (
        <div >
          {!hasName && <>-</>}
          {hasName && <div className="flex flex-row gap-2 items-center"> <AiOutlineUser className="size-4" />
            {user?.firstName} {user?.lastName}</div>}
        </div>
      );
    },
  },
  {
    header: 'Status',
    accessorKey: "currentStatus",
    cell: ({ getValue }) => {
      const colorsMap = {
        "submitted": "bg-blue-500/30 text-blue-500",
        "in_progress": "bg-purple-500/30 text-purple-500",
        "completed": "bg-green-500/30 text-green-500",
      }

      const label = getValue() ?? "";
      const key = String(label).toLowerCase();
      const classes = colorsMap[key] ?? "bg-gray-200";

      const normalizedStatus = label.split("_").map((value) => {
        return value.toLowerCase();
      }).join(" ")

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
    header: 'Date Submitted',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const createdAt = getValue()
      return (
        <div className="flex flex-row gap-2 items-center">
          {formatDate(createdAt)}</div>
      );
    },
  },

  {
    header: 'Submitted By',
    accessorKey: 'createdBy',
    cell: ({ getValue }) => {
      const user = getValue() ?? "";
      const names = `${user?.firstName || ""} ${user?.lastName || ""}`;
      const hasName = names.trim() != "";

      return (
        <div >
          {!hasName && <>-</>}
          {hasName && <div className="flex flex-row gap-2 items-center"> <AiOutlineUser className="size-4" />
            {user?.firstName} {user?.lastName}</div>}
        </div>
      );
    },
  },
  {
    header: 'Actions',
    accessorKey: 'assignedBy',
    cell: ({ row }) => {
      return (
        <div className="flex flex-row items-center">
          <button
            onClick={() => { openQuickViewModal(row.original.id) }}
            className="btn btn-sm bg-transparent text-blue-500 hover:bg-blue-500/20"
          >
            <MdOutlineRemoveRedEye className="size-6 cursor-pointer" />
          </button>
          <button
            className="btn btn-sm bg-transparent text-green-500 hover:bg-green-500/20"
          >
            <HiOutlinePencilAlt className="size-5 cursor-pointer" />

          </button>
          <button
            onClick={() => {deleteRepairRequest(row.original.id) }}
            className="btn btn-sm bg-transparent text-red-500 hover:bg-red-500/20"
          >
            <FaRegTrashCan className="size-4 cursor-pointer" />
          </button>
        </div>
      );
    },
  },
]);

export default repairRequestTableColumns;