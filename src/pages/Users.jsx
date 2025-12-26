import React, { useMemo, useState } from "react";
import Layout from "../components/Layout/Layout";

const USERS = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  affiliateId: `affiliate${i + 1}`,
  postsGenerated: Math.floor(Math.random() * 150),
  postsPublished: Math.floor(Math.random() * 120),
  clicks: Math.floor(Math.random() * 6000),
  conversion: `${Math.floor(Math.random() * 35)}%`,
  joinedOn: "15-12-2025 17:31:52",
}));

export default function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    return USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const start = (page - 1) * rowsPerPage;
  const paginated = filtered.slice(start, start + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen  md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Lorem Ipsum</h1>
            <p className="text-sm text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">
            + View Join Requests
          </button>
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
                  <th className="p-3">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? paginated.map((u) => u.id) : []
                        )
                      }
                    />
                  </th>
                  <th className="p-3 text-start ">User</th>
                  <th className="p-3 text-start">Affiliate ID</th>
                  <th className="p-3 text-start">Posts Generated</th>
                  <th className="p-3 text-start">Posts Published</th>
                  <th className="p-3 text-start">Total Clicks</th>
                  <th className="p-3 text-start">Conversion</th>
                  <th className="p-3 text-start">Joined On</th>
                  <th className="p-3 text-start">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(u.id)}
                        onChange={() => toggleSelect(u.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="p-3">{u.affiliateId}</td>
                    <td className="p-3">{u.postsGenerated}</td>
                    <td className="p-3">{u.postsPublished}</td>
                    <td className="p-3">{u.clicks.toLocaleString()}</td>
                    <td className="p-3">{u.conversion}</td>
                    <td className="p-3 text-xs text-gray-500">{u.joinedOn}</td>
                    <td className="p-3 text-gray-400 cursor-pointer">•••</td>
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
    </Layout>
  );
}
