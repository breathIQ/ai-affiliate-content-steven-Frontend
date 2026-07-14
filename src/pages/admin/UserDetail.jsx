import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import API from "../../services/api";
import { TransactionsTable, formatDateTime } from "./Transactions";

const PLATFORM_ICONS = {
  instagram: "/icons/insta.svg",
  instagram_story: "/icons/insta.svg",
  tiktok: "/icons/ic-tiktok.svg",
};

const POST_STATUS_BADGES = {
  published: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-700",
  pending_render: "bg-amber-100 text-amber-700",
};

function StatChip({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function Pager({ page, lastPage, onChange }) {
  if (lastPage <= 1) return null;
  return (
    <div className="flex items-center justify-between p-4 text-sm text-gray-500">
      <span>
        Page {page} of {lastPage}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1 border rounded-md disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1 border rounded-md disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsLastPage, setPostsLastPage] = useState(1);

  const [txns, setTxns] = useState([]);
  const [txnsPage, setTxnsPage] = useState(1);
  const [txnsLastPage, setTxnsLastPage] = useState(1);

  useEffect(() => {
    API.get(`admin/user/${id}`)
      .then((res) => setUser(res?.data?.data))
      .catch(console.log);
  }, [id]);

  useEffect(() => {
    API.get(`admin/user/${id}/posts?page=${postsPage}&per_page=10`)
      .then((res) => {
        setPosts(res?.data?.data?.posts || []);
        setPostsLastPage(res?.data?.data?.pagination?.last_page || 1);
      })
      .catch(console.log);
  }, [id, postsPage]);

  useEffect(() => {
    API.get(`admin/transactions?user_id=${id}&page=${txnsPage}&per_page=10`)
      .then((res) => {
        setTxns(res?.data?.data?.data || []);
        setTxnsLastPage(res?.data?.data?.last_page || 1);
      })
      .catch(console.log);
  }, [id, txnsPage]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen pt-8 pb-10 px-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          &larr; Back
        </button>

        {/* Profile header */}
        {user && (
          <div className="bg-white rounded-xl shadow p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <img
                src={user.avatar || "/images/defaultImage.png"}
                alt="profile"
                className="w-16 h-16 rounded-full border border-gray-300 object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold">{user.name}</h1>
                  <span
                    className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                      user.status == 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status == 1 ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">
                  Affiliate ID: {user.affiliate_id || "none"} &bull; Joined{" "}
                  {formatDateTime(user.created_at)}
                </p>
                {/* Social accounts */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {(user.social_accounts || []).length === 0 && (
                    <span className="text-xs text-gray-400">
                      No social accounts connected
                    </span>
                  )}
                  {(user.social_accounts || []).map((acc, i) =>
                    acc.profile_url ? (
                      <a
                        key={i}
                        href={acc.profile_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 bg-gray-50 border rounded-full px-3 py-1 text-xs text-blue-600 hover:underline"
                      >
                        <img
                          src={PLATFORM_ICONS[acc.provider]}
                          alt={acc.provider}
                          width={13}
                        />
                        {acc.username || acc.provider}
                      </a>
                    ) : (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-gray-50 border rounded-full px-3 py-1 text-xs text-gray-600"
                      >
                        <img
                          src={PLATFORM_ICONS[acc.provider]}
                          alt={acc.provider}
                          width={13}
                        />
                        {acc.username || acc.provider}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatChip label="Credits" value={user.credits_balance ?? 0} />
                <StatChip label="Posts" value={user.posts_generated ?? 0} />
                <StatChip label="Published" value={user.posts_published ?? 0} />
                <StatChip label="Clicks" value={user.total_clicks ?? 0} />
              </div>
            </div>
          </div>
        )}

        {/* Transactions */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-medium">Transactions</h2>
          </div>
          <TransactionsTable rows={txns} showUser={false} />
          <Pager page={txnsPage} lastPage={txnsLastPage} onChange={setTxnsPage} />
        </div>

        {/* Posts */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-medium">Posts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 text-start">Post</th>
                  <th className="p-3 text-start">Status</th>
                  <th className="p-3 text-start">Platforms</th>
                  <th className="p-3 text-start">Created</th>
                  <th className="p-3 text-start">Published</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400">
                      No posts yet.
                    </td>
                  </tr>
                ) : (
                  posts.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/admin/u/post/view/${p.id}`)}
                          className="flex items-center gap-3 text-left"
                        >
                          {p.media &&
                            (p.media_type === "video" ? (
                              <video
                                src={p.media}
                                className="w-10 h-10 rounded object-cover bg-gray-100"
                                muted
                              />
                            ) : (
                              <img
                                src={p.media}
                                alt=""
                                className="w-10 h-10 rounded object-cover bg-gray-100"
                              />
                            ))}
                          <span className="text-blue-600 hover:underline max-w-[300px] truncate">
                            {p.post_content || `Post #${p.id}`}
                          </span>
                        </button>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                            POST_STATUS_BADGES[p.status] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(p.platforms || []).map((pl, i) => {
                            const acc = (user?.social_accounts || []).find(
                              (a) =>
                                a.provider ===
                                (pl.platform === "instagram_story"
                                  ? "instagram"
                                  : pl.platform)
                            );
                            const chip = (
                              <span
                                className={`flex items-center gap-1 text-[11px] border rounded-full px-2 py-[2px] whitespace-nowrap ${
                                  pl.status === "published"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : pl.status === "failed"
                                    ? "bg-red-50 text-red-600 border-red-200"
                                    : "bg-gray-50 text-gray-500"
                                }`}
                              >
                                <img
                                  src={PLATFORM_ICONS[pl.platform]}
                                  alt=""
                                  width={11}
                                />
                                {pl.platform.replace("_", " ")}
                                {pl.clicks > 0 ? ` (${pl.clicks} clicks)` : ""}
                              </span>
                            );
                            return pl.status === "published" &&
                              acc?.profile_url ? (
                              <a
                                key={i}
                                href={acc.profile_url}
                                target="_blank"
                                rel="noreferrer"
                                title={`Open ${acc.username} on ${pl.platform}`}
                              >
                                {chip}
                              </a>
                            ) : (
                              <span key={i}>{chip}</span>
                            );
                          })}
                          {(p.platforms || []).length === 0 && (
                            <span className="text-xs text-gray-400">none</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap text-gray-600">
                        {p.created_at}
                      </td>
                      <td className="p-3 whitespace-nowrap text-gray-600">
                        {p.published_at ? formatDateTime(p.published_at) : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pager page={postsPage} lastPage={postsLastPage} onChange={setPostsPage} />
        </div>
      </div>
    </Layout>
  );
}

export default UserDetail;
