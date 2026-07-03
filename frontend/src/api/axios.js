import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, "") 
  : "";

const API = axios.create({
  baseURL: apiBaseUrl,
});

let tokenLoader = null;

export const setTokenLoader = (loader) => {
  tokenLoader = loader;
};

API.interceptors.request.use(async (config) => {
  if (tokenLoader) {
    try {
      const token = await tokenLoader();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Error retrieving Clerk token for API request:", err);
    }
  }
  return config;
});

export default API;
