import React, { useState, useEffect, useRef } from "react";
import Spinner from "../../../../components/Spinner.jsx";
import withAuth from "../../../../utils/withAuth.js";
import MainLayout from "../../../../layouts/MainLayout.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext.jsx";
import { toast } from "react-toastify";
import Logo from "../../../../assets/logo.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";

import { PO_STATUS } from "../../../../constants/status.constants.js";
import {
  COMPANY_DETAILS,
  CURRENCY,
} from "../../../../constants/general.constants.js";
import {
  fetchPurchaseOrderDetailsService,
  updatePurchaseOrderStatusService,
} from "./PODetails.service.js";
import { FaArrowLeft } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import Permission from "../../../../components/Permission.jsx";
import { PERMISSION_CREATE_PURCHASE_ORDER } from "../../../../constants/permissions.constants.js";

const PODetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

  const fetchPurchaseOrderDetails = async () => {
    setLoading(true);
    try {
      const purchaseOrderDetails = await fetchPurchaseOrderDetailsService(id);
      setPurchaseOrder(purchaseOrderDetails);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrderDetails();
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const confirmation = await Swal.fire({
        title: "Are you sure?",
        text: "You are about to send this purchase Order to the vendor.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#77B634",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, send it!",
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      setIsSending(true);
      const result = await updatePurchaseOrderStatusService(id, status, user);

      if (result.success) {
        if (status === "PO_Sent") {
          toast.success(result.message, {
            onClose: () => navigate("/app/finance-approval/po-list"),
          });
        } else {
          toast.success(result.message);
        }

        fetchPurchaseOrderDetails();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = () => {
    downloadPDF(printRef, `purchase_order_${purchaseOrder.poNumber}`);
  };

  const downloadPDF = async (printRef, filename = "document") => {
    const element = printRef.current;
    if (!element) {
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const data = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {loading ? (
        <Spinner />
      ) : purchaseOrder ? (
        <>
          <div className="flex py-4 justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <FaArrowLeft className="mr-2" />
                <span>Back</span>
              </button>
            </div>
            <div>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#77B634] hover:bg-[#4d7820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#77B634]"
              >
                Download PDF
              </button>
            </div>
          </div>
          <div className="border-2 border-gray-200">
            <div ref={printRef} className="space-y-6 min-h-screen-[100px] p-6">
              <div className="bg-white rounded-lg p-6 space-y-4 flex flex-col">
                <div className="flex justify-between mr-4">
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold mb-2">Purchase Order</h1>
                    <p className="text-gray-600 ml-0">
                      # {purchaseOrder.poNumber}
                    </p>
                  </div>

                  <p className="mr-4">
                    <img src={Logo} alt="Logo" />
                  </p>
                </div>

                <div className="flex flex-1 justify-between border-t-2 border-b-2 border-gray-200 pt-4 py-8">
                  <div className="flex flex-col space-y-2">
                    <p className="text-gray-700">
                      <span className="font-bold">Issued:</span>
                      <p>
                        {new Date(purchaseOrder.createdAt).toLocaleDateString(
                          "en-us",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )}
                      </p>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-bold">Due:</span>
                      <p>
                        {new Date(
                          purchaseOrder.items[0].expectedDeliveryDate
                        ).toLocaleDateString("en-us", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </p>
                    </p>
                  </div>
                  <div className="border-l-2 border-gray-200 pl-4">
                    <h3 className="font-semibold">To:</h3>
                    <p className="text-gray-700 capitalize">
                      <span className="font-medium">Vendor:</span>{" "}
                      {purchaseOrder.vendor.name}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Address:</span>{" "}
                      {purchaseOrder.vendor.physicalAddress || "N/A"}
                    </p>
                  </div>
                  <div className="border-l-2 border-gray-200 pl-4">
                    <h3 className="font-semibold">From:</h3>
                    <p className="text-gray-700">
                      <span className="font-medium">Company:</span>{" "}
                      {COMPANY_DETAILS.COMPANY_NAME}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Address:</span>{" "}
                      {COMPANY_DETAILS.COMPANY_ADDRESS}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Telephone:</span>{" "}
                      {COMPANY_DETAILS.COMPANY_TELEPHONE}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto mx-4">
                <table className="min-w-full divide-y divide-gray-200 table-auto ">
                  <thead className="bg-gray-100">
                    <tr className=" text-sm">
                      <th className="px-6 py-3 text-left font-bold">
                        Device Type
                      </th>
                      <th className="px-6 py-3 text-left font-bold">
                        Specification
                      </th>
                      <th className="px-6 py-3 text-left font-bold">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left font-bold">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left font-bold">
                        Line Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 border-b border-gray-200"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                          {item.deviceType.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs break-words whitespace-normal">
                          {item.specification}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {Number(item.unitPrice.toFixed(2)).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {Number(item.totalPrice.toFixed(2)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="max-w-full flex flex-row justify-between space-x-2 ">
                <div className=""></div>
                <div className=" pl-4">
                  <p className="text-gray-700 mr-8">
                    <span className="font-bold">
                      Total:
                      {CURRENCY} &nbsp;
                      {Number(
                        purchaseOrder.totalAmount.toFixed(2)
                      ).toLocaleString()}{" "}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg space-y-4 flex flex-row flex-1 justify-end mt-6">
            <Permission
              allowedPermission={[PERMISSION_CREATE_PURCHASE_ORDER]}
            >
              <button
                type="button"
                onClick={() => handleStatusChange(PO_STATUS.PO_SENT)}
                disabled={
                  purchaseOrder?.status === PO_STATUS.PO_SENT || isSending
                }
                className={`inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSending || purchaseOrder?.status === PO_STATUS.PO_SENT
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#77B634] hover:bg-[#4d7820]"
                } `}
              >
                {isSending ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Sending...
                  </>
                ) : (
                  "Send PO"
                )}
              </button>
            </Permission>
          </div>
        </>
      ) : (
        <p className="text-gray-700">Loading...</p>
      )}
    </div>
  );
};

const WrappedLanding = withAuth(PODetails, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
