import API from "./api";

// Turn an already-generated post image into a short video via Grok's
// image-to-video mode. duration_seconds must be 6 or 10.
export const generateVideoFromImage = async (data) => {
  const res = await API.post(`/user/grok/generate-video`, data);
  return res.data;
};

export const getGrokVideoStatus = async (id) => {
  const res = await API.get(`/user/grok/videos/${id}/status`);
  return res.data;
};
