import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updatePasswordByRole } from "../../services/profile.service";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function ChangePasswordModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  // 👁 separate visibility state
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("new_password");

  if (!isOpen) return null;

  // ======================
  // Toggle visibility
  // ======================
  const toggleShow = (field) => {
    setShow((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // ======================
  // Submit handler
  // ======================
  const onSubmit = async (data) => {
    if (loading) return;

    const payload = {
      current_password: data.current_password,
      new_password: data.new_password,
      new_password_confirmation: data.new_password_confirmation,
    };

    try {
      setLoading(true);
      const res = await updatePasswordByRole(payload);

      toast.success(res?.message || "Password changed successfully");
      reset();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[420px] rounded-xl shadow-lg p-5 relative">
        <button onClick={onClose} className="absolute right-4 top-4">
          <img src="/icons/ic-close-circle.svg" />
        </button>

        <h2 className="font-semibold text-lg mb-4">Change Password</h2>

        {/* ================= Current Password ================= */}
        <div className="mb-3">
          <label className="text-sm font-medium">Current Password</label>

          <div className="relative">
            <input
              type={show.current ? "text" : "password"}
              className="w-full border rounded-md px-3 py-2 pr-10 mt-1"
              {...register("current_password", {
                required: "Current password is required",
              })}
            />

            <button
              type="button"
              onClick={() => toggleShow("current")}
              className="absolute right-3 top-[18px] text-gray-500"
            >
              {show.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {errors.current_password && (
            <p className="text-xs text-red-500">
              {errors.current_password.message}
            </p>
          )}
        </div>

        {/* ================= New Password ================= */}
        <div className="mb-3">
          <label className="text-sm font-medium">New Password</label>

          <div className="relative">
            <input
              type={show.new ? "text" : "password"}
              className="w-full border rounded-md px-3 py-2 pr-10 mt-1"
              {...register("new_password", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />

            <button
              type="button"
              onClick={() => toggleShow("new")}
              className="absolute right-3 top-[18px] text-gray-500"
            >
              {show.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {errors.new_password && (
            <p className="text-xs text-red-500">
              {errors.new_password.message}
            </p>
          )}
        </div>

        {/* ================= Confirm Password ================= */}
        <div className="mb-3">
          <label className="text-sm font-medium">
            Confirm New Password
          </label>

          <div className="relative">
            <input
              type={show.confirm ? "text" : "password"}
              className="w-full border rounded-md px-3 py-2 pr-10 mt-1"
              {...register("new_password_confirmation", {
                required: "Please confirm password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
            />

            <button
              type="button"
              onClick={() => toggleShow("confirm")}
              className="absolute right-3 top-[18px] text-gray-500"
            >
              {show.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {errors.new_password_confirmation && (
            <p className="text-xs text-red-500">
              {errors.new_password_confirmation.message}
            </p>
          )}
        </div>

        {/* ================= Footer ================= */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-200 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
