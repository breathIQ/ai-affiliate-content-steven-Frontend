import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout/Layout";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import toast from "react-hot-toast";


export default function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, settotalPages] = useState(0);
   const [openModal, setOpenMadal] = useState();
    const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    getUser();
  }, [page ,rowsPerPage,search]);

  
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await API.delete(`/admin/user/${openModal}`);
      // console.log(response);
      getUser()
      setLoading(false);
      toast.success(response?.data?.message);
      setOpenMadal();
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error?.message);
      console.log(error);
    }
  };
  const deActivate = async (id,status) => {
    try {
      const response = await API.post(`/admin/update-status/${id}`,{status:status});
      console.log(response);
      getUser()
      toast.success(response?.data?.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
      console.log(error);
    }
  };

  const getUser = async () => {
    try {
      let url = `/admin/user?per_page=${rowsPerPage}&page=${page}&search=${search}`;
      const response = await API.get(url);
      setUserList(response?.data?.data?.data || []);
      settotalPages(response?.data?.data?.total)
      setPage(response?.data?.data?.current_page)
      setRowsPerPage(response?.data?.data?.per_page)
    } catch (error) {
      console.log(error);
    }
  };
  const [open, setOpen] = useState({0:false});
  const menuRef = useRef(null);

 
  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">All Users</h1>
            <p className="text-sm text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-3">
            <h2 className="font-medium">Users</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="border rounded-lg px-4 py-2 text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  
                  <th className="p-3 text-start ">User</th>
                  <th className="p-3 text-start">Affiliate ID</th>
                  <th className="p-3 text-start">Posts Generated</th>
                  <th className="p-3 text-start">Posts Published</th>
                  <th className="p-3 text-start">Total Clicks</th>
                  {/* <th className="p-3 text-start">Conversion</th>
                  <th className="p-3 text-start">Joined On</th> */}
                  <th className="p-3 text-start">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((u,index) => (
                  <tr key={u.id} className="border-b">
                    {/* <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(u.id)}
                        onChange={() => toggleSelect(u.id)}
                      />
                    </td> */}
                    <td className="p-3">
                      <div className="flex gap-2">
                        <img
                          src={u?.avatar || "https://i.pravatar.cc/40"}
                          alt="profile"
                          // onClick={() => setProfileOpen((v) => !v)}
                          className="w-9 h-9 rounded-full border border-gray-600 cursor-pointer"
                        />
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{u.affiliate_id || "NA"}</td>
                    <td className="p-3">{u.postsGenerated || "NA"}</td>
                    <td className="p-3">{u.postsPublished || "NA"}</td>
                    <td className="p-3">{u.clicks || "NA"}</td>
                    {/* <td className="p-3">{u.conversion||"NA"}</td>
                    <td className="p-3 text-xs text-gray-500">{u.joinedOn||"NA"}</td> */}
                    <td className="p-3 relative">
                      <div className="relative inline-block" ref={menuRef}>
                        {/* 3 dots */}
                        <button
                      onClick={() => setOpen({[index]:!open[index]})}
                          className="text-gray-400 text-start hover:text-gray-700 text-xl"
                        >
                          ⋯
                        </button>

                        {/* Dropdown */}
                        {open[index] && (
                          <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-50">
                            <button
                              onClick={() => {                                
                                navigate(`/users/labs`,{
                                  state:u
                                });
                              }}
                              className="w-full font-bold text-gray-600 flex align-center gap-2 px-4 py-2 hover:bg-gray-50"
                            >
                              <img src="/icons/ic-veiw.svg" />
                              View
                            </button>
                           <button
                                onClick={() => setOpenMadal(u.id)}
                                className="w-full font-bold text-gray-600 flex align-center gap-2 px-4 py-2 hover:bg-red-50"
                              >
                                <img src="/icons/ic-bin.svg" />
                                Delete
                              </button>
                            <button 
                            onClick={()=>{
                              deActivate(u.id,u?.status == 1 ? 2:1)
                            }}
                            className="w-full font-bold text-gray-600 flex align-center gap-2 px-4 py-2 hover:bg-red-50">
                              <img src="/icons/ic-cancel.svg" />
                              De-activate Affiliate
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 text-sm text-gray-500 gap-3">
            <div>
              Rows per page:
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="ml-2 border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="border px-2 rounded disabled:opacity-50"
              >
                ‹
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border px-2 rounded disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
       <ConfirmDeleteModal
        isOpen={openModal}
        onClose={() => setOpenMadal(false)}
        onConfirm={handleDelete}
        loading={loading}
      />
    </Layout>
  );
}
