import React, { useState, Fragment, useRef } from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/lottie/no-data.json';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { toPascalCase } from '../utils/toPascalCase';

const AssignmentHistoryTable = ({ data = [] }) => {
    const [history, setHistory] = useState(data);
    const cancelButtonRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        roleName: ''
    });

    const formatDate = (dateString) => {
        if (!dateString || isNaN(new Date(dateString))) {
            return 'Invalid Date';
        }
        return format(new Date(dateString), 'MM/dd/yy');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };


    return (
        <div className="flex w-full overflow-x-auto">
            <table className="table-zebra table border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th>Device Type</th>
                        <th>Serial No.</th>
                        <th>Manufacturer</th>
                        <th>Assigned User</th>
                        <th>Assignment Date</th>
                        <th>Performed By</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <Lottie animationData={animationData} loop={true} className="h-40" />
                                    <span className="text-gray-600 text-lg font-semibold">No Data</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((user) => (
                            <tr key={user.serialNumber}>
                                <td>{toPascalCase(user.deviceType)}</td>
                                <td>{user.serialNumber}</td>
                                <td>{toPascalCase(user.manufacturer)}</td>
                                <td>{user.assignedUser}</td>
                                <td>{formatDate(user.activityDate)}</td>
                                <td>{user.performedBy}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>


        </div>
    );
};

export default AssignmentHistoryTable;
