import { useRef, useState } from "react";
import { CheckmarkIcon } from "react-hot-toast";

export function ProfileEditModal({ isOpen, onClose, onSave }) {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "John Doe",
    email: "johndoe@gmail.com",
    affiliate: "johndoe",
  });
  const fileRef = useRef(null);
  const [image, setImage] = useState("https://i.pravatar.cc/80");

  if (!isOpen) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://www.co2book.com/${form.affiliate}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Upload image
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional validation
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);

    // 👉 API upload logic goes here
    // const formData = new FormData();
    // formData.append("image", file);
    // axios.post("/api/upload-profile", formData)
  };

  // Remove image
  const handleRemove = () => {
    setImage("DEFAULT_IMAGE");

    // 👉 API remove logic here
    // axios.delete("/api/remove-profile")
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[550px] rounded-xl shadow-lg p-5 relative">
        <button onClick={onClose} className="absolute right-4 top-4">
          <img src="/icons/ic-close-circle.svg" />
        </button>

        <h2 className="font-semibold text-lg mb-4">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-4">
          <div className="relative w-40 ">
            {/* Profile Image */}
            <img
              src={image}
              alt="Profile"
              className="w-full h-full rounded-lg object-cover border"
            />

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileRef}
              hidden
              accept="image/*"
              onChange={handleUpload}
            />

            {/* Edit Icon */}
            <button
              onClick={() => fileRef.current.click()}
              className="absolute -top-2 -right-2 bg-white border rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-gray-100"
              title="Change photo"
            >
              <img src="/icons/ic-edit.svg" className="w-4 h-4" />
            </button>

            {/* Remove Icon */}
            {image !== "DEFAULT_IMAGE" && (
              <button
                onClick={handleRemove}
                className="absolute -bottom-2 -right-2 bg-white border rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-red-100 text-sm"
                title="Remove photo"
              >
                ✕
              </button>
            )}
          </div>
          <div>
            {/* Name */}
            <label className="text-sm font-medium">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mt-1 mb-3"
            />

            {/* Email */}
            <label className="text-sm font-medium">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mt-1 mb-3"
            />
          </div>
        </div>

        {/* Affiliate */}
        <label className="text-sm font-medium">Affiliate ID</label>
        <div className="flex border rounded-md overflow-hidden mt-1 mb-4">
          <span className="px-3 py-2 text-sm bg-gray-100">
            https://www.co2book.com/
          </span>
          <input
            value={form.affiliate}
            onChange={(e) => setForm({ ...form, affiliate: e.target.value })}
            className="flex-1 px-2 py-2 text-sm outline-none"
          />
          <button onClick={copyLink} className="px-3">
            {copied ? (
              <img src="/icons/ic-check.svg" />
            ) : (
              <img src="/icons/ic-copy.svg" />
            )}
          </button>
        </div>

        {/* Social */}
        <p className="text-sm font-medium mb-2">Social Accounts</p>
        <div className="flex justify-between gap-3 mb-4">
          <div className="flex items-center w-[100%] gap-2 border rounded-md px-3 py-2 text-sm">
            <img src="/icons/insta.svg" />
            @johndoe
            <CheckmarkIcon className="text-green-500" size={14} />
          </div>
          <button className="flex items-center w-[100%] gap-2 border rounded-md px-3 py-2 text-sm">
            <img src="/icons/tiktok.svg" />
            Connect TikTok
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center py-[14px]">
          <button className="text-sm bg-red-500 text-white px-3 py-2 rounded-md">
            Logout
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
