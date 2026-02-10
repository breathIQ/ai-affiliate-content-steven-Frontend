import React, { useRef } from "react";
import { instagramSignin } from "../../services/socialMediaAuth.api";

const InstagramLoginBtn = () => {
  const instagramLogin = async () => {
    try {
      const res = await instagramSignin();
      console.log("Instagram Signin Response:", res);
      window.location.href = res.data;
    } catch (error) {
      console.error("Instagram Signin Error:", error);
    }
  };

  return (
    <>
      {/* <InstagramLogin
        appId="894645976266970"
        appSecret="91934ac4ed4142e2cf0d2ec33d39a099"
        redirectUri="https://your-domain.com/auth/callback"
        authCallback={authHandler}
      /> */}

      {/* YOUR CUSTOM BUTTON */}
      <button
        onClick={instagramLogin}
        className="w-full border rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-sm hover:bg-gray-100"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
          className="w-4"
        />
        Sign In with Instagram
      </button>

    </>
  );
};

export default InstagramLoginBtn;
