import React, { useState, Fragment, useRef } from "react";
import Lottie from "lottie-react";
import animationData from "../assets/lottie/no-data.json";
import { format } from "date-fns";
import { IoTrashOutline } from "react-icons/io5";
import { BsPencilSquare } from "react-icons/bs";
import api from "../utils/apiInterceptor";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";
import Spinner from "./Spinner";
import { toPascalCase } from "../utils/toPascalCase";
import { PERMISSION_CREATE_USER, PERMISSION_MANAGE_USERS } from "../constants/permissions.constants";
import Permission from "./Permission";

const DataTable = ({ data = [], roles = [] }) => {
  const [users, setUsers] = useState(data);
  const cancelButtonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [statusToggleLoading, setStatusToggleLoading] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roleName: "",
  });

  const openEditUserModal = (user) => {
    setIsEditUserModalOpen(true);
    setSelectedUserId(user.id);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      roleName: user.roleName || "",
    });
  };
  const closeAddUserModal = () => setIsEditUserModalOpen(false);

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) {
      return "Invalid Date";
    }
    return format(new Date(dateString), "MM/dd/yy");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

   const handleToggle = async (user) => {
    setStatusToggleLoading(prev => ({...prev, [user.id]: true}));
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `This will ${!user.status ? 'activate' : 'deactivate'} this user!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#77B634',
        cancelButtonColor: '#494848',
        confirmButtonText: `Yes,  ${!user.status ? 'Activate' : 'Deactivate'}  them!`,
      });

      if (!result.isConfirmed) {
        setStatusToggleLoading(prev => ({...prev, [user.id]: false}));
        return
      }; 

      const response = await api.patch(`/users/${user.id}/toggle-status`);

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === user.id ? { ...u, status: response?.data?.data.status } : u
          )
        );
       
        toast.success(`User ${!user.status ? 'activated' : 'deactivated'} successfully.`);
      } else {
        toast.error('Failed to update user status. An error occurred.');
      }

      setStatusToggleLoading(prev => ({...prev, [user.id]: false}));
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred while updating the user's status.");
      setStatusToggleLoading(prev => ({...prev, [user.id]: false}));
    }
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.roleName.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put(`/users/${selectedUserId}`, formData);

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUserId ? { ...user, ...formData } : user
          )
        );

        toast.success("User updated successfully.");
        closeAddUserModal();
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to update user. An error occurred",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `${error?.response?.data?.error} || 'An error while updating user.'`,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove this user from the employee record!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#77B634",
      cancelButtonColor: "#494848",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      Swal.showLoading();
      const response = await api.delete(`/users/${id}`);
      if (response) {
        setUsers((prevData) => prevData.filter((user) => user.id !== id));
        toast.success("User deleted successfully");
      } else {
        Swal.hideLoading();
        toast.error("An error occurred while deleting the user");
      }
    }
  };

  return (
    <div className="flex w-full overflow-x-auto">
      <table className="table-zebra table border-collapse border border-gray-200">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Date Created</th>
            <th>Status</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                <div className="flex flex-col items-center justify-center">
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    className="h-40"
                  />
                  <span className="text-gray-600 text-lg font-semibold">
                    No Data
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.email}>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Permission
                    allowedPermission={[PERMISSION_MANAGE_USERS]}
                  >
                    <input
                      type="checkbox"
                      className="switch switch-success"
                      checked={user?.status}
                      disabled={Boolean(statusToggleLoading[user.id])}
                      onChange={() => handleToggle(user)}
                    />
                  </Permission>
                </td>
                <td>
                  {user?.roleName.charAt(0).toUpperCase() +
                    user?.roleName.slice(1)}
                </td>
                <td>
                  <div className="flex flex-row gap-2">
                    <Permission
                      allowedPermission={[PERMISSION_MANAGE_USERS]}
                    >
                      <button
                        onClick={() => openEditUserModal(user)}
                        className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white"
                        data-tooltip="Edit User"
                      >
                        <BsPencilSquare className="text-[#E3963E] text-lg" />
                      </button>
                    </Permission>
                    <Permission
                      allowedPermission={[PERMISSION_MANAGE_USERS]}
                    >
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white"
                        data-tooltip="Delete User"
                      >
                        <IoTrashOutline className="text-red-600 text-lg" />
                      </button>
                    </Permission>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Transition.Root show={isEditUserModalOpen} as={Fragment}>
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
                    <div className="flex justify-center items-center mb-3 w-full p-2">
                      <h3 className="font-semibold text-lg text-center">
                        Update Employee
                      </h3>
                    </div>
                    <section className="p-2">
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="sr-only" htmlFor="firstName">
                              First Name
                            </label>
                            <input
                              className="input input-solid"
                              placeholder="First Name"
                              type="text"
                              id="firstName"
                              name="firstName"
                              maxLength={25}
                              value={formData.firstName}
                              onChange={handleChange}
                            />
                          </div>

                          <div>
                            <label className="sr-only" htmlFor="lastName">
                              Last Name
                            </label>
                            <input
                              className="input input-solid"
                              placeholder="Last Name"
                              type="text"
                              id="lastName"
                              name="lastName"
                              maxLength={25}
                              value={formData.lastName}
                              onChange={handleChange}
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
                            id="email"
                            name="email"
                            maxLength={50}
                            value={formData.email}
                            onChange={handleChange}
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
                            <option value=""></option>
                            {roles.map((role) => (
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
                            className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 sm:col-start-2 sm:text-sm ${
                              loading || !isFormValid()
                                ? "bg-[#A8D08D] cursor-not-allowed"
                                : "bg-[#77B634] hover:bg-[#66992B]"
                            }`}
                          >
                            {loading ? <Spinner /> : "Submit"}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#77B634] sm:col-start-1 sm:mt-0 sm:text-sm"
                            onClick={() => setIsEditUserModalOpen(false)}
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
    </div>
  );
};

export default DataTable;
