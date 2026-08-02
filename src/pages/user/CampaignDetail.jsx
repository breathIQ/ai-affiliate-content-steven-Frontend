import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import { getAutomations, saveAutomationSettings } from "../../services/campaign.api";
import { getChapter } from "../../services/post.api";
import { getArticles } from "../../services/article.api";
import { getAvatars } from "../../services/heygen.api";
import { getSocialMediaStatus } from "../../services/socialMediaAuth.api";
import AutomationCard, {
  CONTENT_LABELS,
  STEP_STATUS_STYLES,
  stepSubject,
  stepSettings,
} from "../../components/automation/AutomationCard";
import AvatarPickerModal from "../../components/automation/AvatarPickerModal";

const PLATFORM_ICONS = {
  instagram: "/icons/insta.svg",
  instagram_story: "/icons/insta.svg",
  tiktok: "/icons/ic-tiktok.svg",
};

// Same vocabulary the backend validates (automation-ai.ts).
const TEXT_MODELS = [
  { value: "", label: "Default (Claude)" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
];
const IMAGE_ENGINES = [
  { value: "", label: "Default (OpenAI)" },
  { value: "openai", label: "OpenAI (lower cost)" },
  { value: "gemini", label: "Gemini (best on-image text)" },
];
const IMAGE_STYLES = [
  { value: "", label: "Default (Cinematic)" },
  { value: "cinematic", label: "Cinematic Infographic" },
  { value: "minimal", label: "Clean & Minimal" },
  { value: "scientific", label: "Scientific Diagram" },
  { value: "warm", label: "Warm & Human" },
  { value: "bold", label: "Bold & Vibrant" },
  { value: "photo", label: "Hyper-Realistic Photo" },
];

// One campaign (a named series of automations): every post it will publish,
// in chronological order, with the platforms and accounts it goes to; the
// campaign's automations with their controls follow below.
const CampaignDetail = () => {
  const { name } = useParams();
  const campaignName = decodeURIComponent(name || "");
  const navigate = useNavigate();

  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [avatars, setAvatars] = useState([]);
  // Keyed by provider: { instagram: {connected, username}, tiktok: {...} }
  const [accounts, setAccounts] = useState({});

  useEffect(() => {
    getAutomations()
      .then((res) => setAutomations((res?.data || []).filter((a) => a.group_name === campaignName)))
      .catch(() => toast.error("Could not load the campaign."))
      .finally(() => setLoading(false));
    getChapter().then((r) => setChapters(r?.data || [])).catch(() => {});
    getArticles().then((r) => setArticles(r?.data?.articles || [])).catch(() => {});
    getAvatars()
      .then((r) => {
        const d = r?.data || {};
        const flat = []
          .concat(d.my_avatars || [], d.personal_favorites || [], d.global_favorites || [], d.recently_used || [], d.all || [])
          .filter((a) => a && a.avatar_id);
        const seen = new Set();
        setAvatars(flat.filter((a) => (seen.has(a.avatar_id) ? false : seen.add(a.avatar_id))));
      })
      .catch(() => {});
    getSocialMediaStatus()
      .then((r) => setAccounts(r?.data || {}))
      .catch(() => {});
  }, [campaignName]);

  const replaceAutomation = (updated) =>
    setAutomations((list) => list.map((x) => (x.id === updated.id ? updated : x)));
  const dropAutomation = (removed) =>
    setAutomations((list) => list.filter((x) => x.id !== removed.id));

  // Campaign content settings, prefilled from the first automation's defaults
  // (settings apply to every automation in the campaign on save).
  const [settings, setSettings] = useState({ text_model: "", image_engine: "", image_style: "", avatar_ids: [], start_date: "" });
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  useEffect(() => {
    if (settingsLoaded || automations.length === 0) return;
    const d = automations[0]?.defaults || {};
    setSettings({
      text_model: d.text_model || "",
      image_engine: d.image_engine || "",
      image_style: d.image_style || "",
      avatar_ids: Array.isArray(d.avatar_ids) && d.avatar_ids.length
        ? d.avatar_ids
        : d.avatar_id
          ? [d.avatar_id]
          : [],
      start_date: automations[0]?.start_date
        ? new Date(automations[0].start_date).toISOString().slice(0, 10)
        : "",
    });
    setSettingsLoaded(true);
  }, [automations, settingsLoaded]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const results = [];
      for (const a of automations) {
        const res = await saveAutomationSettings(a.id, settings);
        if (res?.success) results.push(res.data);
      }
      if (results.length) {
        setAutomations((list) => list.map((x) => results.find((r) => r.id === x.id) || x));
      }
      toast.success(
        `Settings applied to ${results.length} automation${results.length === 1 ? "" : "s"} in this campaign.`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save the settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // The account a platform publishes to (stories go through the instagram
  // connection).
  const accountFor = (platform) => {
    const provider = platform === "instagram_story" ? "instagram" : platform;
    const acc = accounts?.[provider];
    return acc?.username ? `@${String(acc.username).replace(/^@/, "")}` : null;
  };

  // Merged chronological timeline across every automation in the campaign.
  const timeline = automations
    .flatMap((a) =>
      (a.steps || []).map((s) => ({
        ...s,
        automation: a,
        when: s.scheduled_for ? new Date(s.scheduled_for) : null,
      }))
    )
    .sort((x, y) => (x.when?.getTime() || 0) - (y.when?.getTime() || 0));

  const platforms = [...new Set(automations.flatMap((a) => a.platforms || []))];
  const pendingCount = timeline.filter((s) => s.status === "pending").length;

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
        <button onClick={() => navigate("/u/automations")} className="text-sm text-gray-500 hover:text-gray-800 mb-3">
          &larr; All automations
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">📁</span>
          <h1 className="text-2xl font-semibold text-gray-800">{campaignName}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-1">
          {automations.length} automation{automations.length === 1 ? "" : "s"} · {timeline.length} posts total ·{" "}
          {pendingCount} still to go
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Publishing to:{" "}
          {platforms.length
            ? platforms
                .map((p) => `${p.replace("_", " ")}${accountFor(p) ? ` (${accountFor(p)})` : ""}`)
                .join(", ")
            : "no platforms yet"}
        </p>

        {automations.length === 0 && (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
            No automations belong to this campaign anymore.
          </div>
        )}

        {automations.length > 0 && (
          <div className="bg-white border rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-gray-800 mb-1">Campaign settings</h2>
            <p className="text-xs text-gray-500 mb-3">
              Applied to every post this campaign generates from now on.
              Individual steps can still override them.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <label className="text-xs text-gray-600">
                Start date
                <input
                  type="date"
                  value={settings.start_date}
                  onChange={(e) => setSettings({ ...settings, start_date: e.target.value })}
                  className="mt-1 w-full border rounded-lg text-sm px-2 py-[7px] focus:outline-none"
                />
                <span className="block text-[10px] text-gray-400 mt-0.5">
                  Day 1 of the schedule. Locked once posts have gone out.
                </span>
              </label>
              <label className="text-xs text-gray-600">
                Writing AI (captions &amp; scripts)
                <select
                  value={settings.text_model}
                  onChange={(e) => setSettings({ ...settings, text_model: e.target.value })}
                  className="mt-1 w-full border rounded-lg text-sm px-2 py-2 focus:outline-none"
                >
                  {TEXT_MODELS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-gray-600">
                Image AI
                <select
                  value={settings.image_engine}
                  onChange={(e) => setSettings({ ...settings, image_engine: e.target.value })}
                  className="mt-1 w-full border rounded-lg text-sm px-2 py-2 focus:outline-none"
                >
                  {IMAGE_ENGINES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-gray-600">
                Image style
                <select
                  value={settings.image_style}
                  onChange={(e) => setSettings({ ...settings, image_style: e.target.value })}
                  className="mt-1 w-full border rounded-lg text-sm px-2 py-2 focus:outline-none"
                >
                  {IMAGE_STYLES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <div className="text-xs text-gray-600">
                Video avatars (random pick per video)
                {(() => {
                  const chosen = settings.avatar_ids
                    .map((id) => avatars.find((a) => a.avatar_id === id))
                    .filter(Boolean);
                  return (
                    <button
                      type="button"
                      onClick={() => setAvatarPickerOpen(true)}
                      className="mt-1 w-full border rounded-lg text-sm px-2 py-1.5 flex items-center gap-2 hover:border-purple-400 text-left"
                    >
                      {chosen.length ? (
                        <span className="flex -space-x-2">
                          {chosen.slice(0, 4).map((a) =>
                            a.preview_image_url ? (
                              <img
                                key={a.avatar_id}
                                src={a.preview_image_url}
                                alt={a.avatar_name}
                                className="w-7 h-9 object-cover rounded border border-white"
                              />
                            ) : (
                              <span
                                key={a.avatar_id}
                                className="w-7 h-9 rounded bg-gray-100 border border-white flex items-center justify-center text-gray-400"
                              >
                                ?
                              </span>
                            )
                          )}
                        </span>
                      ) : (
                        <span className="w-7 h-9 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                          ?
                        </span>
                      )}
                      <span className="truncate text-gray-800">
                        {chosen.length === 0
                          ? "None (videos need one)"
                          : chosen.length === 1
                            ? chosen[0].avatar_name || chosen[0].avatar_id
                            : `${chosen.length} avatars`}
                      </span>
                      <span className="ml-auto text-gray-400">▾</span>
                    </button>
                  );
                })()}
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
              >
                {savingSettings ? "Saving..." : "Save settings"}
              </button>
            </div>
          </div>
        )}

        {timeline.length > 0 && (
          <div className="bg-white border rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">Posting schedule</h2>
            <div className="divide-y">
              {timeline.map((s) => (
                <div key={`${s.automation.id}-${s.id}`} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex w-32 shrink-0 text-xs font-medium text-gray-500">
                      {s.when
                        ? s.when.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : `Day ${s.day_number}`}
                    </span>
                    <span className="text-gray-700 shrink-0">{CONTENT_LABELS[s.content_type] || s.content_type}</span>
                    <span className="text-xs text-gray-400 truncate">{stepSubject(s, chapters, articles)}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {stepSettings(s) && <span className="text-xs text-gray-400 hidden sm:inline">{stepSettings(s)}</span>}
                    <span className="flex items-center gap-1">
                      {(s.automation.platforms || []).map((p) => (
                        <img key={p} src={PLATFORM_ICONS[p] || "/icons/ic-veiw.svg"} alt={p} title={`${p}${accountFor(p) ? ` ${accountFor(p)}` : ""}`} width={13} />
                      ))}
                    </span>
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
        )}

        {avatarPickerOpen && (
          <AvatarPickerModal
            avatars={avatars}
            selectedIds={settings.avatar_ids}
            onDone={(ids) => setSettings({ ...settings, avatar_ids: ids })}
            onClose={() => setAvatarPickerOpen(false)}
          />
        )}

        {automations.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Automations in this campaign</h3>
            <div className="space-y-4">
              {automations.map((a) => (
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

export default CampaignDetail;
