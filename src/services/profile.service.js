// src/services/profile.service.js
import { getUserProfile, getAdminProfile, updateAdminProfile, updateUserProfile, updateAdminPassword, updateUserPassword } from "./profile.api";
import { mapProfileResponse } from "./profile.mapper";

export const getProfileByRole = async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user?.role_id) {
    throw new Error("User role not found");
  }

  let response;

  if (user.role_id === 1) {
    response = await getAdminProfile();
  } else if (user.role_id === 2) {
    response = await getUserProfile();
  }

  return mapProfileResponse(response, user.role_id);
};

export const updateProfileByRole = async (formData) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.role_id === 1) {
    return updateAdminProfile(formData);
  }

  if (user?.role_id === 2) {
    return updateUserProfile(formData);
  }

  throw new Error("Invalid role");
};

export const updatePasswordByRole = async (payload) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user?.role_id) {
    throw new Error("User role not found");
  }

  if (user.role_id === 1) {
    return updateAdminPassword(payload);
  }

  if (user.role_id === 2) {
    return updateUserPassword(payload);
  }

  throw new Error("Invalid role");
};