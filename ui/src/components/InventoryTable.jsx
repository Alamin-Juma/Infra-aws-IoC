import React, { useState, useRef, Fragment } from 'react';
import Lottie from 'lottie-react';
import { IoTrashOutline } from "react-icons/io5";
import { BsPencilSquare } from "react-icons/bs";
import animationData from '../assets/lottie/no-data.json';
import Swal from 'sweetalert2';
import api from '../utils/apiInterceptor';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import { FaEye } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Spinner from './Spinner';
import { toPascalCase } from '../utils/toPascalCase';



const InventoryTable = ({ data = [], deviceTypeList = [], manufacturers = [], onDeviceUpdate }) => {

  const [loading, setLoading] = useState(false);
  const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState(1);
  const [selectedManuId, setSelectedManuId] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filteredSpecs, setFilteredSpecs] = useState([]);
  const [selectedDeive, setSelectedDevice] = useState({});
  const [selectedDeviceSpecs, setSelectedDeviceSpecs] = useState({});
  const [formData, setFormData] = useState({
    serialNumber: "",
    deviceType: "",
    manufacturerId: "",
    deviceSpecifications: "",
    specifications: {},
  });


  const closeEditModal = () => setIsEditModalOpen(false);

  const cancelButtonRef = useRef(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const isFormValid = () => {
    return (
      formData.serialNumber.trim() !== '' &&
      formData.manufacturerId.trim() !== ''
    );
  };

  const isNumber = (value) => {
    const numberRegex = /^\d+$/;
    return numberRegex.test(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const currentManufacturer = manufacturers.filter((m) => m.name.toLowerCase() === (formData.manufacturerId.trim()).toLowerCase())
    const currentDeviceType = deviceTypeList.filter((d) => d.name.toLowerCase() === (formData.deviceType.trim()).toLowerCase())

    const payload = {
      serialNumber: formData.serialNumber.trim(),
      deviceTypeId: currentDeviceType[0].id,
      manufacturerId: currentManufacturer[0].id,
      deviceSpecifications: 1,
      specifications: formData.specifications,
    };


    try {
      const res = await api.put(`/api/devices/${selectedDeive.id}`, payload);


      if (res.status === 200) {
        setIsEditModalOpen(false);

        setTimeout(() => {
          toast.success("Device updated successfully!");
          setFormData({
            serialNumber: "",
            deviceType: "",
            manufacturerId: "",
            deviceConditionId: "",
            deviceStatusId: "",
          })

          if (onDeviceUpdate) {
            onDeviceUpdate();
          }
        }, 200)
      }
      else {
        Swal.fire({
          title: 'Error!',
          confirmButtonColor: '#77B634',
          text: "Failed to update device",
          icon: 'error',
        });
      }

    } catch (error) {
      Swal.fire({
        title: 'Error!',
        confirmButtonColor: '#77B634',
        text: error.response?.data?.message || "Failed to update device",
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleEditDevice = (device) => {
    setIsEditModalOpen(true);

    // Initialize selectedDeviceSpecs with the device's specifications
    setSelectedDeviceSpecs(device.specifications);


    const mySpecs = device.deviceType.specifications;
    setFilteredSpecs(JSON.parse(mySpecs));

    setSelectedDevice(device);

    setFormData({
      serialNumber: device.serialNumber,
      deviceType: device.deviceType.name,
      manufacturerId: device.manufacturer.name,
      deviceSpecifications: "",
      specifications: device.specifications,
    });
  };


  const deleteDevice = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will remove this device from the devices record!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#77B634',
        cancelButtonColor: '#494848',
        confirmButtonText: 'Yes, delete it!',
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'Deleting...',
        text: 'Please wait while the device is being deleted.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await api.delete(`/api/devices/${id}`);
      if (response.status === 200 || response.status === 204) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Device deleted successfully.',
          icon: 'success',
          timer: 2000,
          confirmButtonColor: '#77B634',
          showConfirmButton: false,
        });

        onDeviceUpdate();
      } else {
        throw new Error('An error occurred while deleting the device.');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        confirmButtonColor: '#77B634',
        text: error.response?.data?.error || 'You cannot delete a device currently assigned to a user.',
        icon: 'error',
      });
    }
  };

  const handleSpecChange = (e, field) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // Update formData.specifications
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: newValue,
      },
    }));

    // Update selectedDeviceSpecs
    setSelectedDeviceSpecs((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  return (
    <div className="flex w-full overflow-x-auto">
      <table className="table-zebra table border-collapse border border-gray-200">
        <thead>
          <tr>
            <th className='font-bold'>Serial No.</th>
            <th>Manufacturer</th>
            <th>Type</th>
            <th>Status</th>
            <th>Condition</th>
            <th className='flex w-full items center flex-row'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr className='w-full'>
              <td colSpan="5" className="text-center w-full">
                <div className="flex flex-col items-center justify-center">
                  <Lottie animationData={animationData} loop={true} className="h-40" />
                  <span className="text-gray-600 text-lg font-semibold">No Data</span>
                </div>
              </td>
            </tr>
          ) : (
            // Render the table rows if data exists
            data.map((user) => (
              <tr key={user.id}>
                <td>{user.serialNumber}</td>
                <td>{user.manufacturer.name}</td>
                <td>{user.deviceType.name.charAt(0).toUpperCase() + user.deviceType.name.slice(1)}</td>
                <td>
                  {user.deviceStatus.name === 'available' && <span className="badge badge-primary">Available</span>}
                  {user.deviceStatus.name === 'assigned' && <span className="badge badge-success">Assigned</span>}
                  {user.deviceStatus.name === 'decommissioned' && <span className="badge">Decommissioned</span>}

                </td>
                <td>
                  {user.deviceCondition.name === 'Good' && <span className="badge badge-success">Good</span>}
                  {user.deviceCondition.name === 'Broken' && <span className="badge badge-warning">Broken</span>}
                  {user.deviceCondition.name === 'Lost' && <span className="badge badge-secondary">Lost</span>}
                  {user.deviceCondition.name === 'Decommissioned' && <span className="badge badge-flat-error">Decommissioned</span>}
                </td>
                <td>
                  <div className="flex flex-row gap-2">
                    <Link
                      data-test="viewDeviceDetails" 
                      to={`/app/inventory/device-details/${user.id}`}
                      className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white"
                      data-tooltip="View Details"
                      tabIndex="0"
                    >
                      <FaEye className='text-[#0047ab] text-lg' />
                    </Link>
                    <label
                      data-test="editDeviceDetails" 
                      onClick={() => handleEditDevice(user)}
                      className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white"
                      data-tooltip="Edit Details"
                      tabIndex="0"
                    >
                      <BsPencilSquare className='text-[#E3963E] text-lg' />
                    </label>
                    {(user.deviceStatus.name !== 'assigned' && (user.assignedUser === '' || user.assignedUser === null) && user.deviceActivities?.length === 0) && <label
                      onClick={() => deleteDevice(user.id)}
                      className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white"
                      data-tooltip="Delete Device"
                      tabIndex="0"
                    >
                      <IoTrashOutline className='text-red-600 text-lg' />
                    </label>}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Transition.Root show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-[100]" initialFocus={cancelButtonRef} onClose={closeEditModal}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                  style={{ maxWidth: "700px" }}>
                  <div className=''>
                    <div className='flex flex-row items-cente justify-center mb-3 w-full p-2'>
                      <h3 className='font-bold text-lg'>Edit Device Details</h3>
                    </div>
                    <section className="p-2">
                      <form className="space-y-4">
                        {/* Device Type and Serial Number */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="w-full">
                            <label htmlFor="deviceType" className="font-medium text-gray-700">
                              Device Type
                            </label>
                            <select
                              name="deviceType"
                              value={formData.deviceType}
                              onChange={handleChange}
                              disabled
                              className="select select-solid w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">__Select__</option>
                              {deviceTypeList.map((d) => (
                                <option key={d.id} value={d.name}>
                                  {toPascalCase(d.name)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-full">
                            <label htmlFor="serialNumber" className="font-medium text-gray-700">
                              Serial Number
                            </label>
                            <input
                              data-test="serialNumberInput"
                              name="serialNumber"
                              value={formData.serialNumber}
                              onChange={handleChange}
                              className="input input-solid w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              type="text"
                            />
                          </div>
                        </div>

                        {/* Manufacturer and Device Condition */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="w-full">
                            <label htmlFor="manufacturer" className="font-medium text-gray-700">
                              Manufacturer
                            </label>
                            <select
                              name="manufacturerId"
                              value={formData.manufacturerId}
                              onChange={handleChange}
                              className="select select-solid w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">__Select__</option>
                              {manufacturers.map((m) => (
                                <option key={m.id} value={m.name}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>

                        </div>



                        <div className="divider divider-horizontal">Specifications</div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          {filteredSpecs.map((field) => (
                            <div key={field.specification_id} className="w-full">
                              {/* Label */}
                              <label htmlFor={field.name} className="block font-medium text-gray-700 mb-1">
                                {field.name}
                              </label>

                              {/* Input Field */}
                              {field.fieldType === "text" && (
                                <input
                                  type="text"
                                  id={field.name}
                                  name={field.name}
                                  value={selectedDeviceSpecs[field.name] || ''}
                                  onChange={(e) => handleSpecChange(e, field)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              )}

                              {/* Select Field */}
                              {field.fieldType === "select" && (
                                <select
                                  id={field.name}
                                  name={field.name}
                                  onChange={(e) => handleSpecChange(e, field)}
                                  value={selectedDeviceSpecs[field.name] || ''}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select an option</option>
                                  {field.selectOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {/* Checkbox Field */}
                              {field.fieldType === "checkbox" && (
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={field.name}
                                    name={field.name}
                                    checked={selectedDeviceSpecs[field.name] || false}
                                    onChange={(e) => handleSpecChange(e, field)}
                                    className="w-5 h-5 border border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <label htmlFor={field.name} className="ml-2 text-gray-700">
                                    {field.name}
                                  </label>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>



                        {/* Buttons */}
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            data-test="editDeviceDetailsButton"
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !isFormValid()}
                            className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:col-start-2 sm:text-sm ${loading || !isFormValid()
                              ? 'bg-[#A8D08D] cursor-not-allowed'
                              : 'bg-[#77B634] hover:bg-[#66992B]'
                              }`}
                          >
                            {loading ? <Spinner /> : 'Submit'}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-100 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:col-start-1 sm:mt-0 sm:text-sm"
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
    </div>
  )
}

export default InventoryTable;
