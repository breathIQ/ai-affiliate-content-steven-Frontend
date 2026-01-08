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