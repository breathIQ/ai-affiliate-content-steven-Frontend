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
  const [settings, setSettings] = useState({ text_model: "", image_engine: "", image_style: "", avatar_id: "" });
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (settingsLoaded || automations.length === 0) return;
    const d = automations[0]?.defaults || {};
    setSettings({
      text_model: d.text_model || "",
      image_engine: d.image_engine || "",
      image_style: d.image_style || "",
      avatar_id: d.avatar_id || "",
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <label className="text-xs text-gray-600">
                Video avatar
                <select
                  value={settings.avatar_id}
                  onChange={(e) => setSettings({ ...settings, avatar_id: e.target.value })}
                  className="mt-1 w-full border rounded-lg text-sm px-2 py-2 focus:outline-none"
                >
                  <option value="">None (videos need one)</option>
                  {avatars.slice(0, 80).map((a) => (
                    <option key={a.avatar_id} value={a.avatar_id}>
                      {a.avatar_name || a.name || a.avatar_id}
                    </option>
                  ))}
                </select>
              </label>
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
