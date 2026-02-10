import API from "./api";

export const tiktokSignin = async () => {
  const res = await API.get("/auth/tiktok/redirect");
  return res.data;
};

export const instagramSignin = async () => {
  const res = await API.get("auth/instagram/redirect");
  return res.data;
};

export const tiktokAccountLink = async () => {
  const res = await API.get("/user/tiktok/link");
  return res.data;
}

export const instagramAccountLink = async () => {
  const res = await API.get("/user/instagram/link");
  return res.data;
}

export const getSocialMediaStatus = async () => {
  const res = await API.get("/user/social/accounts");
  return res.data;
};