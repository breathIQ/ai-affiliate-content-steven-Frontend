import { useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function InviteModal({ isOpen, onClose }) {
  const [emails, setEmails] = useState("");
 const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};
  if (!isOpen) return null;

  const handleSend = async () => {
    try {
      if (emails.length === 0) return;
      const res = await API.post(`/affiliate/invite`, {
        emails: emails,
      });
      toast.success(res?.data?.message)
      setEmails("");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message||error?.message)
      console.error("Invite failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-800">Invite Affiliate User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>

          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="johndoe@gmail.com"
            rows={5}
            className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <p className="text-xs text-gray-400 mt-2">
            Enter multiple emails to invite more than one user, enter email(s)
            separated by enter.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Send Invite(s)
          </button>
        </div>
      </div>
    </div>
  );
}
