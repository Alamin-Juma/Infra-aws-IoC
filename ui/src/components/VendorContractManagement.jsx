import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/apiInterceptor';
import ContractUpload from './ContractUpload';
import ContractList from './ContractList';
import MainLayout from '../layouts/MainLayout';
import { FaArrowLeft } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import Permission from './Permission';
import { PERMISSION_MANAGE_VENDOR_CONTRACTS } from '../constants/permissions.constants';

const VendorContractManagement = () => {
  const { id } = useParams();
  const vendorId = id;
  const [vendor, setVendor] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [listVersion, setListVersion] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  

  const addNewContract = (newContract) => {
    setContracts((prevContracts) => [...prevContracts, newContract]);

  };

  const refreshContractList = () => {
    setListVersion((prev) => prev + 1);
  };
  


  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await api.get(`/api/vendors/${vendorId}`);
        setVendor(res.data);
      } catch (err) {
        console.warn('Vendor not found. ');
        setVendor(fallbackVendor);
        setError('Vendor not found. ');
      }
    };

    fetchVendor();
  }, [vendorId]);


  return (
    <MainLayout>
      <div className="mb-6">
  <Link
   to={'/app/vendors/vendor-registry'}
    className="inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm"
  >
    <FaArrowLeft className="mr-2" />
    Back
  </Link>
</div>

<section className="bg-white border border-gray-100 shadow-l ml-8 pl-8 pb-8 pt-2">
      <div className="flex items-center justify-end mr-10">
        <Permission
          allowedPermission={[PERMISSION_MANAGE_VENDOR_CONTRACTS]}
        >
         <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#77B634] rounded-md shadow-md  focus:outline-none focus:ring-2 -mb-40"
          >
            <FiUpload className="text-lg" />
            Upload Contract
          </button>
        </Permission>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">{vendor?.name}</h1>

      <div className="flex flex-col lg:flex-nowrap items-start gap-2 text-gray-700 text-sm">

        <div className="flex ">
            <h3 className="text-sm text-black font-bold">Status:  
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor?.status?.toLowerCase() === 'active' ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}`}> {vendor?.status}</span> </h3>
        </div>
       
        <div className="flex ">
            <h3 className="text-sm text-black font-bold">Email: 
            <span className="text-gray-600"> {vendor?.email}</span> </h3>
        </div>
        <div className="flex ">
            <h3 className="text-sm text-black font-bold">Phone: 
            <span className="text-gray-600"> {vendor?.phone}</span> </h3>
        </div>
      </div>

      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999]"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg relative"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Close Button */}
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4 text-center">Upload Contract</h2>

            <ContractUpload
              vendorId={vendor?.id}
              onUploadSuccess={() => {
                setShowUploadModal(false);
              }}
            />
          </div>
        </div>
      )}
    </section>


{error && (
  <div className="mt-6 text-center text-sm text-red-700 bg-red-100 border border-red-200 p-4 rounded-lg">
    {error}
  </div>
)}

{/* Success Message */}
{message && (
  <div className="mt-6 text-center text-sm text-green-700 bg-green-100 border border-green-200 p-4 rounded-lg">
    {message}
  </div>
)}

<div className="bg-white border border-gray-100 shadow-l ml-8 px-8 pb-8 pt-2">



  <ContractList vendorId={vendor?.id} onUploadSuccess={refreshContractList} listVersion={listVersion} showUploadModal={showUploadModal} />
</div>


  </MainLayout>

  );
};

export default VendorContractManagement;
