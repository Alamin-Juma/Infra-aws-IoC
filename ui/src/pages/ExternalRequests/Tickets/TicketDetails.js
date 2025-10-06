import React, { useState, useEffect, useContext } from "react";
import { FaMicrochip, FaMemory, FaHdd, FaGamepad, FaBatteryFull, FaLaptopCode, FaWeightHanging, FaCamera, FaPlug, FaTv, FaIndustry, FaBarcode, FaTags, FaWifi, FaHistory, FaUserCheck, FaWrench, FaTimes } from "react-icons/fa";
import { MdDevices } from "react-icons/md";
import withAuth from '../../../utils/withAuth';
import MainLayout from '../../../layouts/MainLayout';
import config from '../../../configs/app.config';
import { useParams, Link} from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";
import api from "../../../utils/apiInterceptor";
import LoadingTable from "../../../components/LoadingTable";
import Swal from "sweetalert2";
import { toast } from 'react-toastify';
import { toSentenceCase } from "../../../utils/toSentenceCase";
import { toPascalCase } from "../../../utils/toPascalCase";
import { io } from "socket.io-client";
import { NotificationProvider as NotificationContext } from "../../../context/NotificationProvider";
import Permission from "../../../components/Permission";
import { PERMISSION_MANAGE_EXTERNAL_REQUEST } from "../../../constants/permissions.constants";
const API_BASE_URL = config.API_BASE_URL;
const FRONTEND_URL = window.location.hostname.includes('localhost') ? 'http://localhost:3000' : config.FRONTEND_URL_PROD;
const socket = io(API_BASE_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 10000,
});

