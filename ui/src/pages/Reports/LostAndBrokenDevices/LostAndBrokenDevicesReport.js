import React, { useState, useEffect } from "react";
import { FaFileDownload, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import withAuth from "../../../utils/withAuth";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../utils/apiInterceptor";
import { toast } from "react-toastify";
import LoadingTable from "../../../components/LoadingTable";
import Lottie from "lottie-react";
import { formatDate } from "../../../utils/formatDate";
import animationData from "../../../assets/lottie/no-data.json";
import Pagination from "../../../components/Pagination";
import jsPDF from "jspdf/dist/jspdf.umd";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { toPascalCase } from "../../../utils/toPascalCase";
import { toSentenceCase } from "../../../utils/toSentenceCase";
import { MdOutlineFilterAlt } from "react-icons/md";

const Tickets = () => {
  const [ticketsList, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [requestTypes, setRequestTypes] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const today = new Date();
  const formatTheDate = (date) => date.toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    requestType: "",
    dateRange: { from: formatTheDate(oneMonthAgo), to: formatTheDate(today) },
    manufacturer: "",
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
        `/externalRequest/lost-broken-requests?page=${page}&limit=${limit}&requestType=${filters.requestType}&manufacturer=${filters.manufacturer}&from=${filters.dateRange.from}&to=${filters.dateRange.to}`
      );
      setTotal(response.data.data.total);
      setList(response.data.data.requests);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/externalRequest/lost-broken-requests`, {
        params: {
          requestType: filters.requestType,
          manufacturer: filters.manufacturer,
          from: filters.dateRange.from,
          to: filters.dateRange.to,
          limit: 10000, // Large limit to fetch all data
        },
      });
      return response.data.requests || [];
    } catch (error) {
      setLoading(false);
      return [];
    } finally {
      setLoading(false);
    }
  };
  const fetchRequestTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/requestTypes`);
      setRequestTypes(response.data.data);
    } catch (error) {
      setLoading(false);
    }
  };
  const fetchManufacturers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/manufacturer`);
      setManufacturers(response.data.manufacturers);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRequestTypes();
    fetchManufacturers();
  }, [page, limit, filters]);

  // Export as PDF
  const exportToPDF = async () => {
    setIsOpen(false);
    const allData = await fetchAllData();
    if (!allData.length) {
      alert("No data available for export.");
      return;
    }

    try {
      //Title
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Lost & Broken Devices Report", 14, 10);

      const tableData = allData.map((request, index) => [
        index + 1,
        toPascalCase(request.device?.deviceType?.name) || "",
        toSentenceCase(request.requestType?.label) || "",
        request.device?.serialNumber || "",
        request.device?.manufacturer?.name || "",
        request.ticketTrails?.[0]?.ticketId || "",
        request.device?.deviceCondition?.name || "",
        new Date(request.createdAt).toLocaleDateString(), // Formatting date
      ]);

      autoTable(doc, {
        head: [
          [
            "#",
            "Device Type",
            "Request Type",
            "Serial No.",
            "Manufacturer",
            "Ticket No.",
            "Condition",
            "Reporting Date",
          ],
        ],
        body: tableData,
        headStyles: { fillColor: [34, 139, 34] },
      });

      doc.save(
        `lost_broken_devices_${filters.dateRange.from}_${filters.dateRange.to}.pdf`
      );
      toast.success("Report exported successfully!");
    } catch (error) {
      setLoading(false);
    }
  };

  // Export as CSV
  const exportToCSV = async () => {
    setIsOpen(false);
    try {
      const allData = await fetchAllData();
      if (!allData.length) {
        alert("No data available for export.");
        return;
      }

      const csvContent = [
        [
          "#",
          "Device Type",
          "Request Type",
          "Serial No.",
          "Manufacturer",
          "Ticket No.",
          "Condition",
          "Reporting Date",
        ],
        ...allData.map((request, index) => [
          index + 1,
          toPascalCase(request.device?.deviceType?.name) || "",
          toSentenceCase(request.requestType?.label) || "",
          request.device?.serialNumber || "",
          request.device?.manufacturer?.name || "",
          request.ticketTrails?.[0]?.ticketId || "",
          request.device?.deviceCondition?.name || "",
          request.createdAt.split("T")[0],
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(
        blob,
        `lost_broken_devices_${filters.dateRange.from}_${filters.dateRange.to}.csv`
      );
      toast.success("Report exported successfully!");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div data-testid="main-container" className="w-full h-full">
      <div className="flex flex-row w-full  gap-4 justify-between items-center">
        <div className="flex items-center ">
          <h4 className="font-bold text-xl my-2">Lost & Broken Devices</h4>
        </div>
        <div className="flex flex-row  gap-4"></div>
      </div>
      {loading && <LoadingTable />}
      <div className="flex justify-start py-4">
        <div className="flex gap-6 items-center">
          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineFilterAlt className="text-gray-500" />
            </div>
            <select
              className="select w-full pl-10 cursor-pointer"
              value={filters.requestType}
              onChange={(e) =>
                setFilters({ ...filters, requestType: e.target.value })
              }
            >
              <option value="">All Requests</option>
              {requestTypes
                .filter((type) => type.name !== "new_request") // Exclude "new_request"
                .map((type) => (
                  <option key={type.id} value={type.id}>
                    {toSentenceCase(type.label)}
                  </option>
                ))}
            </select>
          </div>

          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineFilterAlt className="text-gray-500" />
            </div>
            <select
              className="select w-full pl-10 cursor-pointer"
              value={filters.manufacturer}
              onChange={(e) =>
                setFilters({ ...filters, manufacturer: e.target.value })
              }
            >
              <option value="">All Manufacturers</option>
              {manufacturers.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col">
            <input
              type="date"
              className="border rounded min-w-[190px] border-[2px] rounded-[.75rem] h-[2.5rem] px-2"
              value={filters.dateRange.from}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, from: e.target.value },
                })
              }
            />
          </div>

          <span className="text-gray-500 mx-1">to</span>

          <div className="flex flex-col">
            <input
              type="date"
              className="border rounded min-w-[190px] border-[2px] rounded-[.75rem] h-[2.5rem] px-2"
              value={filters.dateRange.to}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, to: e.target.value },
                })
              }
            />
          </div>
        </div>
        <div className="relative justify-end flex-shrink-0 ml-auto">
          {/* Export Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between bg-[#B6B634] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#9d9d2c] transition-all min-w-[140px]"
          >
            <FaFileDownload className="text-lg mr-2" />
            {loading ? "Exporting..." : "Export"}
            <IoIosArrowDown className="ml-2 text-lg" />
          </button>

          {/* Dropdown Menu */}
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

      {!loading && (
        <div className="flex w-full overflow-x-auto">
          <table className="table-zebra table min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-6 py-3 text-left font-semibold">
                  Device Type
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Request Type
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Serial No.
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Manufacturer
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Ticket No.
                </th>
                <th className="px-6 py-3 text-left font-semibold">Condition</th>
                <th className="px-6 py-3 text-left font-semibold">
                  Reporting Date
                </th>
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
                ticketsList.map((request) => (
                  <tr key={request.id} className="border border-gray-300">
                    <td className="px-6 py-3">
                      {toPascalCase(request.device?.deviceType?.name)}
                    </td>
                    <td className="px-6 py-3">
                      {toSentenceCase(request.requestType.label)}
                    </td>
                    <td className="px-6 py-3">
                      {request.device?.serialNumber}
                    </td>
                    <td className="px-6 py-3">
                      {request.device?.manufacturer?.name}
                    </td>
                    <td className="px-6 py-3">
                      {request.ticketTrails?.[0]?.ticketId || ""}
                    </td>
                    <td className="px-6 py-3">
                      {request.device?.deviceCondition?.name}
                    </td>
                    <td className="px-6 py-3">
                      {formatDate(request.createdAt)}
                    </td>
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

const WrappedLanding = withAuth(Tickets, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
