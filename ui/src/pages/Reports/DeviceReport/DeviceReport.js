import React, { useState, useEffect } from "react";
import api from "../../../utils/apiInterceptor";
import withAuth from "../../../utils/withAuth";
import MainLayout from "../../../layouts/MainLayout";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearchSharp } from "react-icons/io5";
import { FaFileDownload, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { MdOutlineCalendarMonth, MdOutlineFilterAlt } from "react-icons/md";
import { format, subDays } from "date-fns";
import Lottie from "lottie-react";
import DatePicker from "react-datepicker";
import Pagination from "../../../components/Pagination";
import animationData from "../../../assets/lottie/no-data.json";
import { snakeToSpacedPascal } from "../../../utils/snakeToPascalCase";
import { toSentenceCase } from "../../../utils/toSentenceCase";
import { useCallback } from "react";
import debounce from "lodash.debounce";
import { DEBOUNCETIMEOUT } from "../../../utils/constants";

const DeviceHistoryReport = () => {
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSerialSearch, setIsSerialSearch] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  });

  // Set default date range (last 30 days to today)
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const defaultDateTo = format(new Date(), "yyyy-MM-dd");

  const [filters, setFilters] = useState({
    deviceType: "",
    serialNumber: "",
    dateFrom: defaultDateFrom,
    dateTo: defaultDateTo,
  });

  useEffect(() => {
    if (filters.dateFrom && filters.dateTo) {
      fetchDeviceHistory();
      fetchDeviceTypes();
    }
  }, [
    filters.dateFrom,
    filters.dateTo,
    filters.deviceType,
    filters.serialNumber,
  ]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const fetchDeviceHistory = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setDeviceHistory([]);

      const params = {
        from: filters.dateFrom,
        to: filters.dateTo,
        page,
        limit,
        ...(filters.deviceType && { deviceTypeId: filters.deviceType }),
        ...(filters.serialNumber && { serialNumber: filters.serialNumber }),
      };

      const response = await api.get("/api/reports", { params });

      if (response.status === 200) {
        let { data, total } = response.data;

        data = data.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt).toLocaleDateString("en-US", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
          }),
          updatedAt: new Date(item.updatedAt).toLocaleDateString("en-US", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
          }),
        }));

        setDeviceHistory(data);
        setTotal(total);

        if (data.length === 0) {
          setErrorMessage(
            filters.serialNumber
              ? `No history found for serial number: ${filters.serialNumber}`
              : "No history found for the given date range."
          );
        }
      } else {
        throw new Error("Invalid response status");
      }
    } catch (error) {
      setDeviceHistory([]);
      setErrorMessage(
        "An error occurred while fetching data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await api.get("/deviceTypes");
      setDeviceTypes(response.data.data);
    } catch (error) {}
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "serialNumber") {
      setIsSerialSearch(value !== "");
      debouncedSetFilters(name, value);
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const debouncedSetFilters = useCallback(
    debounce((name, value) => {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }, DEBOUNCETIMEOUT),
    []
  );

  const handlePdfDownload = async () => {
    const headersMap = [
      { header: "Action", key: "activityType" },
      { header: "Notes", key: "description" },
      { header: "Performed By", key: "performedBy" },
      { header: "Date", key: "updatedAt" },
    ];

    const transformedData = deviceHistory.map((item) => ({
      activityType: item.activityType.name,
      description: item.description,
      performedBy: `${item.user.firstName} ${item.user.lastName}`,
      updatedAt: new Date(item.updatedAt).toLocaleString(),
    }));

    try {
      setExporting(true);
      setIsOpen(false);
      const response = await api.post(
        `/api/device-activities/generate-pdf`,
        {
          data: transformedData,
          options: {
            title: "Device History  Report",
            format: "table",
            margin: 50,
            themeColor: "#77B634",
            logo: "https://zeroman.sirv.com/Images/logo.png",
            filename: "device-history-report",
            headers: headersMap,
            footer: "© ITrack 2025",
            table: false,
            wrapText: true,
            minRowHeight: 20,
            maxTextHeight: 100,
            maxRows: 5000,
            footerMargin: 20,
            landscape: true,
            size: "A4",
          },
        },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setExporting(false);
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
    const transformedData = deviceHistory.map((item) => ({
      activityType: item.activityType.name,
      description: item.description,
      performedBy: `${item.user.firstName} ${item.user.lastName}`,
      updatedAt: new Date(item.updatedAt).toLocaleString(),
    }));

    const payload = {
      headers: [
        { header: "Action", key: "activityType" },
        { header: "Notes", key: "description" },
        { header: "Performed By", key: "performedBy" },
        { header: "Date", key: "updatedAt" },
      ],
      data: transformedData,
    };

    try {
      setExporting(true);
      setIsOpen(false);
      const response = await api.post(
        "/api/device-activities/download-csv",
        payload,
        {
          responseType: "blob",
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to download CSV");
      }

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "device-assignment-report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setExporting(false);
      return error;
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Devices History</h2>
      <div className="flex items-center justify-between mb-4 mr-3">
        <div className="flex flex-wrap items-center gap-3 py-4 w-full">
          <div className="relative flex-shrink-0 min-w-[180px] max-w-[220px]">
            <input
              type="text"
              className="input w-full pl-10 pr-4"
              placeholder="Search serial number..."
              name="serialNumber"
              onChange={handleFilterChange}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchSharp className="text-gray-500" />
            </div>
          </div>

          <div className="relative flex-shrink-0 min-w-[180px] max-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineFilterAlt className="text-gray-500" />
            </div>
            <select
              className="select w-full pl-10 cursor-pointer"
              name="deviceType"
              onChange={handleFilterChange}
            >
              <option value="">All Devices</option>
              {deviceTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

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

          <div className="flex-shrink-0 ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between bg-[#B6B634] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#9d9d2c] transition-all min-w-[140px]"
            >
              <FaFileDownload className="text-lg mr-2" />
              {exporting ? "Exporting..." : "Export"}
              {!exporting ? (
                <IoIosArrowDown className="ml-2 text-lg" />
              ) : (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border z-50">
                <button
                  onClick={handlePdfDownload}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FaFilePdf className="text-red-500 text-lg mr-2" />
                  PDF
                </button>
                <button
                  onClick={handleCsvDownload}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FaFileCsv className="text-green-500 text-lg mr-2" />
                  CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto border flex items-center justify-center">
        {loading && (
          <div className="text-center py-8">Loading device history...</div>
        )}

        {!loading && errorMessage && (
          <div className="flex items-center justify-center">
            <tr>
              <td colSpan="5" className="text-center">
                <div className="flex flex-col items-center justify-center">
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    className="h-40"
                  />
                  <span className="text-gray-600 text-lg font-semibold">
                    No Data
                  </span>
                </div>
              </td>
            </tr>
          </div>
        )}

        {!loading && !errorMessage && (
          <table className="table table-zebra w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Serial Number</th>
                <th className="p-2">Device Type</th>
                <th className="p-2">Action</th>
                <th className="p-2">Notes</th>
                <th className="p-2">Performed By</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {deviceHistory.length > 0 ? (
                deviceHistory.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.device.serialNumber}</td>
                    <td className="p-2">
                      {toSentenceCase(item.device.deviceType.name)}
                    </td>
                    <td className="p-2">
                      {snakeToSpacedPascal(item.activityType.name)}
                    </td>
                    <td className="p-2">{item.description || "N/A"}</td>
                    <td className="p-2">{`${item.user.firstName} ${item.user.lastName}`}</td>
                    <td className="p-2">
                      {format(new Date(item.createdAt), "MM/dd/yy")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Pagination
        total={total}
        limit={limit}
        page={page}
        handlePageChange={handlePageChange}
        handleLimitChange={handleLimitChange}
      />
    </div>
  );
};

const WrappedLanding = withAuth(DeviceHistoryReport, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
