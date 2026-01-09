import API from "./api";

export const getPost = async (rowsPerPage,page,search,userId) => {

  const res = await API.get(`/${userId ? `admin/user/${userId?userId:""}/posts`:"user/posts"}?per_page=${rowsPerPage}&page=${page}&search=${search}`);
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
  const formData = new FormData();

  formData.append("chapter", data.chapter);
  formData.append("model", data.model);
  formData.append("prompt", data.prompt);

  const res = await API.post("/user/generate-ai-post", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getSinglePost = async (id) => {
  const res = await API.get(`/user/posts/${id}`);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await API.delete(`/user/posts/${id}`);
  return res.data;
};