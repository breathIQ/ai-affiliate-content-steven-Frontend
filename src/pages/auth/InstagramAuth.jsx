import React from "react";

const InstagramLogin = () => {
  const CLIENT_ID = "YOUR_INSTAGRAM_APP_ID";
  const REDIRECT_URI = "http://localhost:3000/auth/instagram/callback";

  const handleLogin = () => {
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full border rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-sm"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
        className="w-4"
      />
      Sign In with Instagram
    </button>
  );
};

export default InstagramLogin;
