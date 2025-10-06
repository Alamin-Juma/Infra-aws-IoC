import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { toast, ToastContainer } from "react-toastify";
import api from "../../utils/apiInterceptor";
import Swal from "sweetalert2";
import config from "../../configs/app.config";
import { io } from "socket.io-client";
import { toSentenceCase } from "../../utils/toSentenceCase";
import { useAuth } from "../../context/AuthContext";
import { plural } from "../../utils/toPlural";

const LandingPage = () => {
  const API_BASE_URL = config.API_BASE_URL;
  const socket = io(API_BASE_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  const navigate = useNavigate();
  const { user, loading: userLoading } = useAuth();
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState({});
  const [isOnboarding, setIsOnboarding] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    requestType: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const sendNotification = (recipientIds, message) => {
    if (!Array.isArray(recipientIds)) {
      recipientIds = [recipientIds];
    }
    socket.emit("sendNotification", { recipientIds, message });
  };

  const sendNotificationToAllUsers = async (message) => {
    try {
      const response = await fetch(API_BASE_URL + `/users?page=1&limit=1000`);
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

  const validateEmail = (email) => {
    const allowedDomains = [
      "griffinglobaltech.com",
      "thh-llc.com",
      "thejitu.com",
    ];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) return false;

    const domain = email.split("@")[1];
    return allowedDomains.includes(domain);
  };

  const validateOnboardingDescription = (description) => {
    const lines = description.split("\n").filter((line) => line.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return lines.every((line) => {
      const parts = line.split("–").map((part) => part.trim());
      if (parts.length !== 2) return false;

      const [name, email] = parts;
      return name && email && emailRegex.test(email);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Only official company email addresses are allowed!";
    }

    if (!formData.requestType) {
      newErrors.requestType = "Request type is required";
    }

    if (isOnboarding) {
      const selectedCount = Object.values(selectedDevices).filter(
        (device) => device.selected && device.quantity > 0
      ).length;
      if (selectedCount === 0) {
        newErrors.devices = "Please specify quantity for at least one device.";
      }
    } else {
      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));

    if (id === "requestType") {
      const isOnboardingRequest = requestTypes.find(
        (type) =>
          type.id === parseInt(value) &&
          type.label.toLowerCase() === "onboarding"
      );
      setIsOnboarding(!!isOnboardingRequest);
      if (!isOnboardingRequest) {
        setSelectedDevices({});
      }
    }

    const newErrors = { ...errors };
    if (id === "email") {
      if (!value.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(value)) {
        newErrors.email = "Only official company email addresses are allowed!";
      } else {
        delete newErrors.email;
      }
    } else if (id === "requestType") {
      if (!value) {
        newErrors.requestType = "Request type is required";
      } else {
        delete newErrors.requestType;
      }
    } else if (id === "description" && !isOnboarding) {
      if (!value.trim()) {
        newErrors.description = "Description is required";
      } else {
        delete newErrors.description;
      }
    }

    setErrors(newErrors);
  };

  const handleDeviceQuantityChange = (deviceId, quantity) => {
    let isSelected = selectedDevices[deviceId]?.selected || false;

    const cleaned = quantity.replace(/^0+(?!$)/, "");

    let parsedQuantity = parseInt(cleaned, 10);
    if (!isSelected && parsedQuantity > 0) isSelected = true;
    if (isSelected && parsedQuantity < 1) isSelected = false;
    if (parsedQuantity > 100) return;

    setSelectedDevices((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        selected: isSelected,
        quantity: isNaN(parsedQuantity) ? "" : parsedQuantity,
      },
    }));
  };

  const handleDeviceSelection = (deviceId) => {
    const isSelected = selectedDevices[deviceId]?.selected || false;

    setSelectedDevices((prev) => {
      const isSelected = prev[deviceId]?.selected || false;
      return {
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          selected: !isSelected,
          quantity: !isSelected ? prev[deviceId]?.quantity || 1 : 0,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disableSubmit()) return;

    if (validateForm()) {
      setLoading(true);
      let payload = {
        email: formData.email.trim(),
        requestType: parseInt(formData.requestType.trim()),
        deviceTypeId: parseInt(formData.device),
        description: formData.description.trim(),
      };

      const selectedRequestType = requestTypes.find(
        (type) => type.id === parseInt(formData.requestType)
      );
      switch (selectedRequestType.name) {
        case "onboarding":
          const selectedDeviceLabels = Object.entries(selectedDevices)
            .filter(([_, device]) => device.selected && device.quantity > 0)
            .map(([id, details]) => {
              const device = deviceTypes.find((d) => d.id === parseInt(id));
              let label = details.quantity + " " + device?.name;
              return details.quantity > 1 ? plural(label) : label;
            });

          const formattedDescription = `${formData.description.trim()}\n\n Devices: ${selectedDeviceLabels.join(
            ", "
          )}`;
          const formattedDeviceTypes=Object.entries(selectedDevices).map(
            ([id, details]) => {
              return { deviceTypeId: parseInt(id), quantity: details.quantity };
            }
          );
          delete payload.deviceTypeId;
          payload.description = formattedDescription;
          payload.deviceTypes = formattedDeviceTypes;
          break;
        case ("new_request", "lost_report", "broken_report"):
          if (!formData.device) {
            setErrors((prev) => ({
              ...prev,
              device: "Device type is required",
            }));
            setLoading(false);
            return;
          }
          break;
        default:
      }

      try {
        const res = await api.post(`/externalRequest`, payload);
        if (
          res.status === 201 &&
          res.data &&
          typeof res.data.success !== "undefined"
        ) {
          if (res.data.success === true) {
            setFormData({
              email: "",
              requestType: "",
              description: "",
            });
            setIsOnboarding(false);
            setSelectedDevices({});
            Swal.fire({
              title: "Success!",
              cancelButtonColor: "#77B634",
              confirmButtonColor: "#77B634",
              icon: "success",
              text:
                res.data?.message ||
                "Your request has been successfully submitted. You will receive an email confirmation shortly.",
            });
            const notificationMessage =
              selectedRequestType.name === "onboarding"
                ? `New onboarding request from ${formData.email} with ${
                    Object.values(selectedDevices).filter(Boolean).length
                  } devices selected`
                : `New ${selectedRequestType.label} from ${formData.email}: Please review and take action.`;
            sendNotificationToAllUsers(notificationMessage);
          } else {
            Swal.fire({
              title: res.data?.data?.name
                ? `Hello ${res.data?.data?.name}!`
                : `Hello!`,
              cancelButtonColor: "#ddd",
              icon: "info",
              confirmButtonColor: "#77B634",
              text: res.data?.message,
            });
          }
        } else {
          Swal.fire({
            title: "Error!",
            cancelButtonColor: "#77B634",
            confirmButtonColor: "#77B634",
            text: res.data?.message || "An unexpected error occurred.",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          cancelButtonColor: "#77B634",
          confirmButtonColor: "#77B634",
          text: error.response?.data?.message || "Failed to send request.",
          icon: "info",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoginOrLogout = () => {
    if (userLoading) {
      return;
    }

    if (user) {
      localStorage.clear();

      navigate("/");
    } else {
      navigate("auth/login");
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const res = await api.get(`/deviceTypes?page=${1}&limit=${100}`);
      setDeviceTypes(res.data.data);
    } catch {
      toast.error("Failed to fetch device types");
    }
  };

  const fetchReqTypes = async () => {
    try {
      const response = await api.get(
        `/requestTypes/verify?email=${formData.email}`
      );

      setRequestTypes(response.data.data);
    } catch {
      toast.error("Failed to fetch request types", {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    if (formData.email && validateEmail(formData.email)) {
      fetchReqTypes();
    }
  };

  const disableSubmit = () => {
    const formNotSubmitable =
      loading ||
      !formData.email ||
      !formData.requestType ||
      (isOnboarding
        ? Object.values(selectedDevices).filter(
            (device) => device.selected && device.quantity > 0
          ).length === 0
        : !formData.description.trim());

    return formNotSubmitable;
  };

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#77B634] to-[#5A962A] p-0 m-0 flex flex-col">
      <header className="flex justify-between items-center bg-[#3F3D56] text-white rounded-bl-[45px] pl-10">
        <img src={logo} alt="Company Logo" />
        {!userLoading && (
          <Link onClick={handleLoginOrLogout}>
            <button
              data-test="signinButton"
              className="px-6 py-1 mr-4 bg-green-700 rounded-full hover:bg-green-600 transition"
            >
              {user ? "Logout" : "Sign in"}
            </button>
          </Link>
        )}
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-10 py-2">
        <div className="text-white">
          <h1 className="text-5xl font-bold mb-4 text-[#3F3D56]">
            <span className="text-white">Welcome to our</span> <br />
            Inventory Management System.
          </h1>
          <p className="text-lg mb-4">
            Easily report lost, stolen, or damaged devices, request a new
            device, or describe an issue with your assigned equipment.
          </p>
          <p className="text-lg">Fill out the form to submit your request.</p>
        </div>
        <div className="bg-white p-6 shadow-lg rounded-lg w-full">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6"
            noValidate
          >
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Enter your email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                maxLength={45}
                className={`w-full px-4 py-3 bg-transparent border rounded-md text-black focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-green-500 focus:ring-green-500"
                }`}
                placeholder="user@griffinglobaltech.com"
                value={formData.email}
                onBlur={handleBlur}
                onChange={handleChange}
                autoFocus
              />
              {errors.email && (
                <p className="text-red-500 mt-1 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="requestType" className="block text-gray-700 mb-2">
                Select the type of request{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="requestType"
                  className={`w-full px-4 py-3 border bg-transparent text-black rounded-md focus:outline-none focus:ring-2 appearance-none pr-10 ${
                    errors.requestType
                      ? "border-red-500 focus:ring-red-500"
                      : "border-green-500 focus:ring-green-500"
                  }`}
                  value={formData.requestType}
                  onChange={handleChange}
                >
                  <option value="" disabled className="text-gray-500">
                    Select request type
                  </option>
                  {requestTypes.map((request) => (
                    <option key={request.id} value={request.id}>
                      {toSentenceCase(request.label)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {errors.requestType && (
                <p className="text-red-500 mt-1 text-sm">
                  {errors.requestType}
                </p>
              )}
            </div>

            {isOnboarding ? (
              <div>
                <label className="block text-gray-700 mb-2">
                  Select required devices{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {deviceTypes.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`device-${device.id}-check`}
                          checked={
                            selectedDevices.hasOwnProperty([device.id])
                              ? selectedDevices[device.id].selected
                              : false
                          }
                          onChange={() => handleDeviceSelection(device.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`device-${device.id}-check`}
                          className="ml-2 text-gray-700"
                        >
                          {device.name}
                        </label>
                      </div>
                      <div className="flex items-center ">
                        {selectedDevices.hasOwnProperty([device.id]) &&
                        selectedDevices[device.id].selected ? (
                          <>
                            <label
                              htmlFor={`device-${device.id}-quantity`}
                              className="ml-2 text-gray-700"
                            >
                              Quantity:&nbsp;&nbsp;
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              id={`device-${device.id}-quantity`}
                              value={
                                selectedDevices.hasOwnProperty([device.id])
                                  ? selectedDevices[device.id].quantity
                                  : 0
                              }
                              className={`w-[75px] h-4 px-4 py-3 bg-transparent border rounded-md text-black focus:outline-none focus:ring-2 ${
                                errors.deviceTypes
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-green-500 focus:ring-green-500"
                              }`}
                              onChange={(e) =>
                                handleDeviceQuantityChange(
                                  device.id,
                                  e.target.value
                                )
                              }
                            />
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.devices && (
                  <p className="text-red-500 mt-1 text-sm">{errors.devices}</p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="device" className="block text-gray-700 mb-2">
                  Select the device type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="device"
                    className={`w-full px-4 py-3 border bg-transparent text-black rounded-md focus:outline-none focus:ring-2 appearance-none pr-10 ${
                      errors.device
                        ? "border-red-500 focus:ring-red-500"
                        : "border-green-500 focus:ring-green-500"
                    }`}
                    value={formData.device || ""}
                    onChange={handleChange}
                  >
                    <option value="" disabled className="text-gray-500">
                      Select device type
                    </option>
                    {deviceTypes.map((device) => (
                      <option key={device.id} value={device.id}>
                        {toSentenceCase(device.name)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.device && (
                  <p className="text-red-500 mt-1 text-sm">{errors.device}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-black mb-2">
                Enter a description{" "}
                {!isOnboarding && <span className="text-red-500">*</span>}
              </label>
              <textarea
                id="description"
                maxLength={1000}
                className={`w-full px-4 py-3 bg-transparent border rounded-md text-black focus:outline-none focus:ring-2 h-20 resize-none ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-green-500 focus:ring-green-500"
                }`}
                placeholder="Provide details about the issue or request..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              {errors.description && (
                <p className="text-red-500 mt-1 text-sm">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center">
              <button
                id="submitRequest"
                type="submit"
                className={`w-[200px] text-white py-3 px-4 noValidate rounded-full font-medium text-lg transition ${
                  disableSubmit()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#5A962A] hover:bg-green-700"
                }`}
              >
                {!loading && (
                  <span className="flex items-center justify-center">
                    <span className="text-lg flex items-center justify-center">
                      Submit
                    </span>
                  </span>
                )}
                {loading && (
                  <span className="ml-4 flex items-center">
                    Sending...
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      {/* <ToastContainer position="top-right" /> */}
    </div>
  );
};

export default LandingPage;
