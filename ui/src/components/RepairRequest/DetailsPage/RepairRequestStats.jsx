import React from "react";
import { FiMonitor } from "react-icons/fi";
import { FaRegClock } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { BsPersonX } from "react-icons/bs";

const statusOptions = [
  {
    key: "PENDING",
    label: "Pending",
    count: 0,
    icon: FiMonitor,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-600/20",
  },
  {
    key: "IN_PROGRESS",
    label: "In Progress",
    count: 0,
    icon: FaRegClock,
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-600/20",
  },
  {
    key: "FIXED",
    label: "Fixed",
    count: 0,
    icon: FiCheckCircle,
    iconColor: "text-green-600",
    bgColor: "bg-green-600/20",
  },
  {
    key: "RETIRED",
    label: "Retired",
    count: 0,
    icon: BsPersonX,
    iconColor: "text-gray-600",
    bgColor: "bg-gray-400/20",
  },
];

function RepairRequestStats({ repairDevices = [] }) {
  const statusCounts = repairDevices.reduce((acc, device) => {
    const status = device.currentStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="w-full grid grid-cols-2 lg:grid-cols-4 gap-6 py-6">
      {statusOptions.map((option, idx) => {
        const recordCount =
          option.key == "TOTAL"
            ? repairDevices.length
            : statusCounts[option.key] || option.count;

        return (
          <div
            key={idx}
            className="flex flex-row gap-3 items-center border border-gray-300 rounded-lg shadow-lg p-6 px-8"
          >
            <div
              className={`rounded-md p-1 size-12 ${option.bgColor} flex flex-col justify-center items-center`}
            >
              <option.icon className={`${option.iconColor} size-6`} />
            </div>

            <div className="flex flex-col">
              <h5 className="text-xl font-bold">{recordCount}</h5>
              <p className="text-gray-600 text-sm font-medium">
                {option.label}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default RepairRequestStats;
