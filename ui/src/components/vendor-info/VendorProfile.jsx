import React, { useState, useEffect } from 'react';
import VendorContractManagement from '../VendorContractManagement';
import axios from 'axios';

const VendorProfilePage = () => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const vendorId = '123'; // Replace with route param or dynamic ID if needed

  const handleUploadSuccess = () => setRefreshToggle(!refreshToggle);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await axios.get(`/api/vendors/${vendorId}`);
        setVendor(res.data);
      } catch (error) {
        console.error('Failed to fetch vendor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorId, refreshToggle]);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading vendor data...</div>;
  }

  if (!vendor) {
    return <div className="text-center py-10 text-red-500">Vendor not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Page Title */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Vendor Profile Overview</p>
          </div>
        </div>

        {/* Vendor Info */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Vendor Information</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-4 text-gray-700 text-sm">
            <div>
              <span className="font-medium block">Email</span>
              {vendor.email}
            </div>
            <div>
              <span className="font-medium block">Phone</span>
              {vendor.phone}
            </div>
            <div>
              <span className="font-medium block">Address</span>
              {vendor.address}
            </div>
          </div>
        </section>

        {/* Contract Management Section */}
        <section className="space-y-6">
          {/* Pass vendor and handler as props if needed */}
          <VendorContractManagement vendorId={vendorId} onUploadSuccess={handleUploadSuccess} />
        </section>

      </div>
    </div>
  );
};

export default VendorProfilePage;
