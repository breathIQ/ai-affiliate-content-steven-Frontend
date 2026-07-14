import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import {
  getCampaignPost,
  reorderPostMedia,
  deletePostSlide,
  regeneratePostSlide,
} from "../../services/campaign.api";

// Preview + arrange the slides of a campaign post in the order they'll appear.
// Reorder, remove a slide, or regenerate a single educational slide in place.
const CampaignPostPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // "reorder" | mediaId (regen/delete)
  const [dragIndex, setDragIndex] = useState(null); // index being dragged
  const [overIndex, setOverIndex] = useState(null); // index currently hovered as drop target

  const load = async () => {
    try {
      const res = await getCampaignPost(id);
      setPost(res.data);
    } catch {
      toast.error("Could not load this post.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const media = post?.media ?? [];
  const officialId = post?.official_media_id ?? null;

  // Optimistically apply a new order, then persist (revert to server truth on error).
  const persistOrder = async (next) => {
    setPost((p) => ({ ...p, media: next }));
    try {
      await reorderPostMedia(id, next.map((m) => m.id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not reorder.");
      load();
    }
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= media.length) return;
    const next = [...media];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  };

  // Drag-and-drop reorder (desktop). The arrow buttons stay as the
  // touch/keyboard fallback since native HTML5 drag doesn't fire on mobile.
  const onDragStart = (index) => (e) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Firefox needs data set for the drag to start.
    e.dataTransfer.setData("text/plain", String(index));
  };
  const onDragOver = (index) => (e) => {
    e.preventDefault(); // required to allow dropping
    e.dataTransfer.dropEffect = "move";
    if (overIndex !== index) setOverIndex(index);
  };
  const onDrop = (index) => (e) => {
    e.preventDefault();
    const from = dragIndex;
    setDragIndex(null);
    setOverIndex(null);
    if (from === null || from === index) return;
    const next = [...media];
    const [item] = next.splice(from, 1);
    next.splice(index, 0, item);
    persistOrder(next);
  };
  const onDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const remove = async (mediaId) => {
    if (!window.confirm("Remove this slide?")) return;
    setBusy(mediaId);
    try {
      await deletePostSlide(id, mediaId);
      await load();
      toast.success("Slide removed.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not remove the slide.");
    } finally {
      setBusy(null);
    }
  };

  const regen = async (mediaId) => {
    setBusy(mediaId);
    try {
      await regeneratePostSlide(id, mediaId);
      await load(); // re-fetch to pick up the new image (new filename)
      toast.success("Slide regenerated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not regenerate the slide.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">Loading…</div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">Post not found.</div>
      </Layout>
    );
  }

  const reviewChip =
    post.review_status === "pending" ? (
      <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">Awaiting admin review</span>
    ) : post.review_status === "rejected" ? (
      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Rejected</span>
    ) : null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-3">
          ← Back
        </button>

        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-xl font-semibold text-gray-800">Arrange slides</h1>
          {post.campaign_name && (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">{post.campaign_name}</span>
          )}
          {reviewChip}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          These appear in this order. Drag a slide to reorder (or use the arrows), remove one, or regenerate a
          single educational slide.
        </p>

        {post.review_note && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>Review note:</strong> {post.review_note}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {media.map((m, index) => {
            const isOfficial = officialId && m.id === officialId;
            const rowBusy = busy === m.id;
            return (
              <div
                key={m.id}
                draggable={!busy}
                onDragStart={onDragStart(index)}
                onDragOver={onDragOver(index)}
                onDrop={onDrop(index)}
                onDragEnd={onDragEnd}
                className={`bg-white border rounded-xl p-3 transition-shadow ${
                  busy ? "" : "cursor-grab active:cursor-grabbing"
                } ${dragIndex === index ? "opacity-40" : ""} ${
                  overIndex === index && dragIndex !== null && dragIndex !== index
                    ? "ring-2 ring-purple-400 shadow-lg"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    <span className="mr-1.5 select-none text-gray-300" title="Drag to reorder">⠿</span>
                    Slide {index + 1}
                    {isOfficial && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Product image</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || busy}
                      className="text-xs px-2 py-1 rounded border disabled:opacity-40"
                      title="Move up / earlier"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === media.length - 1 || busy}
                      className="text-xs px-2 py-1 rounded border disabled:opacity-40"
                      title="Move down / later"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                <div className="relative">
                  {/* Natural aspect ratio — slides are generated 1024x1536 (2:3); forcing
                      4:5 with object-cover cropped the headline off the top. */}
                  <img
                    src={m.url}
                    alt={`Slide ${index + 1}`}
                    draggable={false}
                    className="w-full rounded-lg border"
                  />
                  {rowBusy && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg text-sm text-gray-600">
                      Working…
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  {!isOfficial && (
                    <button
                      onClick={() => regen(m.id)}
                      disabled={!!busy}
                      className="text-xs px-3 py-1 rounded-lg border text-purple-700 border-purple-300 disabled:opacity-40"
                    >
                      Regenerate
                    </button>
                  )}
                  <button
                    onClick={() => remove(m.id)}
                    disabled={!!busy || media.length <= 1}
                    className="text-xs px-3 py-1 rounded-lg border border-red-300 text-red-600 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-white border rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Caption</p>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{post.caption}</p>
          {post.affiliate_url && (
            <p className="text-xs text-gray-400 mt-3 break-all">Share link: {post.affiliate_url}</p>
          )}
        </div>

        <div className="flex justify-between mt-5">
          <button onClick={() => navigate("/u/library")} className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to library
          </button>
          {post.status === "draft" && !(post.requires_human_review && post.review_status !== "approved") && (
            <button
              onClick={() => navigate(`/u/post/view/${post.id}`)}
              className="bg-purple-700 text-white px-5 py-2 rounded-lg text-sm"
            >
              Continue to publish →
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CampaignPostPreview;
