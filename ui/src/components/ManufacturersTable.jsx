import React, { useState } from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/lottie/no-data.json';
import { formatDate } from '../utils/formatDate';
import Swal from 'sweetalert2';
import { IoTrashOutline } from "react-icons/io5";
import { BsPencilSquare } from "react-icons/bs";
import api from '../utils/apiInterceptor';
import Spinner from './Spinner';

const ManufacturersTable = ({ data = [] }) => {

  const [manufacturersList, setList] = useState(data);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [manufacturer, setEditingManufacturer] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });

  // Function to close the modal
  const closeModal = () => setIsEditModalOpen(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const isFormValid = () => {
    return (
      formData.name !== ''
    );
  };

  const deleteManufacturer = async (id) => {

    const result = await Swal.fire({
      title: 'Confirm Deletion?',
      text: 'Are you sure you want to delete this manufacturer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#77B634',
      cancelButtonColor: '#494848',
      confirmButtonText: 'Yes',
    });

    if (result.isConfirmed) {
      Swal.showLoading();
      const response = await api.delete(`/manufacturer/${id}`);
      if (response) {
        setList((prevData) => prevData.filter((manufacturer) => manufacturer.id !== id));

        toast.success('Manufacturer deleted successfully');
      }
      else {
        Swal.hideLoading();
        toast.error('Sorry, Unable to delete user');
      }
    }

  };

  const handleEditClick = (manufacturer) => {
    setIsEditModalOpen(true);
    setEditingManufacturer(manufacturer);
    setFormData({
      ...formData,
      ['name']: manufacturer.name,
    });

  };

  const updateRecord = (updatedManufacturer) => {
    setList((prevManufacturers) =>
      prevManufacturers.map((manufacturer) =>
        manufacturer.id === updatedManufacturer.id ? updatedManufacturer : manufacturer
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name
      };
      const response = await api.put(`/manufacturer/${manufacturer.id}`, payload);
      setError('');
      if (response.status === 200) {
        const updatedManufacturer = response.data;

        updateRecord(updatedManufacturer);

        setFormData({
          name: ''
        });

        toast.success('Manufacturer updated successfully');
        setTimeout(() => {
          closeModal();
        }, 500);
      } else if (response.status === 409) { //duplicate records
        toast.error("Failed! Manufacturer already exists.");
        setError('Manufacturer already exists.');
      } else {
        toast.error('Error updating manufacturer');
      }
    } catch (error) {
      if (error.status === 409) {
        toast.error('Manufacturer already exists.');
        setError('Manufacturer already exists.');
      } else {
        toast.error('Error updating manufacturer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full overflow-x-auto">
      <table className="table-zebra table min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
            <th className="px-6 py-3 text-left font-semibold">Manufacturer</th>
            <th className="px-6 py-3 text-left font-semibold">Date Created</th>
            <th className="px-6 py-3  text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {manufacturersList.length === 0 ? (
            <tr >
              <td colSpan="4" className="text-center">
                <div className="flex flex-col items-center justify-center">
                  <Lottie animationData={animationData} loop={true} className="h-40" />
                  <span className="text-gray-600 text-lg font-semibold">No Data</span>
                </div>
              </td>
            </tr>
          ) : (
            // Render the table rows if data exists
            manufacturersList.map((user) => (
              <tr key={user.id} className="border border-gray-300">
                <td className="px-6 py-3">{user.name}</td>
                <td className="px-6 py-3">{formatDate(user.createdAt)}</td>
                <td>
                  <div className="dropdown">
                    <label onClick={() => handleEditClick(user)} className="btn tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white mr-2" data-tooltip="Edit Manufacturer" tabIndex={0}><BsPencilSquare className='text-[#77B634]' /></label>
                    <label onClick={() => deleteManufacturer(user.id)} className="btn tooltip tooltip-top btn-sm hover:bg-gray-300 hover:text-white mr-2" data-tooltip="Delete Manufacturer" tabIndex={0}><IoTrashOutline className='text-red-600' /></label>
                  </div>
                </td>
              </tr>
            ))
          )}

        </tbody>
      </table>
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <label className="modal-overlay" htmlFor="modal-2"></label>
          <div className="modal-content flex flex-col gap-5 min-w-[600px]">
            {/* <label htmlFor="modal-2" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label> */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
            <h2 className="text-xl">Edit Manufacturer</h2>
            <section className="bg-gray-2">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && <div className="mb-4 alert alert-error" >
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z" fill="#E92C2C" />
                  </svg>
                  <div className="flex flex-col">
                    <span>Error!</span>
                    <span className="text-content2">{error}</span>
                  </div>
                </div>}
                <div className="w-full">
                  <label htmlFor="roleName" className="block text-gray-700 font-medium mb-1"> Manufacturer <span className="text-red-500">*</span></label>
                  <input
                    className="input input-solid max-w-full"
                    placeholder="Name of Manufacturer"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className={`btn w-44 px-10 py-3 text-lg rounded-lg text-white font-semibold transition duration-300 ease-in-out
    ${isFormValid() ? 'bg-[#77B634] hover:bg-[#66982A] shadow-md' : 'bg-gray-400 cursor-not-allowed opacity-50'}`}
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? <Spinner /> : 'Update'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManufacturersTable;
