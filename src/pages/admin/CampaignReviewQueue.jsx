import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import {
  adminGetReviewQueue,
  adminApproveCampaignPost,
  adminRejectCampaignPost,
} from "../../services/campaign.api";

const CampaignReviewQueue = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetReviewQueue();
      setPosts(res?.data ?? []);
    } catch {
      toast.error("Could not load the review queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    setBusyId(id);
    try {
      await adminApproveCampaignPost(id);
      toast.success("Post approved.");
      setPosts((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Approve failed.");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    const note = window.prompt("Reason for rejection (shown to the affiliate):");
    if (!note) return;
    setBusyId(id);
    try {
      await adminRejectCampaignPost(id, note);
      toast.success("Post rejected.");
      setPosts((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reject failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 min-h-screen">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Campaign Review Queue</h1>
        <p className="text-sm text-gray-500 mb-6">
          Flagged affiliate campaign posts awaiting approval before they can publish.
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing waiting for review. 🎉</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {post.campaign?.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {post.user?.name} ({post.user?.email})
                      </span>
                    </div>

                    {Array.isArray(post.review_reasons) && post.review_reasons.length > 0 && (
                      <ul className="mt-3 list-disc pl-5 text-xs text-amber-700">
                        {post.review_reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}

                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700 border rounded-lg p-3 bg-gray-50">
                      {post.caption}
                    </p>

                    {post.compliance_meta && (
                      <p className="mt-2 text-xs text-gray-400">
                        Claims: {(post.compliance_meta.claim_ids_used || []).join(", ") || "—"} · Facts:{" "}
                        {(post.compliance_meta.fact_ids_used || []).join(", ") || "—"}
                        {post.compliance_meta.image_asset_key
                          ? ` · Image: ${post.compliance_meta.image_asset_key}`
                          : ""}
                      </p>
                    )}
                  </div>

                  {Array.isArray(post.media) && post.media.length > 0 && (
                    <div className="flex gap-2 shrink-0">
                      {post.media.slice(0, 3).map((m) => (
                        <img
                          key={m.id}
                          src={m.url}
                          alt=""
                          className="w-20 h-24 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => reject(post.id)}
                    disabled={busyId === post.id}
                    className="px-4 py-2 rounded-lg text-sm border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approve(post.id)}
                    disabled={busyId === post.id}
                    className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    {busyId === post.id ? "…" : "Approve"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CampaignReviewQueue;
