import React, { useState } from 'react';
import MainLayout from '../../../layouts/MainLayout';
import withAuth from '../../../utils/withAuth';
import ModalWrapper from '../../../components/ModalWrapper';
import RepairRequestForm from '../../../components/RepairRequestForm';
import { useAuth } from '../../../context/AuthContext';
import { PERMISSION_CREATE_REPAIR_REQUEST } from '../../../constants/permissions.constants';
import RequestTable from "../../../components/RepairRequest/Tables/RequestTables";
import PageStats from "../../../components/RepairRequest/PageStats";

export const RepairRequestList = () => {
    const { userPermissions } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const [showRepairRequestModal, setShowRepairRequestModal] = useState(false);

    const handleCancel = () => {
        setShowRepairRequestModal(false);
    };

    const handleSuccess = () => {
        setShowRepairRequestModal(false);
        setRefreshKey((prev) => prev + 1);
    }

    return (
        <div className="p-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Repair Requests</h1>
                </div>
                {
                    userPermissions.includes(PERMISSION_CREATE_REPAIR_REQUEST.toUpperCase()) && <button onClick={() => setShowRepairRequestModal(true)}
                        className='bg-[#8BC34A] hover:bg-[#7CB342] text-white px-4 py-2 rounded-md font-medium transition-colors'>
                        Create New Request
                    </button>
                }
            </div>
            <PageStats />
            <RequestTable refreshKey={refreshKey} setRefreshKey={setRefreshKey} />
            <ModalWrapper isOpen={showRepairRequestModal} onClose={handleCancel} onCancel={handleCancel}>
                <RepairRequestForm onCancel={handleCancel} onSuccess={handleSuccess} />
            </ModalWrapper>
        </div>
    );
};

const WrappedRepairRequests = withAuth(RepairRequestList, false);

export default () => (
    <MainLayout>
        <WrappedRepairRequests />
    </MainLayout>
);
