import React, { useState, useEffect } from 'react';
import withAuth from '../../../../utils/withAuth';
import MainLayout from '../../../../layouts/MainLayout';
import api from '../../../../utils/apiInterceptor';
import { toast } from 'react-toastify';
import LoadingTable from '../../../../components/LoadingTable';
import { MdOutlinePlaylistAdd } from "react-icons/md";
import SpecsTable from '../../../../components/SpecsTable';
import AddSpecsModal from '../../../../components/AddApecsModal';
import Pagination from '../../../../components/Pagination';
import Permission from '../../../../components/Permission';
import { PERMISSION_CREATE_DEVICE_SPEC } from '../../../../constants/permissions.constants';

const SpecificationsPage = () => {
    const [roleList, setRoleList] = useState([]);
    const [page, setPage] = useState(1);
    const [apiError, setApiError] = useState('');
    const [limit, setLimit] = useState(100);
    const [addOptions, setAddOptions] = useState(false);
    const [isAddSpecsModalOpen, setIsAddSpecsModalOpen] = useState(false);
    const [selectOptions, setSelectOptions] = useState([]);
    const [total, setTotal] = useState(0);
    const [formData, setFormData] = useState({
        specName: '',
        fieldType: ''
    });
    const [loading, setLoading] = useState(false);

    const closeAddAddSpecsModal = () => {
        setIsAddSpecsModalOpen(false);
    };

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

    const handleSpecsUpdate = () => {
        fetchSpecs();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setLoading(true);

        try {
            const payload = {
                name: formData.specName.trim(),
                fieldType: formData.fieldType.trim(),
                selectOptions: selectOptions
            };

            const response = await api.post('/api/specifications', payload);
            const newUser = response.data;


           
            addUser(newUser);

           
            setFormData({
                specName: '',
                fieldType: ''
            });

            closeAddAddSpecsModal();
            setTimeout(() => {
                
            toast.success('Specification added successfully');

            handleSpecsUpdate();
            }, 100);
        } catch (error) {
            setApiError(error?.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

   
    const addUser = (newRole) => {
        setRoleList((prevRoles) => [...prevRoles, newRole]);
    };

    
    const fetchSpecs = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/specifications?page=${page}&limit=${limit}`);
            setRoleList(response.data.data);
            setTotal(response.data.total)
        } catch (error) {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

  
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    
    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setPage(1);
    };

    const handleTagsChange = (tags) => {
        setSelectOptions(tags);
    };

    useEffect(() => {
        fetchSpecs();
    }, []);

    return (
        <div data-testid="main-container" className='w-full h-full'>
            <div className='h-[5rem] flex  items-center row w-full gap-4 justify-between'>
                <div className="flex items-center justify-center">
                    <h4 className='font-bold text-xl ml-2 flex items-center justify-center'>Specifications</h4>
                </div>
                <div className='flex flex-row gap-4'>
                    <div>
                        <Permission
                            allowedPermission={[PERMISSION_CREATE_DEVICE_SPEC]}
                        >
                            <button onClick={() => setIsAddSpecsModalOpen(true)} className="btn btn-primary bg-[#77B634]" htmlFor="modal-2">
                                <MdOutlinePlaylistAdd className='font-bold text-xl mr-2' /> Add Specification
                            </button>
                            <AddSpecsModal
                                isEditUserModalOpen={isAddSpecsModalOpen}
                                closeAddUserModal={closeAddAddSpecsModal}
                                formData={formData}
                                addOptions={addOptions}
                                apiError={apiError}
                                setAddOptions={setAddOptions}
                                handleChange={handleChange}
                                selectOptions={selectOptions}
                                handleSubmit={handleSubmit}
                                isFormValid={isFormValid}
                                handleTagsChange={handleTagsChange}
                                loading={false}
                                handleSpecsUpdate={handleSpecsUpdate}
                            />
                        </Permission>
                    </div>
                </div>
            </div>
            {loading && <LoadingTable />}
            {!loading && <SpecsTable data={roleList} handleTagsChange={handleTagsChange} updatedTags={selectOptions} onUpdateSpecs={handleSpecsUpdate} selectOptions={selectOptions} />}
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

const WrappedLanding = withAuth(SpecificationsPage, false);
export default () => <MainLayout><WrappedLanding /></MainLayout>;

