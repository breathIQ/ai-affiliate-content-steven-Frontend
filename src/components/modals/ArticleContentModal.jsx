import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getArticles, draftArticleText, generateArticlePost } from "../../services/article.api";
import { getAvatars, getVoiceClones } from "../../services/heygen.api";

// Promote one of Steven's published carbogenetics.com articles as an image
// carousel or a HeyGen video. Separate from CampaignContentModal (products) and
// GenerateContentModal (the book), matching the backend's split: an article post
// is grounded in the article itself, has no product image, no approved-claim
// citations, and no coupon.
//
// Compliance is enforced server-side. This UI never blocks anything the server
// allows; it only surfaces what the server says.

const STYLE_PRESETS = [
  { id: "cinematic", label: "Cinematic Infographic", design: { image_style: "Cinematic Infographic", content_angle: "Educational / Explainer", human_presence: "No People", visual_mood: "Empowering" } },
  { id: "minimal", label: "Clean & Minimal", design: { image_style: "Minimalist / Modern", content_angle: "Educational / Explainer", human_presence: "No People", visual_mood: "Calm & Grounded" } },
  { id: "scientific", label: "Scientific Diagram", design: { image_style: "Scientific / Conceptual", content_angle: "Clinical Perspective", human_presence: "No People", visual_mood: "Serious & Clinical" } },
];

const MODEL_OPTIONS = [
  { value: "gpt-5.4", label: "ChatGPT" },
  { value: "claude-sonnet-5", label: "Claude" },
  { value: "gemini-pro-latest", label: "Gemini" },
];

const DURATIONS = [15, 30, 45, 60, 90];

