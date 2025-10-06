import React, { useState} from "react";
import api from "../utils/apiInterceptor";
import { toast } from "react-toastify";



const DeviceRegistrationForm = ({ onSuccess, specs = [], manufacturers = [], deviceTypes = [], deviceStatusList = [], deviceConditionList = [] }) => {


    const [formData, setFormData] = useState({
        serialNumber: "",
        deviceTypeId: 0,
        manufacturerId: 0,
        deviceConditionId: 0,
        deviceStatusId: 0,
        deviceSpecifications: 0,
        specifications: {},
    });


    const [loading, setLoading] = useState(false);
    const [filteredSpecs, setFilteredSpecs] = useState(specs)


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });



        if (name === "deviceTypeId") {
            const dType = String(formData.deviceTypeId).trim()
            const filtered = specs.filter((spec) => spec.category === dType);
            setFilteredSpecs(filtered);
        }
    };



    const handleSpecChange = (e, field) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [name]: type === "checkbox" ? checked : value,
            },
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            serialNumber: formData.serialNumber.trim(),
            deviceTypeId: parseInt(formData.deviceType.trim()),
            manufacturerId: parseInt(formData.manufacturer.trim()),
            deviceConditionId: parseInt(formData.deviceConditionId),
            deviceStatusId: parseInt(formData.deviceStatusId),
            deviceSpecifications: 1,
            specifications: formData.specifications,
        };


        try {
            await api.post("/api/devices/new", payload);
            toast.success("Device registered successfully!");
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to register device");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-md w-full">
            <h2 className="text-xl font-medium mt-0 mb-2 text-black">Add a new device</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Device Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="deviceType"
                        value={formData.deviceType}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 bg-transparent text-black rounded-md focus:ring-2 focus:ring-green-500"
                    >
                        <option value=""></option>
                        {deviceTypes.map((brand) => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Serial Number<span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 text-black bg-transparent rounded-md focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Manufacturer<span className="text-red-500">*</span>
                    </label>
                    <select
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 bg-transparent text-black rounded-md focus:ring-2 focus:ring-green-500"
                    >
                        <option value=""></option>
                        {manufacturers.map((brand) => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Device Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="deviceConditionId"
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 bg-transparent text-black rounded-md focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Select Condition</option>
                        {deviceConditionList.map((device) => (
                            <option value={device.id}>{device.name}</option>
                        )
                        )}
                    </select>
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Device Status <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="deviceStatusId"
                        value={formData.deviceStatusId}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 bg-transparent text-black rounded-md focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Select Status</option>
                        {deviceStatusList.map((device) => (
                            <option value={device.id}>{device.name}</option>
                        )
                        )}
                    </select>
                </div>



                {filteredSpecs.map((field) => (
                    <div key={field.specification_id} className="mb-3">
                        <label className="block font-medium">{field.name}</label>
                        {field.fieldType === "input" && (
                            <input type="text" name={field.name} onChange={(e) => handleSpecChange(e, field)} className="w-full p-2 border rounded-md" />
                        )}
                        {field.type === "select" && (
                            <select name={field.name} onChange={(e) => handleSpecChange(e, field)} className="w-full p-2 border rounded-md">
                                {field.options.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        )}
                        {field.type === "checkbox" && (
                            <input type="checkbox" name={field.name} onChange={(e) => handleSpecChange(e, field)} className="mr-2" />
                        )}
                    </div>
                ))}

                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-md transition duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-300"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DeviceRegistrationForm;
