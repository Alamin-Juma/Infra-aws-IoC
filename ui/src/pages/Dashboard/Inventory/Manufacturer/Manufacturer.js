import React, { useState, useRef, useEffect } from 'react';
import { FaPlus } from "react-icons/fa";
import withAuth from '../../../../utils/withAuth';
import MainLayout from '../../../../layouts/MainLayout';
import Spinner from '../../../../components/Spinner';
import api from '../../../../utils/apiInterceptor';
import { toast } from 'react-toastify';
import LoadingTable from '../../../../components/LoadingTable';
import Lottie from 'lottie-react';
import { formatDate } from '../../../../utils/formatDate';
import { IoTrashOutline } from "react-icons/io5";
import { BsPencilSquare } from "react-icons/bs";
import Swal from 'sweetalert2';

import animationData from '../../../../assets/lottie/no-data.json';
import Permission from '../../../../components/Permission';
import { PERMISSION_CREATE_MANUFACTURER, PERMISSION_DELETE_MANUFACTURER, PERMISSION_MANAGE_MANUFACTURER } from '../../../../constants/permissions.constants';

const Manufacturers = () => {
    const [manufacturersList, setList] = useState([]);
    const modalRef = useRef(null);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [manufacturer, setEditingManufacturer] = useState('');

    
    const openModal = () => {
        setError('');
        setFormData({name: ''})
        setIsModalOpen(true);
    }

   
    const closeModal = () => {
        setIsModalOpen(false);
    }
    const closeEditModal = () => setIsEditModalOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value.trimStart(), 
        });
    };   

    
    const isFormValid = () => {
        return (
            formData.name.trim() !== ''
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedName = formData.name.trim();
      
        if (!isFormValid()) return;
      
        const isDuplicate = manufacturersList.some(
          (manufacturer) => manufacturer.name.toLowerCase() === trimmedName.toLowerCase()
        );
      
        if (isDuplicate) {
          setError('Manufacturer already exists.');
          return;
        }
      
        setError('');
        setLoading(true);
      
        try {
          const payload = { name: trimmedName };
          const response = await api.post('/manufacturer', payload);
      
          addRecord(response.data);
          setFormData({ name: '' });
          toast.success('Manufacturer added successfully');
          closeModal();
        } catch (error) {
          const message =
            error?.response?.data?.error || 'Error adding manufacturer.';
          setError(message);
          toast.error(message);
        } finally {
          setLoading(false);
        }
      };
      
    
    const addRecord = (newManufacturer) => {
        setList((prevManufacturers) => 
            [...prevManufacturers, newManufacturer].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt) 
            )
        );
    };

    
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    
    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setPage(1);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/manufacturer?page=${page}&limit=${limit}`);
            
            const sortedManufacturers = response.data.manufacturers.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt) 
            );
    
            setTotal(response.data.total);
            setList(sortedManufacturers);
        } catch (error) {
            toast.error('could not fetch manufacturers')
        } finally {
            setLoading(false);
        }
    };  

    useEffect(() => {
        fetchData();
    }, [page, limit]);

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
      
          try {
            await api.delete(`/manufacturer/${id}`);
            Swal.close(); 
            fetchData();  
            toast.success('Manufacturer deleted successfully');
          } catch (error) {
            Swal.close(); 
            toast.error('Unable to delete manufacturer.');
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

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) return;
      
        setLoading(true);
      
        try {
          const payload = {
            name: formData.name.trim(),
          };
      
          const response = await api.put(`/manufacturer/${manufacturer.id}`, payload);
      
          const updatedManufacturer = response.data;
          updateRecord(updatedManufacturer);
      
          setFormData({ name: '' });
          setError('');
          toast.success('Manufacturer updated successfully');
      
          setTimeout(() => {
            setIsEditModalOpen(false);
          }, 500);
        } catch (error) {
          const message =
            error?.response?.data?.error || 'Error updating manufacturer';
          setError(message);
          toast.error(message);
        } finally {
          setLoading(false);
        }
      };
      
    return (
        <div data-testid="main-container" className='w-full h-full'>
            <div className='h-[5rem] flex flex-row w-full  gap-4 justify-between items-center'>
                <div className="flex items-center ">
                    <h4 className='font-bold text-xl ml-2'>Manufacturers</h4>
                </div>
                <div className='flex flex-row  gap-4'>
                    <div>
                        <Permission
                            allowedPermission={[PERMISSION_CREATE_MANUFACTURER]}
                        >
                            <label onClick={openModal} className="btn btn-primary bg-[#77B634]" htmlFor="modal-2">
                                <FaPlus className='text-l mr-2' /> Add Manufacturer
                            </label>
                        </Permission>
                        <input ref={modalRef} className="modal-state" id="modal-2" type="checkbox" />
                        {isModalOpen && (
                <div className="modal w-screen">
                    <label className="modal-overlay" htmlFor="modal-2"></label>
                    <div className="modal-content flex flex-col gap-5 min-w-[600px] relative">
                    
                   
                    <button
                        onClick={closeModal}
                        className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl"
                        aria-label="Close"
                    >
                        &times;
                    </button>

                    <div className="flex flex-row items-center justify-center mb-2 w-full p-2">
                        <h2 className="text-xl font-bold">New Manufacturer</h2>
                    </div>
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
                                                    className={`rounded-lg btn text-white bg-[#77B634] btn-block ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    disabled={!isFormValid() || loading}
                                                >
                                                    {loading ? <Spinner /> : 'Add Manufacturer'}
                                                </button>
                                            </div>
                                        </form>
                                    </section>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {loading && <LoadingTable />}
            {!loading && <div className="flex w-full overflow-x-auto">
                <table className="table-zebra table min-w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-sm">
                            <th className="px-6 py-3 text-left font-semibold">Manufacturer</th>
                            <th className="px-6 py-3 text-left font-semibold">Date Created</th>
                            <th className="px-6 py-3 text-left font-semibold">Actions</th>
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
                            
                            manufacturersList.map((user) => (
                                <tr key={user.id} className="border border-gray-300">
                                    <td className="px-6 py-3">{user.name}</td>
                                    <td className="px-6 py-3">{formatDate(user.createdAt)}</td>
                                    <td>
                                        <div className="dropdown">
                                            <Permission
                                                allowedPermission={[PERMISSION_MANAGE_MANUFACTURER]}
                                            >
                                                <label onClick={() => handleEditClick(user)} className="btn tooltip tooltip-top btn-sm bg-transparent hover:bg-gray-300 hover:text-white" data-tooltip="Edit Manufacturer" tabIndex={0}><BsPencilSquare className='text-[#E3963E] text-lg' /></label>
                                            </Permission>

                                            <Permission
                                                allowedPermission={[PERMISSION_DELETE_MANUFACTURER]}
                                            >
                                                <label onClick={() => deleteManufacturer(user.id)} className="btn tooltip tooltip-top btn-sm bg-transparent hover:bg-gray-300 hover:text-white mr-2" data-tooltip="Delete Manufacturer" tabIndex={0}><IoTrashOutline className='text-red-600 text-lg' /></label>
                                            </Permission>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}

                    </tbody>
                </table>
                {isEditModalOpen &&
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <label className="modal-overlay" htmlFor="modal-2"></label>
                        <div className="modal-content flex flex-col gap-5 min-w-[600px]">
                            <button
                                onClick={closeEditModal}
                                className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl"
                                aria-label="Close"
                            >
                                &times;
                            </button>
                                
                            <div className='flex items-center justify-center'>
                                <h2 className="text-xl font-bold">Edit Manufacturer</h2>
                            </div>
                            <section className="bg-gray-2">
                                <form className="space-y-4" onSubmit={handleUpdateSubmit}>
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

                                    <div className="mt-4 flex items-center justify-evenly">
                                        <button
                                            type="submit"
                                            className={`btn w-44 px-10 py-3 text-lg rounded-lg text-white font-semibold transition duration-300 ease-in-out bg-gray-400  opacity-50`}
                                            onClick={closeEditModal}
                                        >
                                            {loading ? <Spinner /> : 'cancel'}
                                        </button>
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
                }
            </div>}
            <div className="flex flex-row items-center justify-end gap-4 mt-6">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    Previous
                </button>

               
                <div className="flex items-center gap-2">
                    {Array.from({ length: Math.ceil(total / limit) }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${page === index + 1
                                ? 'bg-[#77B634] text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

                
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page * limit >= total}
                    className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${page * limit >= total ? 'opacity-50 cursor-not-allowed' : ''
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
}

const WrappedLanding = withAuth(Manufacturers, false);
export default () => <MainLayout><WrappedLanding /></MainLayout>;
