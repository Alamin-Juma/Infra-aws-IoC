import React, { useState, useEffect } from "react";
import {
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaGamepad,
  FaBatteryFull,
  FaLaptopCode,
  FaWeightHanging,
  FaCamera,
  FaPlug,
  FaTv,
  FaIndustry,
  FaBarcode,
  FaTags,
  FaWifi,
  FaHistory,
  FaUserCheck,
  FaWrench,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import { MdDevices } from "react-icons/md";
import withAuth from "../../../../utils/withAuth";
import Lottie from "lottie-react";
import animationData from "../../../../assets/lottie/no-history1.json";

import MainLayout from "../../../../layouts/MainLayout";
import config from "../../../../configs/app.config";
import { useParams, Link, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import api from "../../../../utils/apiInterceptor";
import LoadingTable from "../../../../components/LoadingTable";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { formatDate } from "../../../../utils/formatDate";
import { toPascalCase } from "../../../../utils/toPascalCase";


export const DeviceDetails = ({ data = [] }) => {
  const { id } = useParams();
  const API_BASE_URL = config.API_BASE_URL;
  const socket = io(API_BASE_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    timeout: 10000,
  });

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
    ports: <FaPlug className="inline text-[#77B634] mr-2" />,
  };

  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [displayedCondition, setDisplayedCondition] = useState("Good");
  const [pendingCondition, setPendingCondition] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState("Good");
  const [assignedUser, setAssignedUser] = useState("");
  const [displayedUser, setDisplayedUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsersList, setFilteredUsers] = useState([]);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const myUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = api.get(`/users?page=${1}&limit=${100}`);
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        throw new Error("Error getting users: ", error);
      }
    };

    const fetchConditions = async () => {
      try {
        const response = await api.get(`/api/device-condition`);
        const data = await response.json();
        setConditions(data || []);
      } catch (error) {
        throw new Error("Error getting conditions: ", error);
      }
    };

    fetchUsers();
    fetchDeviceDetails();
    fetchConditions();
  }, [id]);

  const handleSearchUser = (val) => {
    setSearchQuery(val);
    fetchUsers(val);
    setIsOpen(true);
  };

  const sendNotification = (recipientIds, message) => {
    if (!Array.isArray(recipientIds)) {
      recipientIds = [recipientIds];
    }
    socket.emit("sendNotification", { recipientIds, message });
  };

  const sendNotificationToAllUsers = async (message) => {
    try {
      const response = await api.get(`/users?page=1&limit=1000`);
      const data = await response.json();

      if (Array.isArray(data.users)) {
        const recipientIds = data.users
          .filter((user) => user.roleName !== "employee")
          .map((user) => user.id);
        if (recipientIds.length > 0) {
          sendNotification(recipientIds, message);
        }
      }
    } catch (error) {
      throw new Error("Error fetching user IDs:", error);
    }
  };

  const fetchDeviceDetails = async () => {
    try {
      const response = await api.get(`/api/devices/${id}`);
      const data = await response.json();
      setDeviceDetails(data);

      const userIds = [
        ...new Set(
          data.deviceActivities.map((activity) => activity.performedBy)
        ),
      ];

      const userResponses = await Promise.all(
        userIds.map((userId) =>
          api.get(`/users/${userId}`)
            .then((res) => res.json())
            .catch((err) => null)
        )
      );

      const validUsers = userResponses.filter((user) => user?.id);
      const userMap = validUsers.reduce((acc, user) => {
        acc[user.id] = `${user.firstName} ${user.lastName}`.trim();
        return acc;
      }, {});

      const cleanDescription = (desc) => {
        return desc.replace(
          / on \d{4}-\d{2}-\d{2} at \d{1,2}:\d{1,2}:\d{1,2}/,
          ""
        );
      };

      const sortedActivities = data.deviceActivities.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const mappedActivities = sortedActivities.map((activity) => ({
        action: activity.activityTypeId === 1 ? "Assignment" : "Unassignment",
        notes: cleanDescription(activity.description),
        performedBy:
          userMap[activity.performedBy] ||
          `Unknown User (ID: ${activity.performedBy})`,
        date: formatDate(activity.createdAt),
      }));

      setDeviceHistory(mappedActivities);
      setDisplayedCondition(data.deviceCondition.name);
      setSelectedCondition(data.deviceCondition.name);

      if (data.deviceStatus.name === "assigned") {
        const user = await getDeviceUser(data.assignedUser);
        setDisplayedUser(user);
        setSelectedUser(user);
        setAssignedUser(`${user.firstName} ${user.lastName}`);
      } else {
        setDisplayedUser(null);
        setSelectedUser(null);
        setAssignedUser("");
      }
    } catch (error) {
      throw new Error("Device details could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (user) => {
    try {
      const response = await api.get(`/users/api/filter`, {
        params: {
          page: 1,
          limit: 50,
          keyword: user,
          roleName: "",
        },
      });
      setFilteredUsers(response.data.users);
    } catch (error) {
      throw new Error("An error occured when fetching users.");
    }
  };

  const getDeviceUser = async (user) => {
    try {
      const response = await api.get(`/users/employee/getByEmail`, {
        params: {
          email: user,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error("An error occured:", error);
    }
  };

  const getInitials = (firstName, lastName) => {
    if (lastName && firstName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
  };

  const getColorFromId = (id) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-purple-500",
    ];
    return colors[id % colors.length];
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setPendingUser(user);
    setIsOpen(false);
  };

  const handleAssignUser = async () => {
    if (!pendingUser) {
      toast.error("Please select a user first");
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `This device will be assigned to ${pendingUser.firstName} as the current user!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#77B634",
        cancelButtonColor: "#494848",
        confirmButtonText: "Yes, Assign it!",
        didOpen: () => {
          document
            .querySelector(".swal2-confirm")
            ?.setAttribute("data-test", "confirmDeviceAssignment");
          document
            .querySelector(".swal2-cancel")
            ?.setAttribute("data-test", "cancelDeviceAssignment");
        },
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Assigning...",
        text: "Please wait while the device is being assigned.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await api.post(`/assignDevice/assign/${id}`, {
        userEmail: pendingUser.email,
        performedBy: myUser?.id,
      });

      if (response.status === 200 || response.status === 204) {
        await fetchDeviceDetails();
        setShowAssignModal(false);
        sendNotificationToAllUsers(
          `A ${deviceDetails.deviceType?.name} with serial number:(${deviceDetails.serialNumber}) has been assigned to ${pendingUser.firstName}.`
        );

        Swal.fire({
          title: "Assigned!",
          text: "Device Assigned successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("An error occurred while assigning the device.");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        cancelButtonColor: "#77B634",
        confirmButtonColor: "#77B634",
        text:
          error.response?.data?.error ||
          "An error occurred while assigning the device.",
        icon: "error",
      });
      setSelectedUser(displayedUser);
    } finally {
      setLoading(false);
      setPendingUser(null);
    }
  };

  const updateDeviceCondition = async () => {
    if (!pendingCondition) {
      toast.error("Please select a condition.");
      return;
    }

    const conditionObj = conditions.find((c) => c.name === pendingCondition);
    if (!conditionObj) return;

    const payload = {
      deviceConditionId: parseInt(conditionObj.id),
      userId: null,
    };

    try {
      const res = await api.patch(`/api/devices/${id}/condition`, payload);
      if (res.status === 200) {
        await fetchDeviceDetails();
        toast.success("Device condition updated successfully!");
        setShowConditionModal(false);
      }
      return data;
    } catch (error) {
      if (error.response?.status === 400) {
        return {
          error: error.response.data.error,
          validConditions: error.response.data.validConditions,
        };
      }
      throw new Error(error.response?.data?.error || "Update failed");
    }
  };

  const handleUpdateCondition = async () => {
    if (!pendingCondition) {
      toast.error("Please select a condition.");
      return;
    }

    const conditionObj = conditions.find((c) => c.name === pendingCondition);
    if (!conditionObj) return;

    const payload = {
      deviceConditionId: conditionObj.id,
    };

    setLoading(true);
    try {
      const response = await api.put(
        `/api/devices/${id}`,
        payload
      );

      if (response.status === 200) {
        await fetchDeviceDetails();
        toast.success("Device condition updated successfully!");
        setShowConditionModal(false);
      }
    } catch (error) {
      toast.error("Failed to update device condition.");
      setSelectedCondition(displayedCondition);
    } finally {
      setLoading(false);
      setPendingCondition(null);
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target.id === "modalOverlay") {
      setShowConditionModal(false);
      setShowAssignModal(false);
    }
  };

  const unAssignDevice = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `This will remove ${assignedUser} as the current user of this device!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#77B634",
        cancelButtonColor: "#494848",
        confirmButtonText: "Yes, Unassign!",
        didOpen: () => {
          document
            .querySelector(".swal2-confirm")
            .setAttribute("data-test", "confirmDeviceUnAssignment");
          document
            .querySelector(".swal2-cancel")
            .setAttribute("data-test", "cancelDeviceUnAssignment");
        },
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Unassigning...",
        text: "Please wait while the device is being unassigned.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await api.post(`/assignDevice/unassign/${id}`, {
        performedBy: myUser.id,
      });

      if (response.status === 200 || response.status === 204) {
        await fetchDeviceDetails();
        sendNotificationToAllUsers(
          `A ${deviceDetails.deviceType?.name} with serial number:(${deviceDetails.serialNumber}) has been unassigned from ${assignedUser}.`
        );

        Swal.fire({
          title: "Unassigned!",
          text: "Device unassigned successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("An error occurred while unassigning the device.");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.error ||
          "An error occured while unassigning device.",
        icon: "error",
      });
    }
  };

  const DeviceSpecifications = ({ device }) => {
    return (
      <>
        {device.specifications &&
          Object.entries(device.specifications).map(([key, value]) => (
            <p key={key} className="text-gray-700 flex items-center">
              {iconMap[key.toLowerCase()] || (
                <FaMicrochip className="inline text-[#77B634] mr-2" />
              )}
              <strong className="capitalize">{key}:</strong>{" "}
              <span className="pl-2">{value}</span>
            </p>
          ))}
      </>
    );
  };

  const conditionBadgeClasses = {
    Good: "badge-success",
    Broken: "badge-warning",
    Decommissioned: "badge-flat-error",
    Lost: "badge-secondary",
  };

  const renderCondition = (condition) => {
    const badgeClass = conditionBadgeClasses[condition] || "badge-warning";
    return <span className={`badge ${badgeClass}`}>{condition}</span>;
  };

  if (loading)
    return (
      <p>
        <LoadingTable />
      </p>
    );
  if (!deviceDetails) return <p>Device not found</p>;

  return (
    <div className="w-full h-screen p-2 bg-[#F5F5F5] text-[#333]">

      {error && (
        <div className="mb-4 alert alert-error">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z"
              fill="#E92C2C"
            />
          </svg>
          <div className="flex flex-col">
            <span>Error!</span>
            <span className="text-content2">{error}</span>
          </div>
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setError("")}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM18.58 32.58L11.4 25.4C10.62 24.62 10.62 23.36 11.4 22.58C12.18 21.8 13.44 21.8 14.22 22.58L20 28.34L33.76 14.58C34.54 13.8 35.8 13.8 36.58 14.58C37.36 15.36 37.36 16.62 36.58 17.4L21.4 32.58C20.64 33.36 19.36 33.36 18.58 32.58Z"
              fill="#00BA34"
            />
          </svg>
          <div className="flex flex-col">
            <span>Success</span>
            <span className="text-content2">{successMessage}</span>
          </div>
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSuccessMessage("")}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="my-2 mb-3 px-2 text-blue-500">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back</span>
          </button>
        </div>
        <div className="flex flex-row items-center gap-4 border-gray-300 pb-5">
          <MdDevices className="text-[#77B634] text-4xl" />
          <div>
            <h2 className="text-2xl font-bold">
              {toPascalCase(deviceDetails.deviceType?.name)}{" "}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <p>
            <FaIndustry className="inline text-[#77B634]" />{" "}
            <strong>Manufacturer: </strong>
            <span className="pl-2">{deviceDetails.manufacturer.name}</span>{" "}
          </p>
          <p>
            <FaTags className="inline text-[#77B634]" />{" "}
            <strong>Condition: </strong>
            <span className="pl-2">
              {renderCondition(displayedCondition)}
            </span>{" "}
          </p>
          <p>
            <FaBarcode className="inline text-[#77B634]" />{" "}
            <strong>Serial Number:</strong>
            <span data-test="deviceSerialNumber" className="pl-2">
              {deviceDetails.serialNumber}
            </span>{" "}
          </p>

          <DeviceSpecifications device={deviceDetails} />
        </div>

        <hr className="my-4 border-gray-300" />

        <div className="flex items-center gap-4">
          {displayedUser && (
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow">
              <div
                className={`w-8 h-8 flex items-center justify-center text-white font-bold rounded-full ${getColorFromId(
                  displayedUser.id
                )}`}
              >
                {getInitials(displayedUser.firstName, displayedUser.lastName)}
              </div>
              <span className="text-gray-800 font-semibold">
                {assignedUser}
              </span>
            </div>
          )}

          <div className="flex gap-4">
            {displayedUser && (
              <button
                data-test="assignDevicesButton"
                onClick={unAssignDevice}
                className="flex items-center gap-2 bg-[#77B634] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                disabled={loading}
              >
                <FaUserCheck />
                {loading ? "Processing..." : "Unassign Device"}
              </button>
            )}

            {!displayedUser && displayedCondition === "Good" && (
              <button
                data-test="assignDevicesButton"
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 bg-[#77B634] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                disabled={loading}
              >
                <FaUserCheck />
                Assign User
              </button>
            )}

            <button
              onClick={() => setShowConditionModal(true)}
              className="flex items-center gap-2 bg-[#77B634] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              disabled={loading}
            >
              <FaWrench />
              Update Condition
            </button>
          </div>
        </div>

        <hr className="my-4 border-gray-300" />

        <table
          data-test="historyTable"
          className="w-full text-left border-collapse"
        >
          {deviceHistory?.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan="4" className="text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Lottie
                      animationData={animationData}
                      loop={true}
                      className="h-40"
                    />
                    <span className="text-gray-600 text-lg font-semibold">
                      No History Found
                    </span>
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
      </div>

      {showConditionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="relative flex justify-between items-center mb-4">
              <h2 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold">
                Update Condition
              </h2>
              <div className="flex flex-shrink-0 ml-auto">
                <FaTimes
                  className="cursor-pointer text-gray-500"
                  onClick={() => {
                    setShowConditionModal(false);
                    setSelectedCondition(displayedCondition);
                  }}
                />
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Condition<span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setPendingCondition(e.target.value);
              }}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.name}>
                  {condition.name}
                </option>
              ))}
            </select>
            <button
              className="mt-4 w-full bg-[#77B634] text-white p-2 rounded-lg"
              onClick={updateDeviceCondition}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div
          id="modalOverlay"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]"
          onClick={handleOutsideClick}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-between mb-4">
              <h2 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold">
                Assign User
              </h2>
              <FaTimes
                className="cursor-pointer text-gray-500 ml-auto"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(displayedUser);
                }}
              />
            </div>

            <div className="relative">
              <input
                data-test="searchUserInput"
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearchUser(e.target.value)}
                className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />

              {selectedUser && (
                <div className="w-full p-2 border rounded flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 flex items-center justify-center text-white rounded-full ${getColorFromId(
                        selectedUser.id
                      )}`}
                    >
                      {getInitials(
                        selectedUser.firstName,
                        selectedUser.lastName
                      )}
                    </div>
                    <span className="ml-3">
                      {selectedUser.firstName} {selectedUser.lastName}
                      {pendingUser?.id === selectedUser.id && " (Selected)"}
                    </span>
                  </div>
                </div>
              )}

              {isOpen && (
                <ul className="absolute w-full mt-1 bg-white border rounded shadow-lg z-10 max-h-60 overflow-auto">
                  {filteredUsersList.map((user) => (
                    <li
                      data-test="individualAssignee"
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center text-white rounded-full ${getColorFromId(
                          user.id
                        )}`}
                      >
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <span className="ml-3">
                        {user.firstName} {user.lastName}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              data-test="assignButton"
              className="mt-4 w-full bg-[#77B634] text-white p-2 rounded-lg"
              onClick={handleAssignUser}
              disabled={!selectedUser || loading}
            >
              {loading ? "Assigning..." : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const WrappedLanding = withAuth(DeviceDetails, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
