import React, { useState, useEffect } from "react";
import Spinner from "../../../../components/Spinner.jsx";
import withAuth from "../../../../utils/withAuth.js";
import MainLayout from "../../../../layouts/MainLayout.jsx";
import api from "../../../../utils/apiInterceptor.js";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../../../context/AuthContext.jsx";
import Modal from "../../../../components/Modal.js";
import RejectionReasonForm from "../../../../components/RejectionReasonForm.js";
import {
  QuotationStatus,
  QUOTATION_STATUS_LABEL,
} from "../../../../constants/status.constants.js";
import { toast } from "react-toastify";
import { CURRENCY } from "../../../../constants/general.constants.js";
import { FaArrowLeft } from "react-icons/fa";
import Permission from "../../../../components/Permission.jsx";
import { PERMISSION_APPROVE_QUOTATION } from "../../../../constants/permissions.constants.js";

const QuotationDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchQuotationDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/quotation/${id}`);
      if (!response.data.quotation) {
        throw new Error("No quotation found");
      }
      setQuotation(response.data.quotation);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching quotation details";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotationDetails();
  }, [id]);

  const handleStatusChange = async (status, rejectionReason = null) => {
    try {
      const payload = {
        status,
        lastUpdatedById: user.id,
      };

      if (status === QuotationStatus.REJECTED) {
        if (!rejectionReason?.trim()) {
          Swal.fire({
            title: "Error!",
            text: "Please provide a rejection reason.",
            icon: "error",
          });
          return;
        }
        payload.rejectionReason = rejectionReason;
      }

      if (status === QuotationStatus.APPROVED) {
        const confirmation = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to approve this quotation.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#77B634",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, approve it!",
        });

        if (!confirmation.isConfirmed) {
          return;
        }
      }
      const response = await api.patch(
        `/api/quotation/${id}/update-status`,
        payload
      );

      if (response.status === 200) {
        if (status === QuotationStatus.REJECTED) {
          toast.info("Quote rejected and sent back to procurement.", {
            onClose: () => navigate("/app/finance-approval/quotation-list"),
          });
        } else if (status === QuotationStatus.APPROVED) {
          toast.success("The quotation has been approved.", {
            onClose: () => navigate("/app/finance-approval/quotation-list"),
          });
        } else {
          toast.success("Quote status updated successfully.", {
            onClose: () => navigate("/app/finance-approval/quotation-list"),
          });
        }
      } else {
        toast.error("Failed to update quotation status.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while updating the quotation.";

      toast.error(message);
    }
  };

  const handleReject = () => {
    setIsModalOpen(true);
  };

  const handleSubmitRejectionReason = (reason) => {
    handleStatusChange(QuotationStatus.REJECTED, reason);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-2">
        <div className=" gap-8 flex-col">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back</span>
          </button>
          <h2 className=" mt-5 text-xl font-bold text-gray-900">
            Quote Details
          </h2>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : quotation ? (
        <div className="space-y-6">
          <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
            <h2>
              <span className="font-bold">Quote ID: </span>
              <span>{quotation.quotationId}</span>
            </h2>
            <p>
              <span className="font-bold">Expected Delivery Date:</span> &nbsp;
              {new Date(
                quotation.lineItems[0].expectedDeliveryDate
              ).toLocaleDateString("en-us", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </p>

            <p>
              <span className="font-bold">Created:</span> &nbsp;
              {new Date(quotation.createdAt).toLocaleDateString("en-us", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </p>

            <p>
              <span className="font-bold">Vendor:</span> {quotation.vendor.name}
            </p>
            <p>
              <span className="font-bold">Status:</span>{" "}
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
                {QUOTATION_STATUS_LABEL[quotation.status] || quotation.status}
              </span>
            </p>
            <p>
              <span className="font-bold">Total Amount:</span> &nbsp;
              {CURRENCY}&nbsp;
              {Number(quotation.totalAmount.toFixed(2)).toLocaleString()}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-auto ">
              <thead>
                <tr className="bg-gray-100 text-sm">
                  <th className="px-6 py-3 text-left font-bold">Device Type</th>
                  <th className="px-6 py-3 text-left font-bold">Quantity</th>
                  <th className="px-6 py-3 text-left font-bold">
                    Unit Price ({CURRENCY})
                  </th>
                  <th className="px-6 py-3 text-left font-bold">
                    Total Price ({CURRENCY})
                  </th>
                  <th className="px-6 py-3 text-left font-bold">
                    Specification
                  </th>
                  <th className="px-6 py-3 text-left font-bold">
                    Justification
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotation.lineItems.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 border-b border-gray-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {item.deviceType.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(item.unitPrice.toFixed(2)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(item.totalPrice.toFixed(2)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs break-words whitespace-normal">
                      {item.specification}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs break-words whitespace-normal">
                      {item.justification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 space-y-4"></div>
          <div className="space-y-4">
            <div className="flex justify-end gap-4">
              <Permission
                allowedPermission={[PERMISSION_APPROVE_QUOTATION]}
              >
                <button
                  type="button"
                  onClick={() => handleStatusChange(QuotationStatus.APPROVED)}
                  disabled={quotation?.status !== QuotationStatus.SUBMITTED}
                  className={`inline-flex justify-center items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${
                    quotation?.status === QuotationStatus.SUBMITTED
                      ? "bg-[#77B634] hover:bg-[#4d7820] focus:ring-[#77B634]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Approve
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={quotation?.status !== QuotationStatus.SUBMITTED}
                  className={`inline-flex justify-center items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 ${
                    quotation?.status === QuotationStatus.SUBMITTED
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Reject
                </button>
              </Permission>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-700">Loading...</p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RejectionReasonForm
          onSubmit={handleSubmitRejectionReason}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const WrappedLanding = withAuth(QuotationDetails, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
