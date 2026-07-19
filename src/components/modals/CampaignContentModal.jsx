import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getCampaigns, draftCampaignText, generateCampaignPost } from "../../services/campaign.api";

// Campaign post generation for the four affiliate domains (CO2 Education,
// CO2inhaler, BodyStream, BodyStream Sauna). Kept as a SEPARATE modal from the
// book-post GenerateContentModal so the existing book/video flow is untouched.
// Compliance (approved claims, red-lint, human review) is enforced server-side;
// this UI surfaces the review banner and blocks nothing the server allows.

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

export default function CampaignContentModal({ onCreated }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [affiliate, setAffiliate] = useState(null);

  const [step, setStep] = useState("type"); // type -> options -> draft -> done
  const [campaign, setCampaign] = useState(null);
  const [model, setModel] = useState("gpt-5.4");
  const [theme, setTheme] = useState("");
  const [prompt, setPrompt] = useState("");
  const [textFormat, setTextFormat] = useState("paragraph");
  const [postType, setPostType] = useState("single");
  const [slides, setSlides] = useState(3);
  const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0].id);
  const [imageEngine, setImageEngine] = useState("openai");

  const [draft, setDraft] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [redHits, setRedHits] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await getCampaigns();
        setCampaigns(res?.data?.campaigns ?? []);
        setAffiliate(res?.data?.affiliate ?? null);
      } catch {
        toast.error("Could not load campaigns.");
      }
    })();
  }, [isOpen]);

  function reset() {
    setStep("type");
    setCampaign(null);
    setTheme("");
    setPrompt("");
    setTextFormat("paragraph");
    setPostType("single");
    setSlides(3);
    setDraft(null);
    setFeedback("");
    setRedHits([]);
    setResult(null);
  }

  function handleClose() {
    setIsOpen(false);
    reset();
  }

  function chooseCampaign(c) {
    setCampaign(c);
    setTheme(c.allowed_themes?.[0] ?? "");
    // Product campaigns can run as a single official-image post or a carousel;
    // education has no product image so it defaults to a carousel.
    setPostType(c.requires_official_image ? "single" : "carousel");
    setStep("options");
  }

  function basePayload() {
    const preset = STYLE_PRESETS.find((p) => p.id === stylePreset) ?? STYLE_PRESETS[0];
    return {
      campaign_slug: campaign.slug,
      model,
      theme,
      prompt,
      text_format: textFormat,
      image_model: imageEngine,
      post_type: postType,
      slides: postType === "carousel" ? Number(slides) : undefined,
      design: preset.design,
    };
  }

  async function requestDraft(withFeedback = false) {
    setDrafting(true);
    setRedHits([]);
    try {
      const payload = { ...basePayload() };
      if (withFeedback && draft) {
        payload.feedback = feedback;
        payload.previous_text = { caption: draft.caption, image_text: draft.image_text };
      }
      const res = await draftCampaignText(payload);
      setDraft(res.data);
      setStep("draft");
      setFeedback("");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.data?.red_hits) {
        setRedHits(data.data.red_hits);
        toast.error("The draft contained prohibited language. Regenerate.");
      } else {
        toast.error(data?.message || "Could not generate draft.");
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
          hashtags: draft.hashtags,
          summary: draft.summary,
        },
      };
      const res = await generateCampaignPost(payload);
      setResult(res.data);
      setStep("done");
      if (onCreated) onCreated(res.data);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.data?.red_hits) {
        setRedHits(data.data.red_hits);
        toast.error("Prohibited language detected. Regenerate the draft.");
        setStep("draft");
      } else {
        toast.error(data?.message || "Could not create the campaign post.");
      }
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-700 text-white py-[10px] px-[16px] flex items-center gap-2 rounded-lg text-sm"
      >
        <img src="/icons/ic-add.svg" className="text-white" alt="" />
        Promote a Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-lg z-50 overflow-y-auto text-gray-900">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Promote a Product</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* STEP 1: campaign */}
            {step === "type" && (
              <div className="px-6 py-8">
                <p className="text-sm text-gray-500 mb-4">Which product or resource do you want to promote?</p>
                {campaigns.length === 0 ? (
                  <p className="text-sm text-gray-400">No active campaigns yet. Check back soon.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {campaigns.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => chooseCampaign(c)}
                        className="border-2 border-gray-200 hover:border-purple-500 rounded-xl p-6 text-left transition"
                      >
                        <div className="text-lg font-semibold mb-1">{c.name}</div>
                        <p className="text-sm text-gray-500">{c.domain}</p>
                      </button>
                    ))}
                  </div>
                )}
                {affiliate && !affiliate.has_ref_code && (
                  <p className="mt-4 text-xs text-amber-600">
                    Your carbogenetics.com affiliate link isn&rsquo;t linked yet — posts will still generate, but
                    clicks won&rsquo;t be attributed until it is.
                  </p>
                )}
              </div>
            )}

            {/* STEP 2: options */}
            {step === "options" && campaign && (
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {(campaign.allowed_themes ?? []).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Anything specific to say? (optional)</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Leave blank to let the AI write on the selected theme."
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
                    <label className="text-sm font-medium mb-1 block">Format</label>
                    <select value={textFormat} onChange={(e) => setTextFormat(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option value="paragraph">Paragraphs</option>
                      <option value="bullet_points">Bullet points</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Post type</label>
                    <select value={postType} onChange={(e) => setPostType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option value="single">
                        {campaign.requires_official_image ? "Single (official product image)" : "Single"}
                      </option>
                      <option value="carousel">Carousel (educational slides{campaign.requires_official_image ? " + product image" : ""})</option>
                    </select>
                  </div>
                  {postType === "carousel" && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Educational slides</label>
                      <select value={slides} onChange={(e) => setSlides(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {postType === "carousel" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {campaign.requires_official_image && (
                  <p className="text-xs text-gray-500">
                    The official product image is added automatically and never altered.
                  </p>
                )}

                <div className="flex justify-between pt-2">
                  <button onClick={() => setStep("type")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                  <button
                    onClick={() => requestDraft(false)}
                    disabled={drafting || !theme}
                    className="bg-purple-700 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-60"
                  >
                    {drafting ? "Writing…" : "Write draft"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: draft review */}
            {step === "draft" && draft && (
              <div className="px-6 py-4 space-y-4">
                {draft.requires_human_review && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-amber-800">This post will need admin review before it can be published.</p>
                    {Array.isArray(draft.review_reasons) && draft.review_reasons.length > 0 && (
                      <ul className="mt-1 list-disc pl-5 text-xs text-amber-700">
                        {draft.review_reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>
                )}

                {redHits.length > 0 && (
                  <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Prohibited language detected: {redHits.join(", ")}. Please regenerate.
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Caption</label>
                  <p className="mt-1 whitespace-pre-wrap text-sm border rounded-lg p-3 bg-gray-50">{draft.caption}</p>
                </div>
                {draft.image_text && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">On-image text</label>
                    <p className="mt-1 text-sm border rounded-lg p-3 bg-gray-50">{draft.image_text}</p>
                  </div>
                )}
                {draft.hashtags && <p className="text-xs text-purple-600">{draft.hashtags}</p>}

                <div>
                  <label className="text-sm font-medium mb-1 block">Request changes (optional)</label>
                  <div className="flex gap-2">
                    <input
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      placeholder="e.g. make it shorter, friendlier tone"
                    />
                    <button
                      onClick={() => requestDraft(true)}
                      disabled={drafting || !feedback}
                      className="bg-gray-200 px-4 py-2 rounded-lg text-sm disabled:opacity-60"
                    >
                      {drafting ? "…" : "Revise"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button onClick={() => setStep("options")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                  <button
                    onClick={finalize}
                    disabled={finalizing}
                    className="bg-purple-700 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-60"
                  >
                    {finalizing ? "Generating…" : "Approve & create post"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: done */}
            {step === "done" && result && (
              <div className="px-6 py-8 text-center space-y-3">
                <div className="text-2xl">✅</div>
                <p className="text-sm font-semibold">Campaign post created and saved to your library.</p>
                {result.requires_human_review ? (
                  <p className="text-sm text-amber-700">It&rsquo;s awaiting admin review before it can be published.</p>
                ) : (
                  <p className="text-sm text-gray-500">You can publish or schedule it from your library.</p>
                )}
                <p className="text-xs text-gray-400 break-all">Share link: {result.affiliate_url}</p>
                {result.post_id && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/u/campaign-post/${result.post_id}`);
                    }}
                    className="mx-auto block bg-purple-700 text-white px-6 py-2 rounded-lg text-sm"
                  >
                    View &amp; arrange slides →
                  </button>
                )}
                <div className="flex justify-center gap-3 pt-2">
                  <button onClick={() => { reset(); }} className="bg-gray-200 px-5 py-2 rounded-lg text-sm">Create another</button>
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
