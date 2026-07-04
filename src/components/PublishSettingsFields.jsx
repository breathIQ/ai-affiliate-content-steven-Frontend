import { useEffect, useState } from "react";
import { CheckmarkIcon } from "react-hot-toast";
import { getSocialMediaStatus, instagramAccountLink, tiktokAccountLink } from "../services/socialMediaAuth.api";
import toast from "react-hot-toast";
import { useLoader } from "../context/LoaderContext";

/**
 * The "which platforms + TikTok compliance settings" chunk of PublishModal,
 * factored out so it can also be embedded directly in the generation
 * modals (HeyGen/Grok) for the "publish automatically"/"schedule" paths -
 * those skip the post-render review step entirely, so this has to be
 * collected up front instead. PublishModal keeps its own inline copy
 * (unchanged) since it already works and touching it wasn't necessary here.
 *
 * Fully self-contained: manages its own field state and reports the
 * assembled settings object via onChange every time something changes, so
 * the parent modal just reads the latest value at submit time.
 */
export default function PublishSettingsFields({ onChange }) {
  const [platforms, setPlatforms] = useState({ instagram: false, tiktok: false });
  const [privacyLevel, setPrivacyLevel] = useState("");
  const [allowComment, setAllowComment] = useState(false);
  const [contentDisclosure, setContentDisclosure] = useState(false);
  const [brandOrganic, setBrandOrganic] = useState(false);
  const [brandedContent, setBrandedContent] = useState(false);
  const [mediaStatus, setMediaStatus] = useState({});

  const { profile } = useLoader();
  const tiktokCreaterInfo = profile?.social_accounts?.tiktok?.creator_info;

  const instagramStatus = mediaStatus?.instagram;
  const tiktokStatus = mediaStatus?.tiktok;

  useEffect(() => {
    getSocialMediaStatus()
      .then((res) => setMediaStatus(res?.data || {}))
      .catch((err) => console.error("Failed to fetch social media status", err));
  }, []);

  useEffect(() => {
    if (privacyLevel === "SELF_ONLY" && brandedContent) {
      setBrandedContent(false);
    }
  }, [privacyLevel, brandedContent]);

  useEffect(() => {
    const selectedPlatforms = Object.entries(platforms)
      .filter(([, checked]) => checked)
      .map(([name]) => name);

    onChange({
      platforms: selectedPlatforms,
      privacy_level: platforms.tiktok ? privacyLevel : undefined,
      allow_comment: platforms.tiktok ? allowComment : undefined,
      content_disclose: platforms.tiktok ? contentDisclosure : undefined,
      brand_organic: platforms.tiktok && contentDisclosure ? brandOrganic : undefined,
      branded_content: platforms.tiktok && contentDisclosure ? brandedContent : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platforms, privacyLevel, allowComment, contentDisclosure, brandOrganic, brandedContent]);

  const instagramLinkAccount = async () => {
    try {
      const res = await instagramAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to link Instagram account");
    }
  };

  const tiktokLinkAccount = async () => {
    try {
      const res = await tiktokAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to link TikTok account");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">
          Publish To:<span className="text-red-500">*</span>
        </p>

        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={platforms.instagram}
                disabled={!instagramStatus?.connected}
                className="accent-[#7239EA] w-[15.75px] h-[15.75px]"
                onChange={() => setPlatforms((p) => ({ ...p, instagram: !p.instagram }))}
              />
              <span>Instagram</span>
            </div>

            {instagramStatus?.connected ? (
              <div className="flex items-center border px-2 py-1 rounded-md gap-1 text-sm">
                <img src="/icons/insta.svg" className="w-4" alt="" />
                @{instagramStatus.username}
                <CheckmarkIcon className="text-green-500" size={14} />
              </div>
            ) : (
              <button
                type="button"
                className="text-sm border px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                onClick={instagramLinkAccount}
              >
                <img src="/icons/insta.svg" className="w-4" alt="" />
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
                className="accent-[#7239EA] w-[15.75px] h-[15.75px]"
                onChange={() => setPlatforms((p) => ({ ...p, tiktok: !p.tiktok }))}
              />
              <span>TikTok</span>
            </div>

            {tiktokStatus?.connected ? (
              <div className="flex items-center border px-2 py-1 rounded-md gap-1 text-sm">
                <img src="/icons/tiktok.svg" className="w-4" alt="" />
                @{tiktokStatus.username}
                <CheckmarkIcon className="text-green-500" size={14} />
              </div>
            ) : (
              <button
                type="button"
                className="text-sm border px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                onClick={tiktokLinkAccount}
              >
                <img src="/icons/tiktok.svg" className="w-4" alt="" />
                Connect TikTok
              </button>
            )}
          </label>
        </div>
      </div>

      {platforms.tiktok && (
        <div className="border border-dashed border-[#F1F1F4] p-[12px] rounded-[8px]">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#0D0F17] mb-1">
              Privacy Status <span className="text-red-500">*</span>
            </label>
            <select
              value={privacyLevel}
              onChange={(e) => setPrivacyLevel(e.target.value)}
              className="w-full text-[14px] border rounded-[6px] px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Option</option>
              {tiktokCreaterInfo?.privacy_level_options?.map((option) => {
                const label = option
                  .toLowerCase()
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());
                const isDisabled = option === "SELF_ONLY" && brandedContent;

                return (
                  <option
                    key={option}
                    value={option}
                    disabled={isDisabled}
                    title={isDisabled ? "Branded content visibility cannot be set to private." : ""}
                  >
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-[#0D0F17] mb-1">Interaction Ability</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className={`accent-[#7239EA] w-[15.75px] h-[15.75px] ${tiktokCreaterInfo?.comment_disabled ? "cursor-not-allowed" : ""}`}
                checked={allowComment}
                disabled={tiktokCreaterInfo?.comment_disabled}
                onChange={(e) => setAllowComment(e.target.checked)}
              />
              <span className="text-[#6E6C81] text-sm">Comments</span>
            </label>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-[#0D0F17]">Content Disclosure</h3>
              <button
                type="button"
                onClick={() => setContentDisclosure(!contentDisclosure)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${contentDisclosure ? "bg-[#7239EA]" : "bg-gray-300"}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${contentDisclosure ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>

            <p className="text-[#6E6C81] font-[400] text-sm mb-4">
              Turn on to disclose that this content promotes goods or services in exchange for
              something of value.
            </p>

            {contentDisclosure && (
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-[#7239EA] w-[15.75px] h-[15.75px]"
                    checked={brandOrganic}
                    onChange={(e) => setBrandOrganic(e.target.checked)}
                  />
                  <span className="font-semibold text-[#6E6C81] text-sm">Your brand</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className={`accent-[#7239EA] w-[15.75px] h-[15.75px] ${privacyLevel === "SELF_ONLY" ? "cursor-not-allowed" : ""}`}
                    checked={brandedContent}
                    disabled={privacyLevel === "SELF_ONLY"}
                    onChange={(e) => setBrandedContent(e.target.checked)}
                  />
                  <span className={`font-semibold text-[#6E6C81] text-sm ${privacyLevel === "SELF_ONLY" ? "text-[#99A1B7]" : ""}`}>
                    Branded content
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