export const TicketDetails = ({ data = [] }) => {

    const { id } = useParams();
    const notifications =NotificationContext ? useContext(NotificationContext)?.notifications : undefined;
    const [users, setUsers] = useState([]);

    const iconMap = {
        processor: <FaMicrochip className="inline text-[#77B634] mr-2" />,
        ram: <FaMemory className="inline text-[#77B634] mr-2" />,
        storage: <FaHdd className="inline text-[#77B634] mr-2" />,
        display: <FaTv className="inline text-[#77B634] mr-2" />,
        graphics: <FaGamepad className="inline text-[#77B634] mr-2" />,
        battery: <FaBatteryFull className="inline text-[#77B634] mr-2" />,
        os: <FaLaptopCode className="inline text-[#77B634] mr-2" />,
        weight: <FaWeightHanging className="inline text-[#77B634] mr-2" />,
        camera: <FaCamera className="inline text-[#77B634] mr-2" />,
        connectivity: <FaWifi className="inline text-[#77B634] mr-1" />,
        ports: <FaPlug className="inline text-[#77B634] mr-2" />
    };

    const ticketStatus = [
        config.TICKET_STATUS.PENDING,
        config.TICKET_STATUS.ASSIGNED,
        config.TICKET_STATUS.IN_PROGRESS,
        config.TICKET_STATUS.COMPLETED
    ];

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [tempSelectedStatus, setTempSelectedStatus] = useState(""); 
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignedUser, setAssignedUser] = useState("");
    const [selectedUser, setSelectedUser] = useState(null); 
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsersList, setFilteredUsers] = useState([]);
    const [deviceHistory] = useState([])
    const [ticketDetails, setTicketDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [assignmentNote, setAssignmentNote] = useState("");
    const [notesLoading, setNotesLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingNoteIndex, setEditingNoteIndex] = useState(null);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [reassignSelectedUser, setReassignSelectedUser] = useState(null);
    const [reassignSearchQuery, setReassignSearchQuery] = useState('');    
    const [reassignIsOpen, setReassignIsOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(API_BASE_URL + `/users?page=${1}&limit=${1000}`);
                const data = await response.json();
                const filteredUsers = (data.users || []).filter(user => user.roleName !== "employee");
                setUsers(filteredUsers);
            } catch (error) {
                throw new Error('Error getting users: ' + error);
            }
        };

        fetchUsers();
        fetchTicketDetails();
    }, [id]);

    useEffect(() => {
        if (notifications && notifications.length > 0) {
            const latest = notifications[notifications.length - 1];
            if (!latest.read) {
                toast.info(latest.message);
            }
        }
    }, [notifications]);

    const fetchTicketDetails = async () => {
        try {
            const response = await api.get(`externalRequest/${id}`);         
            if (response.data?.success) {                
                setTicketDetails(response?.data?.data);
                setSelectedUser(response.data?.data?.assignee);
                setAssignedUser(`${response.data?.data?.assignee?.firstName} ${response.data?.data?.assignee?.lastName}`);
                setSelectedStatus(getStatusName(response.data.data?.requestStatus));
                setTempSelectedStatus(getStatusName(response.data.data?.requestStatus));
            } else {
                toast.error(response.data?.data?.message);
            }
        } catch (error) {
            toast.error('Ticket details could not be loaded: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
   
    const getStatusName = (key) => {
        const status = ticketStatus.find((item) => item.key === key);
        return status ? status.name : "";
    };

    const fetchUsers = async (user) => {
        try {
            const response = await api.get(`/users/api/filter`, {
                params: {
                    page: 1,
                    limit: 50,
                    keyword: user,
                    roleName: '',
                },
            });

            const filteredUsers = (response.data.users || []).filter(user => user.roleName !== config.ROLES.EMPLOYEE);
            setFilteredUsers(filteredUsers);
        } catch (error) {
            toast.error('Failed to fetch users: ' + error.message);
            throw new Error('An error occurred when fetching users.');
        }
    };

    const handleSearchUser = (val) => {
        setSearchQuery(val);
        fetchUsers(val);
        setIsOpen(true);
    }

    
    const getInitials = (firstName, lastName) => {
        if (lastName && firstName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }

    };
    
    const getColorFromId = (id) => {
        const colors = ["bg-blue-500", "bg-green-500", "bg-red-500", "bg-yellow-500", "bg-purple-500"];
        return colors[id % colors.length];
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setIsOpen(false);
    };
   
    const sendNotificationToAllUsers = async (message, type) => {
        try {
            const response = await fetch(API_BASE_URL + `/users?page=1&limit=1000`);
            const data = await response.json();
            if (Array.isArray(data.users)) {
                const recipientIds = data.users
                    .filter(user => user.roleName !== "employee")
                    .map(user => user.id);
                if (recipientIds.length > 0) {
                    const ticketId = ticketDetails.ticketTrails?.[0]?.ticketId || id;
                    const tkId = ticketDetails.ticketTrails?.[0]?.id;
                    let notificationType = 'ticket';
                    let notificationMessage = message;
                    let notificationAction = type;

                    switch (type) {
                        case config.NOTIFICATION_ACTIONS.ASSIGNED:
                            notificationType = 'ticket_assigned';
                            notificationMessage = `Ticket #${ticketId} has been assigned to ${selectedUser.firstName} ${selectedUser.lastName}`;
                            break;
                        case config.NOTIFICATION_ACTIONS.STATUS_UPDATE:
                            notificationType = 'ticket_status';
                            notificationMessage = `Ticket #${ticketId} status has been updated to ${tempSelectedStatus}`;
                            break;
                        case config.NOTIFICATION_ACTIONS.COMPLETED:
                            notificationType = 'ticket_completed';
                            notificationMessage = `Ticket #${ticketId} has been marked as completed`;
                            break;
                        case config.NOTIFICATION_ACTIONS.REASSIGNED:
                            notificationType = 'ticket_reassigned';
                            notificationMessage = `Ticket #${ticketId} has been reassigned to ${reassignSelectedUser.firstName} ${reassignSelectedUser.lastName}`;
                            break;
                        default:
                            notificationType = 'ticket';
                    }

                    const notificationData = {
                        recipientIds,
                        message: notificationMessage,
                        type: notificationType,
                        requestId: ticketId,
                        action: notificationAction,
                        timestamp: new Date().toISOString(),
                        read: false,
                        navigationPath: `/app/external-requests/request-details/${tkId}`,
                        item: `Ticket #${ticketId}`
                    };
                    socket.emit("sendNotification", notificationData);
                }
            }
        } catch (error) {
            toast.error('Failed to send notification: ' + error.message);
        }
    };

    const handleAssignUser = async () => {
        if (!selectedUser) return;
        
        try {
            const response = await api.put(`/externalRequest/${id}`, { 
                assignedUser: selectedUser.id,
                requestStatus: config.TICKET_STATUS.ASSIGNED.key 
            });
            
            if (response.status === 200) {
                setAssignedUser(`${selectedUser.firstName} ${selectedUser.lastName}`);
                setSelectedStatus(config.TICKET_STATUS.ASSIGNED.name);
                setShowAssignModal(false);
                toast.success('Ticket assigned successfully!');
                
                const ticketId = ticketDetails.ticketTrails?.[0]?.ticketId || id;
                const requesterName = `${ticketDetails.user?.firstName} ${ticketDetails.user?.lastName}`;
                const message = `A new ticket (#${ticketId}) for ${requesterName} has been assigned to ${selectedUser.firstName} ${selectedUser.lastName}. Please review and take the necessary actions.`;
                await sendNotificationToAllUsers(message, config.NOTIFICATION_ACTIONS.ASSIGNED, ticketId);
                fetchTicketDetails();
            } else {
                throw new Error('An error occurred while assigning the ticket.');
            }
        } catch (error) {
            toast.error('Failed to assign ticket: ' + error.message);
        }
    };

    const handleCancelAssign = () => {
        setSelectedUser(null);
        setShowAssignModal(false);
    };

    const handleUpdateStatus = async () => {
        if (!tempSelectedStatus) {
            toast.error("Please select a status.");
            return;
        }

        
        const statusObj = ticketStatus.find(c => c.name === tempSelectedStatus);
        if (!statusObj) return;

        const payload = {
            requestStatus: statusObj.key
        };

        try {
            const response = await api.put(`/externalRequest/${id}`, payload);

            if (response.status === 200) {
                
                setSelectedStatus(tempSelectedStatus);
                toast.success("Ticket status updated successfully!");
                setShowStatusModal(false);
               
                const ticketId = ticketDetails.ticketTrails?.[0]?.ticketId || id;
                const requesterName = `${ticketDetails.user?.firstName} ${ticketDetails.user?.lastName}`;
                const message = `Ticket #${ticketId} for ${requesterName} has been updated to status: ${tempSelectedStatus}.`;
                await sendNotificationToAllUsers(message, config.NOTIFICATION_ACTIONS.STATUS_UPDATE, ticketId);
               
                fetchTicketDetails();
            }
        } catch {
            toast.error('Failed to update ticket status.');
        }
    };

    const handleReassignSearchUser = (val) => {
        setReassignSearchQuery(val);
        fetchUsers(val);
        setReassignIsOpen(true);
    };

    const handleReassignSelectUser = (user) => {
        setReassignSelectedUser(user);
        setReassignIsOpen(false);
    };

    const handleReassign = async () => {
        if (!reassignSelectedUser) return;
        try {
            const response = await api.put(`/externalRequest/${id}`, {
                assignedUser: reassignSelectedUser.id,
                requestStatus: config.TICKET_STATUS.ASSIGNED.key
            });
            if (response.status === 200) {
                setAssignedUser(`${reassignSelectedUser.firstName} ${reassignSelectedUser.lastName}`);
                setSelectedUser(reassignSelectedUser);
                setSelectedStatus(config.TICKET_STATUS.ASSIGNED.name);
                setShowReassignModal(false);
                setReassignSelectedUser(null);
                toast.success('Ticket reassigned successfully!');
                fetchTicketDetails();
            } else {
                throw new Error('An error occurred while reassigning the ticket.');
            }
        } catch {
            toast.error('Failed to reassign ticket. Please try again.');
        }
    };

    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showStatusModal || showAssignModal || showNotesModal || showReassignModal) {
                const modalContent = event.target.closest('.modal-content');
                if (!modalContent) {
                    if (showStatusModal) {
                        setShowStatusModal(false);
                        setTempSelectedStatus(selectedStatus);
                    }
                    if (showAssignModal) {
                        setShowAssignModal(false);
                        setSelectedUser(null);
                    }
                    if (showNotesModal) {
                        setShowNotesModal(false);
                        setAssignmentNote("");
                        setIsEditing(false);
                        setEditingNoteIndex(null);
                    }
                    if (showReassignModal) {
                        setShowReassignModal(false);
                        setReassignSelectedUser(null);
                    }
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showStatusModal, showAssignModal, showNotesModal, showReassignModal, selectedStatus]);

    if (loading) return <p><LoadingTable /></p>;
    if (!ticketDetails) return <p>Device not found</p>;

    const renderCondition = (condition) => {
        if (condition === config.DEVICE_CONDITIONS.GOOD) {
            return <span className="badge badge-success">{condition}</span>
        } else if (condition === config.DEVICE_CONDITIONS.DAMAGED) {
            return <span className="badge badge-error">{condition}</span>
        } else if (condition === config.DEVICE_CONDITIONS.DECOMMISSIONED) {
            return <span className="badge badge-primary">{condition}</span>
        } else {
            return <span className="badge badge-warning">{condition}</span>
        }
    };

    const renderTicketStatus = (status) => {
        if (status === config.TICKET_STATUS.PENDING.name) {
            return <span className="badge badge-error">{status}</span>
        } else if (status === config.TICKET_STATUS.ASSIGNED.name) {
            return <span className="badge badge-warning">{status}</span>
        } else if (status === config.TICKET_STATUS.IN_PROGRESS.name) {
            return <span className="badge badge-primary">{status}</span>
        } else if (status === config.TICKET_STATUS.COMPLETED.name) {
            return <span className="badge badge-success">{status}</span>
        } else {
            return <span className="badge badge-error">{config.TICKET_STATUS.PENDING.name}</span>
        }
    };

    const isOnboardingRequest = ticketDetails?.requestType?.name?.toLowerCase() === 'onboarding';

    const DeviceSpecifications = ({ device }) => {
        if (!device || !device.specifications) {
            return null;
        }
        
        return (
            <>
                {Object.entries(device.specifications).map(([key, value]) => (
                    <p key={key} className="text-gray-700 flex items-center">
                        {iconMap[key.toLowerCase()] || <FaMicrochip className="inline text-[#77B634] mr-2" />}
                        <strong className="capitalize">{key}: </strong>&nbsp;{toPascalCase(value)}
                    </p>
                ))}
            </>
        );
    };

    const renderOnboardingView = () => {
        return (
            <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
              
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-3xl text-xl font-bold">Onboarding Request</h2>
                            <p className="mt-1"> <span className="font-medium">Ticket ID:</span> <span className="text-gray-500">{ticketDetails.ticketTrails?.[0]?.ticketId}</span></p>
                        </div>
                        <div className="inline-block mt-2 md:mt-0">
                            {renderTicketStatus(selectedStatus)}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-[#77B634] bg-opacity-10 flex items-center justify-center">
                                <span className="text-[#77B634] font-bold text-2xl">
                                    {ticketDetails.user.firstName[0]}{ticketDetails.user.lastName[0]}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-800 font-semibold text-lg">{ticketDetails.user.firstName} {ticketDetails.user.lastName}</p>
                                <p className="text-gray-500">{ticketDetails.email}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-800 font-medium">Request Date</p>
                            <p className="text-gray-500 text-sm">
                                {new Date(ticketDetails.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

               
                {ticketDetails.descriptions && ticketDetails.descriptions.trim() && (
                    <div className="mt-8">
                        <h3 className="font-semibold mb-2 text-[#3F3D56]">Request Details</h3>
                        <div className="bg-gray-50 border-l-4 border-gray-300 rounded-lg p-6 min-h-[80px] shadow-inner">
                            <div className="text-gray-700">
                                {ticketDetails.descriptions.split('\n').map((note, idx) => (
                                    <p key={idx} className="mb-2 last:mb-0">{note}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

               
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-[#77B634]">IT Staff Assignment Notes</h3>
                        {selectedStatus !== config.TICKET_STATUS.COMPLETED.name && (
                            <button
                                className="bg-[#77B634] text-white px-6 py-2 rounded-lg shadow-lg hover:bg-[#5A962A] font-semibold transition"
                                onClick={() => {
                                    setAssignmentNote("");
                                    setIsEditing(false);
                                    setEditingNoteIndex(null);
                                    setShowNotesModal(true);
                                }}
                            >
                                Add Assignment Note
                            </button>
                        )}
                    </div>
                    <div className="bg-[#F6FFF2] border-l-4 border-[#77B634] rounded-lg p-6 min-h-[80px] shadow-inner">
                        {ticketDetails.notes && ticketDetails.notes.trim() ? (
                            <ul className="list-disc pl-6 text-gray-700">
                                {ticketDetails.notes.split('\n').map((note, idx) => (
                                    <li key={idx} className="group flex items-center justify-between py-1">
                                        <span>{note}</span>
                                        <button
                                            className="opacity-0 group-hover:opacity-100 text-[#77B634] hover:text-[#5A962A] transition-opacity"
                                            onClick={() => {
                                                setAssignmentNote(note);
                                                setIsEditing(true);
                                                setEditingNoteIndex(idx);
                                                setShowNotesModal(true);
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 italic">No assignment notes yet.</p>
                        )}
                    </div>
                </div>

               
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mb-8 mt-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {assignedUser && selectedUser && !showAssignModal && !showReassignModal && (
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow">
                                        <div className={`w-10 h-10 flex items-center justify-center text-white font-bold rounded-full ${getColorFromId(selectedUser.id)}`}>
                                            {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                        </div>
                                        <div>
                                            <span className="text-gray-800 font-semibold">{assignedUser}</span>
                                            <p className="text-sm text-gray-500">Assigned User</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4">
                            {selectedStatus !== config.TICKET_STATUS.COMPLETED.name && (
                                <>
                                    {selectedUser ? (
                                        <Permission
                                            allowedPermission={[PERMISSION_MANAGE_EXTERNAL_REQUEST]}
                                        >
                                            <button 
                                                onClick={() => setShowReassignModal(true)}
                                                className="flex items-center gap-2 bg-[#77B634] text-white px-6 py-3 rounded-lg hover:bg-[#5A962A] font-semibold transition-colors duration-200 shadow"
                                            >
                                                <FaUserCheck />
                                                <span>Unassign</span>
                                            </button>
                                        </Permission>
                                    ) : (
                                        <Permission
                                            allowedPermission={[PERMISSION_MANAGE_EXTERNAL_REQUEST]}
                                        >
                                            <button
                                                onClick={() => setShowAssignModal(true)}
                                                className="flex items-center gap-2 bg-[#77B634] text-white px-6 py-3 rounded-lg hover:bg-[#5A962A] font-semibold transition-colors duration-200 shadow"
                                            >
                                                <FaUserCheck />
                                                <span>Assign User</span>
                                            </button>
                                        </Permission>
                                    )}
                                    <Permission
                                            allowedPermission={[PERMISSION_MANAGE_EXTERNAL_REQUEST]}
                                    >
                                        <button onClick={() => setShowStatusModal(true)} className="flex items-center gap-2 bg-[#77B634] text-white px-6 py-3 rounded-lg hover:bg-[#5A962A] font-semibold transition-colors duration-200 shadow">
                                            <FaWrench />
                                            <span>Update Status</span>
                                        </button>
                                    </Permission>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    
    const sendCompletionNotification = async () => {
        try {
            const notificationData = {
                recipientIds: [ticketDetails?.assignedTo?._id],
                message: `Ticket #${ticketDetails?.ticketNumber} has been marked as completed`,
                type: config.NOTIFICATION_TYPES.TICKET_COMPLETED,
                requestId: ticketDetails?._id,
                action: config.NOTIFICATION_ACTIONS.COMPLETED,
                timestamp: new Date(),
                read: false,
                navigationPath: `${config.ROUTES.REQUEST_DETAILS}/${ticketDetails?.requestId}`,
                item: {
                    _id: ticketDetails?._id,
                    ticketNumber: ticketDetails?.ticketNumber,
                    requestId: ticketDetails?.requestId
                }
            };

            socket.emit('sendNotification', notificationData);
        } catch (error) {            
            toast.error('Failed to send completion notification.');
        }
    };

   
    
    const handleMarkAllAssigned = async () => {
        try {
            
            const response = await api.put(`/externalRequest/${id}`, { requestStatus: config.TICKET_STATUS.COMPLETED.key });
            if (response.status === 200) {
                setSelectedStatus(config.TICKET_STATUS.COMPLETED.name);
                toast.success('Request marked as completed!');
               
                await sendCompletionNotification();
                fetchTicketDetails();
            } else {
                throw new Error('Failed to mark request as completed.');
            }
        } catch {
            toast.error('Failed to complete request.');
        }
    }; 

   
    const getDeviceUrl = (deviceId) => {
        return `${FRONTEND_URL}/app/inventory/device-details/${deviceId}`;
    };

    const renderDeviceInfo = () => {
        const requestType = ticketDetails?.requestType?.name?.toLowerCase();
        
        if (requestType === 'onboarding') {
            return (
                <>
                    <p><FaIndustry className="inline text-[#77B634]" /> <strong>Device Type:</strong> Onboarding Devices</p>
                    <p><FaBarcode className="inline text-[#77B634]" /> <strong>Serial Number:</strong> N/A</p>
                    <p><FaTags className="inline text-[#77B634]" /> <strong>Device Condition:</strong> N/A</p>
                </>
            );
        }

        if (requestType === 'new_request') {
            const deviceTypeName = ticketDetails?.deviceTypeId?.name || ticketDetails?.deviceType?.name;
            return (
                <>
                    <p><FaIndustry className="inline text-[#77B634]" /> <strong>Requested Device Type:</strong> {(!ticketDetails?.device?.deviceType?.name && ticketDetails?.requestType?.label?.toLowerCase() === 'onboarding') ? 'New Hire Devices' : toPascalCase(ticketDetails?.device?.deviceType?.name || ticketDetails?.deviceType?.name || "N/A")}</p>
                </>
            );
        }

        if (requestType === 'lost_report' || requestType === 'broken_report') {
            return (
                <>
                    <p><FaIndustry className="inline text-[#77B634]" /> <strong>Device Type:</strong> {ticketDetails.device?.deviceType?.name ? toPascalCase(ticketDetails.device.deviceType.name) : "N/A"}</p>
                    <p>
                        <FaBarcode className="inline text-[#77B634]" /> <strong>Serial Number: </strong>
                        {ticketDetails.device?.id ? (
                            <Link
                                to={`/app/inventory/device-details/${ticketDetails.device.id}`}
                                className="text-blue-600 hover:underline"
                            >
                                {ticketDetails.device.serialNumber}
                            </Link>
                        ) : (
                            <span>N/A</span>
                        )}
                    </p>
                    <p><FaTags className="inline text-[#77B634]" /> <strong>Device Condition: </strong> {ticketDetails.device?.deviceCondition?.name ? renderCondition(ticketDetails.device.deviceCondition.name) : "N/A"}</p>
                    {ticketDetails.device && <DeviceSpecifications device={ticketDetails.device} />}
                </>
            );
        }

        return (
            <>
                <p><FaIndustry className="inline text-[#77B634]" /> <strong>Device Type:</strong> N/A</p>
                <p><FaBarcode className="inline text-[#77B634]" /> <strong>Serial Number:</strong> N/A</p>
                <p><FaTags className="inline text-[#77B634]" /> <strong>Device Condition:</strong> N/A</p>
            </>
        );
    };

    return (
        <div className="w-full h-screen bg-gray-50">
            
            {(showStatusModal || showAssignModal || showNotesModal || showReassignModal) && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20" />
                    
                </div>
            )}
            
            {error && <div className="mb-4 alert alert-error">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z" fill="#E92C2C" />
                </svg>
                <div className="flex flex-col">
                    <span>Error!</span>
                    <span className="text-content2">{error}</span>
                </div>
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setError('')}
                >
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>}
            {successMessage && <div className="alert alert-success">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM18.58 32.58L11.4 25.4C10.62 24.62 10.62 23.36 11.4 22.58C12.18 21.8 13.44 21.8 14.22 22.58L20 28.34L33.76 14.58C34.54 13.8 35.8 13.8 36.58 14.58C37.36 15.36 37.36 16.62 36.58 17.4L21.4 32.58C20.64 33.36 19.36 33.36 18.58 32.58Z" fill="#00BA34" />
                </svg>
                <div className="flex flex-col">
                    <span>Success</span>
                    <span className="text-content2">{successMessage}</span>
                </div>
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setSuccessMessage('')}
                >
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>}

            
            <div className="p-4">
                <Link to="/app/external-requests" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                    <IoIosArrowRoundBack className="text-2xl" />
                    <span>Back</span>
                </Link>
            </div>

            
            <div className="p-4">
                {isOnboardingRequest ? (
                    <>
                        {renderOnboardingView()}
                    </>
                ) : (
                    <>
                        <div className="flex flex-row items-center gap-4 border-b border-gray-300 pb-4">
                            <MdDevices className="text-[#77B634] text-4xl" />
                            <div>
                                <h2 className="text-2xl font-bold">{toSentenceCase(ticketDetails.requestType?.label)} </h2>
                                <p className="text-gray-600">
                                    <Link 
                                        to={`/app/external-requests/request-details/${ticketDetails.ticketTrails?.[0]?.ticketId || id}`}
                                        className="hover:underline cursor-pointer"
                                    >
                                        {ticketDetails.ticketTrails?.[0]?.ticketId}
                                    </Link>
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-3">
                            <p><FaIndustry className="inline text-[#77B634]" /> <strong>Requestor: {ticketDetails.user.firstName} {ticketDetails.user.lastName}</strong> </p>
                            <p className="col-span-2"><FaIndustry className="inline text-[#77B634]" /> <strong>Requestor Email:</strong> {ticketDetails.email} </p>
                            <p><FaIndustry className="inline text-[#77B634]" /> <strong>Ticket Status:</strong>  {renderTicketStatus(selectedStatus)}</p>
                            {renderDeviceInfo()}
                            <p className="col-span-3"><FaIndustry className="inline text-[#77B634]" /> <strong>Description:</strong> {toSentenceCase(ticketDetails.descriptions)} </p>
                        </div>

                        <hr className="my-4 border-gray-300" />

                        <div className="flex items-center gap-4">
                           
                            {assignedUser && selectedUser && !showAssignModal && !showReassignModal && (
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow">
                                        <div className={`w-10 h-10 flex items-center justify-center text-white font-bold rounded-full ${getColorFromId(selectedUser.id)}`}>
                                            {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                        </div>
                                        <div>
                                            <span className="text-gray-800 font-semibold">{assignedUser}</span>
                                            <p className="text-sm text-gray-500">Assigned User</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            
                            <div className="flex gap-4">
                                {selectedStatus !== config.TICKET_STATUS.COMPLETED.name && (
                                    <>
                                        {selectedUser ? (
                                            <button 
                                                onClick={() => setShowReassignModal(true)}
                                                className="flex items-center gap-2 bg-[#77B634] text-white px-6 py-3 rounded-lg hover:bg-[#5A962A] font-semibold transition-colors duration-200 shadow"
                                            >
                                                <FaUserCheck />
                                                <span>Unassign</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setShowAssignModal(true)}
                                                className="flex items-center gap-2 bg-[#77B634] text-white px-6 py-3 rounded-lg hover:bg-[#5A962A] font-semibold transition-colors duration-200 shadow"
                                            >
                                                <FaUserCheck />
                                                <span>Assign User</span>
                                            </button>
                                        )}

                                        <button onClick={() => setShowStatusModal(true)} className="flex items-center gap-2 bg-[#77B634] text-white px-6 py-3 rounded-lg hover:bg-[#5A962A] font-semibold transition-colors duration-200 shadow">
                                            <FaWrench />
                                            <span>Update Status</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        
                        {selectedStatus !== config.TICKET_STATUS.COMPLETED.name && (
                            <Permission
                                allowedPermission={[PERMISSION_MANAGE_EXTERNAL_REQUEST]}
                            >
                                <button
                                    onClick={handleMarkAllAssigned}
                                    className="flex items-center gap-2 bg-[#77B634] text-white px-6 py-3 rounded-lg hover:bg-[#5A962A] font-semibold transition-colors duration-200 shadow mt-4"
                                >
                                    Mark Request as Completed
                                </button>
                            </Permission>
                        )}
                    </>
                )}
            </div>

           
            {showStatusModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 modal-content">
                        <div className="flex relative mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 w-full text-center">Update Ticket Status</h3>
                            <button
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setTempSelectedStatus(selectedStatus);
                                }}
                                className="text-gray-500 hover:text-gray-700 absolute right-0"
                                aria-label="Close"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                            </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Status<span className="text-red-500">*</span>
                            </label>
                            <select
                                    value={tempSelectedStatus}
                                    onChange={(e) => setTempSelectedStatus(e.target.value)}
                                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] text-base appearance-none bg-white bg-no-repeat bg-[length:20px] bg-[right_10px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]"
                                >
                                    <option value="">Select a status</option>
                                {ticketStatus.map((status) => (
                                    <option key={status.key} value={status.name}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button 
                                type="button"
                                className="px-6 py-3 rounded-lg font-medium text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setTempSelectedStatus(selectedStatus);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-6 py-3 rounded-lg font-medium text-sm text-white bg-[#77B634] hover:bg-[#5F942C]"
                                onClick={handleUpdateStatus}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                            </div>
            )}
           
            {showAssignModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 modal-content">
                        <div className="flex relative mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 w-full text-center">
                                {selectedUser ? 'Reassign Ticket' : 'Assign Ticket'}
                            </h3>
                            <button
                                onClick={handleCancelAssign}
                                className="text-gray-500 hover:text-gray-700 absolute right-0"
                                aria-label="Close"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {selectedUser && (
                                <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${getColorFromId(selectedUser.id)}`}>
                                                {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                            </div>
                                            <div className="ml-3">
                                                <span className="text-base font-medium text-gray-900">
                                                    {selectedUser.firstName} {selectedUser.lastName}
                                                </span>
                                                <p className="text-sm text-gray-500">Selected User</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedUser(null)}
                                            className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                                        >
                                            <FaTimes className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                                
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Users
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchUser(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] text-base"
                                />
                            </div>

                            
                            {isOpen && !selectedUser && (
                                <div className="mt-2 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {filteredUsersList.map((user) => (
                                        <div
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                            className="flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className={`w-8 h-8 flex items-center justify-center text-white rounded-full ${getColorFromId(user.id)}`}>
                                                    {getInitials(user.firstName, user.lastName)}
                                                </div>
                                            <span className="ml-3 text-base text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                className="px-6 py-3 rounded-lg font-medium text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                                onClick={handleCancelAssign}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-6 py-3 rounded-lg font-medium text-sm text-white bg-[#77B634] hover:bg-[#5F942C] disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleAssignUser}
                                disabled={!selectedUser}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

           
            {showReassignModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 modal-content">
                        <div className="flex relative mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 w-full text-center">Reassign Ticket</h3>
                            <button
                                onClick={() => {
                                    setShowReassignModal(false);
                                    setReassignSelectedUser(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 absolute right-0"
                                aria-label="Close"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            
                            {selectedUser && (
                                <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${getColorFromId(selectedUser.id)}`}>
                                            {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                        </div>
                                        <div className="ml-3">
                                            <span className="text-base font-medium text-gray-900">
                                                {selectedUser.firstName} {selectedUser.lastName}
                                            </span>
                                            <p className="text-sm text-gray-500">Current Assigned User</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assign to New User <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={reassignSearchQuery}
                                    onChange={(e) => handleReassignSearchUser(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] text-base"
                                />
                            </div>
                           
                            {reassignSelectedUser && (
                                <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${getColorFromId(reassignSelectedUser.id)}`}>
                                                {getInitials(reassignSelectedUser.firstName, reassignSelectedUser.lastName)}
                                            </div>
                                            <span className="ml-3 text-base font-medium text-gray-900">
                                                {reassignSelectedUser.firstName} {reassignSelectedUser.lastName}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => setReassignSelectedUser(null)}
                                            className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                                        >
                                            <FaTimes className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {reassignIsOpen && !reassignSelectedUser && (
                                <div className="mt-2 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {filteredUsersList.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleReassignSelectUser(user)}
                                            className="flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className={`w-8 h-8 flex items-center justify-center text-white rounded-full ${getColorFromId(user.id)}`}>
                                                {getInitials(user.firstName, user.lastName)}
                                            </div>
                                            <span className="ml-3 text-base text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                className="px-6 py-3 rounded-lg font-medium text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                                onClick={() => {
                                    setShowReassignModal(false);
                                    setReassignSelectedUser(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-6 py-3 rounded-lg font-medium text-sm text-white bg-[#77B634] hover:bg-[#5F942C] disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleReassign}
                                disabled={!reassignSelectedUser}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            <table className="w-full text-left border-collapse">
                {data?.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan="4" className="text-center">
                                <div className="flex flex-col items-center justify-center">
                                   
                                </div>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border-b">Action</th>
                                <th className="p-2 border-b">Notes</th>
                                <th className="p-2 border-b">Performed By</th>
                                <th className="p-2 border-b">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deviceHistory.map((entry, index) => (
                                <tr key={index} className="border-b">
                                    <td className="p-2">{entry.action}</td>
                                    <td className="p-2">{entry.notes}</td>
                                    <td className="p-2">{entry.performedBy}</td>
                                    <td className="p-2">{entry.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </>
                )}
            </table>

            
            {showNotesModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 modal-content">
                        <div className="flex relative mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 w-full text-center">
                            {isEditing ? 'Edit Assignment Note' : 'Add Assignment Note'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowNotesModal(false);
                                    setAssignmentNote("");
                                    setIsEditing(false);
                                    setEditingNoteIndex(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 absolute right-0"
                                aria-label="Close"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <textarea
                            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#77B634] focus:border-[#77B634] text-base"
                            rows={4}
                            placeholder={`e.g.\nLaptop assigned to John Doe\nMonitor (x2) assigned to Jane Smith`}
                            value={assignmentNote}
                            onChange={e => setAssignmentNote(e.target.value)}
                        />
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                className="px-6 py-3 rounded-lg font-medium text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                                onClick={() => {
                                    setShowNotesModal(false);
                                    setAssignmentNote("");
                                    setIsEditing(false);
                                    setEditingNoteIndex(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-6 py-3 rounded-lg font-medium text-sm text-white bg-[#77B634] hover:bg-[#5F942C] disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={notesLoading || !assignmentNote.trim()}
                                onClick={async () => {
                                    setNotesLoading(true);
                                    try {
                                        const notes = ticketDetails.notes ? ticketDetails.notes.split('\n') : [];
                                        if (isEditing && editingNoteIndex !== null) {
                                            notes[editingNoteIndex] = assignmentNote.trim();
                                        } else {
                                            notes.push(assignmentNote.trim());
                                        }
                                        await api.put(`/externalRequest/${ticketDetails.id}`, {
                                            notes: notes.join('\n')
                                        });
                                        setAssignmentNote("");
                                        setIsEditing(false);
                                        setEditingNoteIndex(null);
                                        setShowNotesModal(false);
                                        window.location.reload();
                                    } catch {
                                        toast.error("Failed to save note. Please try again.");
                                    } finally {
                                        setNotesLoading(false);
                                    }
                                }}
                            >
                                {notesLoading ? 'Saving...' : isEditing ? 'Update Note' : 'Save Note'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const WrappedLanding = withAuth(TicketDetails, false);
export default () => <MainLayout><WrappedLanding /></MainLayout>;

