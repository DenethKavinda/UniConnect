// import axios from 'axios';

// // Axios API instance

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Interceptors setup

// export default api;


import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL;
const fallbackBaseUrls = [
  "http://localhost:5000/api",
  "http://localhost:5001/api",
  "http://localhost:5002/api",
  "http://localhost:5003/api",
  "http://localhost:5004/api",
  "http://localhost:5005/api",
];

const savedBaseUrl = localStorage.getItem("apiBaseUrl");
const initialBaseUrl = savedBaseUrl || configuredBaseUrl || fallbackBaseUrls[0];

const API = axios.create({
  baseURL: initialBaseUrl,
});

const baseUrlCandidates = [
  initialBaseUrl,
  ...(configuredBaseUrl ? [configuredBaseUrl] : []),
  ...fallbackBaseUrls,
].filter((url, index, array) => url && array.indexOf(url) === index);

const setWorkingBaseUrl = (url) => {
  API.defaults.baseURL = url;
  localStorage.setItem("apiBaseUrl", url);
};

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry only network-level failures, not auth or validation errors.
    if (!originalRequest || error.response || originalRequest.__retryOnAltBase) {
      return Promise.reject(error);
    }

    originalRequest.__retryOnAltBase = true;

    const currentBase = API.defaults.baseURL;
    const nextBase = baseUrlCandidates.find((candidate) => candidate !== currentBase);

    if (!nextBase) {
      return Promise.reject(error);
    }

    for (const candidate of baseUrlCandidates) {
      if (candidate === currentBase) continue;
      try {
        setWorkingBaseUrl(candidate);
        originalRequest.baseURL = candidate;
        return await API.request(originalRequest);
      } catch (retryError) {
        if (retryError.response) {
          return Promise.reject(retryError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;