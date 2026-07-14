import API from "./api";

const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : {};

// ---- Affiliate-facing (co2education / co2inhaler / co2suit / co2sauna) ----

export const getCampaigns = async () => {
  const res = await API.get("/user/campaigns");
  return res.data;
};

// Draft/approve flow for a campaign post: text + compliance lint only, no
// credits charged, nothing saved (draft_only baked in).
export const draftCampaignText = async (data) => {
  const res = await API.post("/user/campaigns/generate", { ...data, draft_only: true });
  return res.data;
};

// Final generation: images + server-side draft Post creation.
export const generateCampaignPost = async (data) => {
  const res = await API.post("/user/campaigns/generate", data);
  return res.data;
};

// Fetch a single post (slides + caption) for the campaign preview page.
export const getCampaignPost = async (id) => {
  const res = await API.get(`/user/posts/${id}`);
  return res.data;
};

// Persist a new slide order. `order` is an array of media IDs in the desired order.
export const reorderPostMedia = async (id, order) => {
  const res = await API.post(`/user/posts/${id}/media/reorder`, { order });
  return res.data;
};

// Remove one slide from a post.
export const deletePostSlide = async (postId, mediaId) => {
  const res = await API.delete(`/user/posts/${postId}/media/${mediaId}`);
  return res.data;
};

// Regenerate a single educational slide in place.
export const regeneratePostSlide = async (postId, mediaId) => {
  const res = await API.post(`/user/campaigns/posts/${postId}/slides/${mediaId}/regenerate`);
  return res.data;
};

// ---- Automation campaigns (scheduled auto-published sequences) ----

export const getAutomations = async () => {
  const res = await API.get("/user/automations");
  return res.data;
};

export const getAutomation = async (id) => {
  const res = await API.get(`/user/automations/${id}`);
  return res.data;
};

export const createAutomation = async (data) => {
  const res = await API.post("/user/automations", data);
  return res.data;
};

export const updateAutomation = async (id, data) => {
  const res = await API.put(`/user/automations/${id}`, data);
  return res.data;
};

export const setAutomationStatus = async (id, status) => {
  const res = await API.post(`/user/automations/${id}/status`, { status });
  return res.data;
};

export const deleteAutomation = async (id) => {
  const res = await API.delete(`/user/automations/${id}`);
  return res.data;
};

// ---- Admin: campaigns, approved copy, official images, review queue ----

export const adminGetCampaigns = async () => {
  const res = await API.get("/admin/campaigns");
  return res.data;
};

export const adminGetCampaign = async (id) => {
  const res = await API.get(`/admin/campaigns/${id}`);
  return res.data;
};

export const adminUpdateCampaign = async (id, data) => {
  const res = await API.put(`/admin/campaigns/${id}`, data);
  return res.data;
};

export const adminGetCopyItems = async (params = {}) => {
  const res = await API.get("/admin/campaign-copy-items", { params });
  return res.data;
};

export const adminCreateCopyItem = async (data) => {
  const res = await API.post("/admin/campaign-copy-items", data);
  return res.data;
};

export const adminUpdateCopyItem = async (id, data) => {
  const res = await API.put(`/admin/campaign-copy-items/${id}`, data);
  return res.data;
};

export const adminDeleteCopyItem = async (id) => {
  const res = await API.delete(`/admin/campaign-copy-items/${id}`);
  return res.data;
};

export const adminApproveCopyItem = async (id) => {
  const res = await API.post(`/admin/campaign-copy-items/${id}/approve`);
  return res.data;
};

export const adminGetCampaignAssets = async (campaignId) => {
  const res = await API.get(`/admin/campaigns/${campaignId}/assets`);
  return res.data;
};

export const adminUploadCampaignAsset = async (campaignId, formData) => {
  const res = await API.post(`/admin/campaigns/${campaignId}/assets`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const adminSetCurrentAsset = async (campaignId, assetId) => {
  const res = await API.post(`/admin/campaigns/${campaignId}/assets/${assetId}/current`);
  return res.data;
};

export const adminDeleteCampaignAsset = async (campaignId, assetId) => {
  const res = await API.delete(`/admin/campaigns/${campaignId}/assets/${assetId}`);
  return res.data;
};

export const adminGetReviewQueue = async () => {
  const res = await API.get("/admin/campaigns-review-queue");
  return res.data;
};

export const adminApproveCampaignPost = async (postId) => {
  const res = await API.post(`/admin/campaigns-review/${postId}/approve`);
  return res.data;
};

export const adminRejectCampaignPost = async (postId, note) => {
  const res = await API.post(`/admin/campaigns-review/${postId}/reject`, { note });
  return res.data;
};

export { user };
