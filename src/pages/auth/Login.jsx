import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apibase } from "../../services/contants";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setISloading] = useState(false);
    const [showPass, setShowPass] = useState(false);
  
  // View states: 'login' or 'forgot'
  const [view, setView] = useState("login");
  const navigate = useNavigate();
  const location = useLocation();
  const [isadmin, setisadmin] = useState(false);

  useEffect(() => {
    const isadminPath = location.pathname.startsWith("/admin/");
    if (isadminPath) setisadmin(isadminPath);
  }, [location]);

  // Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setISloading(true);
      const res = await axios.post(
        (process.env.apibase || apibase) +
          `/${isadmin ? "admin" : "user"}/login`,
        { email, password }
      );
      setISloading(false);
      toast.success(res?.data.message);
      localStorage.setItem("user", JSON.stringify(res?.data.data));
      localStorage.setItem("access_token", res?.data.data?.access_token);
      window.location.href =
        res?.data.data?.role_id == 2 ? "/u/dashboard" : "/admin/dashboard";
    } catch (error) {
      setISloading(false);
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address");

    try {
      setISloading(true);
      const res = await axios.post(
        (process.env.apibase || apibase) + "/forgot-password",
        { email }
      );
      toast.success(res?.data?.message || "Reset link sent to your email!");
      setISloading(false);
      navigate("/reset-password", {
        state: {email,role: isadmin? "admin" : "user"},
      });
      // Optional: switch back to login after success
      // setView("login");
    } catch (error) {
      setISloading(false);
      toast.error(
        error?.response?.data?.message || "Failed to send reset link"
      );
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-2">
      {/* Left - Form Section */}
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 transition-all duration-300">
          {view === "login" ? (
            /* --- LOGIN VIEW --- */
            <>
              <h1 className="text-2xl font-semibold text-center mb-2">
                Sign In
              </h1>
              <p className="text-sm text-gray-500 text-center mb-6">
                Welcome back! Log in with your credentials.
              </p>

              {!isadmin && (
                <>
                  <button className="w-full border rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-sm hover:bg-gray-50">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                      className="w-4"
                      alt="insta"
                    />
                    Sign In with Instagram
                  </button>
                  <button className="w-full border rounded-lg py-2 mb-4 flex items-center justify-center gap-2 text-sm hover:bg-gray-50">
                    <img src="/icons/tiktok.svg" className="w-4" alt="tiktok" />
                    Sign In with TikTok
                  </button>
                  <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-200" />
                    <span className="mx-2 text-xs text-gray-400">OR</span>
                    <div className="flex-grow h-px bg-gray-200" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                 
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
                      {!showPass ? <FaEyeSlash /> : <FaEye />}
                      {/* <EyeIcon visible={showPass} /> */}
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => setView("forgot")}
                  className="text-right text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
                >
                  Forgot Password?
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 font-medium shadow-sm transition-colors disabled:opacity-70"
                >
                  {isLoading ? "Loading ..." : "Sign In"}
                </button>
              </form>

              {!isadmin && (
                <p className="text-sm text-center mt-6">
                  Don’t have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              )}
            </>
          ) : (
            /* --- FORGOT PASSWORD VIEW --- */
            <div className="animate-in fade-in zoom-in duration-300">
              <h1 className="text-2xl font-bold text-center mb-2">
                Reset Password
              </h1>
              <p className="text-sm text-gray-500 text-center mb-8 px-4">
                Enter your email to receive a password reset link
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 font-bold shadow-md transition-all active:scale-[0.98]"
                >
                  {isLoading ? "Sending..." : "Send Reset Otp"}
                </button>

                <div
                  onClick={() => setView("login")}
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-purple-600 cursor-pointer transition-colors mt-4"
                >
                  <span className="text-lg">←</span> Back to Sign In
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Right - Image Section (Remains Same) */}
      <div className="hidden lg:flex bg-white p-10">
        <div
          style={{
            backgroundImage: "url('/images/book4.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="w-full flex bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-lg border border-gray-100 shadow-inner"
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
