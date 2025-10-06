import React, { useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { useAuth } from "../context/AuthContext";
import DatePicker from 'react-datepicker';
import { FaRegCalendarAlt } from 'react-icons/fa';
import api from '../utils/apiInterceptor';
import { toast } from 'react-toastify';
import Permission from './Permission';
import { PERMISSION_MANAGE_VENDOR_CONTRACTS } from '../constants/permissions.constants';
 

const ContractUpload = ({ vendorId, onUploadSuccess }) => {
  
  const { user } = useAuth();
  const today = new Date().toISOString();

  const [form, setForm] = useState({
    file: null,
    startDate: '',
    endDate: '',
    uploadedBy: user?.id
  });
  

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileError, setFileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const PdfDownloadButton = ({ fileUrl, fileName = 'document.pdf' }) => {
  
    const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');
  
    if (!isPdf) return null;
  };

  const isFormValid = form.file && form.startDate && form.endDate && !fileError;

  const handleChange = (e) => {
  
    const { name, value, files } = e.target;

    if (name === 'file') {
      const file = files[0];

      if (!file) {
        setFileError('Please select a file.'); 
       }

      if (file && file.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed.');
        setForm((prev) => ({ ...prev, file: null }));
        if (fileInputRef.current) fileInputRef.current.value = null;
        return;
      } else {
        setFileError('');
        setForm((prev) => ({ ...prev, file }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async () => {
    
    setIsLoading(true);
    setMessage('');
    setErrorMessage('');
  
    if (!form.file) {
      setFileError('Please select a valid PDF file.');
      setIsLoading(false);
      return;
    }
  
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setErrorMessage('End date cannot be before start date.');
      setIsLoading(false);
      return;
    }
    
  
    const formData = new FormData();
    formData.append('contract', form.file);
    formData.append('startDate', form.startDate);
    formData.append('endDate', form.endDate);
    formData.append('uploadedBy', form.uploadedBy);
  
    try {
      const res = await api.post(
        `api/vendors/${vendorId}/contracts/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (res.status === 201) {
        setMessage( 'Contract uploaded successfully!');
       toast.success('Contract uploaded successfully!');
      }
  
      setForm({ file: null, startDate: '', endDate: '', uploadedBy: '' });
      if (fileInputRef.current) fileInputRef.current.value = null;
       if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error uploading contract.');
      
      toast.error(err.response?.data?.message || 'Error uploading contract.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
<div className="max-w-6xl mx-auto mt-10 p-8 bg-white shadow-md rounded-lg -ml-1">
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            PDF File
          </label>
          <input
            type="file"
            name="file"
            ref={fileInputRef}
            accept="application/pdf"
            onChange={handleChange}
            className="w-full"
          />
          {fileError && <p className="text-red-600 text-sm mt-1">{fileError}</p>}
        </div>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
        <div className="relative">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={form.startDate ? new Date(form.startDate) : null}
            onChange={(date) => handleChange({ target: { name: 'startDate', value: date ? date.toISOString() : '' } })}
            dateFormat="MM/dd/yyyy"
            className="w-full px-4 py-2 pr-10 pl-10 border border-gray-300 rounded-md shadow-sm "
            placeholderText="mm/dd/yyyy"
          />
          <FaRegCalendarAlt className="absolute left-3 top-11 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={form.endDate ? new Date(form.endDate) : null}
            onChange={(date) => handleChange({ target: { name: 'endDate', value: date ? date.toISOString() : '' } })}
            minDate={form.startDate ? new Date(form.startDate) : null}
            dateFormat="MM/dd/yyyy"
            className="w-full px-4 py-2 pr-10 pl-10 border pl-10 border-gray-300 rounded-md shadow-sm "
            placeholderText="mm/dd/yyyy"
          />
          <FaRegCalendarAlt className="absolute left-3 top-11 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
  
      <div className="text-right text-white">
      <Permission
        allowedPermission={[PERMISSION_MANAGE_VENDOR_CONTRACTS]}
      >
        <button
          onClick={handleSubmit}
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`btn bg-[#77B634] text-white ${isLoading || !isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Uploading...' : 'Upload Contract'}
        </button>
      </Permission>
      </div>
    </form>

    {errorMessage && (
      <div className="mt-6 text-center text-red-600 text-sm">
        {errorMessage}
      </div>
    )}
  
    {message && (
      <div className="mt-6 text-center text-green-600 text-sm">
        {message}
      </div>
    )}
  </div>

  
  
  );
};

export default ContractUpload;
