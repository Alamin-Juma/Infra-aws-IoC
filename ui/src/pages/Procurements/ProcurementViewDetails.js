import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import withAuth from "../../utils/withAuth";
import MainLayout from "../../layouts/MainLayout";
import api from "../../utils/apiInterceptor";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/formatDate";
import { ProcurementRequestStatus } from "../../utils/constants";
import ApproveRejectModal from "./ApproveRejectModal";
import EditProcurementRequestModal from "./EditProcurementRequest";
import { io } from "socket.io-client";
import config from "../../configs/app.config";
import {
  editProcurementRequest,
  handleApproveRejectSubmitService,
} from "./ProcurementRequestService";
import DropdownActionsButton from "../../components/DropdownActionsButton";
import Permission from "../../components/Permission";
import { PERMISSION_APPROVE_PROCUREMENT_REQUEST } from "../../constants/permissions.constants";

const ProcurementViewDetails = () => {
  const { id } = useParams();
  const [procurement, setProcurement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openRowId, setOpenRowId] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isApprovalRejectModalOpen, setIsApprovalRejectModalOpen] =
    useState(false);
  const [action, setAction] = useState(null);
  const [isSubmitToProcurementModalOpen, setIsSubmitToProcurementModalOpen] =
    useState(false);
  const modalRef = useRef(null);
  const editProcurementRequestModalRef = useRef(null);

  const API_BASE_URL = config.API_BASE_URL;
  const socket = io(API_BASE_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    timeout: 10000,
  });


  const actions = [
    {
      key: "edit",
      label: "Edit",
      onClick: () => {
      setSelectedRequestId(procurement.id);
      setIsSubmitToProcurementModalOpen(true);
      toggleActions(null);
    },
    onSelectChange: () => {
      setSelectedRequestId(procurement.id);
      setIsSubmitToProcurementModalOpen(true);
      toggleActions(null);
    },
    },
    {
      key: "approve",
      label: "Approve",
      onClick: () => {handleApproveReject(
                  procurement.id,
                  ProcurementRequestStatus.APPROVED
                );
                toggleActions(null);
    },
    onSelectChange: () => {
      handleApproveReject(
                  procurement.id,
                  ProcurementRequestStatus.APPROVED
                );
                toggleActions(null);

    },
    },
    {
      key: "reject",
      label: "Reject",
      onClick: () => {
                handleApproveReject(
                  procurement.id,
                  ProcurementRequestStatus.REJECTED
                );
                toggleActions(null);
              },
      onSelectChange: () => {
                handleApproveReject(
                  procurement.id,
                  ProcurementRequestStatus.REJECTED
                );
                toggleActions(null);
              }
    },
{
      key: "more-info",
      label: "Request More Info",
      onClick: () => {
                handleApproveReject(
                  procurement.id,
                  ProcurementRequestStatus.PENDING
                );
                toggleActions(null);
              },
      onSelectChange: () => {
                handleApproveReject(
                  procurement.id,
                  ProcurementRequestStatus.PENDING
                );
                toggleActions(null);
              }
    },
  ];


  const sendNotificationToAllUsers = async (message, type, requestId) => {
    try {
      const response = await fetch(API_BASE_URL + `/users?page=1&limit=1000`);
      const data = await response.json();

      if (Array.isArray(data.users)) {
        const recipientIds = data.users
          .filter(user => user.roleName !== "employee")
          .map(user => user.id);

        if (recipientIds.length > 0) {
          socket.emit("sendNotification", {
            recipientIds,
            message,
            type,
            requestId,
            navigationPath: `/app/procurement/procurement-request/${requestId}`
          });
        }
      }
    } catch {      
    }
  };

  const handleEditProcurementRequest = async (data) => {
    const success = await editProcurementRequest(data);
    if (success) {
      await sendNotificationToAllUsers(
        `Procurement Request #${procurement.id} has been updated`,
        'procurement_edited',
        procurement.id
      );
      fetchProcurementDetails();
      setIsSubmitToProcurementModalOpen(false);
    }
  };

  const handleApproveRejectSubmit = async (data) => {
    const success = await handleApproveRejectSubmitService(data, action);
    if (success) {
      let notificationMessage = '';
      let notificationType = '';

      switch (action) {
        case ProcurementRequestStatus.APPROVED:
          notificationMessage = `Procurement Request #${procurement.id} has been approved`;
          notificationType = 'procurement_approved';
          break;
        case ProcurementRequestStatus.REJECTED:
          notificationMessage = `Procurement Request #${procurement.id} has been rejected`;
          notificationType = 'procurement_rejected';
          break;
        case ProcurementRequestStatus.PENDING:
          notificationMessage = `More information requested for Procurement Request #${procurement.id}`;
          notificationType = 'procurement_info_requested';
          break;
        default:
          notificationMessage = `Procurement Request #${procurement.id} status has been updated`;
          notificationType = 'procurement_update';
      }

      await sendNotificationToAllUsers(
        notificationMessage,
        notificationType,
        procurement.id
      );

      fetchProcurementDetails();
      setIsApprovalRejectModalOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsApprovalRejectModalOpen(false);
      }
      if (
        editProcurementRequestModalRef.current &&
        !editProcurementRequestModalRef.current.contains(event.target)
      ) {
        setIsSubmitToProcurementModalOpen(false);
      }
    };
    if (isSubmitToProcurementModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    if (isApprovalRejectModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isApprovalRejectModalOpen, isSubmitToProcurementModalOpen]);

  const toggleActions = (id) => {
    setOpenRowId(openRowId === id ? null : id);
  };

  const handleApproveReject = (id, action) => {
    setSelectedRequestId(id);
    setAction(action);
    setIsApprovalRejectModalOpen(true);
    setOpenRowId(null);
  };

  const fetchProcurementDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`api/procurements-requests/${id}`);
      if (response.data.success) {
        setProcurement(response.data.data);
      } else {
        toast.error("Failed to fetch procurement details");
      }
    } catch (error) {
      toast.error("Error fetching procurement details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurementDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!procurement) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <p className="text-red-600">
            Failed to load procurement request details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link
          to="/app/procurement/requests"
          className="flex items-center text-black hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="border-b pb-6 mb-6">
          <h1 className="text-base font-bold">
            Procurement Request <br />
            <span className="text-sm font-bold text-gray-600">
              #{procurement.id}
            </span>
          </h1>
          <hr className="mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-bold text-black">
                  Status:{" "}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                      procurement?.status === ProcurementRequestStatus.DRAFT
                        ? "bg-gray-200 text-gray-800"
                        : procurement?.status ===
                          ProcurementRequestStatus.PENDING
                        ? "bg-yellow-200 text-yellow-800"
                        : procurement?.status ===
                          ProcurementRequestStatus.APPROVED
                        ? "bg-green-200 text-green-800"
                        : procurement?.status ===
                          ProcurementRequestStatus.REJECTED
                        ? "bg-red-200 text-red-800"
                        : procurement?.status ===
                          ProcurementRequestStatus.FULFILLED
                        ? "bg-blue-200 text-blue-800"
                        : procurement?.status ===
                          ProcurementRequestStatus.QOUTED
                        ? "bg-[#556B2F] text-white"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {procurement.status}
                  </span>
                </h3>
              </div>

              <div className="mb-2">
                <h3 className="text-sm font-bold text-black">
                  Created At:{" "}
                  <span className="text-gray-600">
                    {formatDate(procurement.createdAt)}
                  </span>
                </h3>
              </div>
              <div className="mb-2">
                <h3 className="text-sm font-bold text-black">Justification</h3>
                <p className="text-gray-600 break-words whitespace-normal overflow-hidden">
                  {procurement.justification}
                </p>
              </div>
              {procurement.moreInfo && (
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-black">
                    Additional Information
                  </h3>
                  <p className="text-gray-600 break-words whitespace-normal overflow-hidden">
                    {procurement.moreInfo}
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="mb-2">
                <h3 className="text-sm font-bold text-black">
                  Expected Delivery:{" "}
                  <span className="text-gray-600">
                    {formatDate(procurement.expectedDelivery)}
                  </span>
                </h3>
              </div>

              <div className="mb-2">
                <h3 className="text-sm font-bold text-black">
                  Last Updated:{" "}
                  <span className="text-gray-600">
                    {formatDate(procurement.updatedAt)}
                  </span>
                </h3>
              </div>
              {procurement.approvalReason && (
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-black">
                    Approval Reason
                  </h3>
                  <p className="text-gray-600 break-words whitespace-normal overflow-hidden">
                    {procurement.approvalReason}
                  </p>
                </div>
              )}
              {procurement.rejectionReason && (
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-black">
                    Rejection Reason
                  </h3>
                  <p className="text-gray-600 break-words whitespace-normal overflow-hidden">
                    {procurement.rejectionReason}
                  </p>
                </div>
              )}
            </div>
            <div></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold">Requested Items</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Total: {procurement.procurementRequestItems.length} items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y table table-zebra divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm text-gray-500  tracking-wider"
                  >
                    Specification
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm text-gray-500  tracking-wider"
                  >
                    Device Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm text-gray-500  tracking-wider"
                  >
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {procurement.procurementRequestItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 break-words whitespace-normal overflow-hidden">
                        {item.specification}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize">
                        {item.deviceType?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.quantity}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
 


      {procurement.status !== ProcurementRequestStatus.APPROVED &&
        procurement.status !== ProcurementRequestStatus.FULFILLED &&
        procurement.status !== ProcurementRequestStatus.REJECTED &&
        procurement.status !== ProcurementRequestStatus.COMPLETED &&
        procurement.status !== ProcurementRequestStatus.QOUTED && (
          <div className="flex justify-end gap-3 mt-3">
            <Permission
              allowedPermission={[PERMISSION_APPROVE_PROCUREMENT_REQUEST]}
            >
              <DropdownActionsButton actions={actions} defaultActionKey="approve" />
            </Permission>
          </div>
        )}

      {isApprovalRejectModalOpen && (
        <ApproveRejectModal
          id={selectedRequestId}
          action={action}
          isOpen={isApprovalRejectModalOpen}
          onClose={() => setIsApprovalRejectModalOpen(false)}
          onSubmit={handleApproveRejectSubmit}
          approvalRef={modalRef}
        />
      )}

      {isSubmitToProcurementModalOpen && (
        <EditProcurementRequestModal
          id={procurement}
          isOpen={isSubmitToProcurementModalOpen}
          onClose={() => setIsSubmitToProcurementModalOpen(false)}
          onSubmit={handleEditProcurementRequest}
          editProcurementRequestModalRef={editProcurementRequestModalRef}
        />
      )}
      
      
    </div>
  );
};

const WrappedProcurementViewDetails = withAuth(ProcurementViewDetails, false);

export default () => (
  <MainLayout>
    <WrappedProcurementViewDetails />
  </MainLayout>
);
