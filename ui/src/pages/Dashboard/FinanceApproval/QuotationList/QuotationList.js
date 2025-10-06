import React, { useState, useEffect } from "react";
import Pagination from "../../../../components/Pagination";
import Spinner from "../../../../components/Spinner.jsx";
import { FaEye } from "react-icons/fa";
import { IoSearchCircleSharp, IoSearchSharp } from "react-icons/io5";
import { MdOutlineFilterAlt } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import withAuth from "../../../../utils/withAuth";
import MainLayout from "../../../../layouts/MainLayout";
import api from "../../../../utils/apiInterceptor.js";
import { toast } from "react-toastify";
import { DEFAULT_LIMIT } from "../../../../constants/table.constants.js";
import {
  QUOTATION_STATUS_LABEL,
  QuotationStatus,
} from "../../../../constants/status.constants.js";
import { CURRENCY } from "../../../../constants/general.constants.js";
import LoadingTable from "../../../../components/LoadingTable.jsx";
import Lottie from "lottie-react";
import animationData from "../../../../assets/lottie/no-data.json";

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
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

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/quotation", {
        params: {
          status: filters.status,
          keyword: debouncedSearchTerm,
          page,
          limit,
        },
      });

      if (response.data.success !== false) {
        setQuotations(response.data.quotations || []);
        setTotal(response.data.total || 0);
      } else {
        toast.error(response.data.message || "Something went wrong.");
      }

      setQuotations(response.data.quotations);
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
    fetchQuotations();
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
        <h2 className="text-xl font-bold">Quotes</h2>
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
            {Object.keys(QUOTATION_STATUS_LABEL).map((statusKey) => (
              <option key={statusKey} value={statusKey}>
                {QUOTATION_STATUS_LABEL[statusKey]}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
          <input
            type="text"
            className="input w-full pl-10 pr-4"
            placeholder="Quote ID"
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
      {!loading && (!quotations || quotations.length === 0) && (
        <div className="flex flex-col items-center justify-center mt-10 bg-white rounded-lg shadow-sm p-8">
          <Lottie animationData={animationData} loop className="h-40" />
          <p className="text-gray-500 mt-4 text-lg">
            {Object.values(filters).some((filter) => filter.trim())
              ? "No matching quotations found"
              : "No quotations available"}
          </p>
        </div>
      )}

      {!loading && quotations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-zebra table min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-6 py-3 text-left font-semibold">
                  Quote ID
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Submission Date
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Total ({CURRENCY})
                </th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quotation) => (
                <tr
                  onClick={() => {
                    navigate(
                      `/app/finance-approval/quotation-list/quotation-details/${quotation.id}`
                    );
                  }}
                  key={quotation.id}
                  className="hover:bg-gray-50 border-b border-gray-200"
                >
                  <td>{quotation.quotationId}</td>
                  <td>
                    {quotation.submittedBy.firstName}{" "}
                    {quotation.submittedBy.lastName}
                  </td>

                  <td>{new Date(quotation.createdAt).toLocaleDateString()}</td>
                  <td>{Number(quotation.totalAmount).toLocaleString()}</td>
                  <td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                          quotation.status === QuotationStatus.APPROVED
                            ? "bg-green-200 text-green-800"
                            : quotation.status === QuotationStatus.SUBMITTED
                            ? "bg-yellow-200 text-yellow-800"
                            : quotation.status === QuotationStatus.REJECTED
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {QUOTATION_STATUS_LABEL[quotation.status] ||
                          quotation.status}
                      </span>
                    </td>
                  </td>
                  <td>
                    <Link
                      to={`/app/finance-approval/quotation-list/quotation-details/${quotation.id}`}
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

const WrappedLanding = withAuth(QuotationList, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
