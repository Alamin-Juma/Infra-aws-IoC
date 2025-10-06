import React, { useState, useRef, useEffect, Fragment } from "react";
import withAuth from "../../../../utils/withAuth.js";
import MainLayout from "../../../../layouts/MainLayout.jsx";
import api from "../../../../utils/apiInterceptor.js";
import { toast } from "react-toastify";
import LoadingTable from "../../../../components/LoadingTable.jsx";
import InventoryTable from "../../../../components/InventoryTable.jsx";
import { MdAdd, MdOutlineFilterAlt } from "react-icons/md";
import { IoSearchSharp } from "react-icons/io5";
import { Dialog, Transition } from "@headlessui/react";
import Pagination from "../../../../components/Pagination.jsx";
import Spinner from "../../../../components/Spinner.jsx";
import Swal from "sweetalert2";
import { debounce } from "lodash";
import { toPascalCase } from "../../../../utils/toPascalCase.js";
import { toSentenceCase } from "../../../../utils/toSentenceCase.js";
import { DEBOUNCETIMEOUT } from "../../../../utils/constants.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Permission from "../../../../components/Permission.jsx";
import { PERMISSION_MANAGE_DEVICES } from "../../../../constants/permissions.constants.js";

const DeviceTypeList = () => {
  const [searchParams] = useSearchParams();
  const [deviceList, setDeviceList] = useState([]);
  const [specsList, setSpecsList] = useState([]);
  const [manufacturers, setManufacturerList] = useState([]);
  const [deviceConditionList, setDeviceConditionList] = useState([]);
  const [deviceTypeList, setDeviceTypeList] = useState([]);
  const [deviceStatusList, setDeviceStatusList] = useState([]);
  const [deviceSpecifications, setDeviceSpecificationsList] = useState([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [filteredSpecs, setFilteredSpecs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const initialDeviceType = searchParams.get("deviceType") || "";
  const [deviceFilter, setDeviceFilter] = useState(
    initialDeviceType.toLowerCase()
  );
  const modalRef = useRef(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    serialNumber: "",
    deviceType: "",
    manufacturerId: "",
    deviceSpecifications: "",
    specifications: {},
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const openAddUserModal = () => setIsAddUserModalOpen(true);
  const closeAddUserModal = () => setIsAddUserModalOpen(false);

  const cancelButtonRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "deviceType") {
      const filtered = deviceTypeList.filter(
        (spec) => spec.id === parseInt(value.trim())
      );
      setFilteredSpecs(JSON.parse(filtered[0].specifications));
    }
  };

  const isFormValid = () => {
    return (
      formData.serialNumber !== "" &&
      formData.deviceType !== "" &&
      formData.manufacturer !== "" &&
      Object?.keys(formData?.specifications).length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);

    const payload = {
      serialNumber: formData.serialNumber.trim(),
      deviceTypeId: parseInt(formData.deviceType.trim()),
      manufacturerId: parseInt(formData.manufacturer.trim()),
      deviceSpecifications: 1,
      specifications: formData.specifications,
    };

    try {
      const res = await api.post("/api/devices/new", payload);
      if (res.status === 201) {
        setIsAddUserModalOpen(false);
        fetchDevices();

        setTimeout(() => {
          toast.success("Device registered successfully!");
          setFormData({
            serialNumber: "",
            deviceType: "",
            manufacturerId: "",
            deviceConditionId: "",
            deviceStatusId: "",
          });
        }, 200);
      } else {
        Swal.fire({
          title: "Error!",
          confirmButtonColor: "#77B634",
          text: "Failed to register device",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        confirmButtonColor: "#77B634",
        text: error.response?.data?.message || "Failed to register device",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceUpdate = () => {
    fetchDevices();
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/devices/all?page=${page}&limit=${limit}&keyword=${searchQuery}&manufacturer=${manufacturerFilter}&deviceType=${deviceFilter}&deviceCondition=${conditionFilter}`
      );
      setDeviceList(response.data.devices);
      setTotal(response.data.total);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecs = async () => {
    try {
      const response = await api.get(`/api/specifications`);
      setSpecsList(response.data.data);
    } catch (error) {
      toast.error("Couldn't fetch device specifications");
    }
  };

  const fetchManufactures = async () => {
    try {
      const response = await api.get(`/manufacturer`);
      setManufacturerList(response.data.manufacturers);
    } catch (error) {
      toast.error("Couldn't fetch manufacturers");
    }
  };

  const fetchDeviceCondition = async () => {
    try {
      const response = await api.get(`/api/device-condition`);
     
      setDeviceConditionList(response.data);
    } catch (error) {
      toast.error("Couldn't fetch condition");
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await api.get(`/deviceTypes?page=${1}&limit=${100}`);
     
      setDeviceTypeList(response.data.data);
    } catch (error) {
      toast.error("Couldn't fetch device types");
    }
  };

  const fetchDeviceStatus = async () => {
    try {
      const response = await api.get(`/api/device-status`);
      setDeviceStatusList(response.data);
    } catch (error) {
      toast.error("Couldn't fetch device status");
    }
  };

  const fetchDeviceSpecifications = async () => {
    try {
      const response = await api.get(`/api/specifications`);
      setDeviceSpecificationsList(response.data.data);
    } catch (error) {
      toast.error("Couldn't fetch device specifications");
    }
  };

  const handleSpecChange = (e, field) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleSearch = debounce((query) => {
    setSearchQuery(query.trim().toLowerCase());
    setPage(1);
  }, DEBOUNCETIMEOUT);

  const handleManufacturerFilter = (brand) => {
    setManufacturerFilter(brand.trim().toLowerCase());
    setPage(1);
  };

  const handleDeviceConditionFilter = (condition) => {
    setConditionFilter(condition.trim().toLowerCase());
    setPage(1);
  };

  const handleDeviceTypeFilter = (type) => {
    setDeviceFilter(type.trim().toLowerCase());
    setPage(1);
  };

  useEffect(() => {
    fetchSpecs();
    fetchManufactures();
    fetchDeviceTypes();
    fetchDeviceCondition();
    fetchDeviceSpecifications();
    fetchDeviceStatus();
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [
    limit,
    deviceFilter,
    manufacturerFilter,
    conditionFilter,
    searchQuery,
    page,
  ]);

  useEffect(() => {
    if (initialDeviceType && deviceTypeList.length > 0) {
      const matchedDeviceType = deviceTypeList.find(
        (dt) => dt.name.toLowerCase() === initialDeviceType.toLowerCase()
      );

      if (matchedDeviceType) {
        setFormData((prev) => ({
          ...prev,
          deviceType: matchedDeviceType.id.toString(),
        }));

        const filtered = deviceTypeList.filter(
          (spec) => spec.id === matchedDeviceType.id
        );
        if (filtered.length > 0) {
          setFilteredSpecs(JSON.parse(filtered[0].specifications));
        }
      }
    }
  }, [initialDeviceType, deviceTypeList]);

  return (
    <div data-testid="main-container" className="w-full h-full">

      <div className="flex flex-col gap-2">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back</span>
          </button>
        </div>
        <div>
          <h2 className="ml-2 text-xl font-bold capitalize">
            {initialDeviceType}
          </h2>
        </div>
      </div>

      <div className="h-[5rem] flex flex-col md:flex-row w-full gap-4 justify-between items-center py-4">
        <div className="flex flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              id="searchInput"
              type="text"
              className="input w-full pl-10 pr-4"
              placeholder="Search serial number..."
              maxLength={20}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchSharp className="text-gray-500" />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdOutlineFilterAlt className="text-gray-500" />
              </div>
              <select
                id="manufacturerFilter"
                className="select min-w-[200px] w-full pl-10"
                onChange={(e) => handleManufacturerFilter(e.target.value)}
              >
                <option value="">All</option>
                {manufacturers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {toSentenceCase(m.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdOutlineFilterAlt className="text-gray-500" />
              </div>
              <select
                id="deviceTypeFilter"
                className="select min-w-[200px] w-full pl-10"
                onChange={(e) => handleDeviceConditionFilter(e.target.value)}
              >
                <option value="">All</option>
                {deviceConditionList.map((d) => (
                  <option key={d.id} value={d.name}>
                    {toPascalCase(d.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <Permission
              allowedPermission={[PERMISSION_MANAGE_DEVICES]}
            >
              <div
                data-test="addDeviceButton"
                onClick={openAddUserModal}
                className="btn btn-primary bg-[#77B634] w-full md:w-auto"
              >
                <MdAdd className="font-bold text-xl mr-2" /> Add Device
              </div>
            </Permission>
          </div>
        </div>
      </div>
      {loading && <LoadingTable />}
      {!loading && (
        <InventoryTable
          data={deviceList}
          onDeviceUpdate={handleDeviceUpdate}
          deviceTypeList={deviceTypeList}
          manufacturers={manufacturers}
        />
      )}

      <Transition.Root show={isAddUserModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100]"
          initialFocus={cancelButtonRef}
          onClose={closeAddUserModal}
        >
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
                <Dialog.Panel
                  className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                  style={{ maxWidth: "700px" }}
                >
                  <div className="">
                    <div className="flex flex-row items-center justify-center mb-3 w-full p-2">
                      <h3 className="font-bold text-lg flex items-center ">
                        New Device
                      </h3>
                    </div>
                    <section className="p-2">
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="w-full">
                            <label
                              htmlFor="deviceType"
                              className="font-medium text-gray-700"
                            >
                              Device Type
                            </label>
                            <select
                              data-test="deviceType"
                              name="deviceType"
                              value={formData.deviceType}
                              onChange={handleChange}
                              className="select select-solid w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value=""></option>
                              {deviceTypeList.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {toPascalCase(d.name)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-full">
                            <label
                              htmlFor="serialNumber"
                              className="font-medium text-gray-700"
                            >
                              Serial Number
                            </label>
                            <input
                              data-test="serialNumber"
                              name="serialNumber"
                              value={formData.serialNumber}
                              onChange={handleChange}
                              maxLength={20}
                              className="input input-solid w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              type="text"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="w-full">
                            <label
                              htmlFor="manufacturer"
                              className="font-medium text-gray-700"
                            >
                              Manufacturer
                            </label>
                            <select
                              name="manufacturer"
                              value={formData.manufacturer}
                              onChange={handleChange}
                              className="select select-solid w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value=""></option>
                              {manufacturers.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {toPascalCase(m.name)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="divider divider-horizontal">
                          Specifications
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {filteredSpecs.map((field) => (
                            <div
                              key={field.specification_id}
                              className="w-full"
                            >
                              <label
                                htmlFor={field.name}
                                className="block font-medium text-gray-700 mb-1"
                              >
                                {field.name}
                              </label>

                              {field.fieldType === "text" && (
                                <input
                                  type="text"
                                  id={field.name}
                                  name={field.name}
                                  onChange={(e) => handleSpecChange(e, field)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              )}

                              {field.fieldType === "select" && (
                                <select
                                  id={field.name}
                                  name={field.name}
                                  onChange={(e) => handleSpecChange(e, field)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select an option</option>
                                  {field.selectOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {field.fieldType === "checkbox" && (
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={field.name}
                                    name={field.name}
                                    onChange={(e) => handleSpecChange(e, field)}
                                    className="w-5 h-5 border border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <label
                                    htmlFor={field.name}
                                    className="ml-2 text-gray-700"
                                  >
                                    {field.name}
                                  </label>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            data-test="submitAddDeviceForm"
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !isFormValid()}
                            className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:col-start-2 sm:text-sm ${
                              loading || !isFormValid()
                                ? "bg-[#A8D08D] cursor-not-allowed"
                                : "bg-[#77B634] hover:bg-[#66992B]"
                            }`}
                          >
                            {loading ? <Spinner /> : "Submit"}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-200 bg-gray-200 px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-300 sm:col-start-1 sm:mt-0 sm:text-sm"
                            onClick={() => setIsAddUserModalOpen(false)}
                            ref={cancelButtonRef}
                          >
                            Cancel
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

      <Pagination
        dataTest={"devicesPagination"}
        total={total}
        limit={limit}
        page={page}
        handlePageChange={handlePageChange}
        handleLimitChange={handleLimitChange}
      />
    </div>
  );
};

const WrappedLanding = withAuth(DeviceTypeList, false);
export default () => (
  <MainLayout>
    <WrappedLanding />
  </MainLayout>
);
