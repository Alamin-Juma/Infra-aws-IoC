import React, { useState } from "react";
import withAuth from "../../../utils/withAuth";
import MainLayout from "../../../layouts/MainLayout";
import MaintenanceScheduleTable from "../../../components/MaintenanceScheduleTable";
import {
  Calendar,
  Clock,
  AlertTriangle,
  BadgeCheck,
  Repeat
} from 'lucide-react';
import CreateScheduleModal from "../../../components/CreateScheduleModal";
import { useEffect } from "react";
import api from "../../../utils/apiInterceptor";
import { toPascalCase } from "../../../utils/toPascalCase";

const mockSchedules = [
  {
    id: "1",
    title: "Server Room AC Maintenance",
    deviceTypes: ["HVAC"],
    pattern: "Monthly",
    recurring: true,
    assignees: ["John Doe", "Maintenance Team"],
    nextDue: "2024-01-15",
    status: "upcoming",
    createdBy: "Admin",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    title: "Network Equipment Check",
    deviceTypes: ["Network"],
    pattern: "Weekly",
    recurring: true,
    assignees: ["IT Team"],
    nextDue: "2024-01-10",
    status: "overdue",
    createdBy: "IT Manager",
    createdAt: "2023-12-15",
  },
  {
    id: "3",
    title: "Office Equipment Maintenance",
    deviceTypes: ["Office Equipment"],
    pattern: "Quarterly",
    recurring: false,
    assignees: ["Office Manager"],
    nextDue: "2024-02-01",
    status: "upcoming",
    createdBy: "Admin",
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    title: "Security System Check",
    deviceTypes: ["Security"],
    pattern: "Monthly",
    recurring: true,
    assignees: ["Security Team"],
    nextDue: "2024-01-20",
    status: "upcoming",
    createdBy: "Security Manager",
    createdAt: "2024-01-02",
  },
  {
    id: "5",
    title: "Power Systems Maintenance",
    deviceTypes: ["Power"],
    pattern: "Quarterly",
    recurring: true,
    assignees: ["Facilities Team"],
    nextDue: "2024-03-01",
    status: "upcoming",
    createdBy: "Facilities Manager",
    createdAt: "2024-01-03",
  },
  {
    id: "6",
    title: "Safety Equipment Inspection",
    deviceTypes: ["Safety"],
    pattern: "Monthly",
    recurring: true,
    assignees: ["Safety Team"],
    nextDue: "2024-01-25",
    status: "upcoming",
    createdBy: "Safety Manager",
    createdAt: "2024-01-04",
  },
  {
    id: "7",
    title: "IT Infrastructure Maintenance",
    deviceTypes: ["IT Equipment", "Network"],
    pattern: "Bi-weekly Inspection",
    recurring: true,
    assignees: ["IT Team", "John Doe"],
    nextDue: "2024-01-12",
    status: "completed",
    createdBy: "IT Manager",
    createdAt: "2023-12-20",
  },
  {
    id: "8",
    title: "Building Systems Check",
    deviceTypes: ["Building Systems"],
    pattern: "Monthly",
    recurring: true,
    assignees: ["Maintenance Team"],
    nextDue: "2024-01-30",
    status: "upcoming",
    createdBy: "Building Manager",
    createdAt: "2024-01-06",
  },
  {
    id: "9",
    title: "Critical Systems Testing",
    deviceTypes: ["Power", "Safety"],
    pattern: "Weekly",
    recurring: true,
    assignees: ["Facilities Team"],
    nextDue: "2024-01-08",
    status: "overdue",
    createdBy: "Facilities Manager",
    createdAt: "2023-12-25",
  },
  {
    id: "10",
    title: "Comprehensive Office Maintenance",
    deviceTypes: ["Office Equipment", "HVAC"],
    pattern: "Weekly",
    recurring: true,
    assignees: ["Cleaning Team"],
    nextDue: "2024-01-14",
    status: "upcoming",
    createdBy: "Office Manager",
    createdAt: "2024-01-07",
  },
]

const MaintenanceSchedule = () => {
  const [schedules, setSchedules] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [scheduleToCancel, setScheduleToCancel] = useState(null)
  const [deviceTypes, setDeviceType] = useState([]);
  
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const result = await api.get(
      `/api/maintenance-schedules${statusFilter.toLowerCase() !== 'all' ? `?status=${statusFilter}` : ''}`
    );
    setSchedules(result.data.data.maintenanceSchedules);
  }

  useEffect(() => {
    if(schedules?.length > 0){
      const inferedDeviceTypes = Array.from(new Set(schedules?.flatMap((schedule) => schedule.deviceType.name))).sort();
      setDeviceType(inferedDeviceTypes);
    }
  }, [schedules])

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1)
    if (filterType === "status") {
      setStatusFilter(value)
    } else if (filterType === "deviceType") {
      setDeviceTypeFilter(value)
    }
  }

  const setPage = (page) => setCurrentPage(page);

  const handleCreateSchedule = (scheduleData) => {
  
  }

  const refreshSchedules = async () => {
    await fetchSchedules();
  }

  const handleCancelSchedule = (id) => {
      const schedule = schedules?.find((s) => s.id === id)
      setScheduleToCancel(schedule)
      setShowCancelDialog(true)
  }

  return (
    <div>  
      <div className="flex h-screen">
        <div className="flex-1 p-8">
          <div className="mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Maintenance Schedule</h1>
                <p className="text-gray-600 mt-2">Plan and manage preventive maintenance tasks</p>
              </div>
              <CreateScheduleModal handleCancelSchedule={handleCreateSchedule} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <span className="text-2xl"><Calendar size={24} className="mr-1" /></span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{schedules?.length}</p>
                      <p className="text-sm text-gray-600">Total Schedules</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <span className="text-2xl"><Clock size={24} /></span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {schedules?.filter((s) => s.status.toLowerCase() === "upcoming").length}
                      </p>
                      <p className="text-sm text-gray-600">Upcoming</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <span className="text-2xl"><AlertTriangle size={24} /></span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {schedules?.filter((s) => new Date(s.nextDue).getDate() < new Date().getDate).length}
                      </p>
                      <p className="text-sm text-gray-600">Overdue</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <span className="text-2xl">
                        <BadgeCheck size={24} />
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {schedules?.filter((s) => s.status.toLowerCase() === "upcoming").length}
                      </p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-[#8BC34A]"><Calendar size={24} className="mr-1" /></span>
                      Maintenance Schedules
                    </h2>
                    <p className="text-gray-600 text-sm">View and manage all maintenance schedules</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] w-40"
                    >
                      <option value="all">All Status</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <select
                      value={deviceTypeFilter}
                      onChange={(e) => handleFilterChange("deviceType", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8BC34A] w-48"
                    >
                      <option value="all">All Device Types</option>
                      {deviceTypes.map((type) => (
                        <option key={type} value={type}>
                          {toPascalCase(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <MaintenanceScheduleTable 
                schedules={schedules} 
                statusFilter={statusFilter} 
                deviceTypeFilter={deviceTypeFilter} 
                currentPage={currentPage}
                setCurrentPage={setPage}
                handleCancelSchedule={handleCancelSchedule}
                refreshSchedules={refreshSchedules}
              />
            </div>
          </div>
        </div>
      </div>
    </div>  
  )
}

const WrappedSchedules = withAuth(MaintenanceSchedule);

export default () => (
  <MainLayout>
    <WrappedSchedules />
  </MainLayout>
);
