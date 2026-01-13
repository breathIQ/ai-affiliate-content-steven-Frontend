import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deletePost } from "../services/post.api";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";

const statusStyles = {
  Published: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  "Saved in Draft": "bg-yellow-100 text-yellow-700",
};

export default function RecentPostsTable({
  title,
  posts,
  pagination,
  handleSearch,
  loadPost,
}) {
  const [open, setOpen] = useState({1:false });
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [openModal, setOpenMadal] = useState();
  const [loading, setLoading] = useState(false);
 const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await deletePost(openModal);
      setLoading(false);
      
      if (!res?.success) {
        toast.error(res?.message || "Failed to delete post");
        return;
      }
      
      toast.success("Post deleted successfully");
      setOpen({});
      loadPost();
    } catch (err) {
      setLoading(false);
      toast.error(
        err?.response?.data?.error || err?.message || "Something went wrong"
      );
      // console.error("DELETE POST ERROR ❌", err);
      // toast.error("Something went wrong");
    }
  };


   useEffect(() => {
      const handleClickOutside = (e) => {
        if (!menuRef.current) return;
    
        if (!menuRef.current.contains(e.target)) {
          setOpen({});
        }
      };
    
      document.addEventListener("click", handleClickOutside);
    
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3">
        <h2 className="font-semibold text-gray-800">{title||"Recent Posts"}</h2>
        <div className="relative">
          <input
            type="text"
            onChange={handleSearch}
            placeholder="Search"
            className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <img src="/icons/ic-search.svg" />
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overfl-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              {/* <th className="p-3 text-left">
                <input type="checkbox" />
              </th> */}
              <th className="p-3 text-left">Media</th>
              <th className="p-3 text-left">Post</th>
              <th className="p-3 text-left">Chapter</th>
              <th className="p-3 text-left">Hashtags</th>
              <th className="p-3 text-left">AI</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {posts?.length == 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    {/* Simple Empty Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                      className="w-16 h-16 mb-4 opacity-20"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">
                      No posts found
                    </h3>
                    <p className="text-sm mt-1">
                      Try adjusting your filters or add a new post to get
                      started.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              posts?.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* <td className="p-3">
                  <input type="checkbox" />
                </td> */}

                  <td className="p-3">
                    <img
                      src={item.media || ""}
                      alt=""
                      className="w-10 h-10 rounded-md object-cover"
                    />
                  </td>

                  <td className="p-3 max-w-md">
                    <p className="text-gray-700 line-clamp-2">
                      {item.post_content}
                    </p>
                  </td>

                  <td className="p-3 text-gray-600">{item?.chapter_code ? item?.chapter_code+":":""}{item.chapter_name}</td>

                  <td className="p-3 text-gray-600">{item.hashtags_count || 0}</td>

                  <td className="p-3 text-lg">
                    {item.ai_generated ? (
                      <img src="/icons/ic-chatgpt.svg" />
                    ) : (
                      <img src="/icons/ic-claude.svg" />
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <div className="relative inline-block" ref={menuRef}>
                      {/* 3 dots */}
                      <button
                        onClick={(e) => {
                              e.stopPropagation() 
                          setOpen((prev)=>({[index+1]: !prev[index+1] }))
                          // console.log(open , index+1 ,open[index]);
                        }}
                        className="text-gray-400 text-start hover:text-gray-700 text-xl"
                      >
                        ⋯
                      </button>

                      {/* Dropdown */}
                      {open[index+1] && (
                        <div id="btns" onClick={(e) => e.stopPropagation()} className="absolute left-[-60px] mt-2 w-36 bg-white border rounded-lg shadow-lg z-50">
                          <button
                            className="w-full font-bold text-gray-600 flex align-center gap-2 px-4 py-2 hover:bg-gray-50"
                            onClick={() => {
                              if(user?.role_id==1){
                                navigate(`/admin/u/post/view/${item?.id}`, {
                                  state: item,
                                });
                              }else{
                              navigate(`/u/post/view/${item?.id}`)
                              }
                            }}
                          >
                            {/* /admin/u/ */}
                            <img src="/icons/ic-veiw.svg" />
                            View
                          </button>

                          <button
                            onClick={() => setOpenMadal(item.id)}
                            className="w-full font-bold text-gray-600 flex align-center gap-2 px-4 py-2 hover:bg-red-50"
                          >
                            <img src="/icons/ic-bin.svg" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            {}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination}
      </div>

      {/* Mobile hint */}
      <div className="p-3 text-xs text-gray-400 sm:hidden">
        Scroll horizontally →
      </div>
      <ConfirmDeleteModal
        isOpen={openModal}
        onClose={() => setOpenMadal(false)}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}
