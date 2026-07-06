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

// Selfie -> personal HeyGen photo avatar. formData: name, photo (file),
// consent ("1"). Capped at 3 live avatars per user server-side.
export const createPhotoAvatar = async (formData) => {
  const res = await API.post(`/user/heygen/photo-avatars`, formData);
  return res.data;
};

export const getPhotoAvatars = async () => {
  const res = await API.get(`/user/heygen/photo-avatars`);
  return res.data;
};

export const deletePhotoAvatar = async (id) => {
  const res = await API.delete(`/user/heygen/photo-avatars/${id}`);
  return res.data;
};
