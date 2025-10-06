import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Spinner from './Spinner';
import fileApi from '../utils/fileUploadInterceptor';
import config from '../configs/app.config';
import {  } from 'react-toastify';

const UploadCSV = ({ onClose, onAddUser }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [message, setMessage] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      setMessage('Please upload a valid CSV file.');
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.trim().split('\n').map((row) => row.split(','));

      const validEntries = [];
      const invalidEntries = [];
  
      rows.slice(1).forEach((row, index) => {
        const firstName = row[0]?.trim();
        const lastName = row[1]?.trim();
        const email = row[2]?.trim();
  
        // Extract domain from email
        const emailParts = email.split('@');
        const domain = emailParts.length === 2 ? emailParts[1] : '';
  
        if (
          isValidName(firstName) &&
          isValidName(lastName) &&
          emailRegex.test(email) &&
          config.acceptable_domains.includes(domain)
        ) {
          validEntries.push({ firstName, lastName, email });
        } else {
          invalidEntries.push({ row, index: index + 1 });
        }
      });
  
      // Check if valid entries exceed the limit
      if (validEntries.length > 500) {
        setMessage('Maximum upload limit exceeded (500 entries allowed).');
        setPreview([]);
        setInvalidRows([]);
        toast.error('Maximum upload limit exceeded (500 entries allowed).');
        return;
      }
  
      setPreview(validEntries); 
      setInvalidRows(invalidEntries);
    };

    reader.readAsText(file);
  };

  const createCSV = (users) => {
    const header = 'First Name,Last Name,Email\n';
    const csvContent = users
      .map((user) => `${user.firstName},${user.lastName},${user.email}`)
      .join('\n'); // Join rows with newlines
    return new Blob([header + csvContent], { type: 'text/csv' });
  };

  const isValidName = (name) => {
    return name && name.trim().length >= 2;
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      toast.warning('No valid data to upload!');
      return;
    }

    setLoading(true);

    const validCSV = createCSV(preview);
    const validFile = new File([validCSV], 'valid_users.csv', { type: 'text/csv' });

    const formData = new FormData();
    formData.append('file', validFile);

    try {
      const response = await fileApi.post('doc/uploadCSV', formData);
      setLoading(false);
      toast.success('Operation successful!');
      setMessage(response.data.message || 'Operation successful!');
      // Add each user to the parent component's state
      preview.forEach((user) => onAddUser(user));

      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      setLoading(false);
      toast.error('Error uploading file!');
      setMessage(error.response?.data?.message || 'Error uploading file!');
    }
  };

  const handleDownload = () => {
    const csvContent = `First Name,Last Name,Email\nJohn,Doe,john.doe@example.com\nJane,Smith,jane.smith@example.com\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 rounded-lg">
      <h2 className="text-xl text-center font-bold text-gray-700 mb-4">Upload Users via CSV</h2>
      <div className="alert alert-info mb-4">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 34C22.9 34 22 33.1 22 32V24C22 22.9 22.9 22 24 22C25.1 22 26 22.9 26 24V32C26 33.1 25.1 34 24 34ZM26 18H22V14H26V18Z"
            fill="#0085FF"
          />
        </svg>
        <div className="flex flex-col">
          <span>Tips</span>
          <ul>
            <li className="text-gray-500"> - This service should ONLY be used when uploading users in bulk.</li>
            <li className="text-gray-500"> - Only CSV files with extension .csv are accepted.</li>
            <li className="text-gray-500"> - Employees already added will be <strong>skipped</strong> to avoid duplicates.</li>
            <li>
              <button onClick={handleDownload} className="text-blue-500 underline">
                Click to download a sample CSV
              </button>
            </li>
          </ul>
        </div>
      </div>
      <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-100 border border-dashed border-gray-400 rounded-lg cursor-pointer">
        <span className="text-gray-600">Click to Upload</span>
        <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      </label>

      {(preview.length > 0 || invalidRows.length > 0) && (
        <>
          <h3 className="mt-4 text-gray-700">Upload Summary</h3>
          <div className="alert">
            <div className="flex flex-row gap-4">
              <span>Valid Entries:</span>
              <span className="text-content2">{preview.length}</span>
            </div>
            <div className="flex flex-row gap-4">
              <span>Invalid Entries:</span>
              <span className="text-content2">{invalidRows.length}</span>
            </div>
          </div>
        </>
      )}

      <button
        onClick={handleUpload}
        className={`inline-flex w-full justify-center rounded-md border border-transparent mt-5 px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm ${preview < 1
          ? 'bg-[#A8D08D] cursor-not-allowed'
          : 'bg-[#77B634] hover:bg-[#66992B]'
          }`}
      >
        {loading ? <Spinner /> : 'Upload'}
      </button>
    </div>
  );
};

export default UploadCSV;
