import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import { getChapter, draftPostText, generateAIPost, getChapterAngles } from "../../services/post.api";
import { draftScript, generateVideo, getVideoGenerationStatus, getAvatars, getVoiceClones } from "../../services/heygen.api";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import PublishSettingsFields from "../PublishSettingsFields";

const POLL_INTERVAL_MS = 6000;

// One-click image style presets. Each maps to the four design fields the
// backend expects, so nothing downstream changes - the dropdowns still
// exist under "Customize (advanced)" for fine-tuning, pre-filled from
// the chosen preset. Curated combinations that reliably look good, so
// most users never touch the advanced controls.
const IMAGE_PRESETS = [
  {
    id: "cinematic",
    label: "Cinematic Infographic",
    description: "Dramatic, premium, high detail",
    design: {
      image_style: "Cinematic Infographic",
      content_angle: "Educational / Explainer",
      human_presence: "No People",
      visual_mood: "Empowering",
    },
  },
  {
    id: "minimal",
    label: "Clean & Minimal",
    description: "Crisp, modern, lots of space",
    design: {
      image_style: "Minimalist / Modern",
      content_angle: "Educational / Explainer",
      human_presence: "No People",
      visual_mood: "Calm & Grounded",
    },
  },
  {
    id: "scientific",
    label: "Scientific Diagram",
    description: "Precise, clinical, labeled",
    design: {
      image_style: "Scientific / Conceptual",
      content_angle: "Clinical Perspective",
      human_presence: "No People",
      visual_mood: "Serious & Clinical",
    },
  },
  {
    id: "human",
    label: "Warm & Human",
    description: "Real people, approachable",
    design: {
      image_style: "Lifestyle / Wellness",
      content_angle: "Beginner Friendly",
      human_presence: "Everyday People",
      visual_mood: "Warm & Reassuring",
    },
  },
  {
    id: "bold",
    label: "Bold & Vibrant",
    description: "Strong colors, high energy",
    design: {
      image_style: "Illustrated / Graphic",
      content_angle: "Myth-Busting",
      human_presence: "No People",
      visual_mood: "Quietly Provocative",
    },
  },
  {
    id: "photo",
    label: "Hyper-Realistic Photo",
    description: "Lifelike, photographic",
    design: {
      image_style: "Hyper-Realistic",
      content_angle: "Story-Driven",
      human_presence: "Single Person",
      visual_mood: "Curious & Thoughtful",
    },
  },
];

