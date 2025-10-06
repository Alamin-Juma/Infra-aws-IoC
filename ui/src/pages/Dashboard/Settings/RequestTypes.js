import React, { useState, useRef, useEffect, Fragment } from "react";
import { FaUserPlus } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";

import withAuth from "../../../utils/withAuth";
import MainLayout from "../../../layouts/MainLayout";
import Spinner from "../../../components/Spinner";
import api from "../../../utils/apiInterceptor";
import { toast } from "react-toastify";
import LoadingTable from "../../../components/LoadingTable";
import Pagination from "../../../components/Pagination";
import RequestTypeTable from "../../../components/RequestTypeTable";
import Permission from "../../../components/Permission";
import { PERMISSION_CREATE_REQUEST_TYPE } from "../../../constants/permissions.constants";

const RequestTypesPage = () => {
  const [roleSearch, setRoleSearch] = useState("");
  const [allRoles, setAllRoles] = useState([]);
  const toggleRole = (role) => {
    setFormData((prev) => {
      const alreadyAdded = prev.authorizedRoles.includes(role);
      const updatedRoles = alreadyAdded
        ? prev.authorizedRoles.filter((r) => r !== role)
        : [...prev.authorizedRoles, role];

      return { ...prev, authorizedRoles: updatedRoles };
    });
  };
  const [requestTypeList, setrequestTypeList] = useState([]);
  const cancelButtonRef = useRef(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    restrict: false,
    authorizedRoles: [],
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const isFormValid = () => {
    if(formData.restrict && formData.authorizedRoles.length<1){
      return false;
    }
    return formData.name.trim() !== "" && formData.name.trim().length > 2;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

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
      const response = await api.post("/requestTypes", payload);
      const newUser = response.data;

      addUser(newUser);

      setFormData({
        name: "",
        label: "",
        restrict: false,
        authorizedRoles: [],
      });

      closeAddModal();

      setTimeout(() => {
        toast.success("Request Type added successfully");
      }, 200);
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "An error occured while creating request type."
      );
    } finally {
      setLoading(false);
    }
  };

  const addUser = (newRole) => {
    setrequestTypeList((prevRoles) => [...prevRoles, newRole]);
  };

  const fetchReqTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/requestTypes?page=${page}&limit=${limit}`
      );
      setrequestTypeList(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
    } finally {
      setLoading(false);
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

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  useEffect(() => {
    fetchReqTypes();
  }, [page, limit]);

  useEffect(() => {
    fetchAllRoles();
  }, []);

  return (
    <div data-testid="main-container" className="w-full h-full">
      <div className="h-[5rem] flex  items-center row w-full gap-4 justify-between">
        <div className="flex items-center">
          <h4 className="font-bold text-xl ml-2">Request Types</h4>
        </div>
        <div className="flex flex-row gap-4">
          <div>
            <Permission allowedPermission={[PERMISSION_CREATE_REQUEST_TYPE]}>
              <label
                onClick={openAddModal}
                className="btn btn-primary bg-[#77B634]"
                htmlFor="modal-2"
              >
                <FaUserPlus className="font-bold text-xl mr-2" /> Add Request
                Type
              </label>
            </Permission>
          </div>
        </div>
      </div>
      {loading && <LoadingTable />}
      {!loading && <RequestTypeTable data={requestTypeList} refreshData={fetchReqTypes} />}

      <Pagination
        total={total}
        limit={limit}
        page={page}
        handlePageChange={handlePageChange}
        handleLimitChange={handleLimitChange}
      />

      <Transition.Root show={isAddModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 z-[999999]"
          initialFocus={cancelButtonRef}
          onClose={closeAddModal}
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
                  <div className="bg-gray-2">
                    <div className="flex flex-row items-center justify-center mb-3 w-full p-2">
                      <h3 className="font-bold text-lg">New Request Type</h3>
                    </div>
                    <section className="p-2">
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
                                      checked={formData.authorizedRoles.includes(
                                        role
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
                            onClick={closeAddModal}
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

const WrappedLanding = withAuth(RequestTypesPage, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
