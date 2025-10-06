import React, { useState, useEffect } from 'react';
import api from '../utils/apiInterceptor';
import { FiDownload } from 'react-icons/fi';
import { formatDate } from '../utils/formatDate';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import Lottie from 'lottie-react'; // <-- Added
import animationData from '../assets/lottie/no-data.json';
import Pagination from './Pagination';
import { PERMISSION_MANAGE_VENDOR_CONTRACTS } from '../constants/permissions.constants';
import Permission from './Permission';

const ContractList = ({ vendorId, listVersion, showUploadModal }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/vendors/${vendorId}/contracts`);
        setContracts(res.data);
      } catch (err) {
        console.error('Error fetching contracts:', err);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [vendorId, listVersion, showUploadModal]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#77B634",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`/api/vendors/${vendorId}/contracts/archive/${id}`, { ids: [id] })
          .then((res) => {
            toast.success(res.data.message || "Contracts archived successfully!");
            fetchContracts(); // Corrected function call
          })
          .catch((error) => {
            console.error("Error archiving contracts:", error);
            toast.error(
              error.response?.data?.message ||
              "Failed to archive contracts. Please try again."
            );
          });
      }
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleDownload = async (contractId, fileName) => {
    try {
      const response = await api.get(`/api/vendors/${vendorId}/contracts/download/${contractId}`, {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'contract.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const formatDateWithTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <p className="text-center">Loading contracts...</p>;

  return (
    <div className="bg-white">
    <ToastContainer position="top-right" />
    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Uploaded Contracts</h3>
  
    <table className="table-zebra table border-collapse border border-gray-200 w-full">
      <thead>
        <tr className="bg-gray-100 text-gray-700 text-sm">
          <th className="px-6 py-3 text-left border-b border-gray-200">File Name</th>
          <th className="px-6 py-3 text-left border-b border-gray-200">Start Date</th>
          <th className="px-6 py-3 text-left border-b border-gray-200">Expiration Date</th>
          <th className="px-6 py-3 text-left border-b border-gray-200">Uploaded By</th>
          <th className="px-6 py-3 text-center border-b border-gray-200">Actions</th>
        </tr>
      </thead>
      <tbody>
        {contracts.length > 0 ? (
          contracts.map((contract) => (
            <tr
              key={contract.id}
              className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition duration-200 ease-in-out"
            >
              <td className="px-6 py-4 text-sm text-gray-800">
                {contract.fileName || contract.originalName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{formatDate(contract.startDate)}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{formatDate(contract.endDate)}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {contract?.contractUploadedBy?.firstName + " " + contract?.contractUploadedBy?.lastName}
              </td>
              <td className="px-6 py-4 text-sm text-center space-x-3">
                <Permission
                  allowedPermission={[PERMISSION_MANAGE_VENDOR_CONTRACTS]}
                >
                  <button
                    onClick={() => handleDownload(contract.id, contract.fileName || contract.originalName)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition duration-200 ease-in-out"
                    title="Download PDF"
                  >
                    <FiDownload size={18} />
                  </button>
                </Permission>  
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">
              <div className="flex flex-col items-center justify-center py-8">
                <Lottie animationData={animationData} loop={true} className="h-40" />
                <p className="text-gray-600 text-lg mt-4">No contracts uploaded yet.</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
     {/* Pagination */}
     <Pagination
      total={total}
      limit={limit}
      page={page}
      handlePageChange={handlePageChange}
      handleLimitChange={handleLimitChange}
    />
  </div>
  
  );
};

export default ContractList;
