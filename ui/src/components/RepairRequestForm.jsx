import React, { useEffect, useState, useCallback, useMemo } from "react";
import AsyncSelect from 'react-select/async';
import api from "../utils/apiInterceptor";
import { toast } from "react-toastify";
import debounce from 'lodash.debounce';
import { FaPlus, FaUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FcComments } from "react-icons/fc";
import { RiComputerLine } from "react-icons/ri";
import { CgDanger } from "react-icons/cg";
import { REPAIR_REQUEST_SEVERITY_OPTIONS } from "../constants/status.constants";


const RepairRequestForm = ({ onCancel, onSuccess }) => {

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        description: "",
        severity: "",
        affectedDevices: [],
        assignedTo: "",
        location: "",
        deviceType: ""
    });


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "deviceType" && { affectedDevices: [] })
        }));

        if (name === "deviceType") {
            setSelectedDevices([]);
        }

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.deviceType) {
            newErrors.deviceType = "Please select device type";
        }

        if (!formData.severity.trim()) {
            newErrors.severity = "Please select level of severity";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description cannot be empty";
        }

        if (formData.description.length < 10) {
            newErrors.description = "Description must be at least 10 characters";
        }

        if (formData.affectedDevices.length == 0) {
            newErrors.affectedDevices = "Please add at least one device to this request";
        }
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setLoading(true);

            const payload = {
                deviceType: parseInt(formData.deviceType),
                description: formData.description,
                severity: formData.severity,
                affectedDevices: formData.affectedDevices
            }

            if (formData.assignedTo) {
                payload.assignedTo = parseInt(formData.assignedTo);
            }

            if (formData.location) {
                payload.location = formData.location;
            }

            try {
                const result = await api.post("/api/repair-requests", payload);
                const success = result?.data?.success;

                if (success) {
                    toast.success('New repair request created.');
                    clearForm();
                    if(onSuccess) onSuccess();
                } else {
                    toast.error("Failed to create request. Please try again later.");
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to create request. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
    }

    const handleCancel = () => {
        clearForm();
        if (onCancel) onCancel();
    }

    const clearForm = () => {
        setFormData({
            description: "",
            severity: "",
            affectedDevices: [],
            assignedTo: "",
            location: "",
            deviceType: ""
        });
    }

    const loadOptions = async (inputValue) => {
        if (!inputValue || inputValue.length < 2) return [];

        let URL = `/api/devices/all?keyword=${encodeURIComponent(inputValue)}`;
        if (formData.deviceType) {
            const selectedDeviceType = deviceTypes.find(dtype => parseInt(dtype.id) === parseInt(formData.deviceType));
            const deviceTypeName = selectedDeviceType?.name || '';
            URL += `&deviceType=${deviceTypeName}`;
        }

        try {
            const response = await api.get(URL);
            const data = await response.data;

            return data?.devices.map((device) => ({
                label: `${device.serialNumber}`,
                value: device.id
            }));
        } catch (error) {
            return [];
        }
    };

    const useDebouncedLoadOptions = (loadOptions, wait, deps = []) => {
        const debounced = useMemo(() => {
            const fn = debounce((inputValue, callback) => {
                loadOptions(inputValue).then(callback);
            }, wait);

            return fn;
        }, deps);

        useEffect(() => {
            return () => {
                debounced.cancel();
            };
        }, [debounced]);

        return debounced;
    };

    const debouncedLoadOptions = useDebouncedLoadOptions(loadOptions, 300, [formData.deviceType]);

    const fetchUsers = async () => {
        try {
            const data = await api.get(`/users/api/filter`, {
                params: {
                    page: 1,
                    limit: 100,
                },
            });
            setUsers(data.data.users || []);
        } catch (error) {
            throw new Error("Error getting users: ", error);
        }
    };

    const fetchComponentData = async () => {
        try {
            const response = await api.get(`/deviceTypes`, {
                params: {
                    page: 1,
                    limit: 100,
                },
            });
            setDeviceTypes(response.data.data);
        } catch (error) {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchComponentData();
    }, []);

    return (
        <div className="flex flex-col w-full p-4 mx-auto bg-white rounded-md">
            <div>
                <div className="mb-5 border-b border-gray-300">
                    <div className="flex items-center gap-2">
                        <FaPlus className="text-[#8BC34A] " />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Create New Repair Request
                        </h1>
                    </div>
                    <p className="text-gray-600 mt-1 mb-3">Fill out the form below to create a new repair request</p>
                </div>

                <form action="" onSubmit={handleSubmit}>
                    <div className="flex gap-x-5 mb-5">
                        <div className="w-1/2">
                            <label className="block flex gap-1 items-center text-gray-700 text-md font-bold mb-1"><RiComputerLine className="text-[#8BC34A]" /> Device Type<span className="text-red-500">*</span></label>
                            <p className="text-gray-400 mb-3">Select the device type</p>
                            {
                                <select
                                    name="deviceType"
                                    onChange={handleChange}
                                    value={formData.deviceType}
                                    className="max-w-full select select-solid p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose</option>
                                    {deviceTypes.map((brand) => (
                                        <option key={brand.id} value={brand.id}>{`${brand.name.charAt(0).toUpperCase()}${brand.name.slice(1).toLowerCase()}`}</option>
                                    ))}
                                </select>
                            }
                            {errors.deviceType && <p className="text-red-500 text-sm mt-1">{errors.deviceType}</p>}
                        </div>
                        <div className="w-1/2">
                            <label className="block flex items-center text-gray-700 text-md gap-x-1 font-bold mb-1">
                                <CgDanger className="text-[#8BC34A]" /> Severity Level <span className="text-red-500">*</span></label>
                            <p className="text-gray-400 mb-3">How urgent is this repair request?</p>
                            {
                                <select
                                    name="severity"
                                    onChange={handleChange}
                                    value={formData.severity}
                                    className="max-w-full select select-solid p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Choose</option>
                                    {Object.entries(REPAIR_REQUEST_SEVERITY_OPTIONS).map(([key, item]) => (
                                        <option key={key} value={item}>{item}</option>
                                    ))}
                                </select>
                            }
                            {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity}</p>}
                        </div>
                    </div>

                    <div className="flex gap-x-5 mb-5 mt-2">
                        <div className="w-1/2">
                            <label className="block flex items-center text-gray-700 font-bold mb-2 gap-1"> <FaUser className="text-[#8BC34A]" />Assigned To</label>
                            {
                                <select
                                    name="assignedTo"
                                    onChange={handleChange}
                                    value={formData.assignedTo}
                                    className="max-w-full select select-solid p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                >
                                    <option value="">Assign technician</option>
                                    {users.map((user) => (
                                        user.status && <option key={user.id} value={user.id}>{user.firstName}</option>
                                    ))}
                                </select>
                            }
                        </div>
                        <div className="w-1/2">

                            <label className="block flex items-center text-gray-700 font-bold mb-2"><FaLocationDot className="text-[#8BC34A]" />  Location</label>
                            <input
                                type="text"
                                name="location"
                                onChange={handleChange}
                                value={formData.location}
                                placeholder="Enter Location"
                                className="w-full p-2 border border-gray-300 text-black bg-transparent rounded-md focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {formData.deviceType && (
                        <div className="">
                            <label className="block flex gap-1 items-center text-gray-700 font-bold mb-1">
                                <RiComputerLine className="text-[#8BC34A]" /> Affected Devices <span className="text-red-500">*</span>
                            </label>
                            <p className="text-gray-400 mb-5">Search for device by serial numbers</p>
                            <div>
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    isMulti
                                    loadOptions={(input, callback) => debouncedLoadOptions(input, callback)}
                                    onChange={(selected) => {
                                        const selectedValues = selected || [];
                                        setSelectedDevices(selectedValues);

                                        setFormData((prev) => ({
                                            ...prev,
                                            affectedDevices: selectedValues.map((s) => s.value),
                                        }));
                                    }}
                                    value={selectedDevices}
                                    placeholder="Search and select devices..."
                                />
                            </div>
                            {errors.affectedDevices && <p className="text-red-500 text-sm mt-1">{errors.affectedDevices}</p>}
                        </div>
                    )}

                    <div className="flex flex-col my-5">
                        <label className="block text-gray-700 font-bold mb-1">Description <span className="text-red-500">*</span></label>
                        <p className="text-gray-400 mb-5 flex gap-2 items-center"><FcComments className="text-[#8BC34A]" /> Any additional notes or special instructions for this repair</p>

                        <textarea
                            value={formData.description}
                            onChange={handleChange}
                            name="description"
                            className="w-full p-3 border rounded resize-none border-gray-300 "
                            placeholder="Describe this issue in detail, any special requirements, or additional context that would help the technician"
                            row={5}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 justify-end gap-x-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-400 hover:text-gray-500 border border-gray-300  bg-white py-2 px-4 rounded-md transition duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-[#8BC34A] hover:bg-[#7CB342] text-white py-2 px-4 rounded-md transition duration-300"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default RepairRequestForm;