import React, { useState } from "react";
import toast from "react-hot-toast";
import AvatarPickerModal from "../modals/AvatarPickerModal";

// Builds the payload for a new automation campaign: name, start date,
// platforms applied to every step, per-campaign defaults (avatar/voice), and
// an ordered list of day-N steps.
//
// Each step is "what is this about" (source) then "what should it look like"
// (format). The API models the two as one `content_type`, so `source` lives
// only in this component and picks which content types are on offer.

const SOURCES = [
  { value: "chapter", label: "Book Chapter" },
  { value: "article", label: "Article" },
  { value: "product", label: "Promote Product" },
];

const FORMATS = {
  chapter: [
    { value: "carousel_images", label: "Carousel images" },
    { value: "heygen_video", label: "AI presenter video" },
    { value: "image_to_video", label: "Image → short video" },
  ],
  article: [
    { value: "article_images", label: "Carousel images" },
    { value: "article_video", label: "AI presenter video" },
  ],
  product: [{ value: "product_promo", label: "Promo post" }],
};

// Which content types come from a campaign row rather than a book chapter.
const ARTICLE_TYPES = ["article_images", "article_video"];
const CAMPAIGN_TYPES = [...ARTICLE_TYPES, "product_promo"];
const VIDEO_TYPES = ["heygen_video", "article_video"];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "instagram_story", label: "Instagram Story" },
  { value: "tiktok", label: "TikTok" },
];

const MODELS = [
  { value: "claude", label: "Claude" },
  { value: "gpt-4-turbo", label: "ChatGPT" },
  { value: "gemini", label: "Gemini" },
];

const blankStep = (day) => ({
  day_number: day,
  source: "chapter",
  run_at_time: "09:00",
  content_type: "carousel_images",
  chapter_id: "",
  campaign_slug: "",
  params: { slides: 3, duration_seconds: 60, model: "claude", image_model: "openai", prompt: "" },
});

const AutomationBuilder = ({ chapters, campaigns, articles = [], avatars, onCancel, onCreated, createFn }) => {
  // Local calendar date, not UTC: toISOString() rolls over to tomorrow in the
  // evening for anyone behind UTC, which blocked starting a campaign today.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [platforms, setPlatforms] = useState(["instagram"]);
  const [defaults, setDefaults] = useState({ avatar_id: "", voice_id: "" });
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const selectedAvatar = avatars.find((a) => a.avatar_id === defaults.avatar_id) || null;
  const [steps, setSteps] = useState([blankStep(1)]);
  const [saving, setSaving] = useState(false);

  const togglePlatform = (p) =>
    setPlatforms((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));

  const updateStep = (i, patch) =>
    setSteps((list) => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  // Changing the source changes what formats exist and which source id applies,
  // so reset both rather than leaving a stale chapter on an article step.
  const changeSource = (i, source) =>
    updateStep(i, {
      source,
      content_type: FORMATS[source][0].value,
      chapter_id: "",
      campaign_slug: "",
    });

  const updateParam = (i, key, value) =>
    setSteps((list) =>
      list.map((s, idx) => (idx === i ? { ...s, params: { ...s.params, [key]: value } } : s))
    );

  const addStep = () => {
    const nextDay = steps.length ? Math.max(...steps.map((s) => Number(s.day_number) || 1)) + 1 : 1;
    setSteps((list) => [...list, blankStep(nextDay)]);
  };

  const removeStep = (i) => setSteps((list) => list.filter((_, idx) => idx !== i));

  const validate = () => {
    if (!name.trim()) return "Give the automation a name.";
    if (!platforms.length) return "Pick at least one platform.";
    if (!steps.length) return "Add at least one step.";
    for (const s of steps) {
      if (s.source === "product") {
        if (!s.campaign_slug) return `Day ${s.day_number}: pick a product campaign.`;
      } else if (s.source === "article") {
        if (!s.campaign_slug) return `Day ${s.day_number}: pick an article.`;
      } else if (!s.chapter_id) {
        return `Day ${s.day_number}: pick a chapter.`;
      }
      if (VIDEO_TYPES.includes(s.content_type) && !(s.params.avatar_id || defaults.avatar_id)) {
        return `Day ${s.day_number}: pick an avatar for the video (or set a default above).`;
      }
    }
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        start_date: startDate,
        platforms,
        defaults,
        steps: steps.map((s) => {
          const fromCampaign = CAMPAIGN_TYPES.includes(s.content_type);
          return {
            day_number: Number(s.day_number),
            run_at_time: s.run_at_time,
            content_type: s.content_type,
            chapter_id: fromCampaign ? null : Number(s.chapter_id) || null,
            campaign_slug: fromCampaign ? s.campaign_slug : null,
            params: cleanParams(s),
          };
        }),
      };
      const res = await createFn(payload);
      onCreated(res?.data || payload);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not create the automation.");
    } finally {
      setSaving(false);
    }
  };

  // Only send params relevant to the chosen content type.
  const cleanParams = (s) => {
    const p = { model: s.params.model };
    if (s.content_type === "carousel_images") {
      p.slides = Number(s.params.slides) || 3;
      p.image_model = s.params.image_model || "openai";
    } else if (s.content_type === "heygen_video") {
      p.duration_seconds = Number(s.params.duration_seconds) || 60;
      p.avatar_id = s.params.avatar_id || undefined;
      p.voice_id = s.params.voice_id || undefined;
    } else if (s.content_type === "image_to_video") {
      p.image_model = s.params.image_model || "openai";
      p.duration_seconds = Number(s.params.duration_seconds) || 6;
    } else if (s.content_type === "product_promo") {
      p.post_type = s.params.post_type || "single";
      p.slides = Number(s.params.slides) || 1;
      p.image_model = s.params.image_model || "openai";
      p.theme = s.params.theme || undefined;
    } else if (s.content_type === "article_images") {
      p.slides = Number(s.params.slides) || 3;
      p.image_model = s.params.image_model || "openai";
    } else if (s.content_type === "article_video") {
      p.duration_seconds = Number(s.params.duration_seconds) || 60;
      p.avatar_id = s.params.avatar_id || undefined;
      p.voice_id = s.params.voice_id || undefined;
    }
    if (s.params.prompt) p.prompt = s.params.prompt;
    return p;
  };

  const chapterOptions = chapters.map((c) => (
    <option key={c.id} value={c.id}>
      {c.chapter}: {c.chapter_title}
    </option>
  ));

  return (
    <div className="bg-white border-2 border-purple-200 rounded-xl p-5 mb-6">
      <h2 className="font-semibold text-gray-800 mb-4">New automation</h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. October book launch"
            className="w-full border rounded-lg px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">Start date</span>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </label>
      </div>

      <div className="mb-4">
        <span className="block text-sm text-gray-600 mb-1">Publish to (applies to every step)</span>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => togglePlatform(p.value)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                platforms.includes(p.value)
                  ? "bg-purple-700 text-white border-purple-700"
                  : "text-gray-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {avatars.length > 0 && (
        <div className="mb-4">
          <span className="block text-sm text-gray-600 mb-1">
            Default avatar for HeyGen videos (optional)
          </span>
          <button
            type="button"
            onClick={() => setAvatarPickerOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left hover:bg-gray-50 sm:w-1/2"
          >
            {selectedAvatar?.preview_image_url ? (
              <img
                src={selectedAvatar.preview_image_url}
                alt=""
                className="h-10 w-10 flex-shrink-0 rounded object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                None
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-gray-800">
                {selectedAvatar
                  ? selectedAvatar.avatar_name || selectedAvatar.name || selectedAvatar.avatar_id
                  : "No avatar selected"}
              </span>
              <span className="block text-xs text-gray-500">Click to browse avatars</span>
            </span>
          </button>

          <AvatarPickerModal
            isOpen={avatarPickerOpen}
            onClose={() => setAvatarPickerOpen(false)}
            avatars={avatars}
            selectedId={defaults.avatar_id}
            onSelect={(a) => setDefaults((d) => ({ ...d, avatar_id: a ? a.avatar_id : "" }))}
          />
        </div>
      )}

      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs text-gray-600">
                Day
                <input
                  type="number"
                  min={1}
                  value={s.day_number}
                  onChange={(e) => updateStep(i, { day_number: e.target.value })}
                  className="ml-1 w-16 border rounded px-2 py-1"
                />
              </label>
              <label className="text-xs text-gray-600">
                at
                <input
                  type="time"
                  value={s.run_at_time}
                  onChange={(e) => updateStep(i, { run_at_time: e.target.value })}
                  className="ml-1 border rounded px-2 py-1"
                />
              </label>
              <select
                value={s.source}
                onChange={(e) => changeSource(i, e.target.value)}
                className="text-sm border rounded px-2 py-1"
                title="What this post is about"
              >
                {SOURCES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                value={s.content_type}
                onChange={(e) => updateStep(i, { content_type: e.target.value })}
                className="text-sm border rounded px-2 py-1 flex-1"
                title="What the post looks like"
              >
                {(FORMATS[s.source] ?? FORMATS.chapter).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {steps.length > 1 && (
                <button
                  onClick={() => removeStep(i)}
                  className="text-xs text-red-600 px-2"
                  title="Remove step"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              {/* Which chapter / article / product this step is about. */}
              {s.source === "product" ? (
                <select
                  value={s.campaign_slug}
                  onChange={(e) => updateStep(i, { campaign_slug: e.target.value })}
                  className="text-sm border rounded px-2 py-1.5"
                >
                  <option value="">Select product campaign</option>
                  {campaigns.map((c) => (
                    <option key={c.slug || c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : s.source === "article" ? (
                <select
                  value={s.campaign_slug}
                  onChange={(e) => updateStep(i, { campaign_slug: e.target.value })}
                  className="text-sm border rounded px-2 py-1.5"
                >
                  <option value="">Select article</option>
                  {articles.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      #{a.article_number} {a.title}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={s.chapter_id}
                  onChange={(e) => updateStep(i, { chapter_id: e.target.value })}
                  className="text-sm border rounded px-2 py-1.5"
                >
                  <option value="">Select chapter</option>
                  {chapterOptions}
                </select>
              )}

              <select
                value={s.params.model}
                onChange={(e) => updateParam(i, "model", e.target.value)}
                className="text-sm border rounded px-2 py-1.5"
                title="Which AI writes the script/copy"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    Script by {m.label}
                  </option>
                ))}
              </select>

              {/* Per-type extras. Article slides/videos take the same options
                  as their book equivalents. */}
              {(s.content_type === "carousel_images" || s.content_type === "article_images") && (
                <select
                  value={s.params.slides}
                  onChange={(e) => updateParam(i, "slides", e.target.value)}
                  className="text-sm border rounded px-2 py-1.5"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} slide{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              )}

              {s.content_type === "article_images" && (
                <select
                  value={s.params.image_model}
                  onChange={(e) => updateParam(i, "image_model", e.target.value)}
                  className="text-sm border rounded px-2 py-1.5"
                >
                  <option value="openai">Images by OpenAI</option>
                  <option value="gemini">Images by Gemini</option>
                </select>
              )}

              {VIDEO_TYPES.includes(s.content_type) && (
                <>
                  <select
                    value={s.params.duration_seconds}
                    onChange={(e) => updateParam(i, "duration_seconds", e.target.value)}
                    className="text-sm border rounded px-2 py-1.5"
                  >
                    {[30, 45, 60, 90, 120].map((n) => (
                      <option key={n} value={n}>
                        {n} seconds
                      </option>
                    ))}
                  </select>
                  <select
                    value={s.params.avatar_id || ""}
                    onChange={(e) => updateParam(i, "avatar_id", e.target.value)}
                    className="text-sm border rounded px-2 py-1.5"
                  >
                    <option value="">Use default avatar</option>
                    {avatars.map((a) => (
                      <option key={a.avatar_id} value={a.avatar_id}>
                        {a.avatar_name || a.name || a.avatar_id}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {s.content_type === "image_to_video" && (
                <select
                  value={s.params.duration_seconds}
                  onChange={(e) => updateParam(i, "duration_seconds", e.target.value)}
                  className="text-sm border rounded px-2 py-1.5"
                >
                  {[6, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} second clip
                    </option>
                  ))}
                </select>
              )}

              {s.content_type === "product_promo" && (
                <select
                  value={s.params.post_type || "single"}
                  onChange={(e) => updateParam(i, "post_type", e.target.value)}
                  className="text-sm border rounded px-2 py-1.5"
                >
                  <option value="single">Single image</option>
                  <option value="carousel">Carousel</option>
                </select>
              )}
            </div>

            <input
              value={s.params.prompt || ""}
              onChange={(e) => updateParam(i, "prompt", e.target.value)}
              placeholder="Optional extra direction for this step…"
              className="mt-2 w-full text-sm border rounded px-2 py-1.5"
            />
          </div>
        ))}
      </div>

      <button onClick={addStep} className="mt-3 text-sm text-purple-700">
        + Add step
      </button>

      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onCancel} className="text-sm px-4 py-2 rounded-lg border text-gray-600">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="text-sm px-5 py-2 rounded-lg bg-purple-700 text-white disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create automation"}
        </button>
      </div>
    </div>
  );
};

export default AutomationBuilder;
