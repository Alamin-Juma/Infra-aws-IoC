import React, { useEffect, useRef, useState } from "react";
import withAuth from "../../utils/withAuth";
import MainLayout from "../../layouts/MainLayout";
import Pagination from "../../components/Pagination";
import LoadingTable from "../../components/LoadingTable";
import Lottie from "lottie-react";
import api from "../../utils/apiInterceptor";
import animationData from "../../assets/lottie/no-data.json";
import { toast } from "react-toastify";
import { IoSearchSharp, IoTrashOutline } from "react-icons/io5";
import { MdAdd, MdEdit, MdOutlineFilterAlt } from "react-icons/md";
import CreateEditRequestItemModal from "./CreateEditRequestItemModal";
import { formatDateForFilterWithTime } from "../../utils/formatDate";
import CreateProcurementRequestModal from "./CreateProcurementRequestModal";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { BsPencilSquare } from "react-icons/bs";
import {
  DEBOUNCETIMEOUT,
  ProcurementRequestStatus,
} from "../../utils/constants";
import {
  fetchProcurementRequestItems,
  handleSubmitProcurementRequestService,
  handleSubmitRequestService,
} from "./ProcurementRequestService";
import { PERMISSION_DELETE_PROCUREMENT_REQUEST, PERMISSION_MANAGE_PROCUREMENT_REQUEST, PERMISSION_SUBMIT_PROCUREMENT_REQUEST } from "../../constants/permissions.constants";
import Permission from "../../components/Permission";

