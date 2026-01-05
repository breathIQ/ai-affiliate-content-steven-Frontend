import { useState } from "react";

export function ChangePasswordModal({ isOpen, onClose, onSave }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (form.newPass !== form.confirm) {
      alert("Passwords do not match");
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-xl shadow-lg p-5 relative">
        <button onClick={onClose} className="absolute right-4 top-4">
                     <img src="/icons/ic-close-circle.svg" />

        </button>

        <h2 className="font-semibold text-lg mb-4">Change Password</h2>

        {["current", "newPass", "confirm"].map((field, i) => (
          <div key={i} className="mb-3">
            <label className="text-sm font-medium capitalize">
              {field.replace("newPass", "New Password").replace("confirm", "Confirm New Password")}
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className="w-full border rounded-md px-3 py-2 pr-10 mt-1"
                onChange={(e) =>
                  setForm({ ...form, [field]: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {/* {show ? <EyeOff size={16} /> : <Eye size={16} />} */}
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded-md">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
