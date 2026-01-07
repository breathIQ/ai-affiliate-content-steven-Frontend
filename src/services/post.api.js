import API from "./api";

export const getPost = async (rowsPerPage,page,search) => {
  const res = await API.get(`/user/posts?per_page=${rowsPerPage}&page=${page}&search=${search}`);
  return res.data;
};
