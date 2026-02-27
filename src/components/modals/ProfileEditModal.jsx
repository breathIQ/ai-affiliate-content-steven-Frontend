import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { CheckmarkIcon } from "react-hot-toast";
import {
  getProfileByRole,
  updateProfileByRole,
} from "../../services/profile.service";
import { instagramAccountLink } from "../../services/socialMediaAuth.api";
import { tiktokAccountLink } from "../../services/socialMediaAuth.api";
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

            <label className="text-sm">Affiliate ID</label>
            <input
              type="number"
              min={0}
              {...register("other_affiliate_id", { valueAsNumber: true })}
              disabled={profile?.other_affiliate_id !== null && profile?.other_affiliate_id !== undefined}
              className={`w-full border px-3 py-2 rounded-md mb-4`}
            />

            <label className="text-sm">Amazon Link to Your Personal Review of the Book</label>
            <input
              {...register("amazon_link", {
                validate: (value) => {
                  if (!value) return true; // not required
                  return value.startsWith("https://www.amazon.com/")
                    || "Link must start with https://www.amazon.com/";
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
            <div className="flex gap-3 mb-4">
              <div className={`flex items-center w-full justify-center gap-2 border rounded-md px-3 py-2 text-sm ${social.instagram?.connected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => {
                  if (!social.instagram?.connected) {
                    instagramLinkAccount();
                  }
                }}>
                <img src="/icons/insta.svg" />
                {social.instagram?.connected ? (
                  <span className="flex">
                    {social.instagram.username}
                    <CheckmarkIcon size={14} className="ml-1 text-green-500" />
                  </span>
                ) : (
                  "Connect Instagram"
                )}
              </div>

              <div className={`flex items-center w-full justify-center gap-2 border rounded-md px-3 py-2 text-sm ${social.tiktok?.connected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => {
                  if (!social.tiktok?.connected) {
                    tiktokLinkAccount();
                  }
                }}>
                <img src="/icons/tiktok.svg" />
                {social.tiktok?.connected ? (
                  <span className="flex">
                    {social.tiktok.username}
                    <CheckmarkIcon size={14} className="ml-1 text-green-500" />
                  </span>
                ) : (
                  "Connect TikTok"
                )}
              </div>
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
