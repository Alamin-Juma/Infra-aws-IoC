import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import api from "../../utils/apiInterceptor";
import {  toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import Permission from '../../components/Permission';
import { PERMISSION_CREATE_VENDOR, PERMISSION_MANAGE_VENDOR } from '../../constants/permissions.constants';

const VendorDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode = 'add', vendor = null } = location.state || {};

  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', phone: '', email: '', physicalAddress: '',
    deviceTypeSupplied: [], status: 'ACTIVE',
  });
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  useEffect(() => {
    const fetchDeviceTypes = async () => {
      try {
        const response = await api.get("/deviceTypes", {
          params: { page: 1, limit: 100 },
        });
        setDeviceTypes(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching device types:", error);
      }
    };
    fetchDeviceTypes();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && vendor) {
      setForm({ ...vendor });
    }
  }, [vendor, mode]);

  const validateField = (name, value) => {
    let message = '';
    const phoneRegex = /^\+?\d+$/; 

    if (name === 'name' && !value.trim()) {
      message = 'Vendor name is required.';
    }

    if (name === 'email') {
      if (!value.trim()) message = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Invalid email format.';
    }

    if (name === 'phone') {
      if (value && !phoneRegex.test(value)) {
        message = 'Enter a valid phone number (optional + at start, digits only)';
      }
    }

    if (name === 'physicalAddress' && !value.trim()) {
      message = 'Physical address is required.';
    }

    return message;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

  
    if (name === 'name') {
      updatedValue = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    setForm((prev) => ({ ...prev, [name]: updatedValue }));

   
    const errorMessage = validateField(name, updatedValue);
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const handleSubmit = async () => {
    const fieldsToValidate = ['name', 'email', 'phone', 'physicalAddress'];
    let newErrors = {};
    setLoading(true);
  
   
    fieldsToValidate.forEach(field => {
      const errorMessage = validateField(field, form[field]);
      if (errorMessage) newErrors[field] = errorMessage;
    });
  
    if (!form.deviceTypeSupplied.length) {
      newErrors.deviceTypeSupplied = 'Please select at least one device type.';
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }
  
    try {
      const requestData = { ...form };
      let res;
  
      if (mode === 'edit') {
        res = await api.put(`/api/vendors/update/${vendor.id}`, requestData);
        toast.success('Vendor updated successfully!', {
          onClose: () => navigate('/app/vendors/vendor-registry'),
        });
      } else {
        res = await api.post('/api/vendors/create', requestData);
        toast.success('Vendor created successfully!', {
          onClose: () => navigate('/app/vendors/vendor-registry'),
        });
      }
  
      setSubmitted(true);
    } catch (error) {
      const responseErrors = error.response?.data?.errors || {};
      const newBackendErrors = {};
  
      
      Object.entries(responseErrors).forEach(([field, message]) => {
        newBackendErrors[field] = message;
        toast.error(message);
      });
  
      if (!Object.keys(newBackendErrors).length) {
        toast.error('Vendor submission failed. Please try again.');
      }
  
      setErrors(newBackendErrors);
    } finally {
      setLoading(false);
    }
  };


  const isDisabled = () => {
    return (   
      !form.name.trim() ||
      !form.email.trim() ||
      !form.physicalAddress.trim() ||
      !form.deviceTypeSupplied.length
    );
  };
  
  

  return (
    <MainLayout>
      <div className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back</span>
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6">
          {mode === 'edit' ? 'Edit Vendor' : 'Add Vendor'}
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                className={`input input-bordered w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Vendor Name"
                type="text"
                maxLength={100}
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
              <input
                name="phone"
                className={`input input-bordered w-full ${errors.phone ? 'border-red-500' : form.phone ? 'border-green-500' : ''}`}
                placeholder="Phone"
                value={form.phone}
                maxLength={15}
                onChange={(e) => {
                  const input = e.target.value;
                  const formatted = input.startsWith('+')
                    ? '+' + input.slice(1).replace(/\D/g, '')
                    : input.replace(/\D/g, '');
                  handleChange({ target: { name: 'phone', value: formatted } });
                }}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                className={`input input-bordered w-full ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Physical Address <span className="text-red-500">*</span>
              </label>
              <input
                name="physicalAddress"
                className={`input input-bordered w-full ${errors.physicalAddress ? 'border-red-500' : ''}`}
                placeholder="Address"
                value={form.physicalAddress}
                onChange={handleChange}
                maxLength={100}
              />
              {errors.physicalAddress && <p className="text-red-500 text-sm mt-1">{errors.physicalAddress}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Device Type Supplied <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {form.deviceTypeSupplied.map((typeId) => {
                  const type = deviceTypes.find((t) => t.id === typeId);
                  return (
                    <span key={typeId} className="badge badge-default flex items-center gap-2 capitalize">
                      {type?.name}
                      <button
                        type="button"
                        className="btn btn-xs btn-success"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            deviceTypeSupplied: prev.deviceTypeSupplied.filter((id) => id !== typeId),
                          }))
                        }
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>

              <select
                name="deviceTypeSupplied"
                className="select select-bordered w-full mt-2 capitalize"
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!form.deviceTypeSupplied.includes(value) && !isNaN(value)) {
                    setForm((prev) => ({
                      ...prev,
                      deviceTypeSupplied: [...prev.deviceTypeSupplied, value],
                      
                    }));
                    setErrors((prev) => ({ ...prev, deviceTypeSupplied: '' }));
                  }
                }}
              >
                <option>Select device type</option>
                {deviceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                  </option>
                ))}
              </select>
              {errors.deviceTypeSupplied && <p className="text-red-500 text-sm mt-1">{errors.deviceTypeSupplied}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mr-12 mt-6">
            <Permission
              allowedPermission={[PERMISSION_CREATE_VENDOR, PERMISSION_MANAGE_VENDOR]}
            >
              {loading ? (
                <button className="btn loading text-white bg-[#77B634]">Submitting...</button>
              ) : !submitted ? (
                <button
                  className="btn text-white bg-[#77B634]"
                  onClick={handleSubmit}
                  disabled={
                    loading  ||
                    isDisabled()
                  }
                >
                  {mode === 'edit' ? 'Update' : 'Submit'}
                </button>
              ) : null}
            </Permission>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VendorDetailsPage;
