import axios from "axios";
import { apibase } from "./contants";

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
    const token = localStorage.getItem("access_token")
 // or Redux

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
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

    return Promise.reject(error);
  }
);


export default API;