import { useEffect, useState } from "react";
import { CheckmarkIcon } from "react-hot-toast";
import { getSocialMediaStatus, instagramAccountLink, tiktokAccountLink } from "../../services/socialMediaAuth.api";
import toast from "react-hot-toast";
import { FaInfoCircle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useLoader } from "../../context/LoaderContext";

export default function PublishModal({ isOpen, onClose, onSubmit, preview }) {
  const [platforms, setPlatforms] = useState({
    instagram: false,
    tiktok: false,
  });
  const [mediaStatus, setMediaStatus] = useState({});
  // const [enabledContentDisclouserSwitch, setEnabledContentDisclouserSwitch] = useState(true);
const [contentDisclosure, setContentDisclosure] = useState(false)
  // const [reviewLink, setReviewLink] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, watch } = useForm();

  const { profile } = useLoader();

  

  const tiktokCreaterInfo = profile?.social_accounts?.tiktok?.creator_info;

  console.log("tiktokCreaterInfo:=> ", tiktokCreaterInfo);

  const instagramStatus = mediaStatus?.instagram;
  const tiktokStatus = mediaStatus?.tiktok;

  // console.log("mediaStatus:", mediaStatus);

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

  // const handleSubmit = () => {
    

  //   if (!platforms.instagram && !platforms.tiktok) {
  //     toast.error("Please select at least one platform to publish");
  //     return;
  //   }
  //   onSubmit({
  //     platforms,
  //   });

  //   onClose();
  // };

  const submitForm = (data) => {

    if (!platforms.instagram && !platforms.tiktok) {
      toast.error("Please select at least one platform to publish");
      return;
    }

    let payload = {
      platforms,
    };

    // console.log(platforms)

    if (platforms.tiktok) {
      payload = {
        ...payload,
        privacy_level: data.privacy_level,
        allow_comment: data.allow_comment,
        allow_duet: data.allow_duet,
        allow_stitch: data.allow_stitch,
        content_disclose: contentDisclosure,
      };

      if (contentDisclosure) {
        payload.brand_organic = data.brand_organic;
        payload.branded_content = data.branded_content;
      }
    }
    
    // console.log(payload)

    onSubmit(payload);
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
          {/* <div>
            <label className="text-sm font-medium mb-1 flex items-center">
              Amazon Review Link
              <div className="relative group cursor-pointer inline-block ms-2">
                <span className="text-gray-400 hover:text-gray-600">
                  <FaInfoCircle className="text-md" />
                </span>
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                hidden group-hover:block
                bg-black text-white text-xs px-3 py-2 rounded-md
                w-56 text-center z-50"
                >
                  Kindly enter the CO2 book review URL in the text field provided below.
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                    style={{
                      borderLeft: "7px solid transparent",
                      borderRight: "7px solid transparent",
                      borderTop: "7px solid black",
                      borderBottom: "0",
                    }}
                  />
                </div>
              </div>
            </label>

            <input
              type="url"
              placeholder="https://example.com"
              value={reviewLink}
              onChange={(e) => {
                setReviewLink(e.target.value);
              }}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"`}
            />
          </div> */}

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
                    className="accent-[#7239EA] w-[15.75px] h-[15.75px]"
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
                    className="accent-[#7239EA] w-[15.75px] h-[15.75px]"
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

          {platforms.tiktok && (<div className="border border-dashed border-[#F1F1F4] p-[12px] mt-[24px!important] rounded-[8px]">
            {/* Privacy Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#0D0F17] mb-1">Privacy Status</label>
              <select {...register("privacy_level")} className="w-full text-[14px] border rounded-[6px] px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                {tiktokCreaterInfo?.privacy_level_options?.map((option) => {
                  const label = option
                    .toLowerCase()
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());

                  return (
                    <option key={option} value={option}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Interaction Ability */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#0D0F17] mb-1">Interaction Ability</h3>

              <div className="flex gap-8 items-center">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="accent-[#7239EA] w-[15.75px] h-[15.75px]" {...register("allow_comment")} disabled={tiktokCreaterInfo?.comment_disabled} />
                  <span className="text-[#6E6C81] text-sm">Comments</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-[#7239EA] w-[15.75px] h-[15.75px]" {...register("allow_duet")} disabled={tiktokCreaterInfo?.duet_disabled} />
                  <span className="text-[#6E6C81] text-sm">Duet</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-[#7239EA] w-[15.75px] h-[15.75px]" {...register("allow_stitch")} disabled={tiktokCreaterInfo?.stitch_disabled} />
                  <span className="text-[#6E6C81] text-sm">Stitch</span>
                </label>
              </div>
            </div>

            {/* Content Disclosure */}
            <div className="">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-[#0D0F17]">Content Disclosure</h3>

                <div className="flex items-center">
                  <button
                    onClick={() => setContentDisclosure(!contentDisclosure)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      contentDisclosure ? "bg-[#7239EA]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        contentDisclosure ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <p className="text-[#6E6C81] font-[400] text-sm mb-5">
                Turn on to disclose that this video promotes goods or services in exchange for
                something of value. Your video could promote yourself, a third party, or both.
              </p>

              {/* Your Brand */}
              {contentDisclosure && (<><label className="flex items-start gap-2 mb-4">
                <div className="w-[15.75px] h-[15.75px]">
                  <input type="checkbox" className="accent-[#7239EA] w-[15.75px] h-[15.75px] mt-1" {...register("brand_organic")} />
                </div>
                <div>
                  <p className="font-semibold text-[#6E6C81]">Your brand</p>
                  <p className="text-[#6E6C81] font-[400] text-sm">
                    You are promoting yourself or your own business. This video will be
                    classified as Brand Organic.
                  </p>
                </div>
              </label>

              {/* Branded Content */}
              <label className="flex items-start gap-2">
                <div className="w-[15.75px] h-[15.75px]">
                  <input type="checkbox" className="accent-[#7239EA] w-[15.75px] h-[15.75px] mt-1" {...register("branded_content")} />
                </div>
                <div>
                  <p className="font-semibold text-[#6E6C81]">Branded content</p>
                  <p className="text-[#6E6C81] font-[400] text-sm">
                    You are promoting another brand or a third party. This video will be
                    classified as Branded Content.
                  </p>
                </div>
              </label>
              </>)}
            </div>
            <div className="space-y-6">

              {/* Info Box */}
              <div className="mt-[24px] flex items-center gap-3 bg-[#7239EA14] px-4 py-2 rounded-[8px]">
                <div className="h-[24px] w-[24px]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.3" d="M12 1.99899C17.524 1.99899 22.002 6.47699 22.002 12.001C22.002 17.524 17.524 22.002 12 22.002C6.476 22.002 2 17.524 2 12.001C1.999 6.47699 6.476 1.99899 12 1.99899Z" fill="#7239EA"/>
                    <path d="M12.001 6.50001C11.8336 6.49542 11.6671 6.52443 11.5112 6.58532C11.3552 6.64621 11.2131 6.73775 11.0932 6.85453C10.9732 6.9713 10.878 7.11094 10.8129 7.26519C10.7479 7.41943 10.7145 7.58515 10.7146 7.75254C10.7147 7.91993 10.7484 8.0856 10.8137 8.23974C10.879 8.39388 10.9745 8.53337 11.0946 8.64995C11.2147 8.76654 11.357 8.85785 11.513 8.91849C11.669 8.97914 11.8356 9.00788 12.003 9.00301C12.3288 8.99342 12.638 8.85716 12.8649 8.62319C13.0918 8.38922 13.2185 8.07599 13.2181 7.75006C13.2177 7.42413 13.0902 7.1112 12.8628 6.87777C12.6353 6.64434 12.3258 6.50883 12 6.50001H12.001ZM11.996 10.249C11.7509 10.2493 11.5145 10.3397 11.3316 10.5028C11.1487 10.666 11.0321 10.8906 11.004 11.134L10.997 11.25L11.001 16.752L11.007 16.869C11.0352 17.1129 11.1521 17.3379 11.3355 17.5011C11.5188 17.6644 11.7559 17.7544 12.0014 17.7542C12.2469 17.7539 12.4837 17.6634 12.6667 17.4998C12.8498 17.3362 12.9663 17.111 12.994 16.867L13 16.75L12.996 11.249L12.989 11.132C12.9601 10.8888 12.8429 10.6646 12.6597 10.502C12.4764 10.3394 12.2399 10.2498 11.995 10.25L11.996 10.249Z" fill="#7239EA"/>
                  </svg>
                </div>
                <p className="text-[14px] text-[#0D0F17] font-normal">
                  Your video will be labeled “Promotional content”. This cannot be changed once your video is posted.
                </p>
              </div>

              {/* Policy Text */}
              <p className="text-[14px] text-[#0D0F17] leading-[28px]">
                By posting, you agree to TikTok's{" "}
                <a href="#" className="text-[#7239EA] hover:underline">
                  Branded Content Policy
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#7239EA] hover:underline">
                  Music Usage Confirmation
                </a>.
              </p>

            </div>
          </div>)}
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
            // onClick={handleSubmit}
            onClick={handleSubmit(submitForm)}
            className={`px-4 py-2 text-sm rounded-md text-white bg-purple-600 hover:bg-purple-700`}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
