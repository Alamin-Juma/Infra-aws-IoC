import React, { useState, useEffect } from 'react';
import api from '../../../utils/apiInterceptor.js';
import withAuth from '../../../utils/withAuth';
import MainLayout from '../../../layouts/MainLayout';
import { IoIosArrowDown } from "react-icons/io";
import Pagination from '../../../components/Pagination.jsx';
import { FaFileDownload, FaFilePdf, FaFileCsv, FaFilter } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import { toPascalCase } from '../../../utils/toPascalCase.js';
import { MdOutlineFilterAlt } from 'react-icons/md';

const ManufacturerReport = () => {
    const [reportData, setReportData] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10; // Number of items per page

    const [filters, setFilters] = useState({
        manufacturer: "All",
        status: "All",
        condition: "All"
    });
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [manufacturers, statusesRes, conditionsRes] = await Promise.all([
                    api.get("/manufacturer"),
                    api.get("/api/device-status"),
                    api.get("/api/device-condition")
                ]);

                setManufacturers(Array.isArray(manufacturers.data.manufacturers) ? manufacturers.data.manufacturers : []);
                setStatuses(Array.isArray(statusesRes.data) ? statusesRes.data : []);
                setConditions(Array.isArray(conditionsRes.data) ? conditionsRes.data : []);
            } catch (error) {
                toast.error("Error loading filters!");
            }
        };

        fetchInitialData();
    }, []);

    const handlePdfDownload = async () => {

        const headersMap = [
            { header: "Manufacturer", key: "manufacturer" },
            { header: "Device Type", key: "deviceType" },
            { header: "Total", key: "total" },
            { header: "Assigned", key: "assigned" },
            { header: "Available", key: "available" },
            { header: "Lost", key: "lost" },
            { header: "Broken %", key: "percentageBroken" }
        ];

        try {
            setExporting(true);
            setIsOpen(false);
            const response = await api.post(
                `/api/device-activities/generate-pdf`,
                {
                    data: reportData,
                    options: {
                        title: "Device Manufacturer  Report",
                        format: "table",
                        margin: 50,
                        themeColor: "#77B634",
                        logo: "https://zeroman.sirv.com/Images/logo.png",
                        filename: "device-manufacturer-report",
                        headers: headersMap,
                        footer: "© ITrack 2025",
                        table: false,
                        wrapText: true,
                        minRowHeight: 20,
                        maxTextHeight: 100,
                        maxRows: 5000,
                        footerMargin: 20,
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
            a.download = "device-manufacturer-report.pdf";
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
                { label: "Manufacturer", key: "manufacturer" },
                { label: "Device Type", key: "deviceType" },
                { label: "Total", key: "total" },
                { label: "Assigned", key: "assigned" },
                { label: "Available", key: "available" },
                { label: "Lost", key: "lost" },
                { label: "Broken %", key: "percentageBroken" }
            ],
            data: reportData,
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
            a.download = "device-manufacturer-report.csv";
            setExporting(false);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setExporting(false)
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Handle limit change
    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setPage(1);
    };



    const fetchReport = async (pageNumber = 1) => {
        try {
            const response = await api.get("/api/reports/manufacturer-inventory", {
                params: {
                    manufacturer: filters.manufacturer === "All" ? undefined : filters.manufacturer,
                    status: filters.status === "All" ? undefined : filters.status,
                    condition: filters.condition === "All" ? undefined : filters.condition,
                    page: pageNumber,
                    limit
                }
            });

            if (!response.data || response.data.data.length === 0) {
                setReportData([]);
                toast.error("No inventory data found", "warning");
                return;
            }

            const tableData = response.data.data.flatMap((manufacturer) =>
                manufacturer.deviceTypes.map((deviceType) => ({
                    manufacturer: manufacturer.manufacturer,
                    deviceType: deviceType.name,
                    total: manufacturer.totalDevices,
                    assigned: manufacturer.assignedDevices,
                    available: manufacturer.availableDevices,
                    lost: manufacturer.lostDevices,
                    broken: manufacturer.brokenDevices,
                    percentageBroken: manufacturer.brokenPercentage
                }))
            );

            setReportData(tableData);
            setTotal(tableData.length); // Set total count for pagination
            setPage(pageNumber); // Update current page
        } catch (error) {
            toast.error("There are no unavailable devices", "error");
            setReportData([]);
        }
    };


    useEffect(() => {
        fetchReport();
    }, [filters]);

    return (
        <div className="w-full p-4">

            <h2 className="text-lg font-semibold">Manufacturer</h2>
            <div className='flex justify-between items-center mb-4'>

                <div className="h-[5rem] flex flex-col md:flex-row w-full gap-4 justify-between items-center py-4">
                    <div className="flex flex-row gap-2 w-full md:w-auto">

                        <div className="w-full md:w-auto">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdOutlineFilterAlt className="text-gray-500" />
                                </div>
                                <select
                                    className="select min-w-[200px] w-full pl-10"
                                    value={filters.manufacturer}
                                    onChange={(e) => setFilters(prev => ({ ...prev, manufacturer: e.target.value }))}
                                >
                                    <option value="">All</option>
                                    {manufacturers.map(m => (
                                        <option key={m.id} value={m.name}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="w-full md:w-auto">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdOutlineFilterAlt className="text-gray-500" />
                                </div>
                                <select
                                    className="select min-w-[200px] w-full pl-10"
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="">All</option>
                                    {statuses.map(s => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="w-full md:w-auto">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdOutlineFilterAlt className="text-gray-500" />
                                </div>
                                <select
                                    className="select min-w-[200px] w-full pl-10"
                                    value={filters.condition}
                                    onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                                >
                                    <option value="">All</option>
                                    {conditions.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="w-full md:w-auto">
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
                </div>
            </div>

            <div className="flex w-full overflow-x-auto">
                <table className="table w-full table-zebra border">
                    <thead>
                        <tr>

                            <th>Manufacturer</th>
                            <th>Device Type</th>
                            <th>Total</th>
                            <th>Assigned</th>
                            <th>Available</th>
                            <th>Lost</th>
                            <th>Broken</th>
                            <th>Broken %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.manufacturer}</td>
                                    <td>{toPascalCase(row.deviceType)}</td>
                                    <td>{row.total}</td>
                                    <td>{row.assigned}</td>
                                    <td>{row.available}</td>
                                    <td>{row.lost}</td>
                                    <td>{row.broken}</td>
                                    <td>{row.percentageBroken}%</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                    No inventory records found for the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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

const WrappedLanding = withAuth(ManufacturerReport, false);
export default () => <MainLayout><WrappedLanding /></MainLayout>;
