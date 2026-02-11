import API from "./api";
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : {};
export const getPost = async (rowsPerPage, page, search, userId) => {
  const res = await API.get(
    `/${
      userId ? `admin/user/${userId ? userId : ""}/posts` : "user/posts"
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

export const getSinglePost = async (id) => {
  console.log("user" ,user);
  
  const res = await API.get(
    `/${user?.role_id == 2 ? "user/posts" : "admin/post"}/${id}`
  );
  return res.data;
};

export const deletePost = async (id,role) => {
  const res = await API.delete(`${user?.role_id == 2 ? "/user/posts" : "/admin/post"}/${id}`);
  return res.data;
};
