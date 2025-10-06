import React, { useState, useEffect } from "react";
import withAuth from "../../../utils/withAuth";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../utils/apiInterceptor";
import LoadingTable from "../../../components/LoadingTable";
import Lottie from "lottie-react";
import { formatDate } from "../../../utils/formatDate";
import animationData from "../../../assets/lottie/no-data.json";
import Pagination from "../../../components/Pagination";
import { toSentenceCase } from "../../../utils/toSentenceCase";
import { IoSearchSharp } from "react-icons/io5";
import { MdOutlineFilterAlt } from "react-icons/md";
import { debounce } from "lodash";
import { DEBOUNCETIMEOUT } from "../../../utils/constants";
import Swal from "sweetalert2";

const Approvals = () => {
  const [approvalsList, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [requestTypes, setRequestTypes] = useState([]);

  const [filters, setFilters] = useState({
    requestType: "",
    ticket_no: "",
    requestStatus: "",
  });

  const approvalStatus = [
    { key: "PENDING", name: "Pending" },
    { key: "REJECTED", name: "Rejected" },
  ];

  const normalBg = "#77b634";
  const hoverBg = "#77c650";

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
          approved: false,
          requestType: filters.requestType,
          ticket_no: filters.ticket_no,
          requestStatus: filters.requestStatus,
          page,
          limit,
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
    const status = approvalStatus.find((item) => item.key === key);
    return status ? status.name : "";
  };

  const renderApprovalStatus = (status) => {
    status = getStatusName(status);
    return (
      <span
        className={`badge badge-${status === "Pending" ? "primary" : "error"}`}
      >
        {status}
      </span>
    );
  };

  const handleSearch = debounce((query) => {
    setFilters({ ...filters, ticket_no: query.trim() });
  }, DEBOUNCETIMEOUT);

  const handleDecision = async (id, action) => {
    try {
      if (action === "approved") {
        const result = await Swal.fire({
          title: "Approve Request",
          text: "Are you sure you want to approve this request?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#77b634",
          confirmButtonText: "Yes, Approve",
        });

        if (result.isConfirmed) {
          await api.post(`/externalRequest/statusDecision/${id}`, {
            action: "approved",
          });
          Swal.fire("Approved!", "The request has been approved.", "success");
          fetchData();
        }
      } else {
        const { value: reason } = await Swal.fire({
          title: "Reject Request",
          input: "textarea",
          inputLabel: "Reason for Rejection",
          inputPlaceholder: "Enter reason here...",
          confirmButtonColor: "#77b634",
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) return "Reason is required!";
          },
        });

        if (reason) {
          await api.post(`/externalRequest/statusDecision/${id}`, {
            action: "rejected",
            reason,
          });
          Swal.fire("Rejected", "The request has been rejected.", "success");
          fetchData();
        }
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong. Try again.", "error");
    }
  };

  return (
    <div data-testid="main-container" className="w-full h-full">
      <div className="flex items-center">
        <h2 className="ml-2 text-xl font-bold">Approvals</h2>
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
              <option value="REJECTED">Rejected</option>
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
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvalsList.length === 0 ? (
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
                approvalsList.map((request) => (
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
                      {renderApprovalStatus(request.requestStatus)}
                    </td>
                    <td className="px-6 py-3">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          disabled={request.requestStatus === "REJECTED"}
                          onClick={() => handleDecision(request.id, "approved")}
                          style={{
                            backgroundColor: hoveredIndex===request.id ? hoverBg : normalBg,
                          }}
                          className="btn btn-sm text-white"
                           onMouseEnter={() => setHoveredIndex(request.id)}
                           onMouseLeave={() => setHoveredIndex(null)}
                        >
                          Approve
                        </button>
                        <button
                          disabled={request.requestStatus === "REJECTED"}
                          onClick={() => handleDecision(request.id, "rejected")}
                          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
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

const WrappedLanding = withAuth(Approvals, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
