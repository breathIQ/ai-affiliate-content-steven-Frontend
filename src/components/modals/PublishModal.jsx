import { useEffect, useState } from "react";
import { CheckmarkIcon } from "react-hot-toast";
import { getSocialMediaStatus, instagramAccountLink, tiktokAccountLink } from "../../services/socialMediaAuth.api";
import toast from "react-hot-toast";

export default function PublishModal({ isOpen, onClose, onSubmit, preview }) {
  const [platforms, setPlatforms] = useState({
    instagram: false,
    tiktok: false,
  });
  const [mediaStatus, setMediaStatus] = useState({});

  const [reviewLink, setReviewLink] = useState("");
  const [error, setError] = useState("");

  const instagramStatus = mediaStatus?.instagram;
  const tiktokStatus = mediaStatus?.tiktok;

  console.log("mediaStatus:", mediaStatus);

  const instagramLinkAccount = async () => {
    try {
      const res = await instagramAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to link Instagram account"
      );
    }
  };

  const tiktokLinkAccount = async () => {
    try {
      const res = await tiktokAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to link TikTok account"
      );
    }
  };

  // Function to validate URL
  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!platforms.instagram && !platforms.tiktok) {
      toast.error("Please select at least one platform to publish");
      return;
    }
    if (!reviewLink.trim()) {
      setError("Review link is required");
      return;
    }

    if (!isValidUrl(reviewLink.trim())) {
      setError("Please enter a valid URL (https://example.com)");
      return;
    }
    console.log("Submitting with platforms:", platforms, "and reviewLink:", reviewLink);
    onSubmit({
      platforms,
      reviewLink: reviewLink.trim(),
    });

    setError("");
    onClose();
  };

  // ✅ supports: File OR {type:"file"} OR {type:"url"}
  const getMediaSrc = (item) => {
    if (!item) return "";

    // new structure from DraftPostPage
    if (typeof item === "object" && item.type === "url") return item.url;
    if (typeof item === "object" && item.type === "file") {
      // prefer cached preview to avoid creating new blob URLs each render
      if (item.preview) return item.preview;
      if (item.file) return URL.createObjectURL(item.file); // fallback
      return "";
    }

    // backward compatibility: if parent still sends actual File[]
    if (item instanceof File) return URL.createObjectURL(item);

    // if a plain url string is passed
    if (typeof item === "string") return item;

    return "";
  };

  const isVideoMedia = (item) => {
    if (!item) return false;

    // new unified structure
    if (typeof item === "object") {
      if (item.media_type === "video") return true;

      if (item.file?.type?.startsWith("video/")) return true;

      if (item.url && /\.(mp4|webm|ogg)(\?|$)/i.test(item.url)) return true;
    }

    // backward compatibility
    if (item instanceof File) {
      return item.type.startsWith("video/");
    }

    // plain URL string
    if (typeof item === "string") {
      return /\.(mp4|webm|ogg)(\?|$)/i.test(item);
    }

    return false;
  };


  const getHashtagText = (t) => {
    if (!t) return "";
    // support already formatted "#tag" or "tag"
    const s = String(t);
    return `#${s.replace(/^#/, "")}`;
  };

  const fetchMediaStatus = async () => {
    try {
      const res = await getSocialMediaStatus();
      setMediaStatus(res?.data || {});
    } catch (err) {
      console.error("Failed to fetch social media status", err);
      return {};
    }
  };

  useEffect(() => {
    fetchMediaStatus();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-[600px] rounded-xl shadow-lg max-w-xl h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-lg">Publish</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Media Preview */}
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-3">
              {preview.media?.map((item, i) => {
                const src = getMediaSrc(item);
                const isVideo = isVideoMedia(item);

                return (
                  <div
                    key={i}
                    className="w-[120px] h-[150px] rounded-lg overflow-hidden bg-gray-200"
                  >
                    {isVideo ? (
                      <video
                        src={src}
                        className="w-full h-full object-contain"
                        autoPlay
                        // controls
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={src}
                        className="w-full h-full object-cover"
                        alt="preview"
                      />
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          {/* Caption */}
          <p className="text-sm text-gray-600">
            {preview.caption}
            <br />
            {preview.hashtags?.map((t, i) => (
              <span key={i}>{getHashtagText(t)} </span>
            ))}
          </p>

          {/* Review Link */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Review Link <span className="text-red-500">*</span>
            </label>

            <input
              type="url"
              placeholder="https://example.com"
              value={reviewLink}
              onChange={(e) => {
                setReviewLink(e.target.value);
                setError("");
              }}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${error
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-purple-500"
                }`}
              required
            />

            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>

          {/* Publish To */}
          <div>
            <p className="text-sm font-medium mb-2">Publish To:<span className="text-red-500">*</span></p>

            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={platforms.instagram}
                    disabled={!instagramStatus?.connected}
                    onChange={() =>
                      setPlatforms((p) => ({
                        ...p,
                        instagram: !p.instagram,
                      }))
                    }
                  />
                  <span>Instagram</span>
                </div>

                {instagramStatus?.connected ? (
                  <div className="flex items-center border px-2 py-1 rounded-md gap-1 text-sm">
                    <img src="/icons/insta.svg" className="w-4" />
                    @{instagramStatus.username}
                    <CheckmarkIcon className="text-green-500" size={14} />
                  </div>
                ) : (
                  <button
                    className="text-sm border px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                    onClick={instagramLinkAccount}
                  >
                    <img src="/icons/insta.svg" className="w-4" />
                    Connect Instagram
                  </button>
                )}
              </label>


              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={platforms.tiktok}
                    disabled={!tiktokStatus?.connected}
                    onChange={() =>
                      setPlatforms((p) => ({
                        ...p,
                        tiktok: !p.tiktok,
                      }))
                    }
                  />
                  <span>TikTok</span>
                </div>

                {tiktokStatus?.connected ? (
                  <div className="flex items-center border px-2 py-1 rounded-md gap-1 text-sm">
                    <img src="/icons/tiktok.svg" className="w-4" />
                    @{tiktokStatus.username}
                    <CheckmarkIcon className="text-green-500" size={14} />
                  </div>
                ) : (
                  <button
                    className="text-sm border px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                    onClick={tiktokLinkAccount}
                  >
                    <img src="/icons/tiktok.svg" className="w-4" />
                    Connect TikTok
                  </button>
                )}
              </label>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-gray-800 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!reviewLink.trim() || !isValidUrl(reviewLink.trim())}
            className={`px-4 py-2 text-sm rounded-md text-white ${reviewLink.trim() && isValidUrl(reviewLink.trim())
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
