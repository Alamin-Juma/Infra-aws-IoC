import React, { useState, useEffect } from "react";
import { debounce } from "lodash";
import Pagination from "../../../../components/Pagination";
import LoadingTable from "../../../../components/LoadingTable";
import { FaEye } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import withAuth from "../../../../utils/withAuth";
import MainLayout from "../../../../layouts/MainLayout";
import { fetchProcurementRequests } from "./ProcurementRequestsService.js";
import Lottie from "lottie-react";
import animationData from "../../../../assets/lottie/no-data.json";
import { DEBOUNCETIMEOUT } from "../../../../utils/constants.js";
import Permission from "../../../../components/Permission.jsx";
import { PERMISSION_CREATE_QUOTATION, PERMISSION_MANAGE_PROCUREMENT_REQUEST } from "../../../../constants/permissions.constants.js";

const ProcurementRequests = () => {
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { requests, total } = await fetchProcurementRequests(
        debouncedSearchQuery,
        page,
        limit
      );
      const filteredRequests = requests.filter(
        (request) =>
          !debouncedSearchQuery ||
          request.id
            .toString()
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase())
      );
      setRequestsList(filteredRequests);
      setTotal(filteredRequests.length);
    } catch (error) {
      console.error("Error fetching procurement requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) return;
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCETIMEOUT);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchRequests();
  }, [page, limit, debouncedSearchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query.trim());
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchRequests();
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1);
    fetchRequests();
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between">
        <h2 className="ml-2 text-xl font-bold">
          Approved Procurement Requests
        </h2>
      </div>

      <div className="h-[5rem] flex flex-col md:flex-row w-full gap-4 justify-between items-center py-4">
        <div className="flex flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchSharp className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] text-sm"
              placeholder="Request ID"
              onChange={(e) => handleSearch(e.target.value)}
              value={searchQuery}
            />
          </div>
        </div>
      </div>

      {loading && <LoadingTable />}

      {!loading && requestsList.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-10 bg-white rounded-lg shadow-sm p-8">
          <Lottie animationData={animationData} loop className="h-40" />
          <p className="text-gray-500 mt-4 text-lg">
            {searchQuery
              ? "No matching approved requests found"
              : "No approved procurement requests found"}
          </p>
        </div>
      )}

      {!loading && requestsList.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200 table-zebra table border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                Request ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                Submitted By
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                Date Submitted
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requestsList.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.CreatedBy
                      ? `${request.CreatedBy.firstName} ${request.CreatedBy.lastName}`
                      : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(request.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-200 text-green-800">
                    Approved
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Permission
                    allowedPermission={[PERMISSION_CREATE_QUOTATION]}
                  >
                    <Link
                      to={`/app/procurement/procurement-requests/${request.id}`}
                      className="text-[#0047ab] hover:text-[#003a91] transition-colors duration-200"
                    >
                      <FaEye className="h-5 w-5" />
                    </Link>
                  </Permission>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

const WrappedLanding = withAuth(ProcurementRequests, false);

export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
