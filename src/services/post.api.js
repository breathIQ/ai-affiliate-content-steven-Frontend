import API from "./api";
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : {};
export const getPost = async (rowsPerPage, page, search, userId) => {
  const res = await API.get(
    `/${userId ? `admin/user/${userId ? userId : ""}/posts` : "user/posts"
    }?per_page=${rowsPerPage}&page=${page}&search=${search}`
  );
  return res.data;
};

export const createPost = async (data) => {
  const res = await API.post("/user/posts", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getChapter = async (data) => {
  const res = await API.get(`/user/get-chapter`);
  return res.data;
};

export const generateAIPost = async (data) => {
  const res = await API.post("/user/generate-ai-post", data);
  return res.data;
};

// Draft/approve flow: get caption text back for review without charging
// credits or generating images (draft_only: true baked in here).
export const draftPostText = async (data) => {
  const res = await API.post("/user/generate-ai-post", { ...data, draft_only: true });
  return res.data;
};

export const getSinglePost = async (id) => {
  console.log("user", user);

  const res = await API.get(
    `/${user?.role_id == 2 ? "user/posts" : "admin/post"}/${id}`
  );
  return res.data;
};

export const deletePost = async (id, role) => {
  const res = await API.delete(`${user?.role_id == 2 ? "/user/posts" : "/admin/post"}/${id}`);
  return res.data;
};

export const rePost = async (id) => {
  const res = await API.post(`/user/posts/${id}/repost`);
  return res.data;
};

// Publish an already-saved draft post (no media/caption changes, just platform selection)
export const publishPost = async (id, data) => {
  const res = await API.post(`/user/posts/${id}/publish`, data);
  return res.data;
};

// Replace a draft's media - used right after a newly-generated asset (e.g.
// Turn into Video) so it's persisted immediately instead of only living in
// this tab's memory until some later save action.
export const updatePostMedia = async (id, data) => {
  const res = await API.post(`/user/posts/${id}/media`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getChapterAngles = async (chapterId) => {
  const res = await API.get(`/user/chapters/${chapterId}/angles`);
  return res.data;
};
