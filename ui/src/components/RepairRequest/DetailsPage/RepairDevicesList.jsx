import React, { useCallback, useEffect, useState } from "react";
import TanstackDataTable from "../../TanstackDataTable";
import repairDeviceColumns from "./Tables/Columns";
import { CiSearch } from "react-icons/ci";

const statusOptions = {
  ALL: "All Statuses",
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  FIXED: "Fixed",
  RETIRED: "Retired",
  ASSIGNED_TO_VENDOR: "Assigned to Vendor",
};

let defaultFilters = {
  status: "ALL",
  query: undefined,
};

function RepairDevicesList({ repairDevices }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [filteredDevices, setFilteredDevices] = useState(repairDevices);
  const applyStatusFilter = useCallback((status, records = []) => {
    if (status == "ALL") return records;

    return records.filter(
      (record) => record.currentStatus.toUpperCase() == status.toUpperCase(),
    );
  }, []);

  const applySerialNumberQuery = useCallback((query, records = []) => {
    if (query == "" || query == undefined) return records;

    return records.filter((record) => {
      const serialNumber = record.device.serialNumber.toLowerCase();
      return serialNumber.includes(query.toLowerCase());
    });
  }, []);

  useEffect(() => {
    if (filters != defaultFilters) {
      let records = repairDevices;
      records = applySerialNumberQuery(filters.query, records);
      records = applyStatusFilter(filters.status, records);

      setFilteredDevices(records);
    } else {
      setFilteredDevices(repairDevices);
    }
  }, [filters, repairDevices, applySerialNumberQuery, applyStatusFilter]);

  return (
    <section className="w-full">
      <div className="w-full flex flex-row items-center gap-4 justify-between my-6">
        <div className="h-12 flex flex-col flex-1 gap-1">
          <h4 className="font-bold text-lg lg:text-xl">Device List</h4>
          <p className="text-sm text-gray-600">
            {repairDevices.length} devices in this request
          </p>
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 gap-4">
            <label className="col-span-1 sm:col-span-2 text-sm font-bold -mb-2">
              Search
            </label>
            <div className="col-span-1 h-12 relative">
              <input
                type="text"
                placeholder="Search by Request ID"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#8BC34A] text-sm rounded-md pl-10"
                value={filters.query || ""}
                onChange={(v) =>
                  setFilters((prev) => {
                    return { ...prev, query: v.target.value };
                  })
                }
              />
              <CiSearch className="absolute top-3 left-4 text-gray-700" />
            </div>
          </div>
          <div className="col-span-1 h-12">
            <div className="form-field">
              <label className="col-span-1 sm:col-span-2 text-sm font-bold">
                Status
              </label>
              <select
                className="select min-w-full block w-full h-10 px-4 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                id="status"
                name="status"
                value={filters?.status}
                onChange={(v) => {
                  setFilters((prev) => {
                    return {
                      ...prev,
                      status: v.target.value,
                    };
                  });
                }}
              >
                {Object.entries(statusOptions).map(([key, value], idx) => {
                  return (
                    <option value={key} key={key}>
                      {value}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
      <TanstackDataTable columns={repairDeviceColumns} data={filteredDevices} />
    </section>
  );
}

export default RepairDevicesList;
