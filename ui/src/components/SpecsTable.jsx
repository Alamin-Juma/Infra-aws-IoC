import React, { useState, useRef, Fragment } from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/lottie/no-data.json';
import { IoTrashOutline } from "react-icons/io5";
import { BsPencilSquare } from "react-icons/bs";
import api from '../utils/apiInterceptor';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import MultiValueInput from './MultiValueInput';
import { toSentenceCase } from '../utils/toSentenceCase';
import Permission from './Permission';
import { PERMISSION_CREATE_DEVICE_SPEC } from '../constants/permissions.constants';

const SpecsTable = ({ data = [], handleTagsChange, updatedTags = [], selectOptions = [], onUpdateSpecs }) => {
  const [users, setUsers] = useState(data);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [options, setOptions] = useState([]);
  const [addOptions, setAddOptions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const cancelButtonRef = useRef(null);

  const openEditModal = (user) => {
    setIsEditModalOpen(true);

    setSelectedUserId(user.specification_id);

    if (user.selectOptions.length > 0) {
      setAddOptions(true);
      if (updatedTags.length === 0) {
        setOptions(user.selectOptions);
      }
      else {
        setOptions(updatedTags)
      }

    }
    else {
      setAddOptions(false);
    }
    setFormData({
      specName: user.name || '',
      fieldType: user.fieldType || ''
    });
  };
  const closeEditModal = () => setIsEditModalOpen(false);



  const [formData, setFormData] = useState({
    specName: '',
    fieldType: ''
  });

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'fieldType' && value === 'select') {
      setAddOptions(true);
    }
    else {
      setAddOptions(false);
    }
  };

 
  const isFormValid = () => {
    return (
      formData.specName.trim() !== '' &&
      formData.fieldType.trim() !== ''
    );
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const payload = {
        name: formData.specName.trim(),
        fieldType: formData.fieldType.trim(),
        selectOptions: selectOptions,
      };
  
      await api.put(`/api/specifications/${selectedUserId}`, payload);
  
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.specification_id === selectedUserId ? { ...user, ...formData } : user
        )
      );
  
      setFormData({
        specName: '',
        fieldType: '',
      });
  
      onUpdateSpecs();
      toast.success('Specification updated successfully.');
      closeEditModal();
      
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to update specification.');
    } finally {
      setLoading(false);
    }
  };
  


  const deleteUser = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will remove it from the specifications list!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#77B634',
        cancelButtonColor: '#494848',
        confirmButtonText: 'Yes, delete it!',
      });
  
      if (!result.isConfirmed) return;
  
      Swal.fire({
        title: 'Deleting...',
        text: 'Please wait while the specs is being deleted.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      await api.delete(`/api/specifications/${id}`);
  
      setUsers((prevData) =>
        prevData.filter((user) => user.specification_id !== id)
      );
  
      Swal.fire({
        title: 'Deleted!',
        text: 'Specification deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        confirmButtonColor: '#77B634',
        text: error.response?.data?.error || 'An error occurred while deleting this specification.',
        icon: 'error',
      });
    }
  };
  


  return (
    <div className="flex w-full overflow-x-auto">
      <table className="table-zebra table border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm">
            <th className="px-6 py-3  text-left font-bold">Label</th>
            <th className="px-6 py-3 text-left font-bold">Field Type</th>
            <th className="px-6 py-3 text-left font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                <div className="flex flex-col items-center justify-center">
                  <Lottie animationData={animationData} loop={true} className="h-40" />
                  <span className="text-gray-600 text-lg font-semibold">No Data</span>
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.specification_id}>
                <td>{user.name}</td>
                <td>{user?.fieldType.charAt(0).toUpperCase() + user?.fieldType.slice(1)}</td>
                <td>
                  <div className="flex flex-row gap-2">
                    <Permission
                      allowedPermission={[PERMISSION_CREATE_DEVICE_SPEC]}
                    >
                      <label
                        onClick={() => openEditModal(user)}
                        className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white"
                        data-tooltip="Edit Specification"
                        tabIndex="0"
                      >
                        <BsPencilSquare className='text-[#E3963E] text-lg' />
                      </label>
                    </Permission>
                    
                    <Permission
                      allowedPermission={[PERMISSION_CREATE_DEVICE_SPEC]}
                    >  
                      <label
                        onClick={() => deleteUser(user.specification_id)}
                        className="btn bg-transparent tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white"
                        data-tooltip="Delete Specification"
                        tabIndex="0"
                      >
                        <IoTrashOutline className='text-red-600 text-lg' />
                      </label>
                    </Permission>
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
                    <button
                      onClick={closeEditModal}
                      className="absolute top-1 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                      aria-label="Close modal"
                    >
                      &times;
                    </button>  
                  <div className=''>
                    <div className='flex flex-row items-center justify-center mb-3 w-full p-2'>
                      <h3 className='font-bold text-lg'>Edit Specification</h3>
                    </div>
                    <section className="p-2">
                      <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="form-field">
                          <label className="form-label">Specification Name</label>

                          <input placeholder="E.g. RAM"
                            id="specName"
                            name="specName"
                            value={formData.specName}
                            onChange={handleChange}
                            className="input input-solid max-w-full" />
                        </div>

                        <div className="form-field">
                          <label className="form-label">
                            Field Type
                          </label>
                          <select
                            className="select select-solid max-w-full"
                            id="fieldType"
                            name="fieldType"
                            value={formData.fieldType}
                            onChange={handleChange}
                            disabled
                          >
                            <option value=""></option>
                            <option value="text">Text</option>
                            <option value="select">Select</option>
                          </select>
                        </div>

                        {
                          addOptions && (
                            <div>
                              <label className="form-label mb-1">
                                Select Options
                              </label>
                              <MultiValueInput
                                placeholder="Add option..."
                                onChange={handleTagsChange}
                                existingTags={options}
                              />
                            </div>
                          )
                        }


                        <div className="mt-4 flex gap-4">
                          <button
                            onClick={closeEditModal}
                            type="button"
                            className="rounded-lg btn btn-block"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !isFormValid()}
                            className={`rounded-lg btn bg-[#77B634] btn-block ${loading ? 'btn-loading' : 'btn-primary'}`}
                          >
                            Submit
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

export default SpecsTable;
