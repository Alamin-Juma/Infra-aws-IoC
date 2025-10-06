import React, { useEffect, useState } from 'react';

export const DeviceTypeModal = ({ isOpen, closeModal, formData, setFormData, handleSubmit, data }) => {
  if (!isOpen) return null;

  const specifications = formData.specifications || [];

  const [myFormData, setMyFormData] = useState({
    name: ''
  })

  useEffect(() => {
    setFormData({
      name: data.name
    });
  }, [])

  const handleSpecChange = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications
        ? prev.specifications.includes(spec)
          ? prev.specifications.filter((s) => s !== spec)
          : [...prev.specifications, spec]
        : [spec], 
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-black">{formData.id ? "Edit" : "Add"} Device Type</h2>

        <div className="mb-6">
          <label className="font-medium block mb-2 text-black">Device Type</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-black">Select the Device Specifications</h3>
          <div className="grid grid-cols-3 gap-4 text-black">
            {["deviceModel", "screenSize", "processType", "storageType", "storageMemory", "ram", "os", "deviceLink", "manufacturer"].map((spec) => (
              <div key={spec} className="flex items-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 mr-2"
                  checked={Array.isArray(formData.specifications) && formData.specifications.includes(spec)}
                  onChange={() => handleSpecChange(spec)}
                />
                <label>{spec.replace(/([A-Z])/g, " $1").trim()}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={closeModal} className="bg-gray-400 text-white p-2 rounded-md">Cancel</button>
          <button onClick={handleSubmit} className="bg-green-500 text-white p-2 rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
};

export default DeviceTypeModal;
