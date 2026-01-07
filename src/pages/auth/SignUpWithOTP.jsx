import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { apibase } from "../../services/contants";

export default function SignUpWithOTP() {
  const [step, setStep] = useState(1); // 1 = signup, 2 = otp
  const [isLoading, setISloading] = useState(false); // 1 = signup, 2 = otp
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

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
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

              <button className="w-full border rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-sm">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                  className="w-4"
                />
                Sign Up with Instagram
              </button>

              <button className="w-full border rounded-lg py-2 mb-4 flex items-center justify-center gap-2 text-sm">
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
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    required
                  />
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
