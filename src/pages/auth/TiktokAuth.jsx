import React, { useRef } from "react";
import { tiktokSignin } from "../../services/socialMediaAuth.api";

const TiktokLogin = () => {

  const tiktokLogin = async () => {
    try {
      const res = await tiktokSignin();
      console.log("TikTok Signin Response:", res);
      window.location.href = res.data;
    } catch (error) {
      console.error("TikTok Signin Error:", error);
    }
  };

  return (
    <>
      <button
        onClick={tiktokLogin}
        className="w-full border rounded-lg py-2 mb-4 flex items-center justify-center gap-2 text-sm hover:bg-gray-50"
      >
        <img src="/icons/tiktok.svg" className="w-4" alt="tiktok" />
        Sign In with TikTok
      </button>
    </>
  );
};

export default TiktokLogin;
