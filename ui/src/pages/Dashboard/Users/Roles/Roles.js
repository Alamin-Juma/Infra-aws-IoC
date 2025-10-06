import React, { useState, useEffect, Fragment } from "react";
import { FaUserPlus } from "react-icons/fa";
import withAuth from "../../../../utils/withAuth";
import MainLayout from "../../../../layouts/MainLayout";
import { toast } from "react-toastify";
import LoadingTable from "../../../../components/LoadingTable";
import RolesTable from "../../../../components/RolesTable";
import Pagination from "../../../../components/Pagination";
import {
  createRoleService,
  fetchAllPermissionsService,
  fetchRolesService,
} from "./RolesService";
import Modal from "react-modal";
import { IoSearchSharp } from "react-icons/io5";
import { MdOutlineFilterAlt } from "react-icons/md";
import { DEBOUNCETIMEOUT } from "../../../../utils/constants";
import Permission from "../../../../components/Permission";
import { PERMISSION_CREATE_ROLE } from "../../../../constants/permissions.constants";

const Roles = () => {
  const [roleList, setRoleList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({
    roleName: "",
    permissions: [],
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openRowId, setOpenRowId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const overlayClasses = `z-[999999] fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
    isAddModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
  }`;
  const modalClasses = ` bg-white rounded-md p-6 max-w-[40rem] w-full shadow-lg transform transition-all duration-300 ease-in-out ${
    isAddModalOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
  }`;

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  // Function to check if the form is valid
  const isFormValid = () => {
    return (
      formData.roleName.trim() !== "" &&
      formData.roleName.trim().length > 2 &&
      formData.permissions.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setLoading(true);
    try {
      await createRoleService(formData);
      setFormData({
        roleName: "",
        permissions: [],
      });
      toast.success("Role created successfully.");
      closeAddModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "An error occured while creating role."
      );
    }
    setLoading(false);
    fetchRoles();
    setOpenRowId(null);
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { roles, total } = await fetchRolesService(
        page,
        limit,
        debouncedSearchTerm,
        statusFilter
      );
      setRoleList(roles);
      setTotal(total);
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "An error occurred while fetching roles."
      );
    } finally {
      setLoading(false);
    }
    setOpenRowId(null);
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

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [page, limit, debouncedSearchTerm, statusFilter]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCETIMEOUT);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  return (
    <div data-testid="main-container mt-12" className="w-full h-full">
      <div className="h-[5rem] flex  items-center row w-full gap-4 justify-between">
        <div className="flex items-center">
          <h4 className="font-bold text-xl ml-2">Roles</h4>
        </div>
        <div className="flex flex-row gap-4">
          <div>
            <Permission
              allowedPermission={[PERMISSION_CREATE_ROLE]}
            >
              <label
                onClick={openAddModal}
                className="btn btn-primary bg-[#77B634]"
                htmlFor="modal-2"
              >
                <FaUserPlus className="font-bold text-xl mr-2" /> Add Role
              </label>
            </Permission>
          </div>
        </div>
      </div>
      <div className="h-[5rem] flex flex-col md:flex-row w-full gap-4 justify-between items-center py-4">
        <div className="flex flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <input
              type="text"
              className="input w-full pl-10 pr-4"
              placeholder="Role"
              value={searchTerm}
              maxLength={30}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchSharp className="text-gray-500" />
            </div>
          </div>
          <div className="relative flex-shrink-0 min-w-[220px] max-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineFilterAlt className="text-gray-500" />
            </div>
            <select
              className="select min-w-[200px] w-full pl-10"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      {loading && <LoadingTable />}
      {!loading && (
        <RolesTable
          data={roleList}
          setOpenRowId={setOpenRowId}
          openRowId={openRowId}
        />
      )}

      <Pagination
        total={total}
        limit={limit}
        page={page}
        handlePageChange={handlePageChange}
        handleLimitChange={handleLimitChange}
      />

      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={closeAddModal}
        closeTimeoutMS={300}
        className={modalClasses}
        overlayClassName={overlayClasses}
        contentLabel="Edit User Modal"
        zIndex={99999}
      >
        <section className="bg-white rounded-xl  border-none">
          <div className="w-full flex justify-center">
            <h4 className="text-lg font-semibold">New Role</h4>
          </div>
          <div className="p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label">Role Name</label>

                <input
                  placeholder="e.g Admin"
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
                    <div key={permission.id} className="flex items-center">
                      <input
                        className="checkbox checkbox-success"
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        value={permission.id}
                        checked={formData?.permissions?.includes(
                          permission?.id
                        )}
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
                  onClick={closeAddModal}
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
};

const WrappedLanding = withAuth(Roles, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
