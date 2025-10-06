import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { fetchRequestDetails, fetchVendors, fetchVendorDevices, submitQuotation } from "./ProcurementRequestDetailsService";
import LoadingTable from "../../../../components/LoadingTable";
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../../../layouts/MainLayout';
import withAuth from '../../../../utils/withAuth';
import Lottie from "lottie-react";
import animationData from "../../../../assets/lottie/no-data.json";
import { toast } from "react-toastify";
import { FaEye, FaInfoCircle, FaArrowLeft } from "react-icons/fa";
import { io } from "socket.io-client";
import config from "../../../../configs/app.config";
import Spinner from "../../../../components/Spinner.jsx";
import Permission from "../../../../components/Permission.jsx";
import { PERMISSION_CREATE_QUOTATION } from "../../../../constants/permissions.constants.js";

const ProcurementRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorDevices, setVendorDevices] = useState([]);
  const [quotationValues, setQuotationValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewModalRef = useRef(null);
  const API_BASE_URL = config.API_BASE_URL;
  const socket = io(API_BASE_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const requestDetails = await fetchRequestDetails(id);
        setRequest(requestDetails);

        const vendorsData = await fetchVendors();
        setVendors(vendorsData);

        const vendorDevicesData = await fetchVendorDevices();
        setVendorDevices(vendorDevicesData);
      } catch{      
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (itemId, field, value) => {
    if (request?.status === "Quoted") return;

    const newQuotationValues = {
      ...quotationValues,
      [itemId]: {
        ...quotationValues[itemId],
        [field]: value,
      },
    };
    setQuotationValues(newQuotationValues);

    let error = null;
    if (field === 'unitPrice') {
      error = validateUnitPrice(value);
    } else if (field === 'vendor') {
      error = validateVendorSelection(value);
    }

    setErrors(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: error,
      },
    }));
  };

  const validateUnitPrice = (value) => {
    if (!value) return "Unit price is required";
    if (isNaN(value)) return "Must be a valid number";
    if (parseFloat(value) < 1) return "Must be at least 1.00";
    return null;
  };

  const validateVendorSelection = (vendorId) => {
    if (!vendorId) return "Vendor selection is required";
    return null;
  };

  const calculateTotalQuotation = () => {
    return request?.procurementRequestItems?.reduce((total, item) => {
      const unitPrice = parseFloat(quotationValues[item.id]?.unitPrice || 0);
      const quantity = parseInt(item.quantity || 0);
      return total + (unitPrice * quantity);
    }, 0);
  };

  const validateAllFields = () => {
    if (!request?.procurementRequestItems) return false;

    return request.procurementRequestItems.every(item => {
      const itemValues = quotationValues[item.id] || {};
      const itemErrors = errors[item.id] || {};

      const hasUnitPrice = itemValues.unitPrice && !itemErrors.unitPrice;
      const hasVendor = itemValues.vendor && !itemErrors.vendor;

      return hasUnitPrice && hasVendor;
    });
  };
  const getVendorsForDevice = (deviceTypeId) => {
    const vendorIds = vendorDevices
      .filter(vd => vd.deviceId === deviceTypeId)
      .map(vd => vd.vendorId);
    return vendors.filter(vendor => vendorIds.includes(vendor.id) && vendor.status === "ACTIVE");
  };

  const handlePreviewClick = () => {
    const allValid = validateAllFields();

    if (!allValid) {
      const newErrors = {};
      request.procurementRequestItems.forEach(item => {
        newErrors[item.id] = {
          unitPrice: validateUnitPrice(quotationValues[item.id]?.unitPrice),
          vendor: validateVendorSelection(quotationValues[item.id]?.vendor)
        };
      });
      setErrors(newErrors);

      toast.error("Please complete all required fields before previewing");
      return;
    }

    setShowPreview(true);
  };

  const sendNotificationToAllUsers = async (message) => {
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
            type: "quotation_submitted",
            requestId: request?.id || null,
            navigationPath: `/app/procurement/quotations`
          });
        }
      }
    } catch{      
    }
  };

  const handleSubmitQuotation = async () => {
    setLoading(true);
    try {
      await submitQuotation(request, quotationValues, vendors);
      setIsSubmitted(true);
      setShowPreview(false);
      await fetchRequestDetails(id);
      
      const vendorNames = Object.values(quotationValues)
        .map(qv => {
          const v = vendors.find(v => v.id === parseInt(qv.vendor));
          return v ? v.name : null;
        })
        .filter(Boolean)
        .join(", ");
      const totalValue = calculateTotalQuotation();
      const message = `A quotation for Procurement Request #${request?.id || ''} has been submitted by vendor(s): ${vendorNames}.\nTotal Quote Value: KES ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
      await sendNotificationToAllUsers(message);

      
      toast.success('Quote submitted successfully!', {
        onClose: () => navigate('/app/procurement/quotations')       
      });

    } catch{
     
      toast.error('Failed to submit quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPreviewModal = () => {
    if (!showPreview || !request) return null;

    const groupedItems = {};
    request.procurementRequestItems.forEach(item => {
      const vendorId = quotationValues[item.id]?.vendor;
      if (vendorId) {
        if (!groupedItems[vendorId]) groupedItems[vendorId] = [];
        groupedItems[vendorId].push({
          ...item,
          unitPrice: parseFloat(quotationValues[item.id]?.unitPrice || 0),
          totalPrice: parseFloat(quotationValues[item.id]?.unitPrice || 0) * parseInt(item.quantity || 0)
        });
      }
    });

    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div 
            ref={previewModalRef}
            className="relative bg-white rounded-2xl w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.15)]"
          >
            
            <div className="bg-[#77B634] px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Quote Preview</h3>
                <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium text-white">
                  Request #{request.id}
                </span>
              </div>
            </div>

           
            <div className="bg-white px-8 py-6">
             
              <div className="bg-gray-50/80 rounded-xl p-6 mb-8 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    
                    <div>
                      <h4 className="text-gray-900 mb-1">Expected Delivery</h4>
                      <p className="text-gray-900">{formatDate(request.expectedDelivery)}</p>
                    </div>
                  </div>
                </div>
              </div>

             
              {Object.keys(groupedItems).map((vendorId, vendorIndex) => {
                const vendor = vendors.find(v => v.id === parseInt(vendorId));
                const items = groupedItems[vendorId];
                const vendorTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

                return (
                  <div key={vendorId}>
                    {vendorIndex > 0 && (
                      <div className="my-8 border-t-2 border-gray-200"></div>
                    )}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {vendor?.name || "Unknown Vendor"}
                        </h4>
                        <span className="text-sm font-medium text-gray-500">
                          {items.length} {items.length === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                      <div className="rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 table-zebra table border-collapse border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                Device Type
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                Specification
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                Quantity
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                Unit Price (KES)
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                                Total (KES)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item, index) => {
                              const unitPrice = parseFloat(item.unitPrice);
                              const quantity = parseInt(item.quantity);
                              const total = unitPrice * quantity;
                              const isValidPrice = unitPrice >= 1;

                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
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
                                      <div className="text-gray-600 whitespace-pre-wrap break-words max-w-[400px]">
                                        {item.specification || "N/A"}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{quantity.toLocaleString()}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      <span className={`${isValidPrice ? 'text-gray-600' : 'text-red-600'}`}>
                                        {unitPrice.toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </span>
                                      {!isValidPrice && (
                                        <span className="ml-2 text-xs text-red-500">(Minimum price: 1.00)</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
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
                          <tfoot>
                            <tr className="bg-gray-50">
                              
                              
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center h-[52px]">
                  <h4 className="text-lg font-semibold text-gray-900">Total Quote Value</h4>
                  <p className="text-lg font-bold text-[#77B634]">
                    KES {calculateTotalQuotation().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-2xl">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg font-medium text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  onClick={() => setShowPreview(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg font-medium text-sm text-white bg-[#77B634] hover:bg-[#5F942C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#77B634] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmitQuotation}
                  disabled={loading || isSubmitted}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Spinner className="mr-2 w-5 h-5" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Quote to Finance"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!request && !loading) {
    return (
      <div className="w-full h-full p-6">
        <div className="flex flex-col items-center justify-center">
          <Lottie animationData={animationData} loop className="h-40" />
          <span className="text-gray-600 text-lg font-semibold">
            No Procurement Request Found
          </span>
        </div>
      </div>
    );
  }

  if (!request) return <LoadingTable />;

  return (
    <div className="w-full h-full p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back</span>
        </button>
          <h2 className="ml-2 text-xl font-bold text-gray-900">Procurement Request Details</h2>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 border border-gray-100">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-semibold">Request ID:</span>
            <span className="text-gray-800 font-normal">{request.id}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-semibold">Status:</span>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              request.status === "Draft" ? "bg-gray-100 text-gray-800" :
              request.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
              request.status === "Approved" ? "bg-green-100 text-green-800" :
              request.status === "Rejected" ? "bg-red-100 text-red-800" :
              request.status === "Fulfilled" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {request.status}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-semibold">Expected Delivery:</span>
            <span className="text-gray-800 font-normal">{formatDate(request.expectedDelivery)}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <span className="text-gray-700 font-semibold block mb-2">Justification:</span>
            <p className="text-gray-800 font-normal whitespace-pre-wrap break-words">
              {request.justification}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-8 mb-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Request Items</h3>
        <div className="mt-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 table-zebra table border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[20%]">
                    Device Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[30%]">
                    Specification
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[10%]">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[20%]">
                    Unit Price (KES)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-[20%]">
                    Vendor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {request.procurementRequestItems?.length > 0 ? (
                  request.procurementRequestItems.map(item => {
                    const allowedVendors = getVendorsForDevice(item.deviceTypeId);
                    const itemErrors = errors[item.id] || {};
                    const isQuoted = request.status === "Quoted";
                    const unitPrice = parseFloat(quotationValues[item.id]?.unitPrice || 0);
                    const quantity = parseInt(item.quantity || 0);
                    const total = unitPrice * quantity;
                    const isValidPrice = unitPrice >= 1;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
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
                            <div className="text-gray-600 whitespace-pre-wrap break-words max-w-[400px]">
                              {item.specification || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{quantity.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] transition-colors duration-200 ${
                                  itemErrors.unitPrice 
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-gray-300'
                                }`}
                                value={quotationValues[item.id]?.unitPrice || ''}
                                onChange={e => handleInputChange(item.id, 'unitPrice', e.target.value)}
                                placeholder="0.00"
                                disabled={isQuoted}
                              />
                              {itemErrors.unitPrice && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                  <FaInfoCircle className="mr-1" /> {itemErrors.unitPrice}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <select
                              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] transition-colors duration-200 ${
                                itemErrors.vendor 
                                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-gray-300'
                              }`}
                              value={quotationValues[item.id]?.vendor || ''}
                              onChange={e => handleInputChange(item.id, 'vendor', e.target.value)}
                              disabled={isQuoted}
                            >
                              <option value="">Select Vendor</option>
                              {allowedVendors.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                              ))}
                            </select>
                            {itemErrors.vendor && (
                              <p className="text-red-500 text-xs mt-1 flex items-center">
                                <FaInfoCircle className="mr-1" /> {itemErrors.vendor}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Lottie animationData={animationData} loop={true} className="h-40" />
                        <span className="text-gray-600 text-lg font-semibold mt-4">No Items Found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">
            Total Quote Value: <span className="text-[#77B634]">KES {calculateTotalQuotation().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
        <Permission
          allowedPermission={[PERMISSION_CREATE_QUOTATION]}
        >
          <button
            className={`px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
              isSubmitted 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : validateAllFields() 
                  ? "bg-[#77B634] hover:bg-[#5F942C] text-white shadow-lg hover:shadow-xl" 
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handlePreviewClick}
            disabled={!validateAllFields() || isSubmitted}
          >
            {isSubmitted ? (
              "Quote Submitted"
            ) : (
              <>
                <FaEye className="text-lg" /> Preview Quote
              </>
            )}
          </button>
        </Permission>
      </div>

      {renderPreviewModal()}
    </div>
  );
};

const WrappedLanding = withAuth(ProcurementRequestDetails, false);

export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);


