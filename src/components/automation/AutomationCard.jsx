import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  aiEditAutomation,
  setAutomationStatus,
  deleteAutomation,
} from "../../services/campaign.api";

// One automation: header, controls (AI edit / pause / delete) and the step
// list. Shared between the Automations index and the campaign detail page.

export const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-gray-100 text-gray-600",
};

export const CONTENT_LABELS = {
  carousel_images: "Carousel images",
  heygen_video: "HeyGen video",
  image_to_video: "Image → video",
  product_promo: "Product promo",
  article_images: "Article images",
  article_video: "Article video",
};

export const STEP_STATUS_STYLES = {
  pending: "text-gray-400",
  running: "text-blue-600",
  queued: "text-green-600",
  review: "text-amber-600",
  failed: "text-red-600",
  skipped: "text-gray-400",
};

// Human-readable chapter label: "Chapter 1 - The Ancient and Enduring
// History..." instead of the raw database id.
export const chapterLabel = (chapters, id) => {
  const c = chapters.find((x) => String(x.id) === String(id));
  if (!c) return `Chapter ${id || "?"}`;
  const title = c.chapter_title ? ` - ${c.chapter_title}` : "";
  return `${c.chapter || `Chapter ${id}`}${title}`;
};

// Step settings the runner will actually use, so nothing is a mystery:
// slide count for carousels, duration for videos.
export const stepSettings = (s) => {
  const p = s.params && typeof s.params === "object" ? s.params : {};
  const bits = [];
  if (s.content_type === "carousel_images") bits.push(`${p.slides || 3} slides`);
  if (["heygen_video", "article_video"].includes(s.content_type))
    bits.push(`${p.duration_seconds || 60}s video`);
  return bits.join(" · ");
};

export const avatarName = (avatars, id) => {
  if (!id) return null;
  const a = avatars.find((x) => x.avatar_id === id);
  return a?.avatar_name || a?.name || id;
};

// "article-19" is unreadable in a list; show the article's real title when we
// have it loaded, and fall back to the slug for product campaigns.
export const articleTitle = (articles, slug) => {
  const a = articles.find((x) => x.slug === slug);
  return a ? `#${a.article_number} ${a.title}` : null;
};

export const stepSubject = (s, chapters, articles) =>
  s.campaign_slug
    ? articleTitle(articles, s.campaign_slug) || s.campaign_slug
    : chapterLabel(chapters, s.chapter_id);

export default function AutomationCard({ automation: a, chapters, articles, avatars, onChanged, onDeleted }) {
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const toggleStatus = async () => {
    const next = a.status === "active" ? "paused" : "active";
    try {
      await setAutomationStatus(a.id, next);
      onChanged({ ...a, status: next });
    } catch {
      toast.error("Could not update status.");
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete automation "${a.name}"? Steps that haven't run yet are cancelled.`)) return;
    try {
      await deleteAutomation(a.id);
      onDeleted(a);
      toast.success("Automation deleted.");
    } catch {
      toast.error("Could not delete.");
    }
  };

  const applyAiEdit = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Describe the change first.");
      return;
    }
    setAiBusy(true);
    try {
      const res = await aiEditAutomation(a.id, aiPrompt.trim());
      if (!res?.success) {
        toast.error(res?.message || "Could not revise the automation");
        return;
      }
      onChanged(res.data);
      setAiOpen(false);
      setAiPrompt("");
      toast.success("Automation updated. Review the revised schedule.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not revise the automation");
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-4">
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
            {a.defaults?.avatar_id && <> · Avatar: {avatarName(avatars, a.defaults.avatar_id)}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {a.status !== "completed" && (
            <button
              onClick={() => {
                setAiOpen(!aiOpen);
                setAiPrompt("");
              }}
              className="text-xs px-3 py-1 rounded-lg border border-purple-300 text-purple-700"
            >
              ✨ Edit with AI
            </button>
          )}
          {a.status !== "completed" && (
            <button onClick={toggleStatus} className="text-xs px-3 py-1 rounded-lg border text-gray-700">
              {a.status === "active" ? "Pause" : "Resume"}
            </button>
          )}
          <button onClick={remove} className="text-xs px-3 py-1 rounded-lg border border-red-300 text-red-600">
            Delete
          </button>
        </div>
      </div>

      {aiOpen && (
        <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={2}
            disabled={aiBusy}
            placeholder='e.g. "Make all the videos 30 seconds" or "Move the carousels to 8am" or "Switch the avatar to Morgan"'
            className="w-full border rounded-lg text-sm p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Only steps that have not run yet can change; completed posts stay as they are.
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setAiOpen(false)}
              disabled={aiBusy}
              className="text-xs px-3 py-1 rounded-lg border text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={applyAiEdit}
              disabled={aiBusy}
              className="text-xs px-3 py-1 rounded-lg bg-purple-700 text-white disabled:opacity-60"
            >
              {aiBusy ? "Revising (can take a minute)..." : "Apply change"}
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
                {stepSubject(s, chapters, articles)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {stepSettings(s) && <span className="text-xs text-gray-400">{stepSettings(s)}</span>}
              <span className="text-xs text-gray-400">{(s.run_at_time || "").slice(0, 5)}</span>
              <span className={`text-xs font-medium ${STEP_STATUS_STYLES[s.status] || ""}`}>{s.status}</span>
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
  );
}
