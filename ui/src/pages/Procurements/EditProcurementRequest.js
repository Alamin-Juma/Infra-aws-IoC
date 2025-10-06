import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

const EditProcurementRequestModal = ({
  id,
  isOpen,
  onClose,
  onSubmit,
  editProcurementRequestModalRef,
}) => {
  const [request, setRequest] = useState({
    justification: id?.justification || "",
    expectedDelivery: id?.expectedDelivery || "",
  });
  const [errors, setErrors] = useState({
    justification: false,
    expectedDelivery: false,
  });

  useEffect(() => {
    if (id) {
      setRequest({
        justification: id?.justification || "",
        expectedDelivery: id?.expectedDelivery
          ? new Date(id.expectedDelivery)
          : new Date(),
      });
    }
  }, [id]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "expectedDelivery") {
      const selectedDate = value ? new Date(value) : null;
      setErrors((prev) => ({ ...prev, expectedDelivery: false }));
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          expectedDelivery: "Delivery date is required",
        }));
      } else if (selectedDate <= new Date()) {
        setErrors((prev) => ({
          ...prev,
          expectedDelivery: "Expected delivery date must be in the future",
        }));
      }

      setRequest((prev) => ({
        ...prev,
        [name]: selectedDate && !isNaN(selectedDate) ? selectedDate : "",
      }));
    } else {
      setRequest((prev) => ({ ...prev, [name]: value }));
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        id: id?.id,
        ...request,
        expectedDelivery: new Date(request.expectedDelivery),
      });
      request.justification = "";
      request.expectedDelivery = "";
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
        ref={editProcurementRequestModalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold text-center w-full">
              Edit Procurement Request
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
                value={
                  request.expectedDelivery instanceof Date &&
                  !isNaN(request.expectedDelivery)
                    ? request.expectedDelivery.toISOString().split("T")[0]
                    : ""
                }
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

export default EditProcurementRequestModal;
