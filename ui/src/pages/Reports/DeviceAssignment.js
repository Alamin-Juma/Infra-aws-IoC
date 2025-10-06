import React, { useState, useEffect } from 'react';
import withAuth from '../../utils/withAuth';
import MainLayout from '../../layouts/MainLayout';
import { FaFileDownload, FaFilePdf, FaFileCsv, FaFilter } from "react-icons/fa";
import api from '../../utils/apiInterceptor';
import { toast } from 'react-toastify';
import LoadingTable from '../../components/LoadingTable';
import { IoIosArrowDown } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdOutlineCalendarMonth, MdOutlineFilterAlt } from "react-icons/md";
import AssignmentHistoryTable from '../../components/AssignmentHistoryTable';
import Pagination from '../../components/Pagination';
import { toPascalCase } from '../../utils/toPascalCase';
import { formatDate, formatDateForFilter } from '../../utils/formatDate';
import { toSentenceCase } from '../../utils/toSentenceCase';

const DeviceAssignment = () => {

  const [userList, setUserList] = useState([]);
  const [deviceTypeList, setDeviceTypeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [deviceFilter, setDeviceFilter] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);



  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleApplyDateFilter = () => {
    const newStartDate = formatDateForFilter(startDate)
    const newEndDate = formatDateForFilter(endDate)
    if (endDate < startDate) {
      toast.warning("End date cannot be earlier than the start date.");
      return;
    }

    const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays > 90) {
      toast.warning("Date range should not exceed 90 days.");
      return;
    }

    filterByDate(newStartDate, newEndDate)
  };

  const filterByDate = async (start, end) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/device-activities/device-assignments`, {
        params: {
          page,
          limit,
          deviceType: '',
          activityType: '',
          startDate: start,
          endDate: end,
        },
      });
      setUserList(response.data.data);
      setTotal(response.data.totalCount);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {

      if (new Date(endDate).setHours(0, 0, 0, 0) < new Date(startDate).setHours(0, 0, 0, 0)) {
        toast.warning("End date cannot be earlier than the start date.");
        return;
      }

      const diffInDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      if (diffInDays > 90) {
        toast.warning("The selected date range cannot exceed 90 days");
        return;
      }

      const response = await api.get(`/api/device-activities/device-assignments`, {
        params: {
          page,
          limit,
          deviceType: deviceFilter,
          activityType: '',
          startDate: startDate,
          endDate: endDate,
        },
      });

      const formattedDevices = response.data.data.map(device => {    
        // Return the device with the new date format
        return {
          ...device,
          deviceType: toSentenceCase(device.deviceType),
          activityDate: formatDate(device.activityDate)
        };
      });
    
      setUserList(formattedDevices);
      setTotal(response.data.totalCount);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };


  const fetchDeviceTypes = async () => {
    try {
      const res = await api.get(`/deviceTypes?page=${1}&limit=${100}`);
      setDeviceTypeList(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch device types");
    }
  };

  const handlePdfDownload = async () => {
    const headersMap = [
      { header: "Device Type", key: "deviceType" },
      { header: "Serial Number", key: "serialNumber" },
      { header: "Manufacturer", key: "manufacturer" },
      { header: "Performed By", key: "performedBy" },
      { header: "Assigned User", key: "assignedUser" },
      { header: "Assignment Date", key: "activityDate" },
    ];

    try {
      setExporting(true);
      setIsOpen(false);
      const response = await api.post(
        `/api/device-activities/generate-pdf`,
        {
          data: userList,
          options: {
            title: "Device Assignment  Report",
            format: "table",
            margin: 50,
            themeColor: "#77B634",
            logo: "https://zeroman.sirv.com/Images/logo.png",
            filename: "device-assignment-report",
            headers: headersMap,
            footer: "© ITrack 2025",
            table: false,
            wrapText: true,
            minRowHeight: 20,
            maxTextHeight: 100,
            maxRows: 5000,
            footerMargin: 20,
            maxRows: 5000,
            landscape: true,
            size: 'A4'
          },
        },
        { responseType: "blob" }
      );


      // Use response.data because Axios wraps the response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setExporting(false);
      // Create a link element to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "device-report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      setExporting(false);
      return error;
    }
  };

  const handleCsvDownload = async () => {
    const payload = {
      headers: [
        { label: "Device Type", key: "deviceType" },
        { label: "Serial Number", key: "serialNumber" },
        { label: "Manufacturer", key: "manufacturer" },
        { label: "Performed By", key: "performedBy" },
        { label: "Assigned User", key: "assignedUser" },
        { label: "Assignment Date", key: "activityDate" },
      ],
      data: userList,
    };

    try {
      setExporting(true);
      setIsOpen(false);
      const response = await api.post("/api/device-activities/download-csv", payload, {
        responseType: "blob",
      });

      if (response.status !== 200) {
        throw new Error("Failed to download CSV");
      }

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "device-assignemnt-report.csv";
      setExporting(false);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    fetchReport();
    fetchDeviceTypes();
  }, [page, limit, deviceFilter, startDate, endDate]);

  return (
    <div data-testid="main-container" className="w-full h-full overflow-x-hidden">
      <h4 className='font-bold text-xl p-4 ml-2'>Device Assignment</h4>
      <div className="flex flex-wrap items-center gap-3 p-4 w-full">
        {/* Filter Dropdown */}
        <div className="relative flex-shrink-0 min-w-[180px] max-w-[220px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdOutlineFilterAlt className="text-gray-500" />
          </div>
          <select
            className="select w-full pl-10 cursor-pointer"
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
          >
            <option value="">All Devices</option>
            {deviceTypeList.map((d) => (
              <option className='cursor-pointer' value={d.name}>{toPascalCase(d.name)}</option>
            ))}
          </select>
        </div>

        {/* Date Range Section */}
        <div className="flex items-center flex-shrink-0 gap-2 min-w-0">
          <div className="relative min-w-[150px] max-w-[180px]">
            <DatePicker
              className="input w-full pl-10 pr-4"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineCalendarMonth className="text-gray-500" />
            </div>
          </div>

          <span className="text-gray-500 mx-1">to</span>

          <div className="relative min-w-[150px] max-w-[180px]">
            <DatePicker
              className="input w-full pl-10 pr-4"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineCalendarMonth className="text-gray-500" />
            </div>
          </div>
        </div>

        {/* Export Button - Pushed to far right */}
        <div className="flex-shrink-0 ml-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between bg-[#B6B634] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#9d9d2c] transition-all min-w-[140px]"
          >
            <FaFileDownload className="text-lg mr-2" />
            {exporting ? "Exporting..." : "Export"}
            {!exporting ? <IoIosArrowDown className="ml-2 text-lg" /> : <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          </button>


          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border z-50">
              <button onClick={handlePdfDownload} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                <FaFilePdf className="text-red-500 text-lg mr-2" />
                PDF
              </button>
              <button onClick={handleCsvDownload} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                <FaFileCsv className="text-green-500 text-lg mr-2" />
                CSV
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Data Section */}
      <div className="w-full px-4 pb-4">
        {loading ? (
          <LoadingTable />
        ) : (
          <div className="overflow-x-auto">
            <AssignmentHistoryTable data={userList} />
          </div>
        )}
        <Pagination
          total={total}
          limit={limit}
          page={page}
          handlePageChange={handlePageChange}
          handleLimitChange={handleLimitChange}
        />
      </div>
    </div>

  )
}

const WrappedLanding = withAuth(DeviceAssignment, false);
export default () => <MainLayout><WrappedLanding /></MainLayout>;
