import React from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  XCircle,
  Edit,
  Calendar,
  Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toPascalCase } from "../utils/toPascalCase";
import api from "../utils/apiInterceptor";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 5

const MaintenanceScheduleTable = ({schedules = [], statusFilter, deviceTypeFilter, currentPage, setCurrentPage, handleCancelSchedule, refreshSchedules}) => {
    const filteredSchedules = schedules.filter((schedule) => {
        const statusMatch = statusFilter === "all" || schedule.status.toLowerCase() === statusFilter.toLowerCase()
        const deviceTypeMatch = deviceTypeFilter === "all" || schedule.deviceType.name.toLowerCase() === deviceTypeFilter.toLowerCase()
        return statusMatch && deviceTypeMatch
    })

    const totalPages = Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentSchedules = filteredSchedules.slice(startIndex, endIndex)

    const getStatusColor = (status) => {
        switch (status) {
        case "upcoming":
            return "bg-blue-100 text-blue-800"
        case "overdue":
            return "bg-red-100 text-red-800"
        case "completed":
            return "bg-green-100 text-green-800"
        default:
            return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
        case "upcoming":
            return <Clock size={14} />;
        case "overdue":
            return <AlertTriangle size={14} />;
        case "completed":
            return <Calendar size={14} />;
        default:
            return <Clock size={14} />;
        }
    }

    const getRandomColor = () => {
        const colors = [
            "bg-blue-100 text-blue-800",
            "bg-purple-100 text-purple-800",
            "bg-orange-100 text-orange-800",
            "bg-red-100 text-red-800",
            "bg-yellow-100 text-yellow-800",
            "bg-green-100 text-green-800",
            "bg-indigo-100 text-indigo-800",
            "bg-gray-100 text-gray-800",
        ];

        return colors[Math.floor(Math.random() * (colors.length - 1))] || "bg-gray-100 text-gray-800"
    }

    const handleCompleteSchedule = async (id) => {
        const scheduleToComplete = schedules.find((s) => s.id === id)
        if (scheduleToComplete) {
            const result = await Swal.fire({
                title: "Complete Schedule",
                text: "Are you sure you want to mark all entries in this schedule as complete?",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Yes, Mark Complete!",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#77B634",
                cancelButtonColor: "#aaa",
            })

            if (result.isConfirmed) {
                const response = await api.patch(`/api/maintenance-schedules/${id}/complete`);
                if(response.data.success) {
                    toast.success(response.data.message);
                    await refreshSchedules();
                }
            }
        }
    }

    const handleGoToServiceEntries = (scheduleId) => {
        window.location.href = `/maintenance/service-entries?schedule=${scheduleId}`
    }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Schedule",
            text: "Are you sure you want to delete this schedule?",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete it",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#aaa",
        });

        if (result.isConfirmed) {
            const response = await api.delete(`/api/maintenance-schedules/${id}`);
            if(response.data.success) {
                toast.success(response.data.message);
                await refreshSchedules();
            }
        }
    };

    const handleCancel = async (id) => {
        const result = await Swal.fire({
            title: "Cancel Schedule",
            text: "Are you sure you want to cancel this schedule?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Cancel it",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#aaa",
        })

        if (result.isConfirmed) {
            const response = await api.patch(`/api/maintenance-schedules/${id}/cancel`);
            if(response.data.success) {
                toast.success(response.data.message);
                await refreshSchedules();
            }
        }
    };

    return (
        <div className="p-6">
            <div className="space-y-4">
            {currentSchedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                <div className="text-6xl mb-4"><Calendar size={24} /></div>
                <p>No maintenance schedules found</p>
                <p className="text-sm">
                    {filteredSchedules.length === 0 && schedules.length > 0
                    ? "Try adjusting your filters"
                    : 'Click "Create Schedule" to get started'}
                </p>
                </div>
            ) : (
                <>
                {currentSchedules.map((schedule) => (
                    <div
                        key={schedule.id}
                        className="flex items-center justify-between p-6 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                        <div className="w-3/4 ">
                            <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-gray-900">{schedule.title}</h3>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}
                            >
                                {getStatusIcon(schedule.status)}
                                &nbsp;
                                {toPascalCase(schedule.status)}
                            </span>
                            {schedule.isRecurrent && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-600 border border-purple-200">
                                Recurrent
                                </span>
                            )}
                            </div>
                            
                            <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700">Device Types:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRandomColor()}`}
                                >
                                    {toPascalCase(schedule.deviceType.name)}
                                </span>
                            </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Pattern:</span> {schedule.pattern?.name}
                            </div>
                            <div>
                                <span className="font-medium">Next Due:</span> {schedule.nextDue}
                            </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Assignees:</span>{" "}
                                {schedule.assignment
                                    .map((item) => {
                                    const userName = item.assignedToUser
                                        ? `${toPascalCase(item.assignedToUser.firstName)} ${toPascalCase(item.assignedToUser.lastName)}`
                                        : null;

                                    const roleName = item.assignedToRole ? toPascalCase(item.assignedToRole.name) : null;

                                    return [userName, roleName].filter(Boolean).join(" / ");
                                    })
                                    .join(", ")
                                }
                            </div>
                        </div>
                        <div className="flex w-full md:w-1/4 flex-col items-end gap-2 ml-0 md:ml-4">
                            <div className="flex items-end items-center gap-2">
                                <button
                                    title="Edit Schedule"
                                    className="border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-sm transition-colors"
                                >
                                    <Edit className="w-4 h-4 text-gray-600" size={14} />
                                </button>

                                {!["COMPLETED"].includes(schedule.status) && (
                                    <button
                                        onClick={() => handleCancel(schedule.id)}
                                        title="Cancel Schedule"
                                        className="flex items-center border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm transition-colors"
                                    >
                                        <XCircle size={14} />
                                    </button>
                                )}

                                {!["IN_PROGRESS"].includes(schedule.status) && (
                                    <button
                                        onClick={() => handleDelete(schedule.id)}
                                        title="Delete Schedule"
                                        className="border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col [@media(min-width:1484px)]:flex-row gap-2 w-full md:w-auto">
                                <button
                                    className="flex items-center justify-center bg-[#8BC34A] hover:bg-[#7CB342] text-white px-3 py-1 rounded text-sm transition-colors"
                                    onClick={() => handleGoToServiceEntries(schedule.id)}
                                >
                                    <FileText size={14} />&nbsp; Service Entry
                                </button>
                                {["IN_PROGRESS"].includes(schedule.status) && (
                                    <button
                                        className="flex items-center justify-center bg-[#8BC34A] hover:bg-[#7CB342] text-white px-3 py-1 rounded text-sm transition-colors"
                                        onClick={() => handleCompleteSchedule(schedule.id)}
                                    >
                                        <CheckCircle size={14} />&nbsp; Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredSchedules.length)} of{" "}
                        {filteredSchedules.length} schedules
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                        className="border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        >
                        ← Previous
                        </button>
                        <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                                currentPage === page
                                ? "bg-[#8BC34A] text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                            >
                            {page}
                            </button>
                        ))}
                        </div>
                        <button
                        className="border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        >
                        Next →
                        </button>
                    </div>
                    </div>
                )}
                </>
            )}
            </div>
        </div>
    );
}

export default MaintenanceScheduleTable;