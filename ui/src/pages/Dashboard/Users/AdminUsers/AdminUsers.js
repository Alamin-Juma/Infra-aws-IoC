import React, { useState, useRef, useEffect } from 'react';
import { IoIosAdd } from "react-icons/io";
import { FaFileCsv } from "react-icons/fa6";
import { FaUserPlus } from "react-icons/fa";
import DataTable from '../../../../components/DataTable';
import withAuth from '../../../../utils/withAuth';
import MainLayout from '../../../../layouts/MainLayout';
import Spinner from '../../../../components/Spinner';
import api from '../../../../utils/apiInterceptor';
import UploadCSV from '../../../../components/UploadCSV';
import { toast } from 'react-toastify';
import LoadingTable from '../../../../components/LoadingTable';

const AdminUsers = () => {
  const [userList, setUserList] = useState([]);
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) // Basic email validation
    );
  };


  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal
  const closeModal = () => setIsModalOpen(false);

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

    try {
      const response = await api.post('/users', formData);
      const newUser = response.data; // Assuming the API returns the newly added user

      // Add the new user to the list
      addUser(newUser);

      // Reset the form
      setFormData({
        firstName: '',
        lastName: '',
        email: ''
      });

      toast.success('User added successfully');
      setTimeout(() => {
        closeModal();
        fetchUsers();
      }, 500);
    } catch (error) {
      toast.error('Error when adding user');
    } finally {
      setLoading(false);
    }
  };

  // Update state with the new user
  const addUser = (newUser) => {
    setUserList((prevUsers) => [...prevUsers, newUser]);
  };

  // Fetch users from the API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users?page=${page}&limit=${limit}`);
      setUserList(response.data.users); // Update user list
      setTotal(response.data.total); // Update total number of users
    } catch (error) {
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

  useEffect(() => {
    fetchUsers();
  }, [page, limit]);

  return (
    <div data-testid="main-container" className='w-full h-full'>
      <div className='h-[5rem] flex flex row w-full gap-4 justify-between'>
        <div className="form-control relative max-w-[30rem]">
          <input type="email" className="input input-lg max-w-full" placeholder="Search user..." />
        </div>
        <div className='flex flex-row gap-4'>
          <div>
            <label onClick={openModal} className="btn btn-primary bg-[#77B634]" htmlFor="modal-2">
              <FaUserPlus className='font-bold text-xl mr-2' /> Add Employee
            </label>
            <input ref={modalRef} className="modal-state" id="modal-2" type="checkbox" />
            {isModalOpen && (
              <div className="modal w-screen">
                <label className="modal-overlay" htmlFor="modal-2"></label>
                <div className="modal-content flex flex-col gap-5 min-w-[600px]">
                  <label htmlFor="modal-2" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                  <h2 className="text-xl">New User</h2>
                  <section className="bg-gray-2">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div className="w-full">
                        <label className="sr-only" htmlFor="firstName">First Name</label>
                        <input
                          className="input input-solid max-w-full"
                          placeholder="First Name"
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="w-full">
                        <label className="sr-only" htmlFor="lastName">Last Name</label>
                        <input
                          className="input input-solid max-w-full"
                          placeholder="Last Name"
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="w-full">
                        <label className="sr-only" htmlFor="email">Email</label>
                        <input
                          className="input input-solid max-w-full"
                          placeholder="Email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="rounded-lg btn text-white bg-[#77B634] btn-block"
                          disabled={loading || !isFormValid() }
                        >
                          {loading ? <Spinner /> : 'Add User'}
                        </button>
                      </div>
                    </form>
                  </section>
                </div>
              </div>
            )}
          </div>

          <div>
            <label onClick={openModal} className="btn outline outline-[#B6B634] hover:bg-gray-300" htmlFor="modal-3">
              <FaFileCsv className='font-bold text-[#B6B634] text-xl mr-2' /> Bulk Upload
            </label>
            <input ref={modalRef} className="modal-state" id="modal-3" type="checkbox" />
            {isModalOpen && (
              <div className="modal w-screen">
                <label className="modal-overlay" htmlFor="modal-3"></label>
                <div className="modal-content flex flex-col gap-5 min-w-[600px]">
                  <label htmlFor="modal-3" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                  <section className="bg-gray-2">
                    {/* Pass onClose and onAddUser to UploadCSV */}
                    <UploadCSV onClose={closeModal} onAddUser={addUser} />
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {loading && <LoadingTable />}
      {!loading && <DataTable data={userList} />}
      <div className="flex flex-row items-center justify-end gap-4 mt-6">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.ceil(total / limit) }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${page === index + 1
                ? 'bg-[#77B634] text-white' // Active page
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page * limit >= total}
          className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${page * limit >= total ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          Next
        </button>

        {/* Limit Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Users per page:
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

const WrappedLanding = withAuth(AdminUsers, false);
export default () => <MainLayout><WrappedLanding /></MainLayout>;
