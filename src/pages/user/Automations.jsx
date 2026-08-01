import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import {
  getAutomations,
  createAutomation,
  draftAutomationWithAi,
} from "../../services/campaign.api";
import { getChapter } from "../../services/post.api";
import { getCampaigns } from "../../services/campaign.api";
import { getArticles } from "../../services/article.api";
import { getAvatars } from "../../services/heygen.api";
import AutomationBuilder from "../../components/automation/AutomationBuilder";
import AutomationCard, { STATUS_STYLES } from "../../components/automation/AutomationCard";

// Automations, organized by CAMPAIGN: a campaign is a named series of
// automations (group_name). This page lists campaign cards (click through for
// the full posting timeline) plus standalone automations, and hosts both the
// AI builder and the manual builder.
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

  const onCreated = (created) => {
    setAutomations((list) => [created, ...list]);
    setCreating(false);
    toast.success("Automation created. It will run on schedule.");
  };

  const replaceAutomation = (updated) =>
    setAutomations((list) => list.map((x) => (x.id === updated.id ? updated : x)));
  const dropAutomation = (removed) =>
    setAutomations((list) => list.filter((x) => x.id !== removed.id));

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);

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
        "Draft created as PAUSED. Review the schedule, then press Resume to start it.",
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

  // Campaign summary cards: name, automations, steps, next scheduled post.
  const campaignCards = [];
  const standalone = [];
  {
    const idx = new Map();
    for (const a of automations) {
      if (!a.group_name) {
        standalone.push(a);
        continue;
      }
      if (!idx.has(a.group_name)) {
        const card = { name: a.group_name, items: [] };
        idx.set(a.group_name, card);
        campaignCards.push(card);
      }
      idx.get(a.group_name).items.push(a);
    }
    for (const c of campaignCards) {
      const steps = c.items.flatMap((a) => a.steps || []);
      c.stepCount = steps.length;
      c.doneCount = steps.filter((s) => !["pending", "running"].includes(s.status)).length;
      const upcoming = steps
        .filter((s) => s.status === "pending" && s.scheduled_for)
        .map((s) => new Date(s.scheduled_for))
        .sort((x, y) => x - y);
      c.nextAt = upcoming[0] || null;
      c.platforms = [...new Set(c.items.flatMap((a) => a.platforms || []))];
      c.statuses = [...new Set(c.items.map((a) => a.status))];
    }
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
          Campaigns are named series of automations that generate and publish
          posts on schedule. Click a campaign to see everything it will post.
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
            No automations yet. Use <strong>Build with AI</strong> or{" "}
            <strong>New automation</strong> to create your first sequence.
          </div>
        )}

        {campaignCards.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-600 mt-6 mb-2">Campaigns</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {campaignCards.map((c) => (
                <button
                  key={c.name}
                  onClick={() => navigate(`/u/automations/campaign/${encodeURIComponent(c.name)}`)}
                  className="bg-white border rounded-xl p-5 text-left hover:border-purple-400 hover:shadow transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span>📁</span> {c.name}
                    </h2>
                    <div className="flex gap-1">
                      {c.statuses.map((s) => (
                        <span key={s} className={`px-2 py-0.5 rounded-full text-[11px] ${STATUS_STYLES[s] || ""}`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {c.items.length} automation{c.items.length === 1 ? "" : "s"} ·{" "}
                    {c.doneCount}/{c.stepCount} posts done · {c.platforms.join(", ") || "no platforms"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {c.nextAt
                      ? `Next post: ${c.nextAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : "Nothing scheduled"}
                  </p>
                  <p className="text-xs text-purple-700 mt-3">View full posting schedule →</p>
                </button>
              ))}
            </div>
          </>
        )}

        {standalone.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-600 mt-6 mb-2">
              {campaignCards.length > 0 ? "Standalone automations" : "Automations"}
            </h3>
            <div className="space-y-4">
              {standalone.map((a) => (
                <AutomationCard
                  key={a.id}
                  automation={a}
                  chapters={chapters}
                  articles={articles}
                  avatars={avatars}
                  onChanged={replaceAutomation}
                  onDeleted={dropAutomation}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Automations;
