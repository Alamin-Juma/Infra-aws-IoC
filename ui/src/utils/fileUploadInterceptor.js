
import axios from 'axios';
import config from '../configs/app.config';


const fileApi = axios.create({
  baseURL: config.API_BASE_URL,
  headers: { "Content-Type": "multipart/form-data" },
});

// Request interceptor
fileApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
fileApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default fileApi;
