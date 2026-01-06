import axios from "axios";
import { apibase } from "./contants";
import { hideLoader, showLoader } from "./loaderService";

const API = axios.create({
  baseURL: apibase || "http://localhost:5000/api",
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// src/services/interceptors.js

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    // or Redux

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    showLoader();
    return config;
  },
  (error) => {
    hideLoader();
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    hideLoader();
    return response;
  },
  (error) => {
    const status = error.response?.status;
    console.log(error);
    if (status === 401) {
      // Token expired / unauthorized
      //   localStorage.removeItem("token");
      // Optional: redirect to login
      //   window.location.href = "/login";
    }

    if (status === 403) {
      console.error("Forbidden access");
    }
    hideLoader();
    return Promise.reject(error);
  }
);

export default API;
