import React, { useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import api from "../../utils/apiInterceptor";

const CreateEditRequestItemModal = ({
  isOpen,
  onClose,
  onSubmit,
  id = null,
}) => {
  const [deviceType, setDeviceType] = useState(null);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [specification, setSpecification] = useState("");
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);

  const fetchRequestItem = async () => {
    if (id) {
      const response = await api.get(`/api/procurements-requests/item/${id}`);
      const data = response.data.data;
      setDeviceType(data.deviceType);
      setCategory(data.category || "");
      setQuantity(data.quantity || 1);
      setSpecification(data.specification || "");
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequestItem();
    }
    resetForm();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const categories = ["Category1", "Category2", "Custom"];

  
  const categorySpecs = {
    Category1: "Lenovo ThinkBook 14G6 with 16GB RAM and 512GB SSD, 13th Gen",
    Category2: "Lenovo Thinkpad T480s with 16GB RAM and 512GB SSD, 8th Gen",
  };

  const fetchDeviceTypes = async () => {
    const response = await api.get("/deviceTypes", {
      params: { page: 1, limit: 100 },
    });
    setDeviceTypes(response?.data?.data || []);
  };

  useEffect(() => {
    if (isOpen) {
      fetchDeviceTypes();
    }
  }, [isOpen]);

 
  useEffect(() => {
    if (category === "Category1" || category === "Category2") {
      setSpecification(categorySpecs[category]);
      setErrors({ ...errors, specification: "" });
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!deviceType) newErrors.deviceType = "Device type is required";
    if (quantity < 1) newErrors.quantity = "Quantity must be at least 1";
    if (deviceType?.name.toLowerCase().includes("laptop") && !category)
      newErrors.category = "Category is required for laptops";
    if (
      deviceType?.name.toLowerCase().includes("laptop") &&
      category === "Custom" &&
      !specification
    )
      newErrors.specification = "Specification is required for custom laptops";
    if (!deviceType?.name.toLowerCase().includes("laptop") && !specification)
      newErrors.specification = "Specification is required";
    if (specification.length > 0 && specification.length < 20)
      newErrors.specification = "Specification must be at least 20 characters";
    if (specification.length > 200)
      newErrors.specification = "Specification cannot exceed 200 characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && !id) {
      onSubmit({
        deviceType,
        category: deviceType?.name.toLowerCase().includes("laptop")
          ? category
          : undefined,
        quantity,
        specification,
      });
      resetForm();
      onClose();
    }
    if (Object.keys(newErrors).length === 0 && id) {
      onSubmit({
        id,
        deviceType,
        category: deviceType?.name.toLowerCase().includes("laptop")
          ? category
          : undefined,
        quantity,
        specification,
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setDeviceType(null);
    setCategory("");
    setQuantity(1);
    setSpecification("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSpecificationChange = (e) => {
    setSpecification(e.target.value);
    const specLength = e.target.value.length;
    let specError = "";

    if (specLength < 20 && specLength > 0) {
      specError = "Specification must be at least 20 characters";
    } else if (specLength > 200) {
      specError = "Specification cannot exceed 200 characters";
    }

    setErrors({ ...errors, specification: specError });
  };

  const isSpecificationEditable =
    category === "Custom" ||
    !deviceType?.name?.toLowerCase().includes("laptop");
  const capitalize = (s) => {
    return s ? String(s[0] ?? "").toUpperCase() + String(s ?? "").slice(1) : "";
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div ref={modalRef} className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-center w-full">
            {id ? "Edit Procurement Request" : "New Procurement Request"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 "
            aria-label="Close"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label
              htmlFor="deviceType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Device Type <span className="text-red-500">*</span>
            </label>
            <select
              disabled={id ? true : false}
              id="deviceType"
              value={deviceType?.id || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selected = deviceTypes.find(
                  (type) => type.id == selectedId
                );
                setDeviceType(selected || null);
                setCategory("");
                setSpecification("");
                setErrors({ ...errors, deviceType: "" });
              }}
              className={`w-full p-2 border rounded ${
                errors.deviceType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a device type</option>
              {deviceTypes
                .sort((a, b) => b.name.localeCompare(a.name))
                .map((type) => (
                  <option key={type.id} value={type.id} className="capitalize">
                    {capitalize(type.name)}
                  </option>
                ))}
            </select>
            {errors.deviceType && (
              <p className="text-red-500 text-sm mt-1">{errors.deviceType}</p>
            )}
          </div>

          {deviceType?.name.toLowerCase().includes("laptop") && (
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                disabled={id ? true : false}
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setErrors({ ...errors, category: "" });
                }}
                className={`w-full p-2 border rounded ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
  id="quantity"
  type="number"
  value={quantity}
  onChange={(e) => {
    const rawValue = e.target.value;

   
    if (rawValue.length > 5) return;

    const value = parseInt(rawValue) || 0;

    if (value < 1) {
      setErrors({ ...errors, quantity: "Quantity must be at least 1" });
    } else {
      setErrors({ ...errors, quantity: "" });
    }

    setQuantity(rawValue); 
  }}
  max="99999"
  min="1"
  inputMode="numeric" 
  pattern="\d{1,5}" 
  className={`w-full p-2 border rounded ${
    errors.quantity ? "border-red-500" : "border-gray-300"
  }`}
/>


            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {(!deviceType?.name.toLowerCase().includes("laptop") || category) && (
            <div>
              <label
                htmlFor="specification"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Specification{" "}
                {(!deviceType?.name.toLowerCase().includes("laptop") ||
                  category === "Custom") && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <textarea
  id="specification"
  rows={3}
  value={specification}
  maxLength={200}
  onChange={handleSpecificationChange}
  readOnly={!isSpecificationEditable}
  className={`w-full p-2 border rounded resize-none ${
    errors.specification
      ? "border-red-500"
      : specification.length >= 20 &&
        specification.length <= 200 &&
        specification.length > 0
      ? "border-green-500"
      : "border-gray-300"
  } ${!isSpecificationEditable ? "bg-gray-100" : ""}`}
  placeholder={
    isSpecificationEditable
      ? "Enter specifications or details (20-200 characters)..."
      : ""
  }
/>


              <div className="flex justify-between mt-1">
                <p
                  className={`text-sm ${
                    specification.length < 20 && specification.length > 0
                      ? "text-red-500"
                      : specification.length > 200
                      ? "text-red-500"
                      : specification.length >= 20 &&
                        specification.length <= 200
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {specification.length}/200 characters
                </p>
                {errors.specification && (
                  <p className="text-red-500 text-sm">{errors.specification}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#77B634] text-white rounded-md hover:bg-[#68A32E]"
            >
              Save Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditRequestItemModal;
