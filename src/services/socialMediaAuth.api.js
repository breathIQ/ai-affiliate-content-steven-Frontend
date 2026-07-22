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

export const youtubeAccountLink = async () => {
  const res = await API.get("/user/youtube/link");
  return res.data;
}

export const xAccountLink = async () => {
  const res = await API.get("/user/x/link");
  return res.data;
}

export const getSocialMediaStatus = async () => {
  const res = await API.get("/user/social/accounts");
  return res.data;
};

export const disconnectSocialAccount = async (provider) => {
  const res = await API.delete(`/user/social/accounts/${provider}`);
  return res.data;
};