import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import API from "../../services/api";
import toast from "react-hot-toast";
import { formatDateTime } from "./Transactions";

const AREA_LABELS = {
  "image-generation": "Image generation",
  "video-render": "Video render",
  "social-publish": "Social publishing",
  "draft-text": "Text drafting",
};

function ErrorReports() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("open");
  const [resolving, setResolving] = useState(null); // report being resolved
  const [note, setNote] = useState("");

  const getData = async () => {
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (statusFilter) params.set("status", statusFilter);
      const response = await API.get(`admin/error-reports?${params.toString()}`);
      const payload = response?.data?.data;
      setRows(payload?.data || []);
      setLastPage(payload?.last_page || 1);
      setTotal(payload?.total || 0);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, [page, statusFilter]);

  const resolve = async () => {
    try {
      const response = await API.post(`admin/error-reports/${resolving.id}/resolve`, {
        note: note || null,
      });
      const emailed = response?.data?.data?.email_sent;
      toast.success(
        emailed
          ? "Resolved - the user has been emailed."
          : "Resolved. No email sent (user has no email on file or mail is not configured)."
      );
      setResolving(null);
      setNote("");
      getData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not resolve the report");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen pt-8 pb-10 px-4">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Errors</h1>
          <p className="text-sm text-gray-500">
            Every error users hit is reported here automatically. Resolving one
            emails the affected user that it has been fixed.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-3">
            <h2 className="font-medium">
              Error Reports <span className="text-gray-400 font-normal">({total})</span>
            </h2>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded-lg text-sm px-3 py-2 focus:outline-none"
            >
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="">All</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 text-start">When</th>
                  <th className="p-3 text-start">User</th>
                  <th className="p-3 text-start">Area</th>
                  <th className="p-3 text-start">What happened</th>
                  <th className="p-3 text-start">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400">
                      {statusFilter === "open"
                        ? "No open errors. All clear."
                        : "No error reports found."}
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50 align-top">
                      <td className="p-3 whitespace-nowrap text-gray-600">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="p-3">
                        {r.user ? (
                          <button
                            onClick={() => navigate(`/admin/users/${r.user.id}`)}
                            className="text-left"
                          >
                            <div className="font-medium text-blue-600 hover:underline">
                              {r.user.name}
                            </div>
                            <div className="text-xs text-gray-500">{r.user.email}</div>
                          </button>
                        ) : (
                          <span className="text-gray-400">System</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {AREA_LABELS[r.area] || r.area}
                        </span>
                      </td>
                      <td className="p-3 max-w-[380px]">
                        <div className="text-gray-800">{r.message}</div>
                        {r.detail && (
                          <div
                            className="text-xs text-gray-400 mt-1 truncate"
                            title={r.detail}
                          >
                            {r.detail}
                          </div>
                        )}
                        {r.context?.post_id && (
                          <button
                            onClick={() => navigate(`/admin/u/post/view/${r.context.post_id}`)}
                            className="text-[11px] text-blue-500 hover:underline mt-1"
                          >
                            View post #{r.context.post_id}
                          </button>
                        )}
                        {r.status === "resolved" && r.resolved_note && (
                          <div className="text-xs text-green-700 mt-1">
                            Resolution: {r.resolved_note}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                            r.status === "open"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {r.status === "open" ? "Open" : "Resolved"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {r.status === "open" && (
                          <button
                            onClick={() => {
                              setResolving(r);
                              setNote("");
                            }}
                            className="bg-black text-white text-xs px-3 py-2 rounded-md hover:bg-gray-800"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 text-sm text-gray-500">
            <span>
              Page {page} of {lastPage}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded-md disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= lastPage}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded-md disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Resolve modal */}
        {resolving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setResolving(null)} />
            <div className="relative bg-white w-full max-w-md rounded-xl shadow-lg z-50 p-6">
              <h2 className="text-lg font-semibold mb-1">Resolve error</h2>
              <p className="text-sm text-gray-500 mb-4">
                {resolving.user
                  ? `${resolving.user.name} will get an email saying the issue is resolved.`
                  : "No user is attached, so no email will be sent."}
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-4">
                {resolving.message}
              </p>
              <label className="text-sm font-medium text-gray-700">
                Note to include in the email (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. This was a temporary issue with our image provider. It is fixed now."
                className="w-full border rounded-lg text-sm p-3 mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setResolving(null)}
                  className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={resolve}
                  className="bg-black text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-800"
                >
                  Resolve &amp; email user
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ErrorReports;
