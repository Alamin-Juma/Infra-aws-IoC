import React, { useState, useEffect, useRef } from "react";
import { FaEye } from "react-icons/fa";
import MainLayout from "../../../../layouts/MainLayout";
import withAuth from "../../../../utils/withAuth";
import { ToastContainer, toast } from "react-toastify";
import LoadingTable from "../../../../components/LoadingTable";
import Lottie from "lottie-react";
import animationData from "../../../../assets/lottie/no-data.json";
import Pagination from "../../../../components/Pagination";
import { IoSearchSharp } from "react-icons/io5";
import { MdOutlineFilterAlt } from "react-icons/md";
import { debounce } from "lodash";
import { fetchVendors, fetchQuotations } from "./QuotationsService.js";
import { DEBOUNCETIMEOUT } from "../../../../utils/constants.js";
import Permission from "../../../../components/Permission.jsx";
import { PERMISSION_VIEW_QUOTATIONS } from "../../../../constants/permissions.constants.js";

const QuotationsList = () => {
  const [quotationsList, setList] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({
    quotationId: "",
    vendor: "",
    status: "",
  });
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const previewModalRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("")

  const handlePageChange = (newPage) => {
    const parsedPage = parseInt(newPage, 10);
    if (!isNaN(parsedPage)) {
      setPage(parsedPage);
    }
  };

  const handleLimitChange = (newLimit) => {
    const parsedLimit = parseInt(newLimit, 10);
    if (!isNaN(parsedLimit)) {
      setLimit(parsedLimit);
      setPage(1);
    }
  };

  const fetchData = async () => {
   
    setLoading(true);
    try {
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);

      if (isNaN(parsedPage) || isNaN(parsedLimit)) {
        throw new Error("Invalid pagination parameters");
      }

      const [vendorData, quotationData] = await Promise.all([
        fetchVendors(),
       fetchQuotations(parsedPage, parsedLimit, filters),
      ]);

      setVendors(vendorData || []);
      setList(quotationData?.quotations || []);
      setFilteredQuotations(quotationData?.quotations || []);
      setTotal(quotationData?.total || 0);
    } catch (error) {
      toast.error(error.message || "Failed to fetch data");
      setList([]);
      setFilteredQuotations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit,filters]);


   useEffect(() => {
      const timerId = setTimeout(() => {
        setFilters({ ...filters, quotationId:searchQuery })
      }, DEBOUNCETIMEOUT);
  
      return () => {
        clearTimeout(timerId);
      };
    }, [searchQuery]);


  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(1);
  };

  const renderTicketStatus = (status) => {
    switch (status) {
      case "Submitted":
        return <span className="badge badge-info">{status}</span>;
      case "Approved":
        return <span className="badge badge-success">{status}</span>;
      case "Rejected":
        return <span className="badge badge-danger">{status}</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        previewModalRef.current &&
        !previewModalRef.current.contains(event.target)
      ) {
        setShowPreview(false);
      }
    };

    if (showPreview) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPreview]);

  const renderPreviewModal = () => {
    if (!showPreview || !selectedQuotation) return null;

    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <div
            ref={previewModalRef}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full relative z-[10000]"
          >
            <div className="bg-white px-8 pt-8 pb-6 sm:p-10">
              <div className="bg-[#77B634]/10 rounded-t-lg p-8 border-b border-[#77B634]/20">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-[#77B634]">
                      {selectedQuotation.vendor?.name || "N/A"}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <p className="text-gray-600">
                        Quote #{selectedQuotation.quotationId}
                      </p>
                      <span className="text-gray-400">|</span>
                      <p className="text-gray-600">
                        {formatDate(selectedQuotation.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div>{renderTicketStatus(selectedQuotation.status)}</div>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 rounded-lg p-8 border border-gray-200">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <span className="font-medium">Expected Delivery:</span>{" "}
                    {formatDate(selectedQuotation.procurementRequest?.expectedDelivery)}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full divide-y divide-gray-200 table-zebra table border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[12%]">
                          Device Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[38%]">
                          Specification
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[10%]">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[20%]">
                          Unit Price (KES)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[20%]">
                          Total (KES)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedQuotation.lineItems?.map((item, index) => {
                        const unitPrice = parseFloat(item.unitPrice);
                        const quantity = parseInt(item.quantity);
                        const total = unitPrice * quantity;
                        const isValidPrice = unitPrice >= 1;

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                <div className="font-medium mb-1">
                                  {item.deviceType?.name
                                    ? item.deviceType.name.charAt(0).toUpperCase() + item.deviceType.name.slice(1)
                                    : "N/A"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div className="text-gray-600 whitespace-pre-wrap break-words">
                                  {item.specification || "N/A"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {quantity.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <span className={`${isValidPrice ? "text-gray-600" : "text-red-600"}`}>
                                  {unitPrice.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                                {!isValidPrice && (
                                  <span className="ml-2 text-xs text-red-500">
                                    (Minimum price: 1.00)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {total.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 rounded-lg p-8 border border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-[#77B634]">
                    KES{" "}
                    {parseFloat(selectedQuotation.totalAmount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {selectedQuotation.rejectionReason && (
                <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm text-red-700 whitespace-pre-wrap break-words">
                        <strong>Rejection Reason:</strong>{" "}
                        {selectedQuotation.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-8 py-4 sm:px-10 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                style={{ backgroundColor: "#77B634" }}
                onClick={() => setShowPreview(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between">
        <h2 className="ml-2 text-xl font-bold">Quotes</h2>
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
              placeholder="Quote ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineFilterAlt className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] text-sm"
              value={filters.vendor}
              onChange={(e) => handleFilterChange("vendor", e.target.value)}
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.name}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineFilterAlt className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <LoadingTable />}

      {!loading && (!filteredQuotations || filteredQuotations.length === 0) && (
        <div className="flex flex-col items-center justify-center mt-10 bg-white rounded-lg shadow-sm p-8">
          <Lottie animationData={animationData} loop className="h-40" />
          <p className="text-gray-500 mt-4 text-lg">
            {Object.values(filters).some((filter) => filter.trim())
              ? "No matching quotations found"
              : "No quotations available"}
          </p>
        </div>
      )}

      {!loading && filteredQuotations && filteredQuotations.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200 table-zebra table border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr className="bg-gray-50">
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                Quote ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                Vendor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
              >
                Total (KES)
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
            {filteredQuotations.map((quotation) => (
              <tr key={quotation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {quotation.quotationId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {quotation.vendor?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    KES{" "}
                    {parseFloat(quotation.totalAmount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderTicketStatus(quotation.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Permission
                    allowedPermission={[PERMISSION_VIEW_QUOTATIONS]}
                  >
                    <button
                      onClick={() => {
                        setSelectedQuotation(quotation);
                        setShowPreview(true);
                      }}
                      className="text-[#0047ab] hover:text-[#003a91] transition-colors duration-200"
                    >
                      <FaEye className="h-5 w-5" />
                    </button>
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

      {renderPreviewModal()}
    </div>
  );
};

const WrappedLanding = withAuth(QuotationsList, false);

export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
