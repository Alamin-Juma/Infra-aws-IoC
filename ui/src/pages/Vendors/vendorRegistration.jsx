import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import withAuth from '../../utils/withAuth';
import MainLayout from '../../layouts/MainLayout';
import VendorList from './VendorList';
import { FaUserPlus } from 'react-icons/fa';
import Permission from '../../components/Permission';
import { PERMISSION_CREATE_VENDOR } from '../../constants/permissions.constants';


const VendorForm = ({ onSubmit }) =>  {
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedVendor, setSelectedVendor] = useState(null);

  const navigate = useNavigate()

  const handleAddVendor = () => {
    navigate('/app/vendors/add-vendor');
  };

  const handleEditVendor = (vendor) => {
    setFormMode('edit');
    setSelectedVendor(vendor);
    setShowForm(true);
  };
  return (
    <>
      <div className="p-8 max-w-10xl mx-auto text-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold"> Vendor Registry</h2>
        <div className="w-full md:w-auto">
          <Permission
            allowedPermission={[PERMISSION_CREATE_VENDOR]}
          >
            <div
              onClick={handleAddVendor}
              className="btn btn-primary bg-[#77B634] w-full md:w-auto"
            >
              <FaUserPlus className="font-bold text-xl mr-2" /> Add Vendor
            </div>
          </Permission>
        </div>
      </div>

      <VendorList onEdit={handleEditVendor} />

      {showForm && (
        <VendorForm 
          mode={formMode}
          vendor={selectedVendor}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
    </>
  );
};

const WrappedLanding = withAuth(VendorForm, false);

const VendorRegistrationPage = () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);

export default VendorRegistrationPage;
