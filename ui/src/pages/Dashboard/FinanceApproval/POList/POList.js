import React, { useState, useEffect } from "react";
import Pagination from "../../../../components/Pagination.jsx";
import Spinner from "../../../../components/Spinner.jsx";
import { FaEye } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import { MdOutlineFilterAlt } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import withAuth from "../../../../utils/withAuth.js";
import MainLayout from "../../../../layouts/MainLayout.jsx";
import api from "../../../../utils/apiInterceptor.js";
import {
  PO_STATUS,
  PO_STATUS_LABEL,
  PO_STATUS_OPTIONS,
} from "../../../../constants/status.constants";
import { toast } from "react-toastify";
import LoadingTable from "../../../../components/LoadingTable.jsx";
import Lottie from "lottie-react";
import animationData from "../../../../assets/lottie/no-data.json";

const POList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 2000);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/purchase-orders", {
        params: {
          status: filters.status,
          keyword: debouncedSearchTerm,
          page,
          limit,
        },
      });
      setPurchaseOrders(response.data.purchaseOrders);
      setTotal(response.data.total);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch quotations";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, [page, limit, filters, debouncedSearchTerm]);

  const handleStatusFilter = (e) => {
    setFilters({
      ...filters,
      status: e.target.value,
    });
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Purchase Order List</h2>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdOutlineFilterAlt className="text-gray-500" />
          </div>
          <select
            className="select min-w-[200px] w-full pl-10"
            value={filters.status}
            onChange={(e) => handleStatusFilter(e)}
          >
            <option value="">All</option>
            {PO_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
          <input
            type="text"
            className="input w-full pl-10 pr-4"
            placeholder="PO Number"
            maxLength={30}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearchSharp className="text-gray-500" />
          </div>
        </div>
      </div>

      {loading && <LoadingTable />}

      {loading && <LoadingTable />}
      {!loading && (!purchaseOrders || purchaseOrders.length === 0) && (
        <div className="flex flex-col items-center justify-center mt-10 bg-white rounded-lg shadow-sm p-8">
          <Lottie animationData={animationData} loop className="h-40" />
          <p className="text-gray-500 mt-4 text-lg">
            {Object.values(filters).some((filter) => filter.trim())
              ? "No purchase orders found"
              : "No purchase orders available"}
          </p>
        </div>
      )}

      {!loading && purchaseOrders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-zebra table min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-6 py-3 text-left font-semibold">PO Number</th>
                <th className="px-6 py-3 text-left font-semibold">
                  Vendor Name
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Created At
                </th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr
                  onClick={() => {
                    navigate(
                      `/app/finance-approval/po-list/po-details/${po.id}`
                    );
                  }}
                  key={po.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {po.poNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {po.vendor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(po.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                        po.status === PO_STATUS.PO_SENT
                          ? "bg-green-200 text-green-800"
                          : po.status === PO_STATUS.PENDING
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {PO_STATUS_LABEL[po.status]}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      data-test="viewPurchaseOrderDetails"
                      to={`/app/finance-approval/po-list/po-details/${po.id}`}
                      className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white"
                      data-tooltip="View Details"
                      tabIndex="0"
                    >
                      <FaEye className="text-[#0047AB] text-lg" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        total={total}
        limit={limit}
        page={page}
        handlePageChange={setPage}
        handleLimitChange={(e) => {
          setLimit(Number(e.target.value));
          setPage(1);
        }}
      />
    </div>
  );
};

const WrappedLanding = withAuth(POList, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
