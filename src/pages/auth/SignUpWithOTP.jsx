import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { apibase } from "../../services/contants";
import { instagramSignin, tiktokSignin } from "../../services/socialMediaAuth.api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignUpWithOTP() {
  const [step, setStep] = useState(1); // 1 = signup, 2 = otp
  const [isLoading, setISloading] = useState(false); // 1 = signup, 2 = otp
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

if (!passwordRegex.test(form.password)) {
  toast.error("Password must be at least 8 characters, include one letter, one number, and one special character");
  return;
}
    try {
      setISloading(true);
      const res = await axios.post(
        process.env.apibase || apibase + "/user/register",
        form
      );
      setISloading(false);
      // console.log("res" ,res,);
      toast.success(res?.data.message || "OTP sent to your email");
      navigate("/login");
      // setStep(2); // move to OTP screen
    } catch (error) {
      setISloading(false);
      toast.error(error?.response?.data?.message || "Signup failed");
    }
  };

  const instagramLogin = async () => {
      try {
        const res = await instagramSignin();
        console.log("Instagram Signin Response:", res);
        window.location.href = res.data;
      } catch (error) {
        console.error("Instagram Signin Error:", error);
      }
    };

    const tiktokLogin = async () => {
        try {
          const res = await tiktokSignin();
          console.log("TikTok Signin Response:", res);
          window.location.href = res.data;
        } catch (error) {
          console.error("TikTok Signin Error:", error);
        }
      };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };
  const [error, setError] = useState("");

const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (value.length < 8) return "Minimum 8 characters required";
  if (!/[A-Z]/.test(value)) return "Add uppercase letter";
  if (!/[a-z]/.test(value)) return "Add lowercase letter";
  if (!/\d/.test(value)) return "Add a number";
  if (!/[!@#$%^&*]/.test(value)) return "Add special character";

  return "";
};

  const verifyOtp = async () => {
    try {
      setISloading(true);
      const res = await axios.post(
        process.env.apibase || apibase + "/user/verify-otp",
        otp
      );
      setISloading(false);
      // console.log("res" ,res,process.env.apibase);
      toast.success(res?.data.message || "OTP sent to your email");
      setStep(2); // move to OTP screen
    } catch (error) {
      setISloading(false);
      toast.error(error?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-2">
      {/* Left - Form */}
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-semibold text-center mb-1">
                Sign Up
              </h1>
              <p className="text-sm text-gray-500 text-center mb-6">
                Create your account to get started
              </p>

              <button className="w-full border rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-sm" onClick={instagramLogin}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                  className="w-4"
                />
                Sign Up with Instagram
              </button>

              <button className="w-full border rounded-lg py-2 mb-4 flex items-center justify-center gap-2 text-sm" onClick={tiktokLogin}>
                <img src="/icons/tiktok.svg" className="w-4" />
                Sign Up with TikTok
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow h-px bg-gray-200" />
                <span className="mx-2 text-xs text-gray-400">OR</span>
                <div className="flex-grow h-px bg-gray-200" />
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    name="name"
                    // max={}
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    required
                  />
                </div>

              <div>
  <label className="text-sm font-medium">Password</label>

  <div className="relative mt-1">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={form.password}
      onChange={handleChange}
      className="w-full border rounded-lg px-3 pr-10 py-2"
      required
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
    >
      {showPassword ? <FaEye /> : <FaEyeSlash />}
    </button>
  </div>
</div>

<div>
  <label className="text-sm font-medium">Confirm Password</label>

  <div className="relative mt-1">
    <input
      type={showConfirmPassword ? "text" : "password"}
      name="password_confirmation"
      value={form.password_confirmation}
      onChange={handleChange}
      className="w-full border rounded-lg px-3 pr-10 py-2"
      required
    />

    <button
      type="button"
      onClick={() =>
        setShowConfirmPassword(!showConfirmPassword)
      }
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
    >
      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
    </button>
  </div>
</div>


                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2">
                  {isLoading ? "Loading..." : "Sign Up"}
                </button>
              </form>

              <p className="text-sm text-center mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-600 cursor-pointer">
                  Sign In
                </Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-semibold text-center mb-2">
                Verify OTP
              </h1>
              <p className="text-sm text-gray-500 text-center mb-6">
                Enter the 6-digit code sent to your email
              </p>

              <div className="flex justify-between mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-10 h-12 text-center border rounded-lg text-lg"
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2"
              >
                {isLoading ? "Loading..." : "Verify OTP"}
              </button>

              <p className="text-sm text-center mt-4 text-gray-500">
                Didn’t receive code?{" "}
                <span className="text-purple-600 cursor-pointer">Resend</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right - Illustration / Dashboard */}
      <div className="hidden lg:flex bg-white p-10 ">
        <div
          style={{
            backgroundImage: "url('/images/book4.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          className=" w-full flex bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-lg"
        >
          <div className="max-w-lg ">
            <div className="mb-4 p-5">
              <img src="/icons/logoblue.svg" className="mb-4" />
              <p className="text-gray-600 fs-[16px] w-[80%] mb-4">
                CO2 and the hidden science of vitality, resilience, and lifelong
                energy.
              </p>
            </div>

            {/* <div className="">

                <img src="/images/book4.png" className="mb-4" />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
