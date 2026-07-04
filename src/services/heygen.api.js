import API from "./api";

// Draft/approve flow: get a spoken script back for review before anything is
// sent to HeyGen. Free - no credits charged for this step.
export const draftScript = async (data) => {
  const res = await API.post(`/user/heygen/draft-script`, data);
  return res.data;
};

export const generateVideo = async (data) => {
  const res = await API.post(`/user/heygen/generate`, data);
  return res.data;
};

export const getVideoGenerations = async () => {
  const res = await API.get(`/user/heygen/generations`);
  return res.data;
};

export const getVideoGenerationStatus = async (id) => {
  const res = await API.get(`/user/heygen/generations/${id}/status`);
  return res.data;
};

export const getAvatars = async () => {
  const res = await API.get(`/user/heygen/avatars`);
  return res.data;
};

export const toggleFavoriteAvatar = async (avatar) => {
  const res = await API.post(`/user/heygen/avatars/favorite`, {
    avatar_id: avatar.avatar_id,
    avatar_name: avatar.avatar_name,
    preview_image_url: avatar.preview_image_url,
  });
  return res.data;
};
