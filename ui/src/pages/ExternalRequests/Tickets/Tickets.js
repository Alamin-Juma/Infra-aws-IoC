import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import withAuth from "../../../utils/withAuth";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../utils/apiInterceptor";
import LoadingTable from "../../../components/LoadingTable";
import Lottie from "lottie-react";
import { formatDate } from "../../../utils/formatDate";
import { Link } from "react-router-dom";
import animationData from "../../../assets/lottie/no-data.json";
import Pagination from "../../../components/Pagination";
import { toSentenceCase } from "../../../utils/toSentenceCase";
import { IoSearchSharp } from "react-icons/io5";
import { MdOutlineFilterAlt } from "react-icons/md";
import { debounce } from "lodash";
import { DEBOUNCETIMEOUT } from "../../../utils/constants";
import Permission from "../../../components/Permission";
import { PERMISSION_VIEW_EXTERNAL_REQUESTS } from "../../../constants/permissions.constants";

const Tickets = () => {
  const [ticketsList, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [requestTypes, setRequestTypes] = useState([]);

  const [filters, setFilters] = useState({
    requestType: "",
    ticket_no: "",
    requestStatus: "",
  });

  const ticketStatus = [
    { key: "PENDING", name: "Pending" },
    { key: "ASSIGNED", name: "Assigned" },
    { key: "IN_PROGRESS", name: "In Progress" },
    { key: "COMPLETED", name: "Completed" },
  ];

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
      const response = await api.get(`/externalRequest`, {
        params: {
          approved: true,
          requestType: filters.requestType,
          ticket_no: filters.ticket_no,
          requestStatus: filters.requestStatus,
          page: page,
          limit: limit,
        },
      });
      setTotal(response.data.data.total);
      setList(response.data.data.requests);
    } catch {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/requestTypes`);
      setRequestTypes(response.data.data);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRequestTypes();
  }, [page, limit, filters]);

  const getStatusName = (key) => {
    const status = ticketStatus.find((item) => item.key === key);
    return status
      ? status.name
      : key
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
  };

  const renderTicketStatus = (status) => {
    status = getStatusName(status);
    switch (status) {
      case "Assigned":
        return <span className="badge badge-warning">{status}</span>;
      case ("Completed", "Approved"):
        return <span className="badge badge-success">{status}</span>;
      case "In Progress":
        return <span className="badge badge-primary">{status}</span>;
      default:
        return <span className="badge badge-error">{status}</span>;
    }
  };

  const handleSearch = debounce((query) => {
    setFilters({ ...filters, ticket_no: query.trim() });
  }, DEBOUNCETIMEOUT);

  return (
    <div data-testid="main-container" className="w-full h-full">
      <div className="flex items-center">
        <h2 className="ml-2 text-xl font-bold">External Requests </h2>
      </div>
      <div className="h-[5rem] flex flex-col md:flex-row w-full gap-4 justify-between items-center py-4">
        <div className="flex flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <input
              type="text"
              className="input w-full pl-10 pr-4"
              placeholder="Search by Ticket No."
              maxLength={30}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchSharp className="text-gray-500" />
            </div>
          </div>

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
              {requestTypes.map((type) => (
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
              className="select min-w-[200px] w-full pl-10"
              onChange={(e) =>
                setFilters({ ...filters, requestStatus: e.target.value })
              }
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>
      {loading && <LoadingTable />}
      {!loading && (
        <div className="flex w-full overflow-x-auto">
          <table className="table-zebra table min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-6 py-3 text-left font-semibold">
                  Ticket No.
                </th>
                <th className="px-6 py-3 text-left font-semibold">Requestor</th>
                <th className="px-6 py-3 text-left font-semibold">
                  Request Type
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Device Type
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Request Status
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {ticketsList.length === 0 ? (
                <tr className="w-full">
                  <td colSpan="7" className="text-center w-full">
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
                ticketsList.map((request) => (
                  <tr
                    key={request.id}
                    className="border border-gray-200 w-full"
                  >
                    <td className="px-6 py-3">
                      {request.ticketTrails?.[0]?.ticketId || ""}
                    </td>
                    <td className="px-6 py-3">
                      {request.user?.firstName + " " + request.user?.lastName}
                    </td>
                    <td className="px-6 py-3">
                      {toSentenceCase(request.requestType.label)}
                    </td>
                    <td className="px-6 py-3">
                      {!request.device?.deviceType?.name &&
                      request.requestType?.label?.toLowerCase() === "onboarding"
                        ? "New Hire Devices"
                        : toSentenceCase(
                            request.device?.deviceType?.name ||
                              request.deviceType?.name
                          )}
                    </td>
                    <td className="px-6 py-3">
                      {renderTicketStatus(request.requestStatus)}
                    </td>
                    <td className="px-6 py-3">
                      {formatDate(request.createdAt)}
                    </td>
                    <td>
                      <div className="dropdown">
                        <Permission
                          allowedPermission={[
                            PERMISSION_VIEW_EXTERNAL_REQUESTS,
                          ]}
                        >
                          <Link
                            to={`/app/external-requests/request-details/${request.id}`}
                            className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white mr-2"
                            data-tooltip="View Details"
                            tabIndex="0"
                          >
                            <FaEye className="text-[#0047ab] text-lg" />
                          </Link>
                        </Permission>
                      </div>
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
