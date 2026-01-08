import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/Layout/Layout";
import RecentPostsTable from "../components/RecentPostsTable";
import { useLocation } from "react-router-dom";
import { getPost } from "../services/post.api";
import GenerateContentModal from "../components/modals/GenerateContentModal";
import Library from "./user/Library";

export default function UsersLabs() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [postData, setPosts] = useState([]);
  const [totalPages, settotalPages] = useState(0);
  const [generatedData, setGeneratedData] = useState(null);
  const { state } = useLocation();
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      // Reset to page 1 when search changes to avoid empty results on high page numbers
      setPage(1);
    }, 1000);

    return () => clearTimeout(handler);
  }, [search]);
  useEffect(() => {
    loadPost();
  }, [page, rowsPerPage, debouncedSearch]);

  const loadPost = async () => {
    try {
      const response = await getPost(rowsPerPage, page, search,state?.id);
      setPosts(response?.data?.posts || []);
      settotalPages(response?.data?.pagination?.last_page || 1);
      setPage(response?.data?.pagination?.current_page);
      setRowsPerPage(response?.data?.pagination?.per_page);
    } catch (error) {
      console.log(error);
    }
  };

  if (generatedData) {
    console.log("Generated Data in UsersLabs 👉", generatedData);
    return <Library generatedData={generatedData} setGeneratedData={setGeneratedData} loadPost={loadPost} />;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              {state?.name || "USER "}'s Posts
            </h1>
            <p className="text-sm text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          {state?.id ? "" : <GenerateContentModal setGeneratedData={setGeneratedData} />}
        </div>
        <div className="">
          <RecentPostsTable
            posts={postData}
            handleSearch={setSearch}
            loadPost={loadPost}
            pagination={
              <>
                <div className="flex border-top flex-col md:flex-row md:items-center md:justify-between p-4 text-sm text-gray-500 gap-3">
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
              </>
            }
          />
        </div>
      </div>
    </Layout>
  );
}
