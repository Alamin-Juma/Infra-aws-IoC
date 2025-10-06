import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { io } from "socket.io-client";
import config from "../../configs/app.config";
import { toast } from "react-toastify";

const CreateProcurementRequestModal = ({
  isOpen,
  onClose,
  selectedRequests,
  onSubmit,
  procurementModalRef,
}) => {
  const [request, setRequest] = useState({
    justification: "",
    expectedDelivery: "",
    selectedRequests: selectedRequests || [],
    createdByID: "",
  });

  const [errors, setErrors] = useState({
    justification: false,
    expectedDelivery: false,
  });

  const API_BASE_URL = config.API_BASE_URL;
  const socket = io(API_BASE_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  const sendNotificationToAllUsers = async (notificationData) => {
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
            ...notificationData
          });
        }
      }
    } catch{
     
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "expectedDelivery") {
      setErrors({ ...errors, expectedDelivery: !value });
    }
    if (name === "expectedDelivery" && new Date(value) <= new Date()) {
      setErrors({
        ...errors,
        expectedDelivery: "Expected delivery date must be in the future",
      });
    }

    setRequest((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (request.justification.length >= 0 && request.justification.length < 20)
      newErrors.justification = "Justification must be at least 20 characters";
    if (request.justification.length > 200)
      newErrors.justification = "Justification cannot exceed 200 characters";
    if (!request.expectedDelivery)
      newErrors.expectedDelivery = "Expected delivery date is Requiered";
    if (
      request.expectedDelivery &&
      new Date(request.expectedDelivery) <= new Date()
    ) {
      newErrors.expectedDelivery =
        "Expected delivery date must be in the future";
    }
    newErrors = {
      ...newErrors,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const result = await onSubmit({
          ...request,
          expectedDelivery: new Date(request.expectedDelivery),
          selectedRequests,
        });

        if (result && result.id) {
          const message = `A new procurement request has been created: "${request.justification.slice(0, 40)}..."`;
          
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
                  type: "procurement_created",
                  requestId: result.id,
                  navigationPath: `/app/procurement/procurement-request/${result.id}`
                });
              }
            }
          } catch {
            
          }

          toast.success('Procurement request created successfully!', {
            onClose: () => window.location.href = `/app/procurement/procurement-request/${result.id}`,
            autoClose: 2000
          });

          setRequest({
            justification: "",
            expectedDelivery: "",
            selectedRequests: [],
            createdByID: "",
          });
          
          onClose();
        }
      } catch (error) {
        toast.error('Failed to create procurement request. Please try again.');
      }
    }
  };

  const handleJustificationChange = (e) => {
    setRequest({ ...request, justification: e.target.value });
    const specLength = e.target.value.length;
    let justError = "";

    if (specLength < 20 && specLength > 0) {
      justError = "Justification must be at least 20 characters";
    } else if (specLength > 200) {
      justError = "Justification cannot exceed 200 characters";
    }

    setErrors({ ...errors, justification: justError });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[99999]">
      <div
        ref={procurementModalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold text-center w-full">
              Create Procurement Request
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 "
              aria-label="Close"
            >
              <MdClose className="text-2xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justification <span className="text-red-500">*</span>{" "}
                <span className="text-gray-500 text-xs">
                  (20-200 characters)
                </span>
              </label>
              <textarea
                name="justification"
                value={request.justification}
                onChange={handleJustificationChange}
                maxLength={200}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.justification ? "border-red-500" : "border-gray-300"
                }`}
                rows={4}
                placeholder="Explain why this procurement is needed (20-200 characters)..."
              />
              <div className="flex justify-between items-center mt-1">
                <p
                  className={`text-sm ${
                    request.justification.length < 20 &&
                    request.justification.length > 0
                      ? "text-red-500"
                      : request.justification.length > 200
                      ? "text-red-500"
                      : request.justification.length >= 20 &&
                        request.justification.length <= 200
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {request.justification.length}/200 characters
                </p>
                {errors.justification && (
                  <p className="text-red-500 text-sm ml-2">
                    {errors.justification}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expectedDelivery"
                value={request.expectedDelivery}
                onChange={handleChange}
                min={
                  new Date(Date.now() + 86400000).toISOString().split("T")[0]
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.expectedDelivery ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.expectedDelivery && (
                <p className="mt-1 text-sm text-red-600">
                  {request.expectedDelivery &&
                  new Date(request.expectedDelivery) < new Date()
                    ? "Delivery date must be in the future"
                    : "Delivery date is required"}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#77B634] text-white rounded-md hover:bg-[#68A32E]"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProcurementRequestModal;
