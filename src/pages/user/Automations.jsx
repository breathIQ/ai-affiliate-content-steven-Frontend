import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import {
  getAutomations,
  createAutomation,
  draftAutomationWithAi,
  aiEditAutomation,
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
// Human-readable chapter label: "Chapter 1 - The Ancient and Enduring
// History..." instead of the raw database id.
const chapterLabel = (chapters, id) => {
  const c = chapters.find((x) => String(x.id) === String(id));
  if (!c) return `Chapter ${id || "?"}`;
  const title = c.chapter_title ? ` - ${c.chapter_title}` : "";
  return `${c.chapter || `Chapter ${id}`}${title}`;
};

// Step settings the runner will actually use, so nothing is a mystery:
// slide count for carousels, duration for videos.
const stepSettings = (s) => {
  const p = s.params && typeof s.params === "object" ? s.params : {};
  const bits = [];
  if (s.content_type === "carousel_images") bits.push(`${p.slides || 3} slides`);
  if (["heygen_video", "article_video"].includes(s.content_type))
    bits.push(`${p.duration_seconds || 60}s video`);
  return bits.join(" · ");
};

const avatarName = (avatars, id) => {
  if (!id) return null;
  const a = avatars.find((x) => x.avatar_id === id);
  return a?.avatar_name || a?.name || id;
};

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

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);

  // Per-automation AI mass-edit: which automation has the edit box open,
  // its prompt, and whether a revision is in flight.
  const [aiEditId, setAiEditId] = useState(null);
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [aiEditing, setAiEditing] = useState(false);

  const applyAiEdit = async (a) => {
    if (!aiEditPrompt.trim()) {
      toast.error("Describe the change first.");
      return;
    }
    setAiEditing(true);
    try {
      const res = await aiEditAutomation(a.id, aiEditPrompt.trim());
      if (!res?.success) {
        toast.error(res?.message || "Could not revise the automation");
        return;
      }
      setAutomations((list) => list.map((x) => (x.id === a.id ? res.data : x)));
      setAiEditId(null);
      setAiEditPrompt("");
      toast.success("Automation updated. Review the revised schedule.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not revise the automation");
    } finally {
      setAiEditing(false);
    }
  };

  const draftWithAi = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Describe the posting plan first.");
      return;
    }
    setAiDrafting(true);
    try {
      const res = await draftAutomationWithAi(aiPrompt.trim());
      if (!res?.success) {
        toast.error(res?.message || "Could not draft the automation");
        return;
      }
      setAutomations((list) => [res.data, ...list]);
      setAiPrompt("");
      toast.success(
        "Draft created as PAUSED. Review the schedule below, then press Resume to start it.",
        { duration: 8000 }
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not draft the automation");
    } finally {
      setAiDrafting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto p-6">Loading…</div>
      </Layout>
    );
  }

  // A campaign is a named series of automations (group_name); standalone
  // automations (no group) render last without a header unless there are no
  // groups at all.
  const grouped = [];
  {
    const idx = new Map();
    for (const a of automations) {
      const key = a.group_name || "";
      if (!idx.has(key)) {
        const bucket = { name: key, items: [] };
        idx.set(key, bucket);
        grouped.push(bucket);
      }
      idx.get(key).items.push(a);
    }
    grouped.sort((x, y) => (x.name === "" ? 1 : y.name === "" ? -1 : 0));
  }
  const hasGroups = grouped.some((g) => g.name !== "");

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

        {!creating && (
          <div className="bg-white border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✨</span>
              <h2 className="font-semibold text-gray-800">Build with AI</h2>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Describe the posting plan in plain words and AI will build the
              day-by-day schedule. It is created paused so you can review every
              step before starting it.
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
              disabled={aiDrafting}
              placeholder='e.g. "Two posts per day going through all 33 chapters in order: a 3-slide carousel in the morning and a 30-second HeyGen video in the evening, on Instagram and TikTok. Part of my Book Walkthrough campaign."'
              className="w-full border rounded-lg text-sm p-3 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={draftWithAi}
                disabled={aiDrafting}
                className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
              >
                {aiDrafting ? "Drafting (can take a minute)..." : "Draft with AI"}
              </button>
            </div>
          </div>
        )}

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

        <div className="space-y-6 mt-4">
          {grouped.map((g) => (
            <div key={g.name || "__standalone"}>
              {hasGroups && (
                <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  {g.name ? (
                    <>
                      <span>📁</span> {g.name}
                    </>
                  ) : (
                    "Standalone"
                  )}
                  <span className="text-gray-400 font-normal">({g.items.length})</span>
                </h3>
              )}
              <div className="space-y-4">
          {g.items.map((a) => (
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
                    Starts {a.start_date ? new Date(a.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "?"}
                    {" · "}{(a.platforms || []).join(", ")} · {(a.steps || []).length} steps
                    {a.defaults?.avatar_id && (
                      <> · Avatar: {avatarName(avatars, a.defaults.avatar_id)}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {a.status !== "completed" && (
                    <button
                      onClick={() => {
                        setAiEditId(aiEditId === a.id ? null : a.id);
                        setAiEditPrompt("");
                      }}
                      className="text-xs px-3 py-1 rounded-lg border border-purple-300 text-purple-700"
                    >
                      ✨ Edit with AI
                    </button>
                  )}
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

              {aiEditId === a.id && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <textarea
                    value={aiEditPrompt}
                    onChange={(e) => setAiEditPrompt(e.target.value)}
                    rows={2}
                    disabled={aiEditing}
                    placeholder='e.g. "Make all the videos 30 seconds" or "Move the carousels to 8am" or "Switch the avatar to Morgan"'
                    className="w-full border rounded-lg text-sm p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Only steps that have not run yet can change; completed posts stay as they are.
                  </p>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setAiEditId(null)}
                      disabled={aiEditing}
                      className="text-xs px-3 py-1 rounded-lg border text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => applyAiEdit(a)}
                      disabled={aiEditing}
                      className="text-xs px-3 py-1 rounded-lg bg-purple-700 text-white disabled:opacity-60"
                    >
                      {aiEditing ? "Revising (can take a minute)..." : "Apply change"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 divide-y">
                {(a.steps || []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-14 text-xs font-medium text-gray-500">
                        Day {s.day_number}
                      </span>
                      <span className="text-gray-700">{CONTENT_LABELS[s.content_type] || s.content_type}</span>
                      <span className="text-xs text-gray-400 max-w-[360px] truncate">
                        {/* Article and product steps both carry a campaign_slug;
                            only book steps have a chapter. */}
                        {s.campaign_slug
                          ? articleTitle(articles, s.campaign_slug) || s.campaign_slug
                          : chapterLabel(chapters, s.chapter_id)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {stepSettings(s) && (
                        <span className="text-xs text-gray-400">{stepSettings(s)}</span>
                      )}
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
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Automations;