export default function GenerateContentModal({ setGeneratedData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [angles, setAngles] = useState([]);
  const [anglesLoading, setAnglesLoading] = useState(false);
  const [selectedAngleId, setSelectedAngleId] = useState("");
  const location = useLocation();

  // Wizard state
  const [step, setStep] = useState("type"); // type -> options -> draft -> generating -> done
  const [contentType, setContentType] = useState(null); // 'image' | 'video'
  const [stylePreset, setStylePreset] = useState(IMAGE_PRESETS[0].id); // selected image style preset
  const [advancedStyle, setAdvancedStyle] = useState(false); // reveal the fine-grained dropdowns
  const [draft, setDraft] = useState(null); // {title, caption, hashtags, summary} | {script}
  const [imageEngine, setImageEngine] = useState("openai"); // which AI actually renders the image - chosen after text is approved
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [videoGeneration, setVideoGeneration] = useState(null);
  const pollRef = useRef(null);

  // Publish-without-review: lets the user skip the post-render review step
  // entirely by deciding up front what should happen once the video
  // finishes - the server (not this modal) handles it from there via
  // PostAutoPublishService, so nothing in this modal needs to poll or wait
  // when one of these is chosen.
  const [publishAction, setPublishAction] = useState("review"); // "review" | "publish_now" | "schedule"
  const [publishCaption, setPublishCaption] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [publishSettings, setPublishSettings] = useState({ platforms: [] });

  // Avatar picker: HeyGen's account has 1000+ avatars (stock + custom
  // clones), so we fetch once and filter client-side rather than rendering
  // a giant native <select>.
  const [avatars, setAvatars] = useState([]);
  const [heygenPricing, setHeygenPricing] = useState(null); // { cost_cents_per_second, margin_multiplier, price_cents_per_credit, minimum_credits }
  const [myHeygenAvatars, setMyHeygenAvatars] = useState([]); // the HeyGen account's own "My avatars" (photo avatar groups)
  const [myFavoriteAvatars, setMyFavoriteAvatars] = useState([]);
  const [globalFavoriteAvatars, setGlobalFavoriteAvatars] = useState([]);
  const [recentAvatars, setRecentAvatars] = useState([]);
  const [avatarsLoading, setAvatarsLoading] = useState(false);
  const [avatarSearch, setAvatarSearch] = useState("");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Voice: the user's own cloned voices. Selecting one lets them choose,
  // per video, between "agent" (rich, b-roll, uses the HeyGen voice clone)
  // and "audio" (talking-head, open-source Chatterbox voice on their own
  // photo avatar). Empty selection = default HeyGen/agent voice.
  const [myVoices, setMyVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [voiceMode, setVoiceMode] = useState("agent");
  const selectedVoice = myVoices.find((v) => String(v.id) === String(selectedVoiceId)) || null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      post_type: "single",
      duration_seconds: 30,
      orientation: "portrait",
      avatar_id: "",
    },
  });

  const chapterId = watch("chapter_id");
  const postType = watch("post_type");

  // Angles are chapter-specific: reload (and clear any prior pick) on change.
  useEffect(() => {
    setSelectedAngleId("");
    if (!chapterId) {
      setAngles([]);
      return;
    }
    let cancelled = false;
    setAnglesLoading(true);
    getChapterAngles(chapterId)
      .then((r) => {
        if (!cancelled) setAngles(r?.data?.angles || []);
      })
      .catch(() => {
        if (!cancelled) setAngles([]);
      })
      .finally(() => {
        if (!cancelled) setAnglesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  const durationSeconds = watch("duration_seconds");

  // Live credit estimate for the chosen duration - mirrors the backend's
  // HeygenPricingService::creditsForDuration() exactly, using the pricing
  // constants the avatars endpoint returns (so it never drifts from what
  // will actually be charged). null until pricing loads or if the
  // duration is out of range.
  const estimatedCredits = (() => {
    const secs = Number(durationSeconds);
    if (!heygenPricing || !secs || secs < 10 || secs > 120) return null;
    const priceCents = secs * heygenPricing.cost_cents_per_second * heygenPricing.margin_multiplier;
    const credits = priceCents / heygenPricing.price_cents_per_credit;
    return Math.max(Math.ceil(credits), heygenPricing.minimum_credits);
  })();

  useEffect(() => {
    if (location.state?.generate) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchChapters = async () => {
      try {
        const res = await getChapter();
        setChapters(res?.data || []);
      } catch (error) {
        console.error("GET CHAPTER ERROR ❌", error);
      }
    };

    fetchChapters();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || contentType !== "video" || avatars.length > 0 || avatarsLoading) return;

    const fetchAvatars = async () => {
      setAvatarsLoading(true);
      try {
        const res = await getAvatars();
        setAvatars(res?.data?.all || []);
        setHeygenPricing(res?.data?.pricing || null);
        setMyHeygenAvatars(res?.data?.my_avatars || []);
        setMyFavoriteAvatars(res?.data?.personal_favorites || []);
        setGlobalFavoriteAvatars(res?.data?.global_favorites || []);
        setRecentAvatars(res?.data?.recently_used || []);
      } catch (error) {
        console.error("GET AVATARS ERROR ❌", error);
      } finally {
        setAvatarsLoading(false);
      }
    };

    fetchAvatars();
  }, [isOpen, contentType, avatars.length, avatarsLoading]);

  useEffect(() => {
    if (!isOpen || contentType !== "video") return;
    getVoiceClones()
      .then((res) => setMyVoices(res?.data || []))
      .catch((error) => console.error("GET VOICES ERROR ❌", error));
  }, [isOpen, contentType]);

  // When a voice is chosen, default to rich mode if it has a HeyGen clone,
  // otherwise force talking-head (the only mode a Chatterbox-only voice
  // supports).
  const chooseVoice = (id) => {
    setSelectedVoiceId(id);
    const v = myVoices.find((vc) => String(vc.id) === String(id));
    setVoiceMode(v && v.heygen_voice_id ? "agent" : "audio");
  };

  useEffect(() => () => stopPolling(), []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  const resetWizard = () => {
    stopPolling();
    setStep("type");
    setContentType(null);
    setDraft(null);
    setShowFeedback(false);
    setFeedback("");
    setVideoGeneration(null);
    setSelectedAvatar(null);
    setAvatarSearch("");
    setAvatarPickerOpen(false);
    setSelectedVoiceId("");
    setVoiceMode("agent");
    setStylePreset(IMAGE_PRESETS[0].id);
    setAdvancedStyle(false);
    reset();
  };

  const chooseAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    setValue("avatar_id", avatar.avatar_id);
    setAvatarPickerOpen(false);
    setAvatarSearch("");
  };

  const clearAvatar = () => {
    setSelectedAvatar(null);
    setValue("avatar_id", "");
    setAvatarPickerOpen(false);
    setAvatarSearch("");
  };

  // Priority order when not searching: the account's own HeyGen avatars,
  // then my favorites, then whatever's popular across everyone else, then
  // whatever this user has actually used before, then everything else -
  // each avatar appears in only the highest-priority section it
  // qualifies for.
  const myHeygenIds = new Set(myHeygenAvatars.map((a) => a.avatar_id));
  const dedupedFavorites = myFavoriteAvatars.filter((a) => !myHeygenIds.has(a.avatar_id));
  const myFavoriteIds = new Set(dedupedFavorites.map((a) => a.avatar_id));
  const dedupedGlobal = globalFavoriteAvatars.filter(
    (a) => !myHeygenIds.has(a.avatar_id) && !myFavoriteIds.has(a.avatar_id)
  );
  const dedupedRecent = recentAvatars.filter(
    (a) =>
      !myHeygenIds.has(a.avatar_id) &&
      !myFavoriteIds.has(a.avatar_id) &&
      !dedupedGlobal.some((g) => g.avatar_id === a.avatar_id)
  );
  const usedIds = new Set([
    ...myHeygenIds,
    ...myFavoriteIds,
    ...dedupedGlobal.map((a) => a.avatar_id),
    ...dedupedRecent.map((a) => a.avatar_id),
  ]);
  const remainingSlots = Math.max(
    0,
    30 - myHeygenAvatars.length - dedupedFavorites.length - dedupedGlobal.length - dedupedRecent.length
  );
  const otherAvatars = avatars.filter((a) => !usedIds.has(a.avatar_id)).slice(0, remainingSlots);

  const filteredAvatars = avatarSearch.trim()
    ? avatars.filter((a) => a.avatar_name.toLowerCase().includes(avatarSearch.trim().toLowerCase())).slice(0, 30)
    : [...myHeygenAvatars, ...dedupedFavorites, ...dedupedGlobal, ...dedupedRecent, ...otherAvatars];

  const handleClose = () => {
    setIsOpen(false);
    resetWizard();
  };

  const applyPreset = (preset) => {
    setStylePreset(preset.id);
    setValue("image_style", preset.design.image_style, { shouldValidate: true });
    setValue("content_angle", preset.design.content_angle, { shouldValidate: true });
    setValue("human_presence", preset.design.human_presence, { shouldValidate: true });
    setValue("visual_mood", preset.design.visual_mood, { shouldValidate: true });
  };

  const chooseType = (type) => {
    setContentType(type);
    setStep("options");
    // Seed the image design fields from the default preset so a user can
    // generate great images without opening the advanced controls.
    if (type === "image") {
      applyPreset(IMAGE_PRESETS.find((p) => p.id === stylePreset) || IMAGE_PRESETS[0]);
    }
  };

  const requestDraft = async (formData) => {
    setDrafting(true);
    try {
      if (contentType === "image") {
        const res = await draftPostText({
          chapter: formData.chapter_id,
          ...(selectedAngleId ? { angle_id: selectedAngleId } : {}),
          model: formData.model,
          text_format: formData.text_format,
          prompt: formData.prompt,
          // A carousel needs one text per slide, so the draft has to know how
          // many slides it is writing for.
          post_type: formData.post_type,
          slides: formData.post_type === "single" ? 1 : Number(formData.slides),
        });
        if (!res?.success) {
          toast.error(res?.message || "Could not generate draft");
          return;
        }
        setDraft(res.data);
        setImageEngine(formData.model === "gemini" ? "gemini" : "openai");
      } else {
        const res = await draftScript({
          chapter: formData.chapter_id,
          ...(selectedAngleId ? { angle_id: selectedAngleId } : {}),
          model: formData.model,
          duration_seconds: Number(formData.duration_seconds),
          prompt: formData.prompt,
        });
        if (!res?.success) {
          toast.error(res?.message || "Could not generate draft script");
          return;
        }
        setDraft(res.data);
      }
      setStep("draft");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not generate draft");
    } finally {
      setDrafting(false);
    }
  };

  useEffect(() => {
    if (contentType === "video" && draft?.script) {
      setPublishCaption(draft.script);
    } else if (contentType === "image" && draft?.caption) {
      // Same title-newline-caption shape the backend composes for the
      // review flow's generatedData.caption.
      setPublishCaption([draft.title, draft.caption].filter(Boolean).join("\n"));
    }
  }, [contentType, draft]);

  const requestRevision = async () => {
    if (!feedback.trim()) {
      toast.error("Describe what you'd like changed first");
      return;
    }

    const formData = getValues();
    setDrafting(true);
    try {
      if (contentType === "image") {
        const res = await draftPostText({
          chapter: formData.chapter_id,
          ...(selectedAngleId ? { angle_id: selectedAngleId } : {}),
          model: formData.model,
          text_format: formData.text_format,
          prompt: formData.prompt,
          post_type: formData.post_type,
          slides: formData.post_type === "single" ? 1 : Number(formData.slides),
          feedback,
          previous_text: draft,
        });
        if (!res?.success) {
          toast.error(res?.message || "Could not regenerate draft");
          return;
        }
        setDraft(res.data);
      } else {
        const res = await draftScript({
          chapter: formData.chapter_id,
          ...(selectedAngleId ? { angle_id: selectedAngleId } : {}),
          model: formData.model,
          duration_seconds: Number(formData.duration_seconds),
          prompt: formData.prompt,
          feedback,
          previous_script: draft.script,
        });
        if (!res?.success) {
          toast.error(res?.message || "Could not regenerate draft script");
          return;
        }
        setDraft(res.data);
      }
      setShowFeedback(false);
      setFeedback("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not regenerate draft");
    } finally {
      setDrafting(false);
    }
  };

  const approveDraft = async () => {
    const formData = getValues();

    // Shared publish-without-review validation - the image and video
    // branches send the same platform/schedule fields.
    if (publishAction !== "review") {
      if (!publishSettings.platforms?.length) {
        toast.error("Please select at least one platform to publish to");
        return;
      }
      if (publishSettings.platforms.includes("tiktok") && !publishSettings.privacy_level) {
        toast.error("Please select a TikTok privacy status");
        return;
      }
      if (publishAction === "schedule") {
        if (!scheduledAt) {
          toast.error("Please choose a date and time to schedule this post");
          return;
        }
        if (new Date(scheduledAt).getTime() <= Date.now()) {
          toast.error("Scheduled time must be in the future");
          return;
        }
      }
    }

    setFinalizing(true);

    try {
      if (contentType === "image") {
        // Everything needed to re-run image generation with the same
        // approved text later ("Regenerate image" on the post page) -
        // saved onto the draft post by the Library auto-save.
        const generationParams = {
          chapter: formData.chapter_id,
          ...(selectedAngleId ? { angle_id: selectedAngleId } : {}),
          model: formData.model,
          text_format: formData.text_format,
          post_type: formData.post_type,
          slides: formData.post_type === "single" ? 1 : Number(formData.slides),
          design: {
            image_style: formData.image_style,
            content_angle: formData.content_angle,
            human_presence: formData.human_presence,
            visual_mood: formData.visual_mood,
          },
          approved_text: draft,
          image_model: imageEngine,
        };

        const payload = {
          ...generationParams,
          ...(publishAction !== "review" && {
            publish_action: publishAction,
            caption: publishCaption,
            hashtags: (draft.hashtags || "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
              .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
              .join(", "),
            platforms: publishSettings.platforms,
            privacy_level: publishSettings.privacy_level,
            allow_comment: publishSettings.allow_comment,
            content_disclose: publishSettings.content_disclose,
            brand_organic: publishSettings.brand_organic,
            branded_content: publishSettings.branded_content,
            ...(publishAction === "schedule" && { scheduled_at: new Date(scheduledAt).toISOString() }),
          }),
        };

        const res = await generateAIPost(payload);

        if (!res?.success) {
          toast.error(res?.message || "Failed to generate content");
          return;
        }

        // Auto-publish succeeded server-side: the post already exists (and
        // is publishing/scheduled), so skip the review flow entirely -
        // handing res.data to Library would auto-save a duplicate draft.
        if (publishAction !== "review" && res.data?.post_id) {
          toast.success(
            publishAction === "schedule"
              ? `Images generated - post scheduled for ${new Date(scheduledAt).toLocaleString()}.`
              : "Images generated - your post is publishing now."
          );
          handleClose();
          return;
        }

        if (publishAction !== "review") {
          // Server fell back to review (no usable images or the publish
          // step failed) - the normal flow below auto-saves as a draft.
          toast.error("The post couldn't be auto-published - review it below instead.");
        }

        setGeneratedData({ ...res.data, generation_params: generationParams });
        handleClose();
      } else {
        const res = await generateVideo({
          script: draft.script,
          duration_seconds: Number(formData.duration_seconds),
          orientation: formData.orientation,
          avatar_id: formData.avatar_id || undefined,
          voice_clone_id: selectedVoiceId || undefined,
          voice_mode: selectedVoiceId ? voiceMode : undefined,
          ...(publishAction !== "review" && {
            publish_action: publishAction,
            chapter_id: formData.chapter_id,
            caption: publishCaption,
            platforms: publishSettings.platforms,
            privacy_level: publishSettings.privacy_level,
            allow_comment: publishSettings.allow_comment,
            content_disclose: publishSettings.content_disclose,
            brand_organic: publishSettings.brand_organic,
            branded_content: publishSettings.branded_content,
            ...(publishAction === "schedule" && { scheduled_at: new Date(scheduledAt).toISOString() }),
          }),
        });

        if (!res?.success) {
          toast.error(res?.message || "Could not start video generation");
          return;
        }

        if (publishAction !== "review") {
          toast.success(
            publishAction === "schedule"
              ? `Video is generating and will be scheduled for ${new Date(scheduledAt).toLocaleString()} once ready.`
              : "Video is generating and will publish automatically once ready."
          );
          handleClose();
          return;
        }

        setVideoGeneration({ id: res.data.generation_id, status: res.data.status });
        setStep("generating");
        pollRef.current = setTimeout(() => pollVideoStatus(res.data.generation_id), POLL_INTERVAL_MS);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setFinalizing(false);
    }
  };

  const pollVideoStatus = async (id) => {
    try {
      const res = await getVideoGenerationStatus(id);
      if (!res?.success) {
        toast.error(res?.message || "Could not check video status");
        stopPolling();
        return;
      }

      setVideoGeneration(res.data);

      if (res.data.status === "completed") {
        stopPolling();
        handOffCompletedVideo(res.data);
        return;
      }

      if (res.data.status === "failed") {
        stopPolling();
        return;
      }

      pollRef.current = setTimeout(() => pollVideoStatus(id), POLL_INTERVAL_MS);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not check video status");
      stopPolling();
    }
  };

  /* Once a video finishes rendering, hand it to the same review/publish
     screen used for images, instead of leaving it stuck inside this modal
     with no way to actually save/publish it. */
  const handOffCompletedVideo = (generation) => {
    const formData = getValues();
    const selectedChapter = chapters.find((c) => String(c.id) === String(formData.chapter_id));

    setGeneratedData({
      caption: draft?.script || "",
      hashtags: "",
      model: "HeyGen",
      post_type: "single",
      slides: 1,
      images: [
        {
          slide: 1,
          image_url: generation.video_url,
          media_type: "video",
          image_error: null,
          status: true,
        },
      ],
      chapter: selectedChapter?.chapter || "",
      chapter_title: selectedChapter?.chapter_title || "",
      chapter_id: formData.chapter_id,
      ai_prompt: draft?.script || "",
    });
    handleClose();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gray-900 text-white py-[10px] px-[16px] flex align-center gap-2 rounded-lg text-sm"
      >
        <img src="/icons/ic-add.svg" className="text-white" />
        Generate
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-lg z-50 overflow-y-auto text-gray-900">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Generate Content</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {/* STEP 1: Content type */}
            {step === "type" && (
              <div className="px-6 py-8">
                <p className="text-sm text-gray-500 mb-4">What do you want to create?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => chooseType("image")}
                    className="border-2 border-gray-200 hover:border-purple-500 rounded-xl p-6 text-left transition"
                  >
                    <div className="text-lg font-semibold mb-1">Image Post</div>
                    <p className="text-sm text-gray-500">A single image or carousel for Instagram/TikTok.</p>
                  </button>
                  <button
                    onClick={() => chooseType("video")}
                    className="border-2 border-gray-200 hover:border-purple-500 rounded-xl p-6 text-left transition"
                  >
                    <div className="text-lg font-semibold mb-1">Video</div>
                    <p className="text-sm text-gray-500">An AI avatar video, narrated from a script you approve.</p>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Options */}
            {step === "options" && (
              <form onSubmit={handleSubmit(requestDraft)}>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Select Chapter <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("chapter_id", { required: "Chapter is required" })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Chapter</option>
                      {chapters.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.chapter}: {item.chapter_title}
                        </option>
                      ))}
                    </select>
                    {errors.chapter_id && (
                      <p className="text-xs text-red-500 mt-1">{errors.chapter_id.message}</p>
                    )}
                  </div>

                  {/* Content angle: which argument from the chapter to make.
                      Each chapter supports a dozen distinct posts; without this
                      the model keeps landing on the same obvious takeaway. */}
                  {chapterId && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Content Angle{" "}
                        <span className="font-normal text-gray-500">
                          (optional, but gives a sharper post)
                        </span>
                      </label>

                      {anglesLoading ? (
                        <p className="text-sm text-gray-500 py-2">Loading angles...</p>
                      ) : angles.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">
                          No angles yet for this chapter. The post will cover the chapter generally.
                        </p>
                      ) : (
                        <div className="max-h-72 overflow-y-auto rounded-lg border divide-y">
                          <button
                            type="button"
                            onClick={() => setSelectedAngleId("")}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                              selectedAngleId === "" ? "bg-purple-50" : ""
                            }`}
                          >
                            <span className="font-medium">Let the AI choose</span>
                            <span className="block text-xs text-gray-500">
                              Covers the chapter's main point
                            </span>
                          </button>

                          {angles.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => setSelectedAngleId(a.id)}
                              className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                                String(selectedAngleId) === String(a.id) ? "bg-purple-50" : ""
                              }`}
                            >
                              <span className="flex items-start gap-2">
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-medium text-gray-900">
                                    {a.title}
                                  </span>
                                  <span className="block text-xs text-gray-600 mt-0.5">
                                    {a.summary}
                                  </span>
                                </span>
                                {a.used_by_me > 0 && (
                                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                                    used
                                  </span>
                                )}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {angles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {angles.length} angles from this chapter
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        AI Model <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("model", { required: "AI model is required" })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="gpt-4-turbo">ChatGPT</option>
                        <option value="claude-3-haiku-20240307">Claude</option>
                        <option value="gemini">Gemini</option>
                      </select>
                      {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
                    </div>

                    {contentType === "image" ? (
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Text Format <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register("text_format", { required: "Text format is required" })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select Text Format</option>
                          <option value="paragraph">Paragraph</option>
                          <option value="bullet_points">Bullet Points</option>
                        </select>
                        {errors.text_format && (
                          <p className="text-xs text-red-500 mt-1">{errors.text_format.message}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Video Duration <span className="text-red-500">*</span>
                        </label>
                        {/* duration_seconds stays the single source of
                            truth (estimate, validation, submit read it);
                            these two fields just edit it as min:sec.
                            Clamped to the same 10-120s range. */}
                        <input type="hidden" {...register("duration_seconds")} />
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={2}
                              value={Math.floor((Number(durationSeconds) || 0) / 60)}
                              onChange={(e) => {
                                const mins = Math.max(0, Math.min(2, Number(e.target.value) || 0));
                                const secs = (Number(durationSeconds) || 0) % 60;
                                const total = Math.max(10, Math.min(120, mins * 60 + secs));
                                setValue("duration_seconds", total, { shouldValidate: true });
                              }}
                              className="w-16 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-600">min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={59}
                              value={(Number(durationSeconds) || 0) % 60}
                              onChange={(e) => {
                                const mins = Math.floor((Number(durationSeconds) || 0) / 60);
                                const secs = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                                const total = Math.max(10, Math.min(120, mins * 60 + secs));
                                setValue("duration_seconds", total, { shouldValidate: true });
                              }}
                              className="w-16 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-600">sec</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Between 10 seconds and 2 minutes.</p>
                        {estimatedCredits !== null && (
                          <p className="text-xs text-gray-500 mt-1">
                            Estimated cost:{" "}
                            <span className="font-medium text-purple-700">{estimatedCredits} credits</span>{" "}
                            for {Number(durationSeconds)}s. Final charge matches the actual rendered length.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center">
                      {contentType === "image" ? "Custom Prompt" : "What should the video be about?"}
                      <span className="text-gray-500 ms-1">(Optional)</span>
                    </label>
                    <textarea
                      {...register("prompt")}
                      rows={4}
                      placeholder={
                        contentType === "video"
                          ? "Leave blank to let the AI build the video from the selected chapter, or add specific instructions..."
                          : "Write your instructions..."
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.prompt && <p className="text-xs text-red-500 mt-1">{errors.prompt.message}</p>}
                  </div>

                  {contentType === "image" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Post Type <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-sm">
                              <input type="radio" value="single" {...register("post_type")} />
                              Single Post
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="radio" value="carousel" {...register("post_type")} />
                              Carousel
                            </label>
                          </div>
                        </div>

                        {postType === "carousel" && (
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              No. of Carousel Slides <span className="text-red-500">*</span>
                            </label>
                            <select
                              {...register("slides", {
                                required: postType === "carousel" ? "Slides is required for carousel posts" : false,
                              })}
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="">Select Slides</option>
                              {[1, 2, 3, 4].map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                            {errors.slides && (
                              <p className="text-xs text-red-500 mt-1">{errors.slides.message}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Style presets: the primary, simple control. Each
                          fills the four design fields below. */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Style <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {IMAGE_PRESETS.map((preset) => (
                            <button
                              type="button"
                              key={preset.id}
                              onClick={() => applyPreset(preset)}
                              className={`text-left border rounded-lg px-3 py-2 transition ${
                                stylePreset === preset.id
                                  ? "border-purple-600 bg-purple-50 ring-1 ring-purple-600"
                                  : "border-gray-300 hover:border-purple-400"
                              }`}
                            >
                              <span className="block text-sm font-medium text-gray-900">{preset.label}</span>
                              <span className="block text-xs text-gray-500">{preset.description}</span>
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setAdvancedStyle((v) => !v)}
                          className="text-xs text-purple-600 mt-2 hover:underline"
                        >
                          {advancedStyle ? "Hide advanced options" : "Customize (advanced)"}
                        </button>
                      </div>

                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${advancedStyle ? "" : "hidden"}`}>
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Image Style <span className="text-red-500">*</span>
                          </label>
                          <select
                            {...register("image_style", { required: "Image style is required" })}
                            onChange={(e) => {
                              register("image_style").onChange(e);
                              setStylePreset("custom");
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Select Style</option>
                            <option value="Cinematic Infographic">Cinematic Infographic</option>
                            <option value="Minimalist / Modern">Minimalist / Modern</option>
                            <option value="Ancient History">Ancient History</option>
                            <option value="Clinical / Physiological">Clinical / Physiological</option>
                            <option value="Scientific / Conceptual">Scientific / Conceptual</option>
                            <option value="Human / Real People">Human / Real People</option>
                            <option value="Lifestyle / Wellness">Lifestyle / Wellness</option>
                            <option value="Nature-Inspired">Nature-Inspired</option>
                            <option value="Hyper-Realistic">Hyper-Realistic</option>
                            <option value="Illustrated / Graphic">Illustrated / Graphic</option>
                            <option value="Text-Forward / Typography-Led">Text-Forward / Typography-Led</option>
                          </select>
                          {errors.image_style && (
                            <p className="text-xs text-red-500 mt-1">{errors.image_style.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Content Angle <span className="text-red-500">*</span>
                          </label>
                          <select
                            {...register("content_angle", { required: "Content angle is required" })}
                            onChange={(e) => {
                              register("content_angle").onChange(e);
                              setStylePreset("custom");
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Select Angle</option>
                            <option value="Beginner Friendly">Beginner Friendly</option>
                            <option value="Myth-Busting">Myth-Busting</option>
                            <option value="Contrarian Insight">Contrarian Insight</option>
                            <option value="Educational / Explainer">Educational / Explainer</option>
                            <option value="Clinical Perspective">Clinical Perspective</option>
                            <option value="Story-Driven">Story-Driven</option>
                            <option value="Problem → Reframe">Problem → Reframe</option>
                          </select>
                          {errors.content_angle && (
                            <p className="text-xs text-red-500 mt-1">{errors.content_angle.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Human Presence <span className="text-red-500">*</span>
                          </label>
                          <select
                            {...register("human_presence", { required: "Human presence is required" })}
                            onChange={(e) => {
                              register("human_presence").onChange(e);
                              setStylePreset("custom");
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Select Presence</option>
                            <option value="No People">No People</option>
                            <option value="Single Person">Single Person</option>
                            <option value="Everyday People">Everyday People</option>
                            <option value="Athletic / Active">Athletic / Active</option>
                            <option value="Clinical / Professional">Clinical / Professional</option>
                          </select>
                          {errors.human_presence && (
                            <p className="text-xs text-red-500 mt-1">{errors.human_presence.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Visual Mood <span className="text-red-500">*</span>
                          </label>
                          <select
                            {...register("visual_mood", { required: "Visual mood is required" })}
                            onChange={(e) => {
                              register("visual_mood").onChange(e);
                              setStylePreset("custom");
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="">Select Mood</option>
                            <option value="Calm & Grounded">Calm & Grounded</option>
                            <option value="Curious & Thoughtful">Curious & Thoughtful</option>
                            <option value="Serious & Clinical">Serious & Clinical</option>
                            <option value="Empowering">Empowering</option>
                            <option value="Quietly Provocative">Quietly Provocative</option>
                            <option value="Warm & Reassuring">Warm & Reassuring</option>
                          </select>
                          {errors.visual_mood && (
                            <p className="text-xs text-red-500 mt-1">{errors.visual_mood.message}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {contentType === "video" && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Orientation</label>
                      <select
                        {...register("orientation")}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  )}

                  {contentType === "video" && (
                    <div className="relative">
                      <label className="text-sm font-medium mb-1 block">
                        Avatar <span className="text-gray-500">(Optional)</span>
                      </label>
                      <input type="hidden" {...register("avatar_id")} />
                      <button
                        type="button"
                        onClick={() => setAvatarPickerOpen((v) => !v)}
                        className="w-full border rounded-lg px-3 py-2 text-sm flex items-center gap-2 text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {selectedAvatar ? (
                          <>
                            <img
                              src={selectedAvatar.preview_image_url}
                              alt={selectedAvatar.avatar_name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="truncate">{selectedAvatar.avatar_name}</span>
                          </>
                        ) : (
                          <span className="text-gray-500">Let AI choose automatically</span>
                        )}
                      </button>

                      {avatarPickerOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              autoFocus
                              value={avatarSearch}
                              onChange={(e) => setAvatarSearch(e.target.value)}
                              placeholder="Search avatars by name..."
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            <button
                              type="button"
                              onClick={clearAvatar}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-gray-600"
                            >
                              Let AI choose automatically
                            </button>
                            {avatarsLoading && <p className="px-3 py-2 text-sm text-gray-500">Loading avatars...</p>}
                            {!avatarsLoading && filteredAvatars.length === 0 && (
                              <p className="px-3 py-2 text-sm text-gray-500">No avatars found</p>
                            )}
                            {!avatarSearch.trim() && myHeygenAvatars.length > 0 && (
                              <p className="px-3 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase">
                                My Avatars
                              </p>
                            )}
                            {!avatarSearch.trim() && myHeygenAvatars.length === 0 && dedupedFavorites.length > 0 && (
                              <p className="px-3 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase">
                                My Favorites
                              </p>
                            )}
                            {filteredAvatars.map((avatar, index) => (
                              <div key={avatar.avatar_id}>
                                {!avatarSearch.trim() &&
                                  myHeygenAvatars.length > 0 &&
                                  dedupedFavorites.length > 0 &&
                                  index === myHeygenAvatars.length && (
                                    <p className="px-3 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase">
                                      My Favorites
                                    </p>
                                  )}
                                {!avatarSearch.trim() &&
                                  dedupedGlobal.length > 0 &&
                                  index === myHeygenAvatars.length + dedupedFavorites.length && (
                                    <p className="px-3 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase">
                                      Popular
                                    </p>
                                  )}
                                {!avatarSearch.trim() &&
                                  dedupedRecent.length > 0 &&
                                  index === myHeygenAvatars.length + dedupedFavorites.length + dedupedGlobal.length && (
                                    <p className="px-3 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase">
                                      Recently Used
                                    </p>
                                  )}
                                {!avatarSearch.trim() &&
                                  otherAvatars.length > 0 &&
                                  index === myHeygenAvatars.length + dedupedFavorites.length + dedupedGlobal.length + dedupedRecent.length && (
                                    <p className="px-3 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase">
                                      All Avatars
                                    </p>
                                  )}
                                <button
                                  type="button"
                                  onClick={() => chooseAvatar(avatar)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                  <img
                                    src={avatar.preview_image_url}
                                    alt={avatar.avatar_name}
                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                  />
                                  <span className="truncate">{avatar.avatar_name}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {contentType === "video" && myVoices.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Voice <span className="text-gray-500">(Optional)</span>
                      </label>
                      <select
                        value={selectedVoiceId}
                        onChange={(e) => chooseVoice(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Default voice (AI picks / stock)</option>
                        {myVoices.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} (my voice)
                          </option>
                        ))}
                      </select>

                      {selectedVoice && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-2">
                            {selectedVoice.heygen_voice_id && (
                              <button
                                type="button"
                                onClick={() => setVoiceMode("agent")}
                                className={`flex-1 px-3 py-2 rounded-lg text-xs text-left border ${
                                  voiceMode === "agent" ? "border-purple-500 bg-purple-50" : "border-gray-300"
                                }`}
                              >
                                <span className="block font-medium text-gray-900">Rich video</span>
                                <span className="block text-gray-500">B-roll + scenes, my voice</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setVoiceMode("audio")}
                              className={`flex-1 px-3 py-2 rounded-lg text-xs text-left border ${
                                voiceMode === "audio" ? "border-purple-500 bg-purple-50" : "border-gray-300"
                              }`}
                            >
                              <span className="block font-medium text-gray-900">Just me talking</span>
                              <span className="block text-gray-500">My exact voice, my avatar</span>
                            </button>
                          </div>
                          {voiceMode === "audio" && (
                            <p className="text-xs text-amber-600">
                              Talking-head uses your own uploaded avatar — pick one of your avatars above. Adds a
                              small voice-synthesis charge.
                            </p>
                          )}
                          {!selectedVoice.heygen_voice_id && (
                            <p className="text-xs text-gray-400">This voice supports talking-head mode only.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-between gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                  <button
                    type="button"
                    onClick={() => setStep("type")}
                    className="py-[10px] px-[16px] rounded-lg text-sm border border-gray-300 text-gray-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={drafting}
                    className="py-[10px] px-[16px] rounded-lg text-sm bg-purple-600 text-white flex items-center gap-2 disabled:opacity-50"
                  >
                    {drafting ? "Generating draft..." : "Generate Draft Text"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Draft review / approve */}
            {step === "draft" && draft && (
              <div>
                <div className="px-6 py-4 space-y-3">
                  {contentType === "image" ? (
                    <>
                      <p className="text-sm text-gray-500">
                        {draft.image_text_slides?.length > 1
                          ? "This is the exact text that will appear on each slide, in order - review it before we generate."
                          : "This is the exact text that will appear ON the image - review it before we generate."}
                      </p>

                      {/* A carousel carries a different beat of the argument on
                          every slide, so each one is reviewed separately. */}
                      {draft.image_text_slides?.length > 1 ? (
                        <div className="space-y-2">
                          {draft.image_text_slides.map((s, i) => (
                            <div key={i} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                                Slide {i + 1} of {draft.image_text_slides.length}
                              </p>
                              <p className="text-sm whitespace-pre-wrap">{s}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Text on Image</p>
                          <p className="text-sm whitespace-pre-wrap">{draft.image_text}</p>
                        </div>
                      )}

                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-500">Social post caption (not shown on the image)</summary>
                        <div className="border rounded-lg p-4 bg-gray-50 space-y-2 mt-2">
                          <p className="font-semibold">{draft.title}</p>
                          <p className="text-sm whitespace-pre-wrap">{draft.caption}</p>
                          {draft.hashtags && <p className="text-xs text-purple-600">{draft.hashtags}</p>}
                        </div>
                      </details>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Image AI</label>
                        <select
                          value={imageEngine}
                          onChange={(e) => setImageEngine(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="openai">OpenAI (lower cost)</option>
                          <option value="gemini">Gemini (higher cost)</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">Review the script below before we generate the video.</p>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p className="text-sm whitespace-pre-wrap">{draft.script}</p>
                      </div>
                    </>
                  )}

                  {/* Publish-without-review options - shown for both images
                      and videos on the approve step. */}
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">What happens when it's ready?</p>
                    <div className="flex flex-col gap-2 text-sm mb-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={publishAction === "review"}
                          onChange={() => setPublishAction("review")}
                          className="accent-[#7239EA]"
                        />
                        Review before publishing
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={publishAction === "publish_now"}
                          onChange={() => setPublishAction("publish_now")}
                          className="accent-[#7239EA]"
                        />
                        Publish automatically when ready
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={publishAction === "schedule"}
                          onChange={() => setPublishAction("schedule")}
                          className="accent-[#7239EA]"
                        />
                        Schedule for a specific time
                      </label>
                    </div>

                    {publishAction === "schedule" && (
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    )}

                    {publishAction !== "review" && (
                      <>
                        <label className="text-sm font-medium mb-1 block">Caption</label>
                        <textarea
                          value={publishCaption}
                          onChange={(e) => setPublishCaption(e.target.value)}
                          rows={2}
                          className="w-full border rounded-lg px-3 py-2 text-sm resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <PublishSettingsFields onChange={setPublishSettings} />
                      </>
                    )}
                  </div>

                  {showFeedback && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">What should change?</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                        placeholder="e.g. make it more casual, mention the Bohr effect earlier..."
                        className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-between gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                  <button
                    type="button"
                    onClick={() => setStep("options")}
                    className="py-[10px] px-[16px] rounded-lg text-sm border border-gray-300 text-gray-700"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    {showFeedback ? (
                      <button
                        onClick={requestRevision}
                        disabled={drafting}
                        className="py-[10px] px-[16px] rounded-lg text-sm bg-gray-900 text-white disabled:opacity-50"
                      >
                        {drafting ? "Regenerating..." : "Regenerate Draft"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowFeedback(true)}
                        className="py-[10px] px-[16px] rounded-lg text-sm border border-gray-300 text-gray-700"
                      >
                        Request Changes
                      </button>
                    )}
                    <button
                      onClick={approveDraft}
                      disabled={finalizing}
                      className="py-[10px] px-[16px] rounded-lg text-sm bg-[#F8285A] text-white flex items-center gap-2 disabled:opacity-50"
                    >
                      <FaPlus size={16} />
                      {finalizing ? "Generating..." : `Approve & Generate ${contentType === "image" ? "Image" : "Video"}`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Video generating/failed (a completed video hands off
                straight to the same publish review screen used for images,
                via handOffCompletedVideo(), so it's never shown here) */}
            {step === "generating" && (
              <div className="px-6 py-8">
                {videoGeneration?.status !== "failed" && (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-[#F8285A] rounded-full mx-auto mb-4" />
                    <p className="text-sm text-gray-600">
                      {videoGeneration?.status === "generating" || videoGeneration?.status === "thinking"
                        ? "Generating your video..."
                        : "Rendering final video..."}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">This can take a few minutes.</p>
                  </div>
                )}

                {videoGeneration?.status === "failed" && (
                  <div>
                    <p className="text-sm text-red-600 mb-4">
                      {videoGeneration.error_message || "Video generation failed. Your credits have been refunded."}
                    </p>
                    <button
                      onClick={handleClose}
                      className="border border-gray-300 text-gray-700 py-[8px] px-[14px] rounded-lg text-sm"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
