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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      // Reset to page 1 when search changes to avoid empty results on high page numbers
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);
  useEffect(() => {
    getUser();
  }, [page, rowsPerPage, debouncedSearch]);

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await API.delete(`/admin/user/${openModal}`);
      // console.log(response);
      getUser();
      setLoading(false);
      toast.success(response?.data?.message);
      setOpenMadal();
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error?.message);
      console.log(error);
    }
  };
  const deActivate = async (id, status) => {
    try {
      const response = await API.post(`/admin/update-status/${id}`, {
        status: status,
      });
      console.log(response);
      getUser();
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
      settotalPages(response?.data?.data?.last_page);
      setPage(response?.data?.data?.current_page);
      setRowsPerPage(response?.data?.data?.per_page);
    } catch (error) {
      console.log(error);
    }
  };
  const [open, setOpen] = useState({ 0: false });
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(e.target)) {
        setOpen({ 0: false });
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen pt-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">All Users</h1>
            <p className="text-sm text-gray-500">
              View and manage all your users in one place.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-3">
            <h2 className="font-medium">Users</h2>

            <div className="relative">
              {/* <span className="absolute right-3 top-2 text-gray-400">
                <img src="/icons/ic-search.svg" />
              </span> */}
              <input
                type="text"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="pl-4 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflouto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 text-start ">User</th>
                  <th className="p-3 text-start">Affiliate ID</th>
                  <th className="p-3 text-start">Posts Generated</th>
                  <th className="p-3 text-start">Posts Published</th>
                  <th className="p-3 text-start">Total Clicks</th>
                  <th className="p-3 text-start w-[250px] max-w-[250px] min-w-[250px]">Affiliate Link</th>
                  <th className="p-3 text-start">Social Accounts</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList?.length === 0 ? (
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
                          No user found
                        </h3>
                        <p className="text-sm mt-1">
                          Try adjusting your filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  userList.map((u, index) => (
                    <tr key={u.id} className="border-b ">
                      <td className="p-3">
                        <div className="flex gap-2">
                          <img
                            src={u?.avatar || "/images/defaultImage.png"}
                            alt="profile"
                            // onClick={() => setProfileOpen((v) => !v)}
                            className="w-9 h-9 rounded-full border border-gray-600 cursor-pointer"
                          />
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{u.affiliate_id || "0"}</td>
                      <td className="p-3">{u.posts_generated || "0"}</td>
                      <td className="p-3">{u.posts_published || "0"}</td>
                      <td className="p-3">{u.total_clicks || "0"}</td>
                      <td className="p-3 w-[250px] max-w-[250px] min-w-[250px]">
                        <div
                          className={`truncate ${u?.affiliate_link !== "Default"
                              ? "text-blue-500 underline cursor-pointer"
                              : ""
                            }`}
                          title={u?.affiliate_link !== "Default" ? u?.affiliate_link : ""}
                          onClick={() => {
                            if (u?.affiliate_link !== "Default" && u?.affiliate_link) {
                              window.open(u.affiliate_link, "_blank", "noopener,noreferrer");
                            }
                          }}
                        >
                          {u?.affiliate_link || ""}
                        </div>
                      </td>
                      <td className="p-3">{u?.social_accounts?.length > 0 ? u?.social_accounts?.map((account) => (
                        <div key={account.id} className="text-sm flex items-center gap-1">
                          {account.provider === "instagram" ? <img src="/icons/insta.svg" width={15} /> : account.provider === "tiktok" ? <img src="/icons/ic-tiktok.svg" width={15} /> : "Other"} <span className="text-[13px]">{account.username}</span>
                        </div>
                      )) : <div><img src="/icons/ic-close-circle.svg" alt="Not Connected" className="mx-auto" /></div>}</td>
                      <td className="p-3 text-center">
                        <div className="relative inline-block" ref={menuRef}>
                          {/* 3 dots */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpen({ [index]: !open[index] });
                            }}
                            className="text-gray-400 text-start hover:text-gray-700 text-xl"
                          >
                            ⋯
                          </button>

                          {/* Dropdown */}
                          {open[index] && (
                            <div
                              id="btns"
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-[-60px]  mt-2 w-[180px] bg-white border rounded-lg shadow-lg z-50"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();

                                  if (user?.role_id == 1) {
                                    navigate(`/admin/library`, {
                                      state: u,
                                    });
                                  } else {
                                    navigate(`/u/library`, {
                                      state: u,
                                    });
                                  }
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
                                onClick={() => {
                                  deActivate(u.id, u?.status == 1 ? 2 : 1);
                                }}
                                className="w-full font-bold text-gray-600 flex align-center gap-2 px-4 py-2 hover:bg-red-50"
                              >
                                {u?.status == 1 ? (
                                  <img src="/icons/ic-cancel.svg" />
                                ) : (
                                  <img src="/icons/ic-check.svg" />
                                )}
                                {u?.status == 1 ? "De-activate" : "Activate"}
                                {/* De-activate Affiliate */}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                { }
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