const RequestItems = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState({ data: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] =
    useState(false);
  const [isSubmitToProcurementModalOpen, setIsSubmitToProcurementModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const procurementModalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        procurementModalRef.current &&
        !procurementModalRef.current.contains(event.target)
      ) {
        setIsSubmitToProcurementModalOpen(false);
      }
    };
    if (isSubmitToProcurementModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    if (isSubmitToProcurementModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSubmitToProcurementModalOpen]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCETIMEOUT);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await fetchProcurementRequestItems(
        page,
        limit,
        debouncedSearchTerm,
        statusFilter
      );
      setTotal(data?.pagination?.total || 0);
      setRequests(data || []);
    } catch (error) {
      toast.error("Failed to fetch procurement requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, debouncedSearchTerm, statusFilter]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSubmitRequest = async (data) => {
    const success = await handleSubmitRequestService(
      data,
      user,
      fetchData,
      setIsSubmitToProcurementModalOpen
    );
    if (success) {
      setIsSubmitToProcurementModalOpen(false);
    }
  };

  const handleSubmitProcurementRequest = async (data) => {
    const success = await handleSubmitProcurementRequestService(
      data,
      selectedRequests,
      user,
      fetchData,
      setIsSubmitToProcurementModalOpen
    );
    if (success) {
      setIsSubmitToProcurementModalOpen(false);
    }
  };

  const isRequestSelectable = (request) => {
    return request.status === ProcurementRequestStatus.DRAFT;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableRequests = requests?.data
        ?.filter(isRequestSelectable)
        .map((req) => req.id);
      setSelectedRequests(selectableRequests);
    } else {
      setSelectedRequests([]);
    }
  };

  const handleDeleteRequest = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#77B634",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`/api/procurements-requests/item/${id}`)
          .then(() => {
            toast.success("Request deleted successfully!");
            fetchData();
          })
          .catch((error) => {
            toast.error("Failed to delete request. Please try again.");
          });
      }
    });
  };

  const areAllSelectableRequestsSelected = () => {
    const selectableRequests = requests?.data?.filter(isRequestSelectable);
    return (
      selectableRequests?.length > 0 &&
      selectableRequests?.every((req) => selectedRequests.includes(req.id))
    );
  };
  return (
    <div data-testid="main-container" className="w-full h-full">
      <div className="flex items-center justify-between">
        <h2 className="ml-2 text-xl font-bold">Procurements Requests </h2>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <Permission
              allowedPermission={[PERMISSION_SUBMIT_PROCUREMENT_REQUEST]}
            >
              <div
                onClick={() => {
                  setIsCreateRequestModalOpen(true);
                  setSelectedRequestId(null);
                }}
                className="btn btn-primary bg-[#77B634] w-full md:w-auto"
              >
                <MdAdd className="font-bold text-xl mr-2" /> Add Request
              </div>
            </Permission>
          </div>
        </div>
      </div>
      <div className="h-[5rem] flex flex-col md:flex-row w-full gap-4 justify-between items-center py-4">
        <div className="flex flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <input
              type="text"
              className="input w-full pl-10 pr-4"
              placeholder="Device Type"
              maxLength={30}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
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
              className="select min-w-[200px] w-full pl-10"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
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
        <div className="w-full md:w-auto flex justify-end gap-4 mt-4">
          <Permission
            allowedPermission={[PERMISSION_SUBMIT_PROCUREMENT_REQUEST]}
          >
            <button
              disabled={selectedRequests.length === 0}
              onClick={() => setIsSubmitToProcurementModalOpen(true)}
              className="btn btn-primary bg-[#77B634] w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit To Procurement
            </button>
          </Permission>
        </div>
      </div>
      {loading && <LoadingTable />}
      {!loading && (
        <div className="flex w-full overflow-x-auto">
          <table className="table-zebra table min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-6 py-3 text-left font-semibold">
                  <input
                    type="checkbox"
                    checked={areAllSelectableRequestsSelected()}
                    onChange={handleSelectAll}
                    className="checkbox checkbox-sm checkbox-primary"
                    disabled={!requests?.data?.some(isRequestSelectable)}
                  />
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  Device Type
                </th>
                <th className="px-6 py-3 text-left font-semibold">Quantity</th>
                <th className="px-6 py-3 text-left font-semibold">
                  Specification
                </th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">
                  Created At
                </th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!requests?.data || requests?.data?.length === 0 ? (
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
              ) : (
                requests?.data?.map((request) => (
                  <tr
                    key={request?.id}
                    className="border border-gray-200 w-full"
                  >
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => {
                          setSelectedRequests((prev) =>
                            prev.includes(request.id)
                              ? prev.filter((id) => id !== request.id)
                              : [...prev, request.id]
                          );
                        }}
                        className="checkbox checkbox-sm checkbox-primary"
                        disabled={!isRequestSelectable(request)}
                      />
                    </td>
                    <td className="px-6 py-3 capitalize">
                      {request?.deviceType?.name}
                    </td>
                    <td className="px-6 py-3">{request?.quantity}</td>
                    <td className="px-6 py-3">
                      <div className="relative">
                        <div
                          className={`${
                            request?.specification?.length > 40
                              ? "whitespace-normal break-words"
                              : "truncate"
                          } max-w-full`}
                        >
                          {request?.specification}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
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
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {request?.status}
                      </span>
                    </td>
                    <td>{formatDateForFilterWithTime(request?.createdAt)}</td>
                    <td className="px-6 py-3">
                      {request?.status !== ProcurementRequestStatus.SUBMITTED &&
                        request?.status !==
                          ProcurementRequestStatus.FULFILLED &&
                        request?.status !== ProcurementRequestStatus.REJECTED &&
                        request?.status !==
                          ProcurementRequestStatus.APPROVED && (
                          <div className="flex gap-2">
                            <Permission
                              allowedPermission={[PERMISSION_MANAGE_PROCUREMENT_REQUEST]}
                            >
                              <button
                                onClick={() => {
                                  setSelectedRequestId(request?.id);
                                  setIsCreateRequestModalOpen(true);
                                }}
                              >
                                <BsPencilSquare className="text-[#E3963E] text-lg" />
                              </button>
                            </Permission>
                            {request?.status ===
                              ProcurementRequestStatus.DRAFT && (
                              <Permission
                                allowedPermission={[PERMISSION_DELETE_PROCUREMENT_REQUEST]}
                              >
                                <button
                                  onClick={() => handleDeleteRequest(request?.id)}
                                >
                                  <IoTrashOutline className="text-red-600 text-lg" />
                                </button>
                              </Permission>
                            )}
                          </div>
                        )}
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

      <CreateEditRequestItemModal
        isOpen={isCreateRequestModalOpen}
        onClose={() => setIsCreateRequestModalOpen(false)}
        onSubmit={handleSubmitRequest}
        id={selectedRequestId}
      />
      {isSubmitToProcurementModalOpen && (
        <CreateProcurementRequestModal
          isOpen={isSubmitToProcurementModalOpen}
          onClose={() => setIsSubmitToProcurementModalOpen(false)}
          selectedRequests={selectedRequests}
          onSubmit={handleSubmitProcurementRequest}
          procurementModalRef={procurementModalRef}
        />
      )}
    </div>
  );
};

const WrappedLanding = withAuth(RequestItems, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
