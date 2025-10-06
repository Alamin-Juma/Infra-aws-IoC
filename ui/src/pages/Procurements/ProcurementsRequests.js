import React, { useEffect, useState } from "react";
import withAuth from "../../utils/withAuth";
import MainLayout from "../../layouts/MainLayout";
import Pagination from "../../components/Pagination";
import { formatDateForFilterWithTime } from "../../utils/formatDate";
import LoadingTable from "../../components/LoadingTable";
import animationData from "../../assets/lottie/no-data.json";
import Lottie from "lottie-react";
import { MdOutlineFilterAlt } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";

import { ProcurementRequestStatus } from "../../utils/constants";
import { fetchProcurementRequests } from "./ProcurementRequestService";
import { FaEye } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Permission from "../../components/Permission";
import { PERMISSION_APPROVE_PROCUREMENT_REQUEST } from "../../constants/permissions.constants";

const ProcurementRequest = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: fetchedData } = await fetchProcurementRequests(
        page,
        limit,
        statusFilter
      );
      setData(fetchedData.data || []);
      setTotal(fetchedData.pagination.total || 0);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to fetch procurement requests. Please try again.");
    }
  };
  useEffect(() => {
    fetchData();
  }, [page, limit, statusFilter]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between">
        <h2 className="ml-2 text-xl font-bold">Procurements Requests </h2>
      </div>
      <div className="h-[5rem] flex flex-col md:flex-row w-full gap-4 justify-between items-center py-4">
        <div className="flex flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineFilterAlt className="text-gray-500" />
            </div>
            <select
              className="select min-w-[200px] w-full pl-10"
              value={statusFilter}
              onChange={(e) => {
                handleStatusFilterChange(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Fulfilled">Fulfilled</option>
            </select>
          </div>
        </div>
      </div>
      {loading && <LoadingTable />}
      {!loading && (
        <table className="min-w-full divide-y overflow-y-auto divide-gray-200 table-zebra table border-collapse border h-full border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
              >
                Justification
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
              >
                Expected Delivery
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
              >
                Date Created
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.length > 0 ? (
              data?.map((request, index) => (
                <React.Fragment key={request.id}>
                  <tr
                    onClick={() => {
                      navigate(
                        `/app/procurement/procurement-request/${request.id}`
                      );
                    }}
                    className={` ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request?.status === ProcurementRequestStatus.DRAFT
                            ? "bg-gray-200 text-gray-800"
                            : request?.status ===
                              ProcurementRequestStatus.PENDING
                            ? "bg-yellow-200 text-yellow-800"
                            : request?.status ===
                              ProcurementRequestStatus.APPROVED
                            ? "bg-green-200 text-green-800"
                            : request?.status ===
                              ProcurementRequestStatus.REJECTED
                            ? "bg-red-200 text-red-800"
                            : request?.status ===
                              ProcurementRequestStatus.FULFILLED
                            ? "bg-blue-200 text-blue-800"
                            : request?.status ===
                              ProcurementRequestStatus.QOUTED
                            ? "bg-[#556B2F] text-white"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {request.justification}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateForFilterWithTime(request.expectedDelivery)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateForFilterWithTime(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Permission
                        allowedPermission={[PERMISSION_APPROVE_PROCUREMENT_REQUEST]}
                      >
                        <Link
                          to={`/app/procurement/procurement-request/${request.id}`}
                          className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white"
                          data-tooltip="View Procurement Request"
                          tabIndex="0"
                        >
                          <FaEye className="text-[#0047ab] text-lg" />
                        </Link>
                      </Permission>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr className="w-full">
                <td colSpan="5" className="text-center w-full">
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
            )}
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
const WrappedLanding = withAuth(ProcurementRequest, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
