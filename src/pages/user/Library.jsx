import { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import PublishModal from "../../components/modals/PublishModal";
import { useParams, useNavigate } from "react-router-dom";
import { set, useForm } from "react-hook-form";
import { createPost, publishPost, updatePostMedia } from "../../services/post.api";
import toast from "react-hot-toast";
import { getSinglePost } from "../../services/post.api";
import { generateVideoFromImage, getGrokVideoStatus } from "../../services/grok.api";
import PublishSettingsFields from "../../components/PublishSettingsFields";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import Swal from "sweetalert2";

import "yet-another-react-lightbox/styles.css";

export default function DraftPostPage({
  generatedData,
  setGeneratedData,
  loadPost,
}) {
  const [mediaType, setMediaType] = useState("carousel");

  // ✅ keep your existing states (no UI change)
  const [files, setFiles] = useState([]); // uploaded file list (still used for modal preview compatibility)
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [aiModel, setAiModel] = useState("");
  const [postStatus, setPostStatus] = useState(null);
  const [hashtagInput, setHashtagInput] = useState("");
  // const [script, setScript] = useState("");
  const [viewMedia, setViewMedia] = useState([]); // keep for edit mode UI (we'll fill it)
  const [userData, setUser] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [grokPickerOpen, setGrokPickerOpen] = useState(false);
  const [grokDuration, setGrokDuration] = useState(6);
  const [grokAudioMode, setGrokAudioMode] = useState("auto");
  const [grokGeneration, setGrokGeneration] = useState(null); // { id, status }
  const [grokLoading, setGrokLoading] = useState(false);

  // Publish-without-review, same as GenerateContentModal's HeyGen path.
  // In edit mode the existing post is published once the render finishes;
  // in create mode the backend creates the post at kickoff from the form's
  // chapter + caption (both must be filled in before generating).
  const [grokPublishAction, setGrokPublishAction] = useState("review"); // "review" | "publish_now" | "schedule"
  const [grokScheduledAt, setGrokScheduledAt] = useState("");
  const [grokPublishSettings, setGrokPublishSettings] = useState({ platforms: [] });

  // ✅ NEW: unified media list for preview + payload
  // each item: { type: "file", file: File, preview: string } OR { type: "url", url: string, media_type?: "video"|"image" }
  const [mediaItems, setMediaItems] = useState([]);

  console.log("mediaItems:", mediaItems);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};

  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const lightboxSlides =
    viewMedia.length > 0
      ? viewMedia.map((item) => {
        if (item.media_type === "video") {
          return {
            type: "video",
            sources: [
              {
                src: item.url,
                type: "video/mp4",
              },
            ],
          };
        }
        return {
          src: item.url,
        };
      })
      : mediaItems.map((m) => {
        const src = m.type === "url" ? m.url : m.preview;

        const isVideo =
          m.media_type === "video" ||
          (m.type === "file" && m.file?.type?.startsWith("video/")) ||
          /\.(mp4|webm|ogg)(\?|$)/i.test(src || "");

        return isVideo
          ? {
            type: "video",
            sources: [
              {
                src,
                type: "video/mp4",
              },
            ],
          }
          : {
            src,
          };
      });


  const hasFailedMedia = mediaItems.some(
    (item) => item.status === false
  );

  // On mobile, the natural instinct to dismiss a full-screen preview is the
  // phone's back gesture/button - but without this, that gesture is real
  // browser history navigation, which leaves the whole page (losing an
  // unsaved post) instead of just closing the overlay. Pushing a history
  // entry while an overlay is open lets us intercept that back action and
  // close the overlay in place instead.
  const isOverlayOpen = lightboxOpen || Boolean(selectedVideo);

  useEffect(() => {
    if (!isOverlayOpen) return;

    window.history.pushState({ modal: "overlay" }, "");

    const handlePopState = () => {
      setLightboxOpen(false);
      setSelectedVideo(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverlayOpen]);

  const closeOverlay = () => {
    if (window.history.state?.modal === "overlay") {
      window.history.back();
    } else {
      setLightboxOpen(false);
      setSelectedVideo(null);
    }
  };

  useEffect(() => {
    if (!isEditMode) return;

    const fetchPost = async () => {
      try {
        const res = await getSinglePost(id);

        if (!res?.success) {
          toast.error("Failed to load post");
          return;
        }

        const post = res.data;

        // Prefill fields
        setCaption(post.caption || "");
        // setScript(post.script || "");
        setAiModel(post.ai_model || "");
        setUser(post.user || "");
        setPostStatus(post.status || null);

        // Chapter
        if (post.chapter) {
          setChapter({
            id: post.chapter.id,
            code: post.chapter.chapter,
            title: post.chapter.chapter_title,
          });
        }

        // Hashtags
        if (post.hashtags) {
          setHashtags(
            post.hashtags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          );
        }

        // Media type (fallback)
        setMediaType(post.media_assets);

        // ✅ existing media from API (edit mode) as URL items (NO blob conversion)
        if (post.media?.length) {
          setViewMedia(post.media);

          const urlItems = post.media.map((m) => ({
            type: "url",
            url: m.url,
            media_type: m.media_type, // useful for video detection
          }));
          setMediaItems(urlItems);
          if (post.media_assets === "single") {
            setSelectedMedia([0]);
          } else {
            setSelectedMedia(urlItems.map((_, idx) => idx));
          }// select all by default

          // keep files empty in edit mode (uploads disabled anyway)
          setFiles([]);
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.error || err?.message || "Something went wrong"
        );
      }
    };

    fetchPost();
  }, [id, isEditMode]);

  const hasUnsavedData =
    !isEditMode &&
    (caption || files.length > 0 || hashtags.length > 0);

  useEffect(() => {
    if (!hasUnsavedData) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedData]);

  useEffect(() => {
    if (!generatedData) return;

    setCaption(generatedData.caption || "");
    // setScript(generatedData.script || "");

    if (generatedData.hashtags) {
      const tagsArray = generatedData.hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      setHashtags(tagsArray);
    }

    setChapter({
      id: generatedData.chapter_id,
      code: generatedData.chapter,
      title: generatedData.chapter_title,
    });

    setAiModel(generatedData.model || "");
    setMediaType(generatedData.post_type || "carousel");

    // ✅ generated images come as URLs → set into unified mediaItems
    if (generatedData.images?.length) {
      const urlItems = generatedData.images.map((img) => ({
        type: "url",
        url: img.image_url,
        media_type: img.media_type || "image",
        status: img.status
      }));

      setMediaItems(urlItems);
      setSelectedMedia(urlItems.map((_, idx) => idx)); // select all by default

      // keep viewMedia empty so UI uses the "files map" section (we will render from mediaItems there)
      setViewMedia([]);

      // keep files empty because these are NOT uploads
      setFiles([]);
    }
  }, [generatedData]);

  // Credits are already charged and media already generated by the time
  // generatedData shows up here - until this save happens, that work only
  // exists in this tab's memory. Any navigation away (mobile back
  // gesture/button, closing the tab, a crash) loses it with nothing to
  // show for the credits spent. So save a real draft immediately, then
  // hand off to the same "edit an existing draft" flow used everywhere
  // else - from that point on the post is safe in the Library no matter
  // what the user does next.
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    if (!generatedData || isEditMode) return;

    const images = generatedData.images || [];
    const successfulImages = images.filter((img) => img.status !== false);
    const anyFailed = successfulImages.length < images.length;

    // Credits were already spent on whichever slides DID succeed - those
    // must still be saved even if others in the same batch failed. Only
    // skip entirely when there's truly nothing to save.
    if (successfulImages.length === 0) return;

    const postType = successfulImages.length === 1 ? "single" : generatedData.post_type || "carousel";

    const autoSaveDraft = async () => {
      setAutoSaving(true);
      try {
        const formData = new FormData();
        formData.append("chapter_id", generatedData.chapter_id);
        formData.append("caption", generatedData.caption || "");
        formData.append("media_assets", postType);
        formData.append("ai_model", generatedData.model || "");
        formData.append("ai_prompt", generatedData.ai_prompt || "");
        formData.append("status", "draft");

        const indexesToSend = postType === "single" ? successfulImages.slice(0, 1) : successfulImages;

        indexesToSend.forEach((img, i) => {
          formData.append(`media[${i}][file]`, img.image_url);
          formData.append(`media[${i}][media_order]`, i + 1);
        });

        const hashtagString = (generatedData.hashtags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
          .join(", ");
        formData.append("hashtags", hashtagString);

        const response = await createPost(formData);

        if (!response?.success) {
          toast.error(
            response?.messages?.join(", ") ||
              'Could not save this as a draft automatically - use "Save without Publishing" before leaving this page.'
          );
          return;
        }

        toast.success(
          anyFailed
            ? `Saved ${successfulImages.length} of ${images.length} slides to your Library as a draft (the rest failed to generate) - it's safe even if you navigate away now.`
            : "Saved to your Library as a draft - it's safe even if you navigate away now."
        );
        setGeneratedData(null);
        navigate(`/u/post/view/${response.data.id}`, { replace: true });
      } catch (error) {
        console.error("AUTO-SAVE DRAFT ERROR ❌", error);
        toast.error(
          'Could not save this as a draft automatically - use "Save without Publishing" before leaving this page.'
        );
      } finally {
        setAutoSaving(false);
      }
    };

    autoSaveDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedData, isEditMode]);

  const { handleSubmit } = useForm();

  const captionWords = caption.trim().split(/\s+/).filter(Boolean).length;
  // const scriptWords = script.trim().split(/\s+/).filter(Boolean).length;

  // ✅ Upload and store as {type:file} in mediaItems, also keep files state updated
  const uploadFiles = async (e) => {
    const incoming = Array.from(e.target.files || []).filter(Boolean);
    if (!incoming.length) return;

    if (mediaType === "carousel") {
      const totalFiles = mediaItems.length + incoming.length;

      if (totalFiles > 10) {
        toast.error("You can upload a maximum of 10 files in carousel mode.");
        e.target.value = "";
        return;
      }
    }

    // ⚠️ ALERT before replacing existing media in SINGLE mode
    if (mediaType === "single" && mediaItems.length > 0) {
      const result = await Swal.fire({
        title: "Replace existing media?",
        text: "Uploading a new image will replace the current media.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, replace it",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#7C3AED", // purple
        cancelButtonColor: "#9CA3AF",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        e.target.value = "";
        return;
      }
    }

    // IMPORTANT: allow selecting same file again later
    e.target.value = "";

    const fileSig = (f) => `${f.name}-${f.size}-${f.lastModified}`;

    const newItemsRaw = incoming.map((file) => ({
      type: "file",
      file,
      preview: URL.createObjectURL(file),
      media_type: file.type?.startsWith("video/") ? "video" : "image",
      _sig: fileSig(file), // internal signature for dedupe
    }));

    // ✅ ONE atomic update for BOTH arrays
    // ✅ DEDUPE: if the same upload is processed twice, it won't be added again
    setMediaItems((prevMedia) => {
      const existingSigs = new Set(
        prevMedia
          .filter((m) => m?.type === "file" && m?._sig)
          .map((m) => m._sig)
      );

      const newItems = newItemsRaw.filter((m) => !existingSigs.has(m._sig));

      // if nothing new (because it was a duplicate run), do nothing
      if (!newItems.length) return prevMedia;

      if (mediaType === "single") {
        // in single mode, replace all with first new item
        setSelectedMedia([0]);
        setFiles([newItems[0].file]);
        return [newItems[0]];
      }

      // carousel -> append
      const startIndex = prevMedia.length;
      const nextMedia = [...prevMedia, ...newItems];

      // update selectedMedia ONCE based on final indexes
      setSelectedMedia((prevSelected) => {
        const appendedIndexes = newItems.map((_, i) => startIndex + i);
        // prevent duplicates in selection too
        const setSel = new Set(prevSelected);
        appendedIndexes.forEach((idx) => setSel.add(idx));
        return Array.from(setSel);
      });

      // keep your files state updated (only true uploads)
      setFiles((prevFiles) => {
        const prevSigs = new Set(prevFiles.map(fileSig));
        const addFiles = newItems
          .map((m) => m.file)
          .filter((f) => !prevSigs.has(fileSig(f)));
        return [...prevFiles, ...addFiles];
      });

      return nextMedia;
    });
  };


  // const toggleMedia = (index) => {
  //   if (mediaType === "single") {
  //     setSelectedMedia([index]); // always single
  //     return;
  //   }

  //   setSelectedMedia((prev) =>
  //     prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
  //   );
  // };

  const toggleMedia = (index) => {
    // SINGLE MODE → never allow deselect
    if (mediaType === "single") {
      setSelectedMedia([index]);
      return;
    }

    // CAROUSEL MODE
    setSelectedMedia((prev) => {
      const isSelected = prev.includes(index);

      // 🚫 Prevent removing the LAST selected media
      if (isSelected && prev.length === 1) {
        // toast.error("At least one media is required");
        return prev;
      }

      return isSelected
        ? prev.filter((i) => i !== index)
        : [...prev, index];
    });
  };

  useEffect(() => {
    if (!mediaItems.length) return;

    if (mediaType === "single") {
      setSelectedMedia([0]);
    } else {
      setSelectedMedia(mediaItems.map((_, index) => index));
    }
  }, [mediaType]);

  useEffect(() => {
    return () => {
      mediaItems.forEach((m) => {
        if (m?.type === "file" && m?.preview) {
          URL.revokeObjectURL(m.preview);
        }
      });
    };
  }, []);

  const buildBasePostFormData = () => {
    const formData = new FormData();

    formData.append("chapter_id", chapter?.id);
    formData.append("caption", caption);
    // formData.append("script", script);
    formData.append("media_assets", mediaType);
    formData.append("ai_model", aiModel);
    formData.append("ai_prompt", generatedData?.ai_prompt);

    // ✅ media payload exactly like screenshot:
    // media[0][file] = File OR URL string
    // media[0][media_order] = 1
    const indexesToSend =
      mediaType === "single"
        ? selectedMedia.slice(0, 1) // only first selected
        : selectedMedia;

    const uniqueSelected = Array.from(new Set(indexesToSend));

    uniqueSelected.forEach((index, i) => {
      const item = mediaItems[index];
      if (!item) return;

      if (item.type === "file") {
        formData.append(`media[${i}][file]`, item.file);
      } else {
        formData.append(`media[${i}][file]`, item.url);
      }

      formData.append(`media[${i}][media_order]`, i + 1);
    });

    const hashtagString = hashtags
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .join(", ");

    formData.append("hashtags", hashtagString);

    return formData;
  };

  const handleSaveDraft = async () => {
    try {
      const formData = buildBasePostFormData();
      formData.append("status", "draft");

      const response = await createPost(formData);

      if (!response?.success) {
        toast.error(response?.messages?.join(", ") || "Failed to save post.");
        return;
      }

      toast.success(response?.message || "Saved to your library!");
      loadPost();
      setGeneratedData(null);
      navigate("/u/library", {
        state: { generate: false }
      });
    } catch (error) {
      console.error("SAVE DRAFT ERROR ❌", error);
      toast.error(
        error?.response?.data?.error || error?.message || "Something went wrong"
      );
    }
  };

  const canTurnIntoVideo =
    mediaType === "single" &&
    mediaItems.length === 1 &&
    (mediaItems[0]?.media_type || "image") === "image";

  const pollGrokStatus = (generationId) => {
    const interval = setInterval(async () => {
      try {
        const res = await getGrokVideoStatus(generationId);
        if (!res?.success) return;

        const gen = res.data;

        if (gen.status === "completed") {
          clearInterval(interval);
          setGrokLoading(false);
          setGrokGeneration(null);

          setMediaItems((prev) => {
            const next = [...prev];
            next[0] = { type: "url", url: gen.video_url, media_type: "video" };
            return next;
          });

          // This video just cost real credits - persist it to the saved
          // draft immediately rather than leaving it sitting only in this
          // tab's memory until some later save action.
          if (isEditMode) {
            try {
              const formData = new FormData();
              formData.append("media[0][file]", gen.video_url);
              formData.append("media[0][media_order]", 1);
              const saveRes = await updatePostMedia(id, formData);

              if (!saveRes?.success) {
                toast.error("Video generated, but could not save it to your draft - use Publish soon to avoid losing it.");
              } else {
                toast.success("Image turned into video and saved to your draft!");
              }
            } catch (error) {
              console.error("SAVE GROK VIDEO ERROR ❌", error);
              toast.error("Video generated, but could not save it to your draft - use Publish soon to avoid losing it.");
            }
          } else {
            toast.success("Image turned into video!");
          }
          return;
        }

        if (gen.status === "failed") {
          clearInterval(interval);
          setGrokLoading(false);
          setGrokGeneration(null);
          toast.error(gen.error_message || "Video generation failed. Credits were refunded.");
          return;
        }

        setGrokGeneration({ id: generationId, status: gen.status });
      } catch (err) {
        clearInterval(interval);
        setGrokLoading(false);
        setGrokGeneration(null);
        toast.error("Could not check video generation status.");
      }
    }, 4000);
  };

  const startGrokVideo = async () => {
    const sourceImage = mediaItems[0];
    if (!sourceImage) return;

    if (grokPublishAction !== "review") {
      if (!isEditMode) {
        // Create mode: the backend builds the post from the form's chapter
        // and caption, so both have to exist before generation starts.
        if (!chapter?.id) {
          toast.error("Select a chapter before auto-publishing this video");
          return;
        }
        if (!caption.trim()) {
          toast.error("Write a caption before auto-publishing this video");
          return;
        }
      }
      if (!grokPublishSettings.platforms?.length) {
        toast.error("Please select at least one platform to publish to");
        return;
      }
      if (grokPublishSettings.platforms.includes("tiktok") && !grokPublishSettings.privacy_level) {
        toast.error("Please select a TikTok privacy status");
        return;
      }
      if (grokPublishAction === "schedule") {
        if (!grokScheduledAt) {
          toast.error("Please choose a date and time to schedule this video");
          return;
        }
        if (new Date(grokScheduledAt).getTime() <= Date.now()) {
          toast.error("Scheduled time must be in the future");
          return;
        }
      }
    }

    try {
      setGrokLoading(true);

      const res = await generateVideoFromImage({
        image_url: sourceImage.url,
        duration_seconds: grokDuration,
        audio_mode: grokAudioMode,
        post_id: isEditMode ? id : undefined,
        ...(grokPublishAction !== "review" && {
          publish_action: grokPublishAction,
          ...(!isEditMode && { chapter_id: chapter?.id, caption }),
          platforms: grokPublishSettings.platforms,
          privacy_level: grokPublishSettings.privacy_level,
          allow_comment: grokPublishSettings.allow_comment,
          content_disclose: grokPublishSettings.content_disclose,
          brand_organic: grokPublishSettings.brand_organic,
          branded_content: grokPublishSettings.branded_content,
          ...(grokPublishAction === "schedule" && { scheduled_at: new Date(grokScheduledAt).toISOString() }),
        }),
      });

      if (!res?.success) {
        toast.error(res?.messages?.join(", ") || res?.message || "Could not start video generation.");
        setGrokLoading(false);
        return;
      }

      setGrokPickerOpen(false);

      if (grokPublishAction !== "review") {
        setGrokLoading(false);
        toast.success(
          grokPublishAction === "schedule"
            ? `Video is generating and will be scheduled for ${new Date(grokScheduledAt).toLocaleString()} once ready.`
            : "Video is generating and will publish automatically once ready."
        );

        // Create mode: the backend just created the post this render will
        // land in - hand over to its detail page, since the compose form's
        // in-memory image no longer drives anything.
        if (!isEditMode && res.data?.post_id) {
          navigate(`/u/post/view/${res.data.post_id}`, { replace: true });
        }
        return;
      }

      setGrokGeneration({ id: res.data.generation_id, status: res.data.status });
      pollGrokStatus(res.data.generation_id);
    } catch (error) {
      setGrokLoading(false);
      toast.error(
        error?.response?.data?.error || error?.message || "Could not start video generation."
      );
    }
  };

  const handlePublishExisting = async (data) => {
    const { platforms, ...rest } = data;
    const selectedPlatforms = Object.entries(platforms || {})
      .filter(([, value]) => value)
      .map(([key]) => key);

    try {
      const response = await publishPost(id, { ...rest, platforms: selectedPlatforms });

      if (!response?.success) {
        toast.error(response?.messages?.join(", ") || response?.message || "Failed to publish post.");
        return;
      }

      toast.success(response?.message || "Your content is being processed.");
      setPublishOpen(false);

      if (user?.role_id == 1) {
        navigate(`/admin/library`, { state: userData });
      } else {
        navigate("/u/library");
      }
    } catch (error) {
      console.error("PUBLISH EXISTING POST ERROR ❌", error);
      toast.error(
        error?.response?.data?.error || error?.message || "Something went wrong"
      );
    }
  };

  const handlePublishSubmit = async (data) => {
    const { platforms, scheduled_at, ...tiktokSettings } = data;
    try {
      const formData = buildBasePostFormData();

      if (scheduled_at) {
        formData.append("status", "scheduled");
        formData.append("scheduled_at", scheduled_at);
      } else {
        formData.append("status", "published");
      }

      Object.entries(platforms).forEach(([key, value], i) => {
        if (value) {
          formData.append(`platforms[${i}]`, key);
        }
      });

      // ✅ Append TikTok settings ONLY if TikTok selected
      if (platforms.tiktok) {

        if (tiktokSettings.privacy_level) {
          formData.append("privacy_level", tiktokSettings.privacy_level);
        }

        if (tiktokSettings.allow_comment !== undefined) {
          formData.append("allow_comment", tiktokSettings.allow_comment);
        }

        if (tiktokSettings.allow_duet !== undefined) {
          formData.append("allow_duet", tiktokSettings.allow_duet);
        }

        if (tiktokSettings.allow_stitch !== undefined) {
          formData.append("allow_stitch", tiktokSettings.allow_stitch);
        }

        if (tiktokSettings.content_disclose !== undefined) {
          formData.append("content_disclose", tiktokSettings.content_disclose);
        }

        if (tiktokSettings.content_disclose) {

          if (tiktokSettings.brand_organic !== undefined) {
            formData.append("brand_organic", tiktokSettings.brand_organic);
          }

          if (tiktokSettings.branded_content !== undefined) {
            if(tiktokSettings.privacy_level === "SELF_ONLY"){
              formData.append("branded_content", false);
            }else{
              formData.append("branded_content", tiktokSettings.branded_content);
            }
          }

        }
      }

      const response = await createPost(formData);

      if (!response?.success) {
        toast.error(response?.messages.join(", ") || "Failed to create post.");
        return;
      } else {
        toast.success(response?.message || "Post created successfully!");
        loadPost();
        setGeneratedData(null);
        setPublishOpen(false);
        navigate("/u/library", {
          state: { generate: false }  // navigation state
        });
      }
    } catch (error) {
      console.error("CREATE POST ERROR ❌", error);
    }
  };

  // ✅ For modal preview:
  // If file → pass File (existing behavior)
  // If url → pass url string (PublishModal should render url if it already supports it)
  const selectedFiles = selectedMedia
    .map((idx) => {
      const item = mediaItems[idx];
      if (!item) return null;
      return item.type === "file" ? item.file : item.url;
    })
    .filter(Boolean);

  return (<>
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen">
        <div className="bg-white rounded-xl p-6 space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex flex-wrap gap-3 items-center">
              <span
                onClick={() => {
                  if (isEditMode) {
                    if (user?.role_id == 1) {
                      navigate(`/admin/library`, {
                        state: userData,
                      });
                    } else {
                      navigate("/u/library");
                    }
                    return;
                  }
                  if (!hasUnsavedData) {
                    setGeneratedData(null);
                    return;
                  }

                  const ok = window.confirm(
                    "Unsaved changes will be lost. Do you want to continue?"
                  );

                  if (ok) {
                    setGeneratedData(null);
                  }
                }}
                role="button"
                className="border bg-white text-dark py-[10px] px-[16px] flex gap-2 rounded-lg text-sm"
              >
                <img src="/icons/folderback.svg" />
                Back To Library
              </span>
              <h1 className="font-semibold">
                {isEditMode ? "Post Details" : autoSaving ? "Saving draft..." : "Post Preview"}
              </h1>
            </div>

            {!isEditMode && (
              <div className="flex flex-wrap gap-2">
                {canTurnIntoVideo && (
                  <button
                    onClick={() => setGrokPickerOpen(true)}
                    disabled={hasFailedMedia || grokLoading || autoSaving}
                    className={`border border-gray-400 text-gray-700 py-[10px] px-[16px] rounded-lg flex gap-2 ${hasFailedMedia || grokLoading || autoSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {grokLoading ? "Turning into video..." : "Turn into Video"}
                  </button>
                )}
                <button
                  onClick={handleSaveDraft}
                  className={`border border-purple-600 text-purple-600 py-[10px] px-[16px] rounded-lg flex gap-2 ${hasFailedMedia || autoSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={hasFailedMedia || autoSaving}
                >
                  Save without Publishing
                </button>
                <button
                  onClick={() => setPublishOpen(true)}
                  className={`bg-purple-600 text-white py-[10px] px-[16px] rounded-lg flex gap-2 ${hasFailedMedia || autoSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={hasFailedMedia || autoSaving}
                >
                  <img src="/icons/publish.svg" /> Publish
                </button>
              </div>
            )}

            {isEditMode && postStatus === "draft" && (
              <div className="flex flex-wrap gap-2">
                {canTurnIntoVideo && (
                  <button
                    onClick={() => setGrokPickerOpen(true)}
                    disabled={grokLoading}
                    className={`border border-gray-400 text-gray-700 py-[10px] px-[16px] rounded-lg flex gap-2 ${grokLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {grokLoading ? "Turning into video..." : "Turn into Video"}
                  </button>
                )}
                <button
                  onClick={() => setPublishOpen(true)}
                  className="bg-purple-600 text-white py-[10px] px-[16px] rounded-lg flex gap-2"
                >
                  <img src="/icons/publish.svg" /> Publish
                </button>
              </div>
            )}
          </div>

          {grokPickerOpen && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-[400px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-5 space-y-4">
                <h2 className="font-semibold text-lg">Turn Image into Video</h2>
                <p className="text-sm text-gray-500">
                  Animate this image into a short video using Grok. Choose a duration:
                </p>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={grokDuration === 6}
                      onChange={() => setGrokDuration(6)}
                    />
                    6 seconds
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={grokDuration === 10}
                      onChange={() => setGrokDuration(10)}
                    />
                    10 seconds
                  </label>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Audio</label>
                  <select
                    value={grokAudioMode}
                    onChange={(e) => setGrokAudioMode(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="auto">Auto (let Grok decide)</option>
                    <option value="voice">Voice / narration</option>
                    <option value="music">Background music only</option>
                    <option value="silent">Silent</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Grok isn't guaranteed to follow this exactly - it's a best-effort steer, not a hard setting.
                  </p>
                </div>

                <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">What happens when it's ready?</p>
                    <div className="flex flex-col gap-2 text-sm mb-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={grokPublishAction === "review"}
                          onChange={() => setGrokPublishAction("review")}
                          className="accent-[#7239EA]"
                        />
                        Review before publishing
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={grokPublishAction === "publish_now"}
                          onChange={() => setGrokPublishAction("publish_now")}
                          className="accent-[#7239EA]"
                        />
                        Publish automatically when ready
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={grokPublishAction === "schedule"}
                          onChange={() => setGrokPublishAction("schedule")}
                          className="accent-[#7239EA]"
                        />
                        Schedule for a specific time
                      </label>
                    </div>

                    {grokPublishAction === "schedule" && (
                      <input
                        type="datetime-local"
                        value={grokScheduledAt}
                        min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                        onChange={(e) => setGrokScheduledAt(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    )}

                    {grokPublishAction !== "review" && (
                      <>
                        {!isEditMode && (
                          <p className="text-xs text-gray-500 mb-2">
                            Uses the chapter and caption from the post form - fill those in first.
                          </p>
                        )}
                        <PublishSettingsFields onChange={setGrokPublishSettings} />
                      </>
                    )}
                  </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setGrokPickerOpen(false)}
                    className="px-4 py-2 text-sm rounded-md bg-gray-800 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startGrokVideo}
                    disabled={grokLoading}
                    className="px-4 py-2 text-sm rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Generate Video
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MEDIA TYPE */}
          <div className="flex gap-6 text-sm">
            <label
              className={`flex gap-2 ${isEditMode && "cursor-not-allowed"}`}
            >
              <input
                type="radio"
                checked={mediaType === "single"}
                disabled={isEditMode}
                onChange={() => setMediaType("single")}
              />
              Single Media
            </label>
            <label
              className={`flex gap-2 ${isEditMode && "cursor-not-allowed"}`}
            >
              <input
                type="radio"
                checked={mediaType === "carousel"}
                disabled={isEditMode}
                onChange={() => setMediaType("carousel")}
              />
              Carousel
            </label>
          </div>

          {hasFailedMedia && (
            <div
              style={{
                background: "#b40606",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "4px",
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
              }}
            >
              <img src="/icons/brokenImage.png" style={{width: '40px', height: '40px'}} />
              <p>
                Image processing failed because the {generatedData?.model} AI server is currently down. Please regenerate the images before publishing. 
                <span role="button" style={{whiteSpace: 'nowrap'}} className="bg-purple-600 border-purple-600 p-[7px] text-[12px] ms-2 rounded-sm cursor-pointer" onClick={() => setGeneratedData(null)}>Click Here</span>
              </p>
            </div>
          )}
          {/* MEDIA GRID */}
          <div className="flex gap-4 flex-wrap">
            {viewMedia.length > 0 &&
              viewMedia.map((url, index) => {
                return (
                  <>
                    {url?.media_type == "video" ? (
                      <div
                        key={`view-${index}`}
                        className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-200"
                      >
                        <div
                          className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer bg-black/20 hover:bg-black/40 transition-colors"
                          onClick={() => {
                            setLightboxIndex(index);
                            setLightboxOpen(true);
                          }}
                        >
                          <img
                            src="/icons/ic-play2.svg"
                            className="w-9 h-9 transform group-hover:scale-110 transition-transform"
                            alt="Play"
                          />
                        </div>

                        <video
                          src={url?.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                      </div>
                    ) : (
                      <div
                        key={`view-${index}`}
                        className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-200"
                      >
                        <img
                          src={url?.url}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => {
                            setLightboxIndex(index);
                            setLightboxOpen(true);
                          }}
                        />
                      </div>
                    )}
                  </>
                );
              })}

            {viewMedia.length === 0 &&
              mediaItems.map((m, index) => {
                const isSelected = selectedMedia.includes(index);

                const src = m?.type === "url" ? m?.url : m?.preview;
                const isVideo =
                  m?.media_type === "video" ||
                  (m?.type === "url" &&
                    /\.(mp4|webm|ogg)(\?|$)/i.test(m?.url || "")) ||
                  (m?.type === "file" &&
                    m?.file?.type?.startsWith("video/"));

                return (
                  <div
                    key={index}
                    className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-200"
                  >
                    {isVideo ? (
                      <video
                        src={src}
                        className="w-full h-full object-cover cursor-pointer"
                        muted
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                      />
                    ) : (
                      <img
                        src={src}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          if (hasFailedMedia) return;
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                      />
                    )}


                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMedia(index);
                      }}
                      className={`absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center ${isSelected
                        ? "bg-purple-600 border-purple-600"
                        : "bg-white border-gray-300"
                        }`}
                    >
                      {isSelected && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </button>

                    {isSelected && (
                      <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 rounded-full">
                        {selectedMedia.indexOf(index) + 1}/
                        {selectedMedia.length}
                      </span>
                    )}
                  </div>
                );
              })}

            {!isEditMode && (
              <label className="w-28 h-28 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer text-sm text-gray-500">
                <img src="/icons/ic-upload-grey.svg" />
                <p>Upload</p>
                <input
                  type="file"
                  multiple={mediaType === "carousel"}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={uploadFiles}
                />
              </label>
            )}
          </div>

          {/* Chapter + AI */}
          <div className="flex justify-between text-sm text-gray-600">
            <p>
              <span className="font-medium">Chapter:</span> <br />
              <span className="text-gray-400">
                {chapter ? `${chapter.code} : ${chapter.title}` : "-"}
              </span>
            </p>

            <p>
              <span className="font-medium">AI Model:</span> <br />
              <span className="text-gray-400">{aiModel || "-"}</span>
            </p>
          </div>

          {/* Caption + Hashtags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Caption:</label>
                <span className="text-xs text-gray-400">
                  {captionWords} words
                </span>
              </div>
              <textarea
                value={caption}
                readOnly={isEditMode}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Hashtags:</label>
                <span className="text-xs text-gray-400">{hashtags.length}</span>
              </div>

              <div className="flex flex-wrap gap-2 border rounded-lg p-3">
                {hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 px-3 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    {tag}
                    {!isEditMode && (
                      <button
                        onClick={() =>
                          setHashtags(hashtags.filter((_, idx) => idx !== i))
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}

                <input
                  type="text"
                  value={hashtagInput}
                  disabled={isEditMode}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && hashtagInput.trim()) {
                      e.preventDefault();
                      setHashtags((prev) => [...prev, hashtagInput.trim()]);
                      setHashtagInput("");
                    }
                  }}
                  className={`text-xs outline-none flex-1 min-w-[120px] ${isEditMode && "bg-transparent cursor-not-allowed"
                    }`}
                />
              </div>

              <p className="text-xs text-gray-400 text-right mt-1">
                Hashtags will be appended to the caption when publishing
              </p>
            </div>
          </div>

          {/* Script */}
          {/* <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">
                Script:
              </label>
              <span className="text-xs text-gray-400">{scriptWords} words</span>
            </div>
            <textarea
              value={script}
              readOnly={isEditMode}
              onChange={(e) => setScript(e.target.value)}
              rows={8}
              className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-purple-500"
            />
          </div> */}
        </div>

        <PublishModal
          isOpen={publishOpen}
          onClose={() => setPublishOpen(false)}
          onSubmit={isEditMode ? handlePublishExisting : handlePublishSubmit}
          preview={{
            caption,
            hashtags,
            media: selectedFiles,
          }}
        />
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 z-50"
            onClick={closeOverlay}
          >
            &times;
          </button>

          {/* Video Container */}
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <video src={selectedVideo} className="w-full h-full" controls autoPlay />
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeOverlay}
          />
        </div>
      )}
    </Layout>
    <Lightbox
      open={lightboxOpen}
      close={closeOverlay}
      index={lightboxIndex}
      slides={lightboxSlides}
      plugins={[Video]}
    />
  </>);
}
