import React, { useRef } from "react";

const TiktokLogin = () => {
  const TIKTOK_CLIENT_KEY = "awk5c3938mfcb3wc"; // process.env.TIKTOK_CLIENT_KEY||
  const REDIRECT_URI = "https://aiaffiliate.betacvinfotech.com/auth/instagram/callback";
  //  "https://aiaffiliate.betacvinfotech.com/login";



  const tiktokLogin = () => {
    const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=user.info.basic&response_type=code&redirect_uri=${REDIRECT_URI}&state=login`;
    window.location.href = url;
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
