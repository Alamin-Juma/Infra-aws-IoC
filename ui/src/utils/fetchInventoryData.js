import api from "./apiInterceptor";


export const fetchDevices = async () => {
  try {
    const response = await api.get(`/api/devices/all`);
    return response.data.devices;
  } catch (error) {
    return [];
  }
};

export const fetchDeviceTypes = async () => {
  try {
    const response = await api.get(`/deviceTypes?page=1&limit=100`);
    return response.data.data;
  } catch (error) {
    return [];
  }
};

export const fetchManufacturers = async () => {
  try {
    const response = await api.get(`/manufacturer`);
    return response.data.manufacturers;
  } catch (error) {
    return [];
  }
};

export const fetchDeviceConditions = async () => {
  try {
    const response = await api.get(`/api/device-condition`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const fetchDeviceStatus = async () => {
  try {
    const response = await api.get(`/api/device-status`);
    return response.data;
  } catch (error) {

    return [];
  }
};

export const fetchDeviceSpecifications = async () => {
  try {
    const response = await api.get(`/api/specifications`);
    return response.data.data;
  } catch (error) {
    return [];
  }
};
