import API from "./api";

export const getUserDashboardData = async () => {
  const res = await API.get("/user/dashboard");
  return res.data;
};