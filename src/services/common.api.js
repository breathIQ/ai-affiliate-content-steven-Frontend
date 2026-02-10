import API from "./api";

export const getTerms = async () => {
  const res = await API.get("/content/terms-conditions");
  return res.data;
};

export const getPrivacy = async () => {
  const res = await API.get("/content/privacy-policy");
  return res.data;
};