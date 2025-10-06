import axios from "axios";
import config from "../configs/app.config";
import { toast } from "react-toastify";
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
const ACCESS_TOKEN_NAME = config.ACCESS_TOKEN_NAME;
const REFRESH_TOKEN_NAME = config.REFRESH_TOKEN_NAME;

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_NAME);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;

    const originalRequest = error.config;
    if (!response) {
      toast.error("Check your internet connection or try again later.", {
        autoClose: 3000,
      });
      return Promise.reject(error);
    }

    const status = response.status;
    const message =
      response.data?.message ??
      response.statusText ??
      response.message ??
      "Unknown error";
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = "Bearer " + token;
          return await axios(originalRequest);
        } catch (err) {
          return await Promise.reject(err);
        }
      }

      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_NAME);
      if (!refreshToken) {
        toast.error("Session Expired,You are being redirected to login.", {
          onClose: () => {
            localStorage.clear();
            window.location.href = "/auth/login";
          },
          autoClose: 3000,
        });

        return Promise.reject(error);
      }

      try {
        try {
          const res = await axios.post(
            `${config.API_BASE_URL}/auth/refresh-access-token`,
            {
              refreshToken: refreshToken,
            }
          );

          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;
          localStorage.setItem(ACCESS_TOKEN_NAME, newAccessToken);
          localStorage.setItem(REFRESH_TOKEN_NAME, newRefreshToken);
          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = "Bearer " + newAccessToken;
          return await axios(originalRequest);
        } catch (err_1) {
          processQueue(err_1, null);

          toast.error("Session Expired,Please log in again.", {
            onClose: () => {
              localStorage.clear();
              window.location.href = "/auth/login";
            },
            autoClose: 3000,
          });
          return await Promise.reject(err_1);
        }
      } finally {
        isRefreshing = false;
      }
    }
    switch (status) {
      case 403:
        toast.error(
          "You do not have permission to access this resource. Contact the administrator.",
          {
            autoClose: 3000,
          }
        );
        if (window.location.pathname != "/app/dashboard") {
          window.location.href = "/app/dashboard";
        }
        break;
      case 404:
        toast.error("The requested resource was not found.", {
          onClose: () => {},
          autoClose: 3000,
        });
        break;

      case 409:
        toast.error(response.data?.message || "Conflict occurred.", {
          onClose: () => {},
          autoClose: 3000,
        });
        break;

      case 500:
        toast.error("An unexpected error occurred on the server.", {
          onClose: () => {},
          autoClose: 3000,
        });
        break;
      default:
        toast.error(message, {
          onClose: () => {},
          autoClose: 3000,
        });
    }

    return Promise.reject(error);
  }
);

export default api;
