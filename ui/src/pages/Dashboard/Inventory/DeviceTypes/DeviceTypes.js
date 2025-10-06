import MainLayout from "../../../../layouts/MainLayout";
import withAuth from "../../../../utils/withAuth";
import React, { useState, useRef, useEffect, Fragment } from "react";
import { FaPlus } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { BsPencilSquare } from "react-icons/bs";
import api from "../../../../utils/apiInterceptor";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dialog, Transition } from "@headlessui/react";
import { toPascalCase } from "../../../../utils/toPascalCase";
import Spinner from "../../../../components/Spinner";
import LoadingTable from "../../../../components/LoadingTable";
import Permission from "../../../../components/Permission";
import { PERMISSION_CREATE_DEVICE_TYPE, PERMISSION_DELETE_DEVICE_TYPE, PERMISSION_MANAGE_DEVICE_TYPE } from "../../../../constants/permissions.constants";

export const DeviceTypes = () => {
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [formData, setFormData] = useState({ name: "",low_stock_limit: 5});
    const [loading, setLoading] = useState(false);
    const [specs, setSpecs] = useState([]);

  const [selectedEditId, setSelectedEditId] = useState([]);
  const [selectedDeviceSpecs, setSelectedDeviceSpecs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const cancelButtonRef = useRef(null);

    const openAddModal = () => {
        setFormData({
            name: '',
            reorder_point: '',
        });
        setSelectedDeviceSpecs([]);
        setIsAddModalOpen(true);
    };
    const closeAddModal = () => setIsAddModalOpen(false);

    const openEditModal = (device) => {
        setSelectedEditId(device.id)
        setSelectedDeviceSpecs(JSON.parse(device.specifications));
        setFormData(device ? { name: toPascalCase(device.name), low_stock_limit: device.low_stock_limit ?? 5 } : { name: "", low_stock_limit: 5 });
        setIsEditModalOpen(true)
    };
    const closeEditModal = () => setIsEditModalOpen(false);


  useEffect(() => {
    fetchDeviceTypes();
    fetchDeviceSpecifications();
  }, []);

  const isFormValid = () => {
    return formData.name.trim() !== "" && selectedDeviceSpecs.length > 0;
  };
  

  const fetchDeviceTypes = async () => {
    try {
      const res = await api.get(`/deviceTypes?page=${page}&limit=${limit}`);
      setDeviceTypes(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      toast.error("Failed to fetch device types");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(total / limit)) return;
    setPage(newPage);
  };

    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setPage(1); 
    };

  useEffect(() => {
    fetchDeviceTypes();
  }, [page, limit]);

  const handleSubmit = async (e) => {
    const payload = {
      name: formData.name.trim().toLowerCase(),
      low_stock_limit: formData.low_stock_limit,
      specifications: selectedDeviceSpecs,
    };
  
    setLoading(true);
  
    try {
      await api.post(`/deviceTypes`, payload);
  
      closeAddModal();
      setTimeout(() => {
        toast.success("Device type added successfully");
      }, 300);
  
      setFormData({ name: "" });
      fetchDeviceTypes();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        confirmButtonColor: "#77B634",
        text: error.response?.data?.error || "An error occurred.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  



    const handleEditSubmit = async (e) => {
      const payload = {
        name: formData.name.trim().toLowerCase(),
        low_stock_limit: formData.low_stock_limit,
        specifications: selectedDeviceSpecs,
      };
    
      setLoading(true);
    
      try {
        const res = await api.put(`/deviceTypes/${selectedEditId}`, payload);
    
        closeEditModal();
        setTimeout(() => {
          toast.success("Device type updated successfully");
        }, 300);
    
        setFormData({ name: "" });
    
        fetchDeviceTypes();
      } catch (error) {
        Swal.fire({
          title: "Error!",
          confirmButtonColor: "#77B634",
          text: error.response?.data?.error || "An error occurred.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    

  const fetchDeviceSpecifications = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/specifications?page=${1}&limit=${100}`
      );
      setSpecs(response.data.data);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecChange = (e, spec) => {
    if (e.target.checked) {
      setSelectedDeviceSpecs([...selectedDeviceSpecs, spec]);
    } else {
      setSelectedDeviceSpecs(
        selectedDeviceSpecs.filter((s) => s.specification_id !== spec.specification_id)
      );
    }
  };


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Device type?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#77B634",
      cancelButtonColor: "#494848",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/deviceTypes/${id}`);
      toast.success("Device type deleted successfully");
      fetchDeviceTypes();
    } catch (error) {
      toast.error("Failed to delete device type");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4  rounded-full">
        <h2 className="text-xl font-bold">Device Types</h2>
        <Permission
          allowedPermission={[PERMISSION_CREATE_DEVICE_TYPE]}
        >
          <button
            onClick={openAddModal}
            className="bg-[#77B634] text-white p-2 btn btn-success btn-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add Device Type
          </button>
        </Permission>
      </div>

     

            <table className="w-full table table-zebra border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-[#F0F7EE]">
                    <th className="p-2 w-[20%]">Name</th>
                    <th className="p-2 w-[20%] text-center">Low Stock Limit</th>
                    <th className="p-2 w-[25%] text-center">Actions</th>
                    </tr>
                </thead>
                {loading && <LoadingTable />}
                <tbody>
                    {deviceTypes?.map((device) => (
                    <tr key={device.id}>
                        <td>{toPascalCase(device.name)}</td>
                        <td className="text-center">{device.low_stock_limit ?? 5}</td>
                        <td className="text-center">
                        <div className=" items-center"> 
                            <Permission
                              allowedPermission={[PERMISSION_MANAGE_DEVICE_TYPE]}
                            >
                              <label
                                onClick={() => openEditModal(device)}
                                className="btn tooltip tooltip-top btn-sm bg-transparent hover:bg-gray-300 hover:text-white"
                                data-tooltip="Edit Device Type"
                                tabIndex="0"
                              >
                                <BsPencilSquare className="text-[#E3963E] text-lg" />
                              </label>
                            </Permission>
                            {device._count?.devices > 0 ? (
                                <div
                                  className="btn btn-sm bg-transparent text-gray-400 cursor-not-allowed tooltip tooltip-top"
                                  data-tooltip="Cannot delete: device type in use"
                                >
                                  <IoTrashOutline className="text-gray-400 text-lg" />
                                </div>
                              ) : (
                                <Permission
                                  allowedPermission={[PERMISSION_DELETE_DEVICE_TYPE]}
                                >
                                  <label
                                    onClick={() => handleDelete(device.id)}
                                    className="btn tooltip tooltip-top btn-sm bg-transparent hover:bg-gray-300 hover:text-white"
                                    data-tooltip="Delete Device Type"
                                    tabIndex="0"
                                  >
                                    <IoTrashOutline className="text-red-600 text-lg" />
                                  </label>
                                </Permission>
                              )}


                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
             </table>





            <Transition.Root show={isAddModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-[100]" initialFocus={cancelButtonRef} onClose={closeAddModal}>
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
      style={{ maxWidth: '700px' }}
    >
 
      <button
        type="button"
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        onClick={() => setIsAddModalOpen(false)}
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div>
        <div className="flex justify-center items-center mb-3 w-full p-2">
          <h3 className="font-semibold text-lg">New Device Type</h3>
        </div>

        <section className="p-2">
          <form className="space-y-4">
            {/* Device Name */}
            <div>
              <label className="block text-sm font-medium mb-2 ml-1">Device Type Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-md focus:border-gray-300 cursor-text"
              />
            </div>

         
            <div>
              <label className="block text-sm font-medium mb-2 ml-1">Low Stock Limit</label>
              <input
                type="number"
                name="low_stock_limit"
                min="1"
                value={formData.low_stock_limit}
                onChange={(e) =>
                  setFormData({ ...formData, low_stock_limit: parseInt(e.target.value, 10) })
                }
                className="w-full p-2 border border-gray-200 rounded-md focus:border-gray-300"
              />
            </div>

            <div>
              <div className="grid grid-cols-3 gap-4">
                {specs?.map((spec) => (
                  <div key={spec.specification_id}>
                    <label className="flex cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedDeviceSpecs.some(
                          (s) => s.specification_id === spec.specification_id
                        )}
                        onChange={(e) => handleSpecChange(e, spec)}
                      />
                      <span>{spec.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleSubmit(formData, selectedDeviceSpecs)}
                disabled={loading || !isFormValid()}
                className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:col-start-2 sm:text-sm ${
                  loading || !isFormValid()
                    ? 'bg-[#A8D08D] cursor-not-allowed'
                    : 'bg-[#77B634] hover:bg-[#66992B]'
                }`}
              >
                {loading ? <Spinner /> : 'Submit'}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:col-start-1 sm:mt-0 sm:text-sm"
                onClick={() => setIsAddModalOpen(false)}
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

      <Transition.Root show={isEditModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100]"
          initialFocus={cancelButtonRef}
          onClose={closeEditModal}
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

  <button
    type="button"
    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
    onClick={() => setIsEditModalOpen(false)}
    aria-label="Close"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>

  <div>
    <div className="flex justify-center items-center mb-3 w-full p-2">
      <h3 className="font-semibold text-lg">Update Device Type</h3>
    </div>

    <section className="p-2">
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 ml-1">Device Type Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-200 rounded-md focus:border-gray-300 cursor-text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 ml-1">Low Stock Limit</label>
          <input
            type="number"
            name="low_stock_limit"
            min="1"
            value={formData.low_stock_limit}
            onChange={(e) =>
              setFormData({ ...formData, low_stock_limit: parseInt(e.target.value, 10) })
            }
            className="w-full p-2 border border-gray-200 rounded-md focus:border-gray-300"
          />
        </div>

        <div>
          <div className="grid grid-cols-3 gap-4">
            {specs?.map((spec) => (
              <div key={spec.id}>
                <label className="flex cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedDeviceSpecs.some((s) => s.specification_id === spec.specification_id)}
                    onChange={(e) => handleSpecChange(e, spec)}
                  />
                  <span>{spec.name}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            onClick={handleEditSubmit}
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
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:col-start-1 sm:mt-0 sm:text-sm"
            onClick={() => setIsEditModalOpen(false)}
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

      <div className="flex flex-row items-center justify-end gap-4 mt-6">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${
            page === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>

       
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.ceil(total / limit) }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                page === index + 1
                  ? "bg-[#77B634] text-white" 
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page * limit >= total}
          className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${
            page * limit >= total ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>

        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Rows per page:
          </label>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const WrappedLanding = withAuth(DeviceTypes, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
