import React, { useState, useEffect } from "react";
import { FaFileDownload, FaFilePdf, FaFileCsv } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineFilterAlt } from "react-icons/md";
import withAuth from "../../../../utils/withAuth";
import MainLayout from "../../../../layouts/MainLayout";
import api from "../../../../utils/apiInterceptor";
import { ToastContainer, toast } from "react-toastify";
import LoadingTable from "../../../../components/LoadingTable";
import Lottie from "lottie-react";
import animationData from "../../../../assets/lottie/no-data.json";
import Pagination from "../../../../components/Pagination";
import { toPascalCase } from "../../../../utils/toPascalCase";
import { useNavigate } from "react-router-dom";

const InventoryListPage = () => {
  const [ticketsList, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("viewMode") || "list";
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  const [filters, setFilters] = useState({
    deviceType: "",
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

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
          limit: 10000,
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

  return (
    <div data-testid="main-container" className="w-full p-2">
      <ToastContainer hideProgressBar position="top-right" autoClose={1000} />
      <div className="flex items-center ">
        <h4 className="font-bold text-xl my-2">Inventory</h4>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-4 w-full">
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
        <div className="flex items-center gap-2">
          <span className={`text-sm ${viewMode === "list" ? "font-bold" : ""}`}>
            List
          </span>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              checked={viewMode === "card"}
              onChange={() =>
                setViewMode(viewMode === "list" ? "card" : "list")
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
          <span className={`text-sm ${viewMode === "card" ? "font-bold" : ""}`}>
            Card
          </span>
        </div>
      </div>

      {loading && <LoadingTable />}

      {!loading && (
        <>
          {viewMode === "list" ? (
            <div className="flex w-full overflow-x-auto">
              <table className="table-zebra table min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm">
                    <th className="px-6 py-3 text-left font-semibold">
                      Device Type
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">Total</th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Low Stock Limit
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Assigned
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Broken
                    </th>
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
                    ticketsList.map((device) => (
                      <tr
                        key={device.deviceType}
                        className="border border-gray-300 hover:cursor-pointer"
                        onClick={() => {
                          navigate(
                            `/app/inventory/devices/device-types-list?deviceType=${device.deviceType}`
                          );
                        }}
                      >
                        <td className="px-6 py-3">
                          {toPascalCase(device?.deviceType)}
                        </td>
                        <td className="px-6 py-3">{device?.count}</td>
                        <td className="px-6 py-3">{device?.availableCount}</td>
                        <td className="px-6 py-3">{device?.low_stock_limit}</td>
                        <td className="px-6 py-3">{device?.assignedCount}</td>
                        <td className="px-6 py-3">{device?.brokenCount}</td>
                        <td className="px-6 py-3">{device?.lostCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4">
              {ticketsList.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center">
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    className="h-40"
                  />
                  <span className="text-gray-600 text-lg font-semibold">
                    No Data
                  </span>
                </div>
              ) : (
                ticketsList.map((device) => (
                  <div
                    key={device.deviceType}
                    onClick={() => {
                      navigate(
                        `/app/inventory/devices/device-types-list?deviceType=${device.deviceType}`
                      );
                    }}
                    className="border border-gray-200 rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 w-full max-w-sm min-h-[240px] flex flex-col justify-between bg-white cursor-pointer transform hover:-translate-y-1 hover:scale-101"
                  >
                    <div className="text-center">
                      <h1 className="font-semibold text-lg text-gray-800 mb-1">
                        {toPascalCase(device?.deviceType)}
                      </h1>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <p className="text-xs text-green-600">Available</p>
                        <p className="font-semibold text-lg text-green-800">
                          {device?.availableCount}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600">Assigned</p>
                        <p className="font-semibold text-lg text-blue-800">
                          {device?.assignedCount}
                        </p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                        <p className="text-xs text-red-600">Broken</p>
                        <p className="font-semibold text-lg text-red-800">
                          {device?.brokenCount}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                        <p className="text-xs text-yellow-600">Lost</p>
                        <p className="font-semibold text-lg text-yellow-800">
                          {device?.lostCount}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-600">Retired</p>
                        <p className="font-semibold text-lg text-slate-800">
                          {device?.retiredCount}
                        </p>
                      </div>
                      <div className="bg-violet-50 p-3 rounded-lg border border-violet-100">
                        <p className="text-xs text-violet-600">
                          Low Stock Limit
                        </p>
                        <p className="font-semibold text-lg text-violet-800">
                          {device?.low_stock_limit}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                      <p>
                        <span className="font-semibold text-gray-700">
                          Total:
                        </span>{" "}
                        <span className="font-bold text-xl text-gray-900">
                          {device?.count}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
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

const WrappedLanding = withAuth(InventoryListPage, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
