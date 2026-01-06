import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apibase } from "../../services/contants";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setISloading] = useState(false); // 1 = signup, 2 = otp
  const location = useLocation();
  const navigate = useNavigate();
  const [isadmin, setisadmin] = useState(false);
  /* Sync tabs + active state with URL */
  useEffect(() => {
    const isadminPath = location.pathname.startsWith("/admin/");
    // console.log("isadminPath" ,isadminPath);
    if (isadminPath) {
      setisadmin(isadminPath);
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log({ email, password });
    try {
      setISloading(true);
      const res = await axios.post(
        process.env.apibase || apibase + `/${isadmin ? "admin" : "user"}/login`,
        { email, password }
      );
      setISloading(false);
      // console.log("res" ,res,process.env.apibase);
      toast.success(res?.data.message);
      localStorage.setItem("user", JSON.stringify(res?.data.data));
      localStorage.setItem("access_token", res?.data.data?.access_token);
      window.location.href = res?.data.data?.role_id == 2 ? "/u/dashboard": "/dashboard";
    } catch (error) {
      setISloading(false);
      toast.error(error?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-2">
      {/* Left - Form */}
      <div className="flex items-center justify-center px-6 py-20 ">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl font-semibold text-center mb-2">Sign In</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Welcome back! Log in with your credentials.
          </p>
          {isadmin ? (
            ""
          ) : (
            <>
              <button className="w-full border rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-sm">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                  className="w-4"
                />
                Sign In with Instagram
              </button>

              <button className="w-full border rounded-lg py-2 mb-4 flex items-center justify-center gap-2 text-sm">
                <img src="/icons/tiktok.svg" className="w-4" />
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="text-right text-sm text-purple-600 cursor-pointer">
              Forgot Password?
            </div>

            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2">
              {isLoading ? "Loading ..." : " Sign In"}
            </button>
          </form>

          {isadmin ? (
            ""
          ) : (
            <p className="text-sm text-center mt-6">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-purple-600 cursor-pointer">
                Sign Up
              </Link>
            </p>
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
