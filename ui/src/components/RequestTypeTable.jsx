import React, { useState } from "react";
import Lottie from "lottie-react";
import { IoTrashOutline } from "react-icons/io5";
import { BsPencilSquare } from "react-icons/bs";
import animationData from "../assets/lottie/no-data.json";
import { formatDate } from "../utils/formatDate";
import Swal from "sweetalert2";
import api from "../utils/apiInterceptor";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { snakeToSpacedPascal } from "../utils/snakeToPascalCase";
import Permission from "./Permission";
import { useEffect } from "react";
import Spinner from "./Spinner";
import {
  PERMISSION_DELETE_REQUEST_TYPE,
  PERMISSION_MANAGE_REQUEST_TYPE,
} from "../constants/permissions.constants";

const RequestTypeTable = ({ data = [], refreshData }) => {
  const [roleSearch, setRoleSearch] = useState("");
  const [allRoles, setAllRoles] = useState([]);

  const toggleRole = (role) => {
    setFormData((prev) => {
      const exists = prev.authorizedRoles.some((r) => r.id === role.id);

      const updatedRoles = exists
        ? prev.authorizedRoles.filter((r) => r.id !== role.id)
        : [...prev.authorizedRoles, role];

      return { ...prev, authorizedRoles: updatedRoles };
    });
  };

  const [roles, setRoles] = useState(data);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAlert, setAlert] = useState(false);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    restrict: false,
    authorizedRoles: [],
  });

  const overlayClasses = `z-[999999] fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
  }`;

  const modalClasses = `bg-white rounded-md p-6 max-w-[40rem] w-full shadow-lg transform transition-all duration-300 ease-in-out ${
    isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
  }`;

  const openModal = (request) => {
    setIsOpen(true);
    setSelectedUserId(request.id);
    let formatedRoles = request.authorizedRoles.map((e) => e.role) || [];
    setFormData({
      name: request.name || "",
      label: request.label || "",
      restrict: request.restrict || false,
      authorizedRoles: formatedRoles,
    });
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isFormValid = () => {
    if (formData.restrict && formData.authorizedRoles.length < 1) {
      return false;
    }
    return formData.name.trim() !== "";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim().toLowerCase(),
        label: formData.label.trim(),
        restrict: formData.restrict || false,
        authorizedRoles: formData.restrict
          ? formData.authorizedRoles.map((e) => e.id)
          : [],
      };
      const response = await api.put(
        `/requestTypes/${selectedUserId}`,
        payload
      );

      if (response.status === 200) {
        setRoles((prevRequestTypes) =>
          prevRequestTypes.map((requestType) =>
            requestType.id === selectedUserId
              ? {
                  ...requestType,
                  ...response.data.authorizedRoles.map((e) => e.role),
                }
              : requestType
          )
        );
        refreshData();
        toast.success("Request Type updated successfully.");
        closeModal();
      } else {
        toast.error("Failed to update request type. An error occurred.");
      }
    } catch (error) {
      setAlert(true);
      setError(error?.response?.data?.error || "Error updating request type");
      setTimeout(() => {
        setAlert(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteRequestType = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will remove this request type from the records!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#77B634",
        cancelButtonColor: "#494848",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Deleting...",
        text: "Please wait while the request type is being deleted.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await api.delete(`/requestTypes/${id}`);

      if (response.status === 200 || response.status === 204) {
        setRoles((prevData) => prevData.filter((user) => user.id !== id));

        Swal.fire({
          title: "Deleted!",
          text: "Request type deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        refreshData();
      } else {
        throw new Error("An error occurred while deleting the request type.");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.error,
        icon: "error",
      });
    }
  };
  const fetchAllRoles = async () => {
    try {
      const response = await api.get(`/roles?page=1&limit=1000`);
      setAllRoles(response.data.data.roles);
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    fetchAllRoles();
  }, []);

  return (
    <div className="flex w-full overflow-x-auto">
      <table className="table-zebra table border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className="font-bold">Request Type</th>
            <th>Date Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
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
            // Render the table rows if data exists
            roles.map((user) => (
              <tr key={user.id}>
                <td>{snakeToSpacedPascal(user.name)}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="flex flex-row gap-2">
                    <Permission
                      allowedPermission={[PERMISSION_MANAGE_REQUEST_TYPE]}
                    >
                      <label
                        onClick={() => openModal(user)}
                        className="btn tooltip tooltip-top bg-transparent btn-lg hover:bg-gray-300 hover:text-white"
                        data-tooltip="Edit Request Type"
                        tabIndex="0"
                      >
                        <BsPencilSquare className="text-[#77B634]" />
                      </label>
                    </Permission>
                    <Permission
                      allowedPermission={[PERMISSION_DELETE_REQUEST_TYPE]}
                    >
                      <label
                        onClick={() => deleteRequestType(user.id)}
                        className="btn tooltip tooltip-top btn-lg bg-transparent hover:bg-gray-300 hover:text-white"
                        data-tooltip="Delete Request Type"
                        tabIndex="0"
                      >
                        <IoTrashOutline className="text-red-600" />
                      </label>
                    </Permission>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Edit User Modal */}
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        closeTimeoutMS={300}
        className={modalClasses}
        overlayClassName={overlayClasses}
        contentLabel="Edit User Modal"
      >
        <section className="bg-gray-2 rounded-xl">
          <div className="p-8">
            <div className="w-full flex mb-4 justify-center">
              <h4 className="text-lg font-semibold text-center">
                Edit Request Type
              </h4>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="w-full">
                <label>Request Type</label>
                <input
                  className="input input-solid max-w-full"
                  placeholder=""
                  type="text"
                  name="name"
                  maxLength={25}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="w-full">
                <label>Request Label</label>
                <input
                  className="input input-solid max-w-full"
                  placeholder=""
                  type="text"
                  name="label"
                  maxLength={25}
                  value={formData.label}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="w-full flex items-center gap-2">
                <label htmlFor="restrict">Restrict</label>
                <input
                  id="restrict"
                  type="checkbox"
                  name="restrict"
                  checked={formData.restrict}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      restrict: e.target.checked,
                    }))
                  }
                />
              </div>

              {formData.restrict && (
                <div>
                  <input
                    type="text"
                    placeholder="Search roles..."
                    className="input input-solid w-full mb-2"
                    onChange={(e) => setRoleSearch(e.target.value)}
                  />
                  <div className="max-h-32 overflow-y-auto border rounded p-2">
                    {allRoles
                      .filter((role) =>
                        role.name
                          .toLowerCase()
                          .includes(roleSearch.toLowerCase())
                      )
                      .map((role) => (
                        <div
                          key={role}
                          className="flex items-center gap-2 mb-1 cursor-pointer"
                          onClick={() => toggleRole(role)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.authorizedRoles.some(
                              (r) => r.id === role.id
                            )}
                            readOnly
                          />
                          <span>{role.name}</span>
                        </div>
                      ))}
                  </div>

                  {formData.authorizedRoles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.authorizedRoles.map((role) => (
                        <span
                          key={role.id}
                          className="bg-gray-200 px-2 py-1 text-sm rounded flex items-center gap-1"
                        >
                          {role.name}
                          <button
                            type="button"
                            onClick={() => toggleRole(role)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:col-start-2 sm:text-sm ${
                    loading || !isFormValid()
                      ? "bg-[#A8D08D] cursor-not-allowed"
                      : "bg-[#77B634] hover:bg-[#66992B]"
                  }`}
                >
                  {loading ? <Spinner /> : "Submit"}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-100 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50  sm:col-start-1 sm:mt-0 sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      </Modal>
    </div>
  );
};

export default RequestTypeTable;
