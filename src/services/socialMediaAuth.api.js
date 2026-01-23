import API from "./api";

export const tiktokSignin = async () => {
  const res = await API.get("/auth/tiktok/redirect");
  return res.data;
};