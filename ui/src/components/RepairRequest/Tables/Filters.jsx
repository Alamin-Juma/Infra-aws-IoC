import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

import { PiFunnel } from "react-icons/pi";
import { CiSearch } from "react-icons/ci";
import DatePicker from "react-datepicker";
import { FaRegCalendarAlt } from "react-icons/fa";
import api from "../../../utils/apiInterceptor";
import { isEqualOrBefore } from "../../../utils/util";

const statusOptions = {
    ALL: "All Statuses",
    SUBMITTED: "Submitted",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
};

const severityOptions = {
    ALL: "All Severities",
    High: "High",
    Critical: "Critical",
    Medium: "Medium",
    Low: "Low",
};

const defaultFilters = {
    dateFrom: "",
    dateTo: "",
    status: "ALL",
    severity: "ALL",
    assignedTo: "",
    deviceType: "",
}

export default function Filters({ onFiltersChangeAction }) {
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [users, setUsers] = useState([]);

    const [filters, setFilters] = useState(defaultFilters);

    const fetchDeviceTypes = async () => {
        try {
            const res = await api.get(`/deviceTypes`, {
                params: {
                    page: 1,
                    limit: 100,
                }
            });
            setDeviceTypes(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch device types");
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get(`/users/api/filter`, {
                params: {
                    page: 1,
                    limit: 100,
                },
            });
            setUsers(response.data.users);
        } catch (error) {
            throw new Error("An error occurred when fetching users.");
        }
    };


    useEffect(() => {
        fetchDeviceTypes();
        fetchUsers();
    }, [])


    useEffect(() => {
        onFiltersChangeAction(filters);
    }, [filters, onFiltersChangeAction])

    return (
        <section className="border border-gray-200 rounded-md shadow-lg p-6 bg-white mb-4 space-y-4 ">
            <div className="w-full flex flex-row gap-4 justify-between">
                <div className="flex flex-row items-center gap-1">
                    <PiFunnel className="text-green-600 size-5" />
                    <h3 className="text-lg lg:text-xl font-bold">Filters</h3>
                </div>

                <button
                    disabled={filters == defaultFilters}
                    onClick={() => {
                        setFilters(defaultFilters)
                    }}
                    className="px-4 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100 transition-all duration-150 text-sm text-gray-600">
                    Clear All Filters
                </button>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Search */}
                <div className="grid grid-cols-1 gap-4">
                    <label className="col-span-1 sm:col-span-2 text-sm font-bold -mb-2">
                        Search
                    </label>
                    <div className="col-span-1 h-12 relative">
                        <input
                            type="text"
                            placeholder="Search by Request ID"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8BC34A] text-sm rounded-md pl-10"
                        />
                        <CiSearch className="absolute top-3 left-4 text-gray-700" />
                    </div>
                </div>

                {/* Date range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <label className="col-span-1 sm:col-span-2 text-sm font-bold -mb-2 lg:-mb-4">
                        Date range
                    </label>
                    <div className="w-full">
                        <div className="relative w-full">
                            <DatePicker
                                wrapperClassName="w-full block"
                                selected={filters?.dateFrom ? new Date(filters.dateFrom) : null}
                                maxDate={new Date()}
                                onChange={(date) => {
                                  
                                    if (filters?.dateTo && !isEqualOrBefore(date, filters.dateTo)) {
                                        setFilters({
                                            ...filters,
                                            dateTo: "",
                                            dateFrom: date ? date.toLocaleDateString("en-CA") : "",
                                        });

                                    } else {
                                        setFilters({
                                            ...filters,
                                            dateFrom: date ? date.toLocaleDateString("en-CA") : "",
                                        });
                                    }
                                }}
                                className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                                placeholderText="From (mm/dd/yyyy)"
                                dateFormat="MM/dd/yyyy"
                                isClearable={!!filters?.dateFrom}
                            />
                            <FaRegCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="relative w-full">
                            <DatePicker
                                wrapperClassName="w-full block"
                                selected={filters?.dateTo ? new Date(filters.dateTo) : null}
                                onChange={(date) =>
                                    setFilters({
                                        ...filters,
                                        dateTo: date ? date.toLocaleDateString("en-CA") : "",
                                    })
                                }
                                className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                                placeholderText="To (mm/dd/yyyy)"
                                dateFormat="MM/dd/yyyy"
                                maxDate={new Date()}
                                minDate={filters?.dateFrom || null}
                                isClearable={!!filters?.dateTo}
                            />
                            <FaRegCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 pb-6">
                {/* Status */}
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
                {/* Severity */}
                <div className="col-span-1 h-12">
                    <div className="form-field">
                        <label className="col-span-1 sm:col-span-2 text-sm font-bold">
                            Severity
                        </label>
                        <select
                            className="select min-w-full block w-full h-10 px-4 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                            id="severity"
                            name="severity"
                            value={filters?.severity}
                            onChange={(v) => {
                                setFilters((prev) => {
                                    return {
                                        ...prev,
                                        severity: v.target.value,
                                    };
                                });
                            }}
                        >
                            {Object.entries(severityOptions).map(([key, value], idx) => {
                                return (
                                    <option value={key} key={key}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Assignee */}
                <div className="col-span-1 h-12">
                    <div className="form-field">
                        <label className="col-span-1 sm:col-span-2 text-sm font-bold">
                            Assignee
                        </label>
                        <select
                            className="select min-w-full block w-full h-10 px-4 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                            id="assignedTo"
                            name="assignedTo"
                            value={filters?.assignedTo}
                            onChange={(v) => {
                                setFilters((prev) => {
                                    return {
                                        ...prev,
                                        assignedTo: v.target.value,
                                    };
                                });
                            }}
                        >
                            <option value={""} key={""}>
                                All Assignees
                            </option>
                            {users.map((record, idx) => {
                                return (
                                    <option value={record.id} key={record.id}>
                                        {record.firstName} {record.lastName}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Device Type */}
                <div className="col-span-1 h-12">
                    <div className="form-field">
                        <label className="col-span-1 sm:col-span-2 text-sm font-bold">
                            Device Type
                        </label>
                        <select
                            className="select min-w-full block w-full h-10 px-4 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                            id="deviceType"
                            name="deviceType"
                            value={filters?.deviceType}
                            onChange={(v) => {
                                setFilters((prev) => {
                                    return {
                                        ...prev,
                                        deviceType: v.target.value,
                                    };
                                });
                            }}
                        >
                            <option value={""} key={""}>
                                All device types
                            </option>
                            {deviceTypes.map((record) => {
                                return (
                                    <option value={record.id} key={record.id}>
                                        {record.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>
        </section>
    );
}
