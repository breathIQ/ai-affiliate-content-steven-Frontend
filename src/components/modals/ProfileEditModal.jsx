import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { CheckmarkIcon } from "react-hot-toast";
import {
  getProfileByRole,
  updateProfileByRole,
} from "../../services/profile.service";
import {
  instagramAccountLink,
  tiktokAccountLink,
  youtubeAccountLink,
  xAccountLink,
  disconnectSocialAccount,
} from "../../services/socialMediaAuth.api";
import {
  getAffiliateProfile,
  claimAffiliateCoupon,
} from "../../services/campaign.api";
import { useLoader } from "../../context/LoaderContext";

const DEFAULT_IMAGE = "/images/defaultImage.png";

export function ProfileEditModal({ isOpen, onClose }) {
  const fileRef = useRef(null);
  const { profile, loadProfile } = useLoader();
  const [image, setImage] = useState(profile?.avatar || DEFAULT_IMAGE);
  const [imageFile, setImageFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [social, setSocial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [savedCoupon, setSavedCoupon] = useState(null);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const affiliate_id = watch("affiliate_id");

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

  const youtubeLinkAccount = async () => {
    try {
      const res = await youtubeAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to link YouTube account");
    }
  };

  const xLinkAccount = async () => {
    try {
      const res = await xAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to link X account");
    }
  };

  const [disconnecting, setDisconnecting] = useState(null);
  const disconnect = async (providerKey, label) => {
    setDisconnecting(providerKey);
    try {
      await disconnectSocialAccount(providerKey);
      toast.success(`${label} disconnected. You can connect a different account now.`);
      setSocial((s) => ({ ...(s || {}), [providerKey]: { connected: false, username: null } }));
      loadProfile();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to disconnect ${label}`);
    } finally {
      setDisconnecting(null);
    }
  };

  // Providers rendered in the Social Accounts section. YouTube and X only
  // appear when the backend reports them (i.e. their integration is configured).
  const SOCIAL_PROVIDERS = [
    { key: "instagram", label: "Instagram", handle: false, link: instagramLinkAccount },
    { key: "tiktok", label: "TikTok", handle: true, link: tiktokLinkAccount },
    { key: "youtube", label: "YouTube", handle: false, link: youtubeLinkAccount },
    { key: "x", label: "X", handle: true, link: xLinkAccount },
  ];

  const providerIcon = (key) => {
    if (key === "instagram") return <img src="/icons/insta.svg" className="w-5 h-5" alt="" />;
    if (key === "tiktok") return <img src="/icons/tiktok.svg" className="w-5 h-5" alt="" />;
    if (key === "youtube")
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
          <path fill="#FF0000" d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12z" />
          <path fill="#fff" d="M9.75 15.5v-7L15.5 12z" />
        </svg>
      );
    if (key === "x")
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
          <path fill="#000" d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.9l-4.71-6.16L5.5 22H2.24l8-9.17L1.5 2h7.06l4.26 5.63L18.244 2zm-1.21 18h1.83L7.05 3.9H5.1L17.03 20z" />
        </svg>
      );
    return null;
  };

  // The coupon lives on the affiliate hub endpoint (it also auto-issues one
  // when missing), not on the profile payload.
  useEffect(() => {
    if (!isOpen || Number(user?.role_id) !== 2) return;
    getAffiliateProfile()
      .then((res) => {
        setSavedCoupon(res?.data?.coupon || null);
        setCouponInput(res?.data?.coupon || "");
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !profile) return;

    reset({
      name: profile?.name || "",
      email: profile?.email || "",
      affiliate_id: profile?.affiliate_id || "",
      other_affiliate_id: profile?.other_affiliate_id ?? "",
      amazon_link: profile?.amazon_link || "",
    });

    setImage(profile?.avatar || DEFAULT_IMAGE);
    setImageFile(null);
    setSocial(profile?.social_accounts || null);

  }, [isOpen, profile, reset]);


  if (!isOpen) return null;

  const copyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://co2body.com/${affiliate_id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyCoupon = (e) => {
    e.stopPropagation();
    if (!savedCoupon) return;
    navigator.clipboard.writeText(savedCoupon);
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 1500);
  };

  const saveCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!/^[a-zA-Z0-9_-]{4,24}$/.test(code)) {
      toast.error("Use 4-24 letters, numbers, dashes or underscores.");
      return;
    }
    if (code === savedCoupon) return;
    try {
      setCouponSaving(true);
      const res = await claimAffiliateCoupon(code);
      setSavedCoupon(res?.data?.coupon || code);
      setCouponInput(res?.data?.coupon || code);
      toast.success("Your coupon is live");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save your coupon.");
    } finally {
      setCouponSaving(false);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image");
      return;
    }

    setImageFile(file);
    setImage(URL.createObjectURL(file));
    setIsAvatarRemoved(false);
  };

  const handleRemove = () => {
    setImage(DEFAULT_IMAGE);
    setImageFile(null);
    setIsAvatarRemoved(true);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    // ✅ Only allowed field
    formData.append("name", data.name);
    formData.append("amazon_link", data.amazon_link || "");
    formData.append("other_affiliate_id", data.other_affiliate_id || "");
    formData.append("affiliate_id", data.affiliate_id || "");

    // ✅ New avatar
    if (imageFile) {
      formData.append("avatar", imageFile);
    }

    if (isAvatarRemoved) {
      formData.append("avatar", "");
    }

    try {
      setLoading(true);

      const res = await updateProfileByRole(formData);

      toast.success(res?.message || "Profile updated successfully");
      loadProfile();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
console.log("profile:", profile)
  return (
    // <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    // <div className="bg-white max-w-[550px] w-full rounded-xl shadow-lg p-5 relative"></div>
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white max-w-[550px] w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-5 relative">
        <button onClick={onClose} className="absolute right-4 top-4">
          <img src="/icons/ic-close-circle.svg" />
        </button>
        <h2 className="font-semibold text-lg mb-4">Profile</h2>

        {/* Avatar */}
        <div
          className="flex gap-6 items-center mb-4"
          style={user?.role_id == 1 ? { flexDirection: "column" } : {}}
        >
          <div className="relative" style={{ width: "12rem", height: "8rem" }}>
            <img
              src={image}
              alt="Profile"
              className="w-full h-full rounded-lg object-contain border"
            />

            <input
              type="file"
              ref={fileRef}
              hidden
              // accept="image/*"
              accept=".jpeg,.jpg,.png,.gif,.svg"
              onChange={handleUpload}
            />

            {/* Edit */}
            <button
              type="button"
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.value = "";
                }
                fileRef.current.click();
              }}
              className="absolute -top-2 -right-2 bg-white border rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-gray-100"
            >
              <img src="/icons/ic-edit.svg" className="w-4 h-4" />
            </button>

            {/* Remove */}
            {image !== DEFAULT_IMAGE && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -bottom-2 -right-2 bg-white border rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-red-100"
              >
                ✕
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="w-full">
            <label className="text-sm">Name</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full border px-3 py-2 rounded-md"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}

            <label className="text-sm mt-4 block">Email</label>
            <input
              {...register("email")}
              disabled
              className="w-full border px-3 py-2 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Affiliate user?.role_id == 1 */}
        {user?.role_id == 2 && (
          <>
            <label className="text-sm">Affiliate URL</label>
            <div className="flex items-center border rounded-md mb-4 bg-gray-100">
              {/* URL – always visible */}
              <span className="px-3 py-2 text-sm pe-0 shrink-0">
                https://co2body.com/
              </span>

              {/* INPUT – truncate when screen is small */}
              <input
                {...register("affiliate_id")}
                disabled={Number(profile?.affiliate_id_editable) !== 1}
                className={`flex-1 min-w-0 px-2 py-2 ps-0 text-sm`}
              />

              {/* Copy button – fixed */}
              <button
                type="button"
                onClick={(e) => copyLink(e)}
                className="px-3 w-[45px] shrink-0"
              >
                {copied ? (
                  <img src="/icons/ic-check.svg" />
                ) : (
                  <img src="/icons/ic-copy.svg" />
                )}
              </button>
            </div>

            <label className="text-sm">Affiliate Coupon</label>
            <p className="text-xs text-gray-400 mb-1">
              Share this code with your audience — it gives them $500 off any
              device ($1,495 minimum order) on carbogenetics.com and credits
              the sale to you. Edit it to any code you like. Discount amounts
              are subject to change with product pricing.
            </p>
            <div className="flex items-center border rounded-md mb-4">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder={savedCoupon ? "" : "Being set up — check back shortly"}
                className="flex-1 min-w-0 px-3 py-2 text-sm uppercase"
              />
              <button
                type="button"
                onClick={copyCoupon}
                className="px-3 w-[45px] shrink-0"
                title="Copy coupon"
              >
                {couponCopied ? (
                  <img src="/icons/ic-check.svg" />
                ) : (
                  <img src="/icons/ic-copy.svg" />
                )}
              </button>
              {couponInput.trim().toUpperCase() !== (savedCoupon || "") && (
                <button
                  type="button"
                  onClick={saveCoupon}
                  disabled={couponSaving}
                  className="px-3 py-1.5 me-2 shrink-0 text-sm rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {couponSaving ? "Saving..." : "Save"}
                </button>
              )}
            </div>

            <label className="text-sm">Old-System Affiliate ID</label>
            <p className="text-xs text-gray-400 mb-1">
              Only for affiliates transferring from the old carbogenetics.com
              affiliate program. If you signed up here, you don't need this —
              your affiliate account is linked automatically and this shows
              your linked code.
            </p>
            <input
              type="text"
              {...register("other_affiliate_id")}
              disabled={profile?.other_affiliate_id !== null && profile?.other_affiliate_id !== undefined}
              className={`w-full border px-3 py-2 rounded-md mb-4 disabled:bg-gray-100 disabled:text-gray-500`}
            />

            <label className="text-sm">Amazon Link to Your Personal Review of the Book</label>
            <p className="text-xs text-gray-400 mb-1">
              Open your review on Amazon and copy its link — product pages and
              other sites won't work.
            </p>
            <input
              {...register("amazon_link", {
                validate: (value) => {
                  if (!value) return true; // not required
                  if (!value.startsWith("https://www.amazon.com/"))
                    return "Link must start with https://www.amazon.com/";
                  // Review permalink (classic or portal format), or the book's own page
                  // paperback, Kindle, ISBN
                  const BOOK_ASINS = ["B0GW2FJ2X1", "B0GX2WRBBB", "9941881677"];
                  const isReview =
                    /\/customer-reviews\/(?:[^/]+\/)*R[A-Z0-9]{7,}/i.test(value) ||
                    /amazon\.com\/review\/R[A-Z0-9]{7,}/i.test(value);
                  const dpMatch = value.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
                  const isBookPage = dpMatch && BOOK_ASINS.includes(dpMatch[1].toUpperCase());
                  return (
                    isReview ||
                    isBookPage ||
                    "This must be the link to your Amazon review of the book"
                  );
                },
              })}
              className={`w-full border px-3 py-2 rounded-md ${errors.amazon_link ? 'border-red-500 mb-0' : 'mb-4'}`}
            />

            {errors.amazon_link && (
              <p className="text-xs text-red-500 mb-4">
                {errors.amazon_link.message}
              </p>
            )}

          </>
        )}

        {/* Social */}
        {social && (
          <>
            <p className="text-sm font-medium mb-2">Social Accounts</p>
            <div className="space-y-2 mb-4">
              {SOCIAL_PROVIDERS.filter((p) => social[p.key] !== undefined).map((p) => {
                const acc = social[p.key];
                const isConnected = Boolean(acc?.connected);
                return (
                  <div
                    key={p.key}
                    className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {providerIcon(p.key)}
                      {isConnected ? (
                        <span className="flex items-center min-w-0">
                          <span className="truncate">
                            {p.handle ? "@" : ""}
                            {acc.username}
                          </span>
                          <CheckmarkIcon size={14} className="ml-1 text-green-500 flex-shrink-0" />
                        </span>
                      ) : (
                        <span className="text-gray-500">{p.label} not connected</span>
                      )}
                    </div>

                    {isConnected ? (
                      <button
                        type="button"
                        onClick={() => disconnect(p.key, p.label)}
                        disabled={disconnecting === p.key}
                        className="text-xs font-medium text-red-500 hover:text-red-700 flex-shrink-0 disabled:opacity-60"
                      >
                        {disconnecting === p.key ? "Disconnecting…" : "Disconnect"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={p.link}
                        className="text-xs font-medium text-purple-600 hover:text-purple-800 flex-shrink-0"
                      >
                        Connect {p.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center py-[14px]">
          <button
            onClick={() => {
              window.location = user?.role_id == 2 ? "/login" : "/admin/login";
              localStorage.clear();
            }}
            className="text-sm bg-red-500 text-white px-3 py-2 rounded-md"
          >
            Logout
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded-md"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
