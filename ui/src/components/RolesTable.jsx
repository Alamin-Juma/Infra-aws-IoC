import React, { useEffect, useState } from 'react';
import {  BsPencilSquare, BsThreeDots } from "react-icons/bs";
import { formatDate } from '../utils/formatDate';
import Swal from 'sweetalert2';
import api from '../utils/apiInterceptor';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { toPascalCase } from '../utils/toPascalCase';
import { RiArrowDropDownLine, RiArrowDropUpLine } from 'react-icons/ri';
import { fetchAllPermissionsService } from '../pages/Dashboard/Users/Roles/RolesService';
import Permission from './Permission';
import { PERMISSION_MANAGE_ROLE } from '../constants/permissions.constants';



const RolesTable = ({ data = [], setOpenRowId }) => {

  const [roles, setRoles] = useState(data);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAlert, setAlert] = useState(false);
  const [error, setError] = useState('');
   const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [formData, setFormData] = useState({
    roleName: '',
    permissions: [],
  });
  const [expandedRows, setExpandedRows] = useState(null);

  
  const toggleRow = (id) => {
    setExpandedRows((prev) => (prev === id ? null : id));
  };

  const fetchPermissions = async () => {
      try {
        const permissions = await fetchAllPermissionsService();
        setPermissions(permissions);
      } catch (error) {
        toast.error(
          error?.response?.data?.error ||
            "An error occurred while fetching permissions."
        );
      }
    };

  const overlayClasses = `z-[999999] fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`;
  const modalClasses = ` bg-white rounded-md p-6 max-w-[40rem] w-full shadow-lg transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
    }`;

  const openModal = (role) => {
    setOpenRowId(null);
    setIsOpen(true);
    setSelectedRoleId(role.id);
    setFormData({
      roleName: toPascalCase(role?.name?.replace('_', ' ')) || '',
      permissions: role?.rolePermissions?.map((permission) => permission.permission.id) || [],
    });
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setPermissions(prevPermissions => {
      const updatedPermissions = [...prevPermissions];
      const permissionIndex = updatedPermissions.findIndex(permission => permission.id === Number(name));
      if (permissionIndex !== -1) {
        updatedPermissions[permissionIndex].checked = e.target.checked;
      }
      return updatedPermissions;
    });
  };

  const isFormValid = () => {
    return (
      formData.roleName.trim() !== "" &&
      formData.roleName.trim().length > 2 &&
      formData.permissions.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.roleName.trim(),
        permissions: formData.permissions,
      }
      const response = await api.put(`/roles/${selectedRoleId}`, payload);
      if (response.status === 200) {
        setRoles((preRoles) =>
          preRoles.map((role) =>
            role.id === selectedRoleId ? { ...role, rolePermissions: response?.data?.data.permissions  } : role
          )
        );


        toast.success('Role updated successfully.');
        closeModal();
      } else {
        toast.error('Failed to update user. An error occurred.');
      }
    } catch (error) {
      setAlert(true);
      setError(error?.response?.data?.error);
      toast.error(error?.response?.data?.message || 'An error occurred while updating the role.');
      setTimeout(() => {
        setAlert(false);
      }, 3000)
    } finally {
      setLoading(false);

    }
    
  };


  const handleToggle = async (role) => {
    setOpenRowId(null);
    closeModal();
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `This will ${!role.status ? 'activate' : 'deactivate'} this role!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#77B634',
        cancelButtonColor: '#494848',
        confirmButtonText: `Yes,  ${!role.status ? 'Activate' : 'Deactivate'}  it!`,
      });

      if (!result.isConfirmed) return; 

      const response = await api.patch(`/roles/${role.id}/toggle-status`);

      if (response.status === 200) {
        
        setRoles((prevRoles) =>
          prevRoles.map((r) =>
            r.id === role.id ? { ...r, status: response?.data?.data.status } : r
          )
        );
       
       toast.success(`Role ${!role.status ? 'activated' : 'deactivated'} successfully.`);
      } else {
        toast.error('Failed to update role status. An error occurred.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'An error occurred while updating the role.');
    }
    setOpenRowId(null);
  };


  useEffect(() => {fetchPermissions(); }, [roles]);


  return (
    <div className="flex w-full overflow-x-auto z-50">

      <table className="min-w-full divide-y divide-gray-200 table-zebra table border-collapse border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
            ></th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
            >
              Role
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
            >
              Date Created
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.length > 0 ? (
            roles.map((role) => (
              <React.Fragment key={role.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                      onClick={() => toggleRow(role.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {expandedRows === role.id ? (
                        <RiArrowDropUpLine
                          className="inline-block"
                          size={20}
                        />
                      ) : (
                        <RiArrowDropDownLine
                          className="inline-block"
                          size={20}
                        />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {role?.name === "It Staff" || role?.name === "it_staff" ? "IT Staff" :  toPascalCase(role?.name?.replace('_', ' '))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(role?.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Permission
                      allowedPermission={[PERMISSION_MANAGE_ROLE]}
                    >
                      <input
                        type="checkbox"
                        className="switch switch-success"
                        checked={role?.status}
                        disabled={loading}
                        onChange={() => handleToggle(role)}
                      />
                    </Permission>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                    <Permission
                      allowedPermission={[PERMISSION_MANAGE_ROLE]}
                    >
                      <button
                        onClick={() => openModal(role)}
                        className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100"
                      >
                        <BsPencilSquare className='text-[#E3963E] text-lg' />
                      </button>
                    </Permission>
                      </div>
                  </td>
                </tr>

                {expandedRows === role.id && (
                  <tr className="bg-gray-100">
                    <td colSpan="5" className="px-6 py-4">
                      <div className="mt-4">
                        <h3 className="text-md font-semibold text-gray-800 mb-2">Role Permissions</h3>

                        {role.rolePermissions.length === 0 ? (
                          <p className="text-sm text-gray-500">No data</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-white border rounded">
                            {role.rolePermissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="bg-gray-50 text-sm text-black px-3 py-2 rounded shadow-sm"
                              >
                                {toPascalCase(permission.permission?.name?.replace(/_/g, ' ')) || '-'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr className="w-full">
              <td colSpan="5" className="text-center w-full">
                <div className="flex flex-col items-center justify-center py-8">
                  <span className="text-gray-600 text-lg font-semibold">
                    No Data
                  </span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        closeTimeoutMS={300}
        className={modalClasses}
        overlayClassName={overlayClasses}
        contentLabel="Edit User Modal"
        zIndex={99999}
      >
        <section className="bg-white rounded-xl">
          <div className="w-full flex justify-center">
            <h4 className="text-lg font-semibold">Edit Role</h4>
          </div>
          <div className="p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label">Role Name</label>

                <input
                  placeholder=""
                  id="roleName"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                 className="input max-w-full placeholder:text-sm  text-sm "
                />
              </div>
              <div className="w-full">
                <label htmlFor="permissions">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center"
                    >
                      <input
                        className="checkbox checkbox-success"
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        value={permission.id}
                        checked={formData?.permissions?.includes(permission?.id)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          setFormData((prev) => ({
                            ...prev,
                            permissions: checked
                              ? [...(prev.permissions || []), parseInt(value)]
                              : (prev.permissions || []).filter(
                                  (perm) => perm !== parseInt(value)
                                ),
                          }));
                        }}
                      />
                      <label
                        htmlFor={`permission-${permission.id}`}
                        className="ml-2"
                      >
                        {permission.routeName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={closeModal}
                  type="button"
                  className="rounded-lg btn btn-block"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className={`rounded-lg btn bg-[#77B634] btn-block ${
                    loading ? "btn-loading" : "btn-primary"
                  }`}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </section>
      </Modal>
    </div>
  );
}

export default RolesTable;
