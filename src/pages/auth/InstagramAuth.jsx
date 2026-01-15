import React, { useRef } from "react";
import InstagramLogin from "react-instagram-oauth";

const InstagramLoginBtn = () => {
  const CLIENT_ID = "894645976266970";
  //  process.env.INSTAGRAM_CLIENT_ID||
  const appSecret="91934ac4ed4142e2cf0d2ec33d39a099"

  const REDIRECT_URI = 
   "https://aiaffiliate.betacvinfotech.com/auth/instagram/callback"
  // "http://localhost:3000/login";


  const handleLogin = () => {
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
    window.location.href = authUrl;
  };
  const instagramRef = useRef();

  const authHandler = (err, data) => {
    if (err) return console.error(err);
    console.log("Authorization Code:", data.code);
    // Send data.code to your backend to exchange for an Access Token
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
        onClick={() => {handleLogin()}}
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
