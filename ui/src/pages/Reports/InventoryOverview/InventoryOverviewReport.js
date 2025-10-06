import React, { useState, useEffect } from "react";
import { FaFileDownload, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineFilterAlt } from "react-icons/md";
import withAuth from "../../../utils/withAuth";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../utils/apiInterceptor";
import { toast } from "react-toastify";
import LoadingTable from "../../../components/LoadingTable";
import Lottie from "lottie-react";
import animationData from "../../../assets/lottie/no-data.json";
import Pagination from "../../../components/Pagination";
import { saveAs } from "file-saver";
import { toPascalCase } from "../../../utils/toPascalCase";

const InventoryOverview = () => {
  const [ticketsList, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    deviceType: "",
  });

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/devices/count?page=${page}&limit=${limit}&deviceType=${filters.deviceType}`
      );
      setTotal(response.data.total);
      setList(response.data.devices);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/devices/count`, {
        params: {
          deviceType: filters.deviceType,
          limit: 10000, // Large limit to fetch all data
        },
      });
      return response.data.devices || [];
    } catch (error) {
      setLoading(false);
      return [];
    } finally {
      setLoading(false);
    }
  };
  const fetchDeviceTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/deviceTypes?page=${1}&limit=${1000}`);
      setDeviceTypes(response.data.data);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDeviceTypes();
  }, [page, limit, filters]);

  // Export as PDF
  const exportToPDF = async () => {
    setIsOpen(false);
    const allData = await fetchAllData();

    const formattedDevices = allData.map((device) => {
      // Return the device with the new date format
      return {
        ...device,
        deviceType: toPascalCase(device.deviceType),
      };
    });

    const headersMap = [
      { header: "Device Type", key: "deviceType" },
      { header: "Count", key: "count" },
    ];

    try {
      setExporting(true);
      setIsOpen(false);
      const response = await api.post(
        `/api/device-activities/generate-pdf`,
        {
          data: formattedDevices,
          options: {
            title: "Inventory Overview Report",
            format: "table",
            margin: 50,
            themeColor: "#77B634",
            logo: "https://zeroman.sirv.com/Images/logo.png",
            filename: "inventory-overview-report",
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

  // Export as CSV
  const exportToCSV = async () => {
    setIsOpen(false);
    setExporting(true);
    try {
      const allData = await fetchAllData();
      if (!allData.length) {
        alert("No data available for export.");
        return;
      }

      const csvContent = [
        ["#", "Device Type", "Count"],
        ...allData.map((device, index) => [
          index + 1,
          toPascalCase(device?.deviceType) || "",
          device?.count,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `Inventory_Overview_Report.csv`);
      setExporting(false);
      toast.success("Report exported successfully!");
    } catch (error) {
      setExporting(false);
      setLoading(false);
    }
  };

  return (
    <div data-testid="main-container" className="w-full p-2">
      <div className="flex items-center ">
        <h4 className="font-bold text-xl my-2">Inventory Overview</h4>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-4 w-full">
        {/* Filter Dropdown */}
        <div className="relative flex-shrink-0 min-w-[180px] max-w-[220px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdOutlineFilterAlt className="text-gray-500" />
          </div>
          <select
            className="select w-full pl-10 cursor-pointer"
            value={filters.deviceType}
            onChange={(e) =>
              setFilters({ ...filters, deviceType: e.target.value })
            }
          >
            <option value="">All Devices</option>
            {deviceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {toPascalCase(type.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Export Button - Pushed to far right */}
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
                onClick={exportToPDF}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FaFilePdf className="text-red-500 text-lg mr-2" />
                PDF
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FaFileCsv className="text-green-500 text-lg mr-2" />
                CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && <LoadingTable />}

      {!loading && (
        <div className="flex w-full overflow-x-auto">
          <table className="table-zebra table min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-6 py-3 text-left font-semibold">
                  Device Type
                </th>
                <th className="px-6 py-3 text-left font-semibold">Count</th>
                <th className="px-6 py-3 text-left font-semibold">Available</th>
                <th className="px-6 py-3 text-left font-semibold">Assigned</th>
                <th className="px-6 py-3 text-left font-semibold">Broken</th>
                <th className="px-6 py-3 text-left font-semibold">Lost</th>
              </tr>
            </thead>
            <tbody>
              {ticketsList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
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
              ) : (
                // Render the table rows if data exists
                ticketsList.map((device) => (
                  <tr
                    key={device.deviceType}
                    className="border border-gray-300"
                  >
                    <td className="px-6 py-3">
                      {toPascalCase(device?.deviceType)}
                    </td>
                    <td className="px-6 py-3">{device?.count}</td>
                    <td className="px-6 py-3">{device?.availableCount}</td>
                    <td className="px-6 py-3">{device?.assignedCount}</td>
                    <td className="px-6 py-3">{device?.brokenCount}</td>
                    <td className="px-6 py-3">{device?.lostCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
  );
};

const WrappedLanding = withAuth(InventoryOverview, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
