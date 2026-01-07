import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { CheckmarkIcon } from "react-hot-toast";
import {
  getProfileByRole,
  updateProfileByRole,
} from "../../services/profile.service";

const DEFAULT_IMAGE = "/images/defaultImage.png";

export function ProfileEditModal({ isOpen, onClose }) {
  const fileRef = useRef(null);
  const [image, setImage] = useState(DEFAULT_IMAGE);
  const [imageFile, setImageFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [social, setSocial] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const affiliate = watch("affiliate");

  useEffect(() => {
    if (!isOpen) return;

    const loadProfile = async () => {
      try {
        const profile = await getProfileByRole();
        reset({
          name: profile.name,
          email: profile.email,
          affiliate: profile.affiliate,
        });

        setImage(profile.avatar || DEFAULT_IMAGE);
        setImageFile(null);
        setSocial(profile.social_accounts);
      } catch (err) {
        console.error(err);
      }
    };

    loadProfile();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://www.co2book.com/${affiliate}`);
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
  };

  const handleRemove = () => {
    setImage(DEFAULT_IMAGE);
    setImageFile(null);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    // ✅ Only allowed field
    formData.append("name", data.name);

    // ✅ New avatar
    if (imageFile) {
      formData.append("avatar", imageFile);
    }

    // ✅ Remove avatar
    if (!imageFile && image === DEFAULT_IMAGE) {
      formData.append("remove_avatar", 1);
    }
    try {
      setLoading(true);

      const res = await updateProfileByRole(formData);

      toast.success(res?.message || "Profile updated successfully");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[550px] rounded-xl shadow-lg p-5 relative">
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
              accept="image/*"
              onChange={handleUpload}
            />

            {/* Edit */}
            <button
              type="button"
              onClick={() => fileRef.current.click()}
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
        {user?.role_id == 1 && (
          <>
            <label className="text-sm">Affiliate ID</label>
            <div className="flex border rounded-md mb-4 bg-gray-100">
              <span className="px-3 py-2 text-sm">
                https://www.co2book.com/
              </span>
              <input
                {...register("affiliate")}
                disabled
                className="flex-1 px-2 py-2 bg-gray-100 cursor-not-allowed"
              />
              <button type="button" onClick={copyLink} className="px-3">
                {copied ? (
                  <img src="/icons/ic-check.svg" />
                ) : (
                  <img src="/icons/ic-copy.svg" />
                )}
              </button>
            </div>
          </>
        )}

        {/* Social */}
        {social && (
          <>
            <p className="text-sm font-medium mb-2">Social Accounts</p>
            <div className="flex gap-3 mb-4">
              <div className="flex items-center w-full justify-center gap-2 border rounded-md px-3 py-2 text-sm">
                <img src="/icons/insta.svg" />
                {social.instagram?.connected ? (
                  <span>
                    {social.instagram.username}
                    <CheckmarkIcon size={14} className="ml-1 text-green-500" />
                  </span>
                ) : (
                  "Connect Instagram"
                )}
              </div>

              <div className="flex items-center w-full justify-center gap-2 border rounded-md px-3 py-2 text-sm">
                <img src="/icons/tiktok.svg" />
                {social.tiktok?.connected ? (
                  <span>
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
