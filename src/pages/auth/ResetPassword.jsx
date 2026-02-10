import axios from "axios";
import React, { useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apibase } from "../../services/contants";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setISloading] = useState(false);
  const [passError, setPassError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const { state } = useLocation();
  // console.log("state" ,state);
  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Minimum 8 characters required";
    if (!/[A-Z]/.test(value)) return "Add at least 1 uppercase letter";
    if (!/[a-z]/.test(value)) return "Add at least 1 lowercase letter";
    if (!/\d/.test(value)) return "Add at least 1 number";
    if (!/[!@#$%^&*]/.test(value)) return "Add special character";

    return "";
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const err = validatePassword(value);
    setPassError(err);

    // re-check confirm match
    if (confirmPassword && value !== confirmPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  const handleConfirmChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (password !== value) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  // States for toggling visibility
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleResetSubmit = async (e) => {
    // console.log("cleick",otp.join(""));
    e.preventDefault();
    const passErr = validatePassword(password);

    if (passErr) {
      setPassError(passErr);
      return toast.error(passErr);
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return toast.error("Passwords do not match");
    }

    try {
      setISloading(true);
      const res = await axios.post(
        `${process.env.apibase || apibase}/reset-password`,
        {
          email: state?.email || "",
          token: otp.join(""),
          password,
          password_confirmation: confirmPassword,
        },
      );

      toast.success(res?.data?.message || "Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Link expired or invalid",
      );
    } finally {
      setISloading(false);
    }
  };

  const handleKeyDown = (index, e) => {
    // 3. Move focus back on Backspace if current field is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="animate-in fade-in zoom-in duration-300">
            <h1 className="text-xl font-bold text-center mb-2">New Password</h1>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">
              Enter your new password below to secure your account.
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-5">
              {/* Password Input */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enter Otp
                </label>
                <div className="flex justify-between pt-0 mt-0">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      maxLength={1}
                      value={digit}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-10 h-12 text-center border rounded-lg text-lg"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    // onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600"
                  >
                    {!showPass ? <FaEyeSlash /> : <FaEye />}
                    {/* <EyeIcon visible={showPass} /> */}
                  </button>
                </div>
                {passError && (
                  <p className="text-xs text-red-500 mt-1">{passError}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    // onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600"
                  >
                    {!showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                    {/* <EyeIcon visible={showConfirmPass} /> */}
                  </button>
                </div>
                {confirmError && (
                  <p className="text-xs text-red-500 mt-1">{confirmError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? "Updating..." : "Reset Password"}
              </button>
              <div className="text-center mt-4">
                <Link
                  to={state?.role == "user" ? "/login" : "/admin/login"}
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Branding (Same as your code) */}
      <div className="hidden lg:flex bg-white p-10">
        <div
          style={{
            backgroundImage: "url('/images/book4.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="w-full flex bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-lg border border-gray-100"
        >
          <div className="max-w-lg">
            <div className="mb-4 p-5">
              <img src="/icons/logoblue.svg" className="mb-4" alt="logo" />
              <p className="text-gray-600 text-lg w-[80%] mb-4 leading-relaxed">
                CO2 and the hidden science of vitality, resilience, and lifelong
                energy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
