import API from "./api";

export const getPost = async (rowsPerPage,page,search) => {
  const res = await API.get(`/admin/user/posts?per_page=${rowsPerPage}&page=${page}&search=${search}`);
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