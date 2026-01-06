import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout/Layout";
import API from "../services/api";
import RecentPostsTable from "../components/RecentPostsTable";
import { useLocation } from "react-router-dom";

export default function UsersLabs() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [userList, setUserList] = useState([]);
  const [totalPages, settotalPages] = useState(0);
  const { state } = useLocation();
 

  // console.log("state", state);

  const getPost = async () => {
    try {
      let url = `/admin/user/posts?per_page=${rowsPerPage}&page=${page}&search=${search}`;
      const response = await API.get(url);
      console.log("response ", response);
      setUserList(response?.data?.data?.data || []);
      settotalPages(response?.data?.data?.total);
      setPage(response?.data?.data?.current_page);
      setRowsPerPage(response?.data?.data?.per_page);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{state?.name}'s Posts</h1>
            <p className="text-sm text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          {/* <button className="bg-gray-900 text-white py-[10px] px-[16px]flex align-center gap-2 rounded-lg text-sm">
            <img src="/icons/folderback.svg" /> View Join Requests
          </button> */}
        </div>

        <div className="">
          <RecentPostsTable />
        </div>
      </div>
    </Layout>
  );
}
