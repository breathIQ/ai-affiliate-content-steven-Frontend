import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import {
  getAutomations,
  createAutomation,
  setAutomationStatus,
  deleteAutomation,
} from "../../services/campaign.api";
import { getChapter } from "../../services/post.api";
import { getCampaigns } from "../../services/campaign.api";
import { getArticles } from "../../services/article.api";
import { getAvatars } from "../../services/heygen.api";
import AutomationBuilder from "../../components/automation/AutomationBuilder";

// Automation campaigns: build a day-by-day sequence of content (carousels,
// HeyGen videos, image-to-video, product promos) that generate and publish
// themselves with no review. This page lists existing sequences and hosts the
// builder for creating a new one.
const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-gray-100 text-gray-600",
};

const CONTENT_LABELS = {
  carousel_images: "Carousel images",
  heygen_video: "HeyGen video",
  image_to_video: "Image → video",
  product_promo: "Product promo",
  article_images: "Article images",
  article_video: "Article video",
};

// "article-19" is unreadable in a list; show the article's real title when we
// have it loaded, and fall back to the slug for product campaigns.
const articleTitle = (articles, slug) => {
  const a = articles.find((x) => x.slug === slug);
  return a ? `#${a.article_number} ${a.title}` : null;
};

const STEP_STATUS_STYLES = {
  pending: "text-gray-400",
  running: "text-blue-600",
  queued: "text-green-600",
  review: "text-amber-600",
  failed: "text-red-600",
  skipped: "text-gray-400",
};

const Automations = () => {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [articles, setArticles] = useState([]);
  const [avatars, setAvatars] = useState([]);

  const load = async () => {
    try {
      const res = await getAutomations();
      setAutomations(res?.data || []);
    } catch {
      toast.error("Could not load automations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Reference data for the builder dropdowns.
    getChapter().then((r) => setChapters(r?.data || [])).catch(() => {});
    getCampaigns().then((r) => setCampaigns(r?.data?.campaigns || [])).catch(() => {});
    getArticles().then((r) => setArticles(r?.data?.articles || [])).catch(() => {});
    getAvatars()
      .then((r) => {
        const d = r?.data || {};
        // avatars endpoint returns grouped sections; flatten to a simple list.
        const favorites = [].concat(d.personal_favorites || [], d.global_favorites || []);
        const favoriteIds = new Set(favorites.map((a) => a && a.avatar_id).filter(Boolean));
        const flat = []
          .concat(d.my_avatars || [], favorites, d.recently_used || [], d.all || [])
          .filter((a) => a && a.avatar_id);
        // De-dupe by avatar_id, keeping the favorite flag for the picker's tabs.
        const seen = new Set();
        setAvatars(
          flat
            .filter((a) => (seen.has(a.avatar_id) ? false : seen.add(a.avatar_id)))
            .map((a) => ({ ...a, is_favorite: favoriteIds.has(a.avatar_id) }))
        );
      })
      .catch(() => {});
  }, []);

  const toggleStatus = async (a) => {
    const next = a.status === "active" ? "paused" : "active";
    try {
      await setAutomationStatus(a.id, next);
      setAutomations((list) => list.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
    } catch {
      toast.error("Could not update status.");
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Delete automation "${a.name}"? Steps that haven't run yet are cancelled.`)) return;
    try {
      await deleteAutomation(a.id);
      setAutomations((list) => list.filter((x) => x.id !== a.id));
      toast.success("Automation deleted.");
    } catch {
      toast.error("Could not delete.");
    }
  };

  const onCreated = (created) => {
    setAutomations((list) => [created, ...list]);
    setCreating(false);
    toast.success("Automation created. It will run on schedule.");
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto p-6">Loading…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-semibold text-gray-800">Automations</h1>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              + New automation
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Schedule a sequence of posts that generate and publish themselves automatically — no review.
        </p>

        {creating && (
          <AutomationBuilder
            articles={articles}
            chapters={chapters}
            campaigns={campaigns}
            avatars={avatars}
            onCancel={() => setCreating(false)}
            onCreated={onCreated}
            createFn={createAutomation}
          />
        )}

        {!creating && automations.length === 0 && (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
            No automations yet. Click <strong>New automation</strong> to build your first sequence.
          </div>
        )}

        <div className="space-y-4 mt-4">
          {automations.map((a) => (
            <div key={a.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-800">{a.name}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[a.status] || ""}`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Starts {a.start_date} · {(a.platforms || []).join(", ")} · {(a.steps || []).length} steps
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {a.status !== "completed" && (
                    <button
                      onClick={() => toggleStatus(a)}
                      className="text-xs px-3 py-1 rounded-lg border text-gray-700"
                    >
                      {a.status === "active" ? "Pause" : "Resume"}
                    </button>
                  )}
                  <button
                    onClick={() => remove(a)}
                    className="text-xs px-3 py-1 rounded-lg border border-red-300 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3 divide-y">
                {(a.steps || []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-14 text-xs font-medium text-gray-500">
                        Day {s.day_number}
                      </span>
                      <span className="text-gray-700">{CONTENT_LABELS[s.content_type] || s.content_type}</span>
                      <span className="text-xs text-gray-400">
                        {/* Article and product steps both carry a campaign_slug;
                            only book steps have a chapter. */}
                        {s.campaign_slug
                          ? articleTitle(articles, s.campaign_slug) || s.campaign_slug
                          : `Chapter ${s.chapter_id || "?"}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{(s.run_at_time || "").slice(0, 5)}</span>
                      <span className={`text-xs font-medium ${STEP_STATUS_STYLES[s.status] || ""}`}>
                        {s.status}
                      </span>
                      {s.post_id && (
                        <button
                          onClick={() => navigate(`/u/campaign-post/${s.post_id}`)}
                          className="text-xs text-purple-700"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Automations;
