import axios from "axios";
import React, { useState,useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apibase } from "../../services/contants";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
const inputRefs = useRef([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setISloading] = useState(false);
  const {state } =useLocation()
  // console.log("state" ,state);
  
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
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    try {
      setISloading(true);
      const res = await axios.post(
        `${process.env.apibase || apibase}/reset-password`, 
        {email:state||"", otp:otp.join(""), password,password_confirmation:confirmPassword }
      );

      toast.success(res?.data?.message || "Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      toast.error(error?.response?.data?.message|| error?.message || "Link expired or invalid");
    } finally {
      setISloading(false);
    }
  };

  // Reusable Eye Icon Component
  const EyeIcon = ({ visible }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      {visible ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      ) }
    </svg>
  );

  const handleKeyDown = (index, e) => {
    // 3. Move focus back on Backspace if current field is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
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
                <label className="text-sm font-medium text-gray-700">Enter Otp</label>
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
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600"
                  >
                    <EyeIcon visible={showPass} />
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600"
                  >
                    <EyeIcon visible={showConfirmPass} />
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? "Updating..." : "Reset Password"}
              </button>

              <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Branding (Same as your code) */}
      <div className="hidden lg:flex bg-white p-10">
        <div style={{ backgroundImage: "url('/images/book4.png')", backgroundSize: "cover", backgroundPosition: "center" }}
          className="w-full flex bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-lg border border-gray-100">
          <div className="max-w-lg">
            <div className="mb-4 p-5">
              <img src="/icons/logoblue.svg" className="mb-4" alt="logo" />
              <p className="text-gray-600 text-lg w-[80%] mb-4 leading-relaxed">
                CO2 and the hidden science of vitality, resilience, and lifelong energy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}