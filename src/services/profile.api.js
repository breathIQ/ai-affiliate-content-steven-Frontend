// src/services/profile.api.js
import API from "./api";

export const getUserProfile = async () => {
  const res = await API.get("/user/profile");
  return res.data;
};

export const getAdminProfile = async () => {
  const res = await API.get("/admin/profile");
  return res.data;
};

export const updateUserProfile = async (data) => {
  const res = await API.post("/user/update-profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateAdminProfile = async (data) => {
  const res = await API.post("/admin/update-profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateUserPassword = async (data) => {
  const res = await API.post("/user/change-password", data);
  return res.data;
};

export const updateAdminPassword = async (data) => {
  const res = await API.post("/admin/change-password", data);
  return res.data;
};