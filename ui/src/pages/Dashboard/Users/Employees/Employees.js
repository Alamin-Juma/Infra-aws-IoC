import React, { useState, useRef, useEffect, Fragment } from "react";
import { FaFileCsv } from "react-icons/fa6";
import { FaUserPlus } from "react-icons/fa";
import DataTable from "../../../../components/DataTable";
import withAuth from "../../../../utils/withAuth";
import MainLayout from "../../../../layouts/MainLayout";
import Spinner from "../../../../components/Spinner";
import api from "../../../../utils/apiInterceptor";
import UploadCSV from "../../../../components/UploadCSV";
import { toast } from "react-toastify";
import LoadingTable from "../../../../components/LoadingTable";
import { IoSearchSharp } from "react-icons/io5";
import { debounce } from "lodash";
import config from "../../../../configs/app.config";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { LiaTimesSolid } from "react-icons/lia";
import Pagination from "../../../../components/Pagination";
import { MdOutlineFilterAlt } from "react-icons/md";
import { fetchRolesService } from "../Roles/RolesService";
import { toPascalCase } from "../../../../utils/toPascalCase";
import { displayRoleOptions } from "../../../../utils/util";
import { DEBOUNCETIMEOUT } from "../../../../utils/constants";
import Permission from "../../../../components/Permission";
import { PERMISSION_CREATE_USER } from "../../../../constants/permissions.constants";

const Employees = () => {
  const [userList, setUserList] = useState([]);
  const cancelButtonRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roleName: ""
  });
  const [loading, setLoading] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [error, setError] = useState("");
  const [roleList, setRoleList] = useState([]);

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.roleName.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    );
  };

  const isValidEmailDomain = (email) => {
    const domain = email.split("@")[1];
    return config.acceptable_domains.includes(domain);
  };

  const openAddUserModal = () => setIsAddUserModalOpen(true);
  const closeAddUserModal = () => setIsAddUserModalOpen(false);

  const openBulkUploadModal = () => setIsBulkUploadModalOpen(true);
  const closeBulkUploadModal = () => setIsBulkUploadModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      roleName: formData.roleName.trim(),
    };

    try {
      if (!isValidEmailDomain(payload.email)) {
        Swal.fire({
          title: "Error!",
          text: "Provide a valid company email",
          icon: "error",
        });
        return;
      }

      const response = await api.post("/users", formData);
      const newUser = response.data;

      addUser(newUser);

      // Reset the form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        roleName: roleList?.some(role => role.name === 'employee') ? "employee" : "",
      });

      toast.success("User added successfully");

      setTimeout(() => {
        closeAddUserModal();
        fetchUsers();
      }, 500);
    } catch (error) {
      setError(error.response.data.error);
      if (
        error.response &&
        error.response.data.error === "User already exists."
      ) {
        toast.error("User already exists.");
      } else {
        toast.error("Error when adding user");
      }
    } finally {
      setLoading(false);
    }
  };

  const addUser = (newUser) => {
    setUserList((prevUsers) => [...prevUsers, newUser]);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/api/filter`, {
        params: {
          page,
          limit,
          keyword: searchQuery,
          roleName: filterRole,
        },
      });
      setUserList(response.data.users);
      setTotal(response.data.total);

      const responseRoles = await api.get(
        `/roles?page=1&limit=100&status=true`
      );
      const roles = responseRoles?.data?.data?.roles;
      setRoleList(roles);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  // Handle search input change with debouncing
  const handleSearch = debounce((query) => {
    setSearchQuery(query.trim().toLowerCase());
    setPage(1);
  }, DEBOUNCETIMEOUT);

  // Handle filter dropdown change
  const handleFilter = (role) => {
    setFilterRole(role.trim().toLowerCase());
    setPage(1);
  };

  useEffect(() => {
    if(roleList?.some(role => role.name === 'employee'))
    {
      setFormData(prev => ({...prev, roleName: "employee"}))
    }
  }, [roleList])

  useEffect(() => {
    fetchUsers();
  }, [page, limit, searchQuery, filterRole, isBulkUploadModalOpen]);

  return (
    <div data-testid="main-container" className="w-full h-full">
      <div className="flex items-center">
        <h2 className="ml-2 text-xl font-bold">Employees </h2>
      </div>
      <div className="h-[5rem] flex flex-col md:flex-row w-full gap-4 justify-between items-center py-4">
        <div className="flex flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              className="input w-full pl-10 pr-4"
              placeholder="Search email or name"
              maxLength={30}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchSharp className="text-gray-500" />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdOutlineFilterAlt className="text-gray-500" />
              </div>
              <select
                className="select min-w-[200px] w-full pl-10"
                onChange={(e) => handleFilter(e.target.value)}
              >
                <option value="">All</option>
                {roleList.map((role) => (
                  <option key={role._id} value={role.name}>
                    {displayRoleOptions(role)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Permission
            allowedPermission={[PERMISSION_CREATE_USER]}
          >
            <div className="w-full md:w-auto">
              <div
                onClick={openAddUserModal}
                className="btn btn-primary bg-[#77B634] w-full md:w-auto"
              >
                <FaUserPlus className="font-bold text-xl mr-2" /> Add Employee
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div
                onClick={openBulkUploadModal}
                className="btn outline outline-[#B6B634] hover:bg-gray-300 w-full md:w-auto"
              >
                <FaFileCsv className="font-bold text-[#B6B634] text-xl mr-2" />{" "}
                Bulk Upload
              </div>
            </div>
          </Permission>
        </div>
      </div>
      {loading && <LoadingTable />}
      {!loading && <DataTable data={userList} roles={roleList} />}

      {/* Add User Upload Modal */}
      <Transition.Root show={isAddUserModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100]"
          initialFocus={cancelButtonRef}
          onClose={closeAddUserModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                  style={{ maxWidth: "700px" }}
                >
                  <div className="">
                    <div className="flex flex-row items-center mb-3 w-full p-2">
                      <h3 className="font-semibold text-lg">New Employee</h3>
                    </div>
                    <section className="p-2">
                      <form className="space-y-4">
                         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="sr-only" htmlFor="firstName">
                              First Name
                            </label>
                            <input
                              className="input input-solid max-w-full"
                              placeholder="First Name"
                              type="text"
                              name="firstName"
                              maxLength={25}
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div>
                            <label className="sr-only" htmlFor="lastName">
                              Last Name
                            </label>
                            <input
                              className="input input-solid max-w-full"
                              placeholder="Last Name"
                              type="text"
                              name="lastName"
                              maxLength={25}
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="w-full">
                          <label className="sr-only" htmlFor="email">
                            Email
                          </label>
                          <input
                            className="input input-solid max-w-full"
                            placeholder="Email"
                            type="email"
                            name="email"
                            maxLength={50}
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="w-full">
                          <label className="sr-only" htmlFor="roleName">
                            Role
                          </label>
                          <select
                            className="select select-solid max-w-full"
                            id="roleName"
                            name="roleName"
                            value={formData.roleName}
                            onChange={handleChange}
                          >
                            {roleList.map((role) => (
                              <option key={role.id} value={role.name}>
                                {role?.name === "It Staff" ||
                                role?.name === "it_staff"
                                  ? "IT Staff"
                                  : toPascalCase(role?.name?.replace("_", " "))}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !isFormValid()}
                            className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:col-start-2 sm:text-sm ${
                              loading || !isFormValid()
                                ? "bg-[#A8D08D] cursor-not-allowed"
                                : "bg-[#77B634] hover:bg-[#66992B]"
                            }`}
                          >
                            {loading ? <Spinner /> : "Add User"}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-[#77B634] border-[2px] bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50  sm:col-start-1 sm:mt-0 sm:text-sm"
                            onClick={() => setIsAddUserModalOpen(false)}
                            ref={cancelButtonRef}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Bulk User Upload Modal */}
      <Transition.Root show={isBulkUploadModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100]"
          initialFocus={cancelButtonRef}
          onClose={closeBulkUploadModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                  style={{ maxWidth: "700px" }}
                >
                  <div className="bg-transparent">
                    <div className="flex justify-end p-2">
                      <span>
                        <LiaTimesSolid
                          onClick={() => setIsBulkUploadModalOpen(false)}
                          className="hover:bg-gray-200 rounded cursor-pointer"
                        />
                      </span>
                    </div>
                    <section className="p-2">
                      <UploadCSV
                        onClose={closeBulkUploadModal}
                        onAddUser={addUser}
                      />
                    </section>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

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

const WrappedLanding = withAuth(Employees, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
