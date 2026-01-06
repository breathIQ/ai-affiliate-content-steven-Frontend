import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout/Layout";
import API from "../services/api";
import RecentPostsTable from "../components/RecentPostsTable";
import { useLocation } from "react-router-dom";
import { getPost } from "../services/post.api";

export default function UsersLabs() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [userList, setUserList] = useState([]);
  const [totalPages, settotalPages] = useState(0);
  const { state } = useLocation();
 
  const loadPost = async () => {
    try {
      const response = await getPost(rowsPerPage,page,search);
      setUserList(response?.data?.data || []);
      settotalPages(response?.data?.total);
      setPage(response?.data?.current_page);
      setRowsPerPage(response?.data?.per_page);
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
        </div>

        <div className="">
          <RecentPostsTable />
        </div>
      </div>
    </Layout>
  );
}
