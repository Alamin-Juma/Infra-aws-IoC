import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/apiInterceptor';
import { toast } from 'react-toastify';
import MainLayout from '../../layouts/MainLayout';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from 'react-icons/fa';

export default function EditVendorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    physicalAddress: '',
    deviceTypeSupplied: [],
    contractStartDate: '',
    contractEndDate: '',
    
  });

  const [errors, setErrors] = useState({});
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [updateClicked, setUpdateClicked] = useState(false); 
    const [submitted, setSubmitted] = useState(false);
  
    useEffect(() => {
      const fetchVendor = async () => {
        try {
          const res = await api.get(`/api/vendors/${id}`);
          const data = res.data;
    
          
          const {
            status,          
            vendorDevices,    
            ...cleanedData    
          } = data;
    
          cleanedData.contractStartDate = cleanedData.contractStartDate?.slice(0, 10) || '';
          cleanedData.contractEndDate = cleanedData.contractEndDate?.slice(0, 10) || '';
          cleanedData.deviceTypeSupplied = vendorDevices?.map((device) => device.deviceType) || [];
    
          setForm(cleanedData);
        } catch (error) {
          toast.error('Failed to fetch vendor data');
        }
      };
    
      const fetchDeviceTypes = async () => {
        try {
          const res = await api.get('/deviceTypes');
          setDeviceTypes(res.data.data || []);
        } catch (error) {
          toast.error('Failed to fetch device types');
        }
      };
    
      fetchVendor();
      fetchDeviceTypes();
    }, [id]);
    

  const validateField = (fieldName, value, fullForm = form) => {
    let message = '';

    switch (fieldName) {
      case 'name':
        if (!value) message = 'Name is required';
        break;
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Valid email is required';
        break;
      case 'phone':
        if (!value || !/^\+\d+$/.test(value)) message = 'Enter a valid phone number';
        break;
      case 'physicalAddress':
        if (!value) message = 'Address is required';
        break;
      case 'contractStartDate':
        if (!value) message = 'Start date is required';
        break;
      case 'contractEndDate':
        if (!value) {
          message = 'End date is required';
        } else if (new Date(value) < new Date(fullForm.contractStartDate)) {
          message = 'End date cannot be before start date';
        }
        break;
      case 'deviceTypeSupplied':
        if (!Array.isArray(value) || !value.length) {
          message = 'At least one device type is required';
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    validateField(name, value, updatedForm);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true); 
    setUpdateClicked(true); 

    try {
      const response = await api.put(`/api/vendors/update/${id}`, form);
      if (response.status === 200) {
        toast.success(response.data.message || 'Vendor updated successfully', {
          onClose: () => navigate('/app/vendors/vendor-registry'),
        });
      } else {
        toast.error('Failed to update vendor');
      }
    } catch (error) {
      toast.error('Cannot submit without required fields');
    }

    setLoading(false); 
  };

  const validate = () => {
    const err = {};
    const phoneRegex = /^\+\d+$/;
    if (!form.name) err.name = 'Name is required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Valid email is required';
    if (!form.phone || !phoneRegex.test(form.phone)) {
      err.phone = 'Enter a valid phone number';
    }
    if (!form.physicalAddress) err.physicalAddress = 'Address is required';
    if (!Array.isArray(form.deviceTypeSupplied) || !form.deviceTypeSupplied.length) {
      err.deviceTypeSupplied = 'At least one device type is required';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
    setSubmitted(true);

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
      <div className="min-h-screen p-5 max-w-6xl mx-auto">
        <div className="mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Vendor</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

           
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Vendor Name</label>
              <input
                name="name"
                className={`input input-bordered w-full ${errors.name ? 'border-red-500' : form.name ? 'border-green-500' : ''}`}
                placeholder="Vendor Name"
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
                className={`input input-bordered w-full ${
                  errors.phone ? 'border-red-500' : form.phone ? 'border-green-500' : ''
                }`}
                placeholder="Phone"
                value={form.phone}
                maxLength={15}
                onChange={(e) => {
                  let input = e.target.value;

                  if (input.startsWith('+')) {
                    input = '+' + input.slice(1).replace(/\D/g, '');
                  } else {
                    input = input.replace(/\D/g, '');
                  }

                  handleChange({ target: { name: 'phone', value: input } });
                }}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

           
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input
                name="email"
                className={`input input-bordered w-full ${errors.email ? 'border-red-500' : form.email ? 'border-green-500' : ''}`}
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

           
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Physical Address</label>
              <input
                name="physicalAddress"
                className={`input input-bordered w-full ${errors.physicalAddress ? 'border-red-500' : form.physicalAddress ? 'border-green-500' : ''}`}
                placeholder="Address"
                value={form.physicalAddress}
                onChange={handleChange}
              />
              {errors.physicalAddress && <p className="text-red-500 text-sm mt-1">{errors.physicalAddress}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Device Type Supplied</label>
              <div className="flex flex-wrap gap-2">
                {form.deviceTypeSupplied.map((typeId) => {
                  const id = typeof typeId === 'object' ? typeId.id : typeId;
                  const type = deviceTypes.find((t) => t.id === id);
                  return (
                    <span key={id} className="badge badge-outline flex items-center gap-2 capitalize">
                      {type?.name || 'Unknown'}
                      <button
                        type="button"
                        className="btn btn-xs btn-success"
                        onClick={() =>
                          setForm({
                            ...form,
                            deviceTypeSupplied: form.deviceTypeSupplied.filter((d) => {
                              const dId = typeof d === 'object' ? d.id : d;
                              return dId !== id;
                            }),
                          })
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
                  if (!form.deviceTypeSupplied.some((d) => (typeof d === 'object' ? d.id : d) === value) && value && !isNaN(value)) {
                    setForm({
                      ...form,
                      deviceTypeSupplied: [...form.deviceTypeSupplied, value],
                    });
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
              {errors.deviceTypeSupplied && (
                <p className="text-red-500 text-sm mt-1">{errors.deviceTypeSupplied}</p>
              )}
            </div>

       
          </div>

        
          <div className="flex justify-end gap-4 mt-6">
            <button className="btn" onClick={() => navigate('/app/vendors/vendor-registry')}>
              Cancel
            </button>
            {!submitted && (
        <button
          className="btn text-white bg-[#77B634]"
          onClick={handleSubmit}
          disabled={loading || updateClicked || isDisabled()} 
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