export default function ArticleContentModal({ onCreated }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [affiliate, setAffiliate] = useState(null);
  const [search, setSearch] = useState("");

  const [step, setStep] = useState("pick"); // pick -> options -> draft -> done
  const [article, setArticle] = useState(null);
  const [format, setFormat] = useState("carousel"); // carousel | single | video
  const [model, setModel] = useState("claude-sonnet-5");
  const [prompt, setPrompt] = useState("");
  const [textFormat, setTextFormat] = useState("paragraph");
  const [slides, setSlides] = useState(3);
  const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0].id);
  const [imageEngine, setImageEngine] = useState("openai");

  // Video-only options, mirroring the book video flow.
  const [duration, setDuration] = useState(45);
  const [orientation, setOrientation] = useState("portrait");
  const [avatarId, setAvatarId] = useState("");
  const [avatars, setAvatars] = useState([]);
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState("");
  const [voiceMode, setVoiceMode] = useState("agent");

  const [draft, setDraft] = useState(null);
  const [script, setScript] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [redHits, setRedHits] = useState([]);
  const [result, setResult] = useState(null);

  const isVideo = format === "video";

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await getArticles();
        setArticles(res?.data?.articles ?? []);
        setAffiliate(res?.data?.affiliate ?? null);
      } catch {
        toast.error("Could not load articles.");
      }
    })();
  }, [isOpen]);

  // Avatars and voices are only needed once someone actually picks video, so
  // don't spend the requests (the avatar list is a HeyGen round trip) up front.
  useEffect(() => {
    if (!isOpen || !isVideo || avatars.length > 0) return;
    (async () => {
      try {
        const res = await getAvatars();
        const d = res?.data ?? {};
        const merged = [...(d.my_avatars ?? []), ...(d.recently_used ?? []), ...(d.personal_favorites ?? []), ...(d.all ?? [])];
        const seen = new Set();
        setAvatars(merged.filter((a) => a && !seen.has(a.avatar_id) && seen.add(a.avatar_id)).slice(0, 24));
      } catch {
        toast.error("Could not load avatars.");
      }
      try {
        const res = await getVoiceClones();
        setVoices(res?.data || []);
      } catch {
        // A user with no cloned voices is normal; the agent picks a voice.
      }
    })();
  }, [isOpen, isVideo, avatars.length]);

  const selectedVoice = useMemo(
    () => voices.find((v) => String(v.id) === String(voiceId)) ?? null,
    [voices, voiceId]
  );

  // A Chatterbox-only clone has no HeyGen voice id, so it can only drive the
  // talking-head pipeline. Mirrors the rule the backend enforces.
  useEffect(() => {
    if (!selectedVoice) return;
    setVoiceMode(selectedVoice.heygen_voice_id ? "agent" : "audio");
  }, [selectedVoice]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) => a.title.toLowerCase().includes(q) || String(a.article_number) === q
    );
  }, [articles, search]);

  function reset() {
    setStep("pick");
    setArticle(null);
    setSearch("");
    setFormat("carousel");
    setPrompt("");
    setTextFormat("paragraph");
    setSlides(3);
    setDraft(null);
    setScript("");
    setRedHits([]);
    setResult(null);
    setAvatarId("");
    setVoiceId("");
    setVoiceMode("agent");
  }

  function handleClose() {
    setIsOpen(false);
    reset();
  }

  function chooseArticle(a) {
    setArticle(a);
    setStep("options");
  }

  function basePayload() {
    const preset = STYLE_PRESETS.find((p) => p.id === stylePreset) ?? STYLE_PRESETS[0];
    const payload = {
      campaign_slug: article.slug,
      model,
      prompt,
      text_format: textFormat,
      post_type: format,
    };

    if (isVideo) {
      payload.duration_seconds = Number(duration);
      payload.orientation = orientation;
      if (avatarId) payload.avatar_id = avatarId;
      if (voiceId) {
        payload.voice_clone_id = Number(voiceId);
        payload.voice_mode = voiceMode;
      }
      return payload;
    }

    payload.image_model = imageEngine;
    payload.design = preset.design;
    if (format === "carousel") payload.slides = Number(slides);
    return payload;
  }

  async function requestDraft() {
    setDrafting(true);
    setRedHits([]);
    try {
      const res = await draftArticleText(basePayload());
      setDraft(res.data);
      setScript(res.data?.script ?? "");
      setStep("draft");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.data?.red_hits) {
        setRedHits(data.data.red_hits);
        toast.error("The draft contained prohibited language. Try again.");
      } else {
        toast.error(data?.message || "Could not generate the draft.");
      }
    } finally {
      setDrafting(false);
    }
  }

  async function finalize() {
    setFinalizing(true);
    try {
      const payload = {
        ...basePayload(),
        approved_text: {
          title: draft.title,
          caption: draft.caption,
          image_text: draft.image_text,
          // One text per slide, so the carousel reads as a sequence.
          image_text_slides: draft.image_text_slides ?? [],
          hashtags: draft.hashtags,
          summary: draft.summary,
        },
      };
      if (isVideo) payload.approved_script = script;

      const res = await generateArticlePost(payload);
      setResult(res.data);
      setStep("done");
      if (onCreated) onCreated(res.data);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.data?.red_hits) {
        setRedHits(data.data.red_hits);
        toast.error("Prohibited language detected. Edit the text and try again.");
        setStep("draft");
      } else {
        toast.error(data?.message || "Could not create the post.");
      }
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-700 text-white py-[10px] px-[16px] flex items-center gap-2 rounded-lg text-sm"
      >
        <img src="/icons/ic-add.svg" className="text-white" alt="" />
        Promote an Article
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-lg z-50 overflow-y-auto text-gray-900">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Promote an Article</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* STEP 1: pick the article */}
            {step === "pick" && (
              <div className="px-6 py-6">
                <p className="text-sm text-gray-500 mb-3">
                  Pick an article to promote. Your post links straight to it, and you get credit for
                  anyone who subscribes there.
                </p>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or number"
                  className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {articles.length === 0 ? (
                  <p className="text-sm text-gray-400">No articles available yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                    {filtered.map((a) => (
                      <button
                        key={a.slug}
                        onClick={() => chooseArticle(a)}
                        className="w-full border-2 border-gray-200 hover:border-emerald-500 rounded-xl p-4 text-left transition flex gap-3"
                      >
                        <span className="shrink-0 mt-[2px] inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          {a.article_number}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-sm">{a.title}</span>
                          {a.excerpt && (
                            <span className="block text-xs text-gray-500 mt-1 line-clamp-2">{a.excerpt}</span>
                          )}
                        </span>
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <p className="text-sm text-gray-400 py-4 text-center">No article matches that.</p>
                    )}
                  </div>
                )}

                {affiliate && !affiliate.has_ref_code && (
                  <p className="mt-4 text-xs text-amber-600">
                    Your carbogenetics.com affiliate link is not connected yet. Posts will still
                    generate, but clicks will not be attributed to you until it is.
                  </p>
                )}
              </div>
            )}

            {/* STEP 2: options */}
            {step === "options" && article && (
              <div className="px-6 py-4 space-y-4">
                <div className="rounded-lg bg-gray-50 border px-4 py-3">
                  <p className="text-sm font-semibold">#{article.article_number} {article.title}</p>
                  <p className="text-xs text-gray-500 mt-1 break-all">Your link: {article.link}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Post format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "carousel", label: "Carousel", hint: "Several slides" },
                      { id: "single", label: "Single image", hint: "One slide" },
                      { id: "video", label: "Video", hint: "AI presenter" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className={`rounded-lg border-2 px-3 py-3 text-left transition ${
                          format === f.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="block text-sm font-semibold">{f.label}</span>
                        <span className="block text-xs text-gray-500">{f.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Anything specific to say? (optional)</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Leave blank to let the AI pick the sharpest idea in the article."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Writer</label>
                    <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      {MODEL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Caption format</label>
                    <select value={textFormat} onChange={(e) => setTextFormat(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option value="paragraph">Paragraphs</option>
                      <option value="bullet_points">Bullet points</option>
                    </select>
                  </div>
                </div>

                {/* Image options */}
                {!isVideo && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {format === "carousel" && (
                      <div>
                        <label className="text-sm font-medium mb-1 block">Slides</label>
                        <select value={slides} onChange={(e) => setSlides(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Slide style</label>
                      <select value={stylePreset} onChange={(e) => setStylePreset(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                        {STYLE_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Image engine</label>
                      <select value={imageEngine} onChange={(e) => setImageEngine(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="openai">OpenAI</option>
                        <option value="gemini">Gemini</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Video options */}
                {isVideo && (
                  <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Length</label>
                        <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                          {DURATIONS.map((d) => <option key={d} value={d}>{d} seconds</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Orientation</label>
                        <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Presenter {voiceMode === "audio" && <span className="text-xs text-gray-500">(must be one of your own avatars)</span>}
                      </label>
                      {avatars.length === 0 ? (
                        <p className="text-xs text-gray-400">Loading avatars…</p>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                          {avatars.map((a) => (
                            <button
                              key={a.avatar_id}
                              onClick={() => setAvatarId(a.avatar_id === avatarId ? "" : a.avatar_id)}
                              title={a.avatar_name}
                              className={`rounded-lg border-2 overflow-hidden aspect-[3/4] ${
                                avatarId === a.avatar_id ? "border-emerald-500" : "border-transparent hover:border-gray-300"
                              }`}
                            >
                              {a.preview_image_url ? (
                                <img src={a.preview_image_url} alt={a.avatar_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] p-1 block">{a.avatar_name}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {!avatarId && (
                        <p className="text-xs text-gray-500 mt-1">No presenter picked, so HeyGen will choose one.</p>
                      )}
                    </div>

                    {voices.length > 0 && (
                      <div>
                        <label className="text-sm font-medium mb-1 block">Voice (optional)</label>
                        <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                          <option value="">Default voice</option>
                          {voices.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                        {selectedVoice && !selectedVoice.heygen_voice_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            This voice only works in talking-head mode, so pick one of your own photo
                            avatars above.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button onClick={() => setStep("pick")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                  <button
                    onClick={requestDraft}
                    disabled={drafting}
                    className="bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-60"
                  >
                    {drafting ? "Writing…" : isVideo ? "Write draft & script" : "Write draft"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 pb-2">Drafting is free. Nothing is charged until you approve it.</p>
              </div>
            )}

            {/* STEP 3: draft review */}
            {step === "draft" && draft && (
              <div className="px-6 py-4 space-y-4">
                {draft.requires_human_review && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-amber-800">This post will need review before publishing.</p>
                    {Array.isArray(draft.review_reasons) && draft.review_reasons.length > 0 && (
                      <ul className="mt-1 list-disc pl-5 text-xs text-amber-700">
                        {draft.review_reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>
                )}

                {redHits.length > 0 && (
                  <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Prohibited language detected: {redHits.join(", ")}. Edit the text below or draft again.
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Caption</label>
                  <textarea
                    value={draft.caption}
                    onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
                    rows={8}
                    className="mt-1 w-full text-sm border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {isVideo ? (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Spoken script</label>
                    <textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      rows={6}
                      className="mt-1 w-full text-sm border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">This is what the presenter says out loud.</p>
                  </div>
                ) : draft.image_text_slides?.length > 1 ? (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Slide text ({draft.image_text_slides.length} slides, in order)
                    </label>
                    <div className="mt-1 space-y-2">
                      {draft.image_text_slides.map((s, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="shrink-0 mt-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            {i + 1}
                          </span>
                          <textarea
                            value={s}
                            onChange={(e) => {
                              const next = [...draft.image_text_slides];
                              next[i] = e.target.value;
                              setDraft({ ...draft, image_text_slides: next });
                            }}
                            rows={2}
                            className="flex-1 text-sm border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Each slide carries a different beat of the argument. This is what gets rendered
                      onto the images.
                    </p>
                  </div>
                ) : (
                  draft.image_text && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">On-image text</label>
                      <textarea
                        value={draft.image_text}
                        onChange={(e) => setDraft({ ...draft, image_text: e.target.value })}
                        rows={3}
                        className="mt-1 w-full text-sm border rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )
                )}

                {draft.hashtags && <p className="text-xs text-emerald-700">{draft.hashtags}</p>}
                {draft.link && <p className="text-xs text-gray-400 break-all">Links to: {draft.link}</p>}

                <div className="flex justify-between pt-2">
                  <button onClick={() => setStep("options")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                  <div className="flex gap-2">
                    <button onClick={requestDraft} disabled={drafting} className="bg-gray-200 px-4 py-2 rounded-lg text-sm disabled:opacity-60">
                      {drafting ? "…" : "Draft again"}
                    </button>
                    <button
                      onClick={finalize}
                      disabled={finalizing || !draft.caption?.trim() || (isVideo && !script.trim())}
                      className="bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-60"
                    >
                      {finalizing ? (isVideo ? "Starting…" : "Generating…") : isVideo ? "Approve & make video" : "Approve & create post"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: done */}
            {step === "done" && result && (
              <div className="px-6 py-8 text-center space-y-3">
                <div className="text-2xl">✅</div>
                {isVideo ? (
                  <>
                    <p className="text-sm font-semibold">Your video is rendering.</p>
                    <p className="text-sm text-gray-500">
                      It takes a few minutes. The finished video lands on this draft in your library
                      automatically, then you can publish it.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold">Your images are being generated.</p>
                    <p className="text-sm text-gray-500">
                      Each one takes about half a minute. They attach to this draft in your library
                      automatically, then you can publish it. You do not need to wait here.
                    </p>
                  </>
                )}

                {result.requires_human_review && (
                  <p className="text-sm text-amber-700">It is awaiting review before it can be published.</p>
                )}

                <p className="text-xs text-gray-400 break-all">Share link: {result.affiliate_url}</p>

                {result.post_id && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/u/campaign-post/${result.post_id}`);
                    }}
                    className="mx-auto block bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm"
                  >
                    {isVideo ? "Track this video →" : "Track your images →"}
                  </button>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <button onClick={reset} className="bg-gray-200 px-5 py-2 rounded-lg text-sm">Create another</button>
                  <button onClick={handleClose} className="bg-gray-200 px-5 py-2 rounded-lg text-sm">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
