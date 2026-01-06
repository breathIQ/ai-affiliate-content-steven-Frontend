import React, { useEffect, useRef, useState } from "react";
import InviteModal from "../modals/InviteModal";
import { ProfileEditModal } from "../modals/ProfileEditModal";
import { ChangePasswordModal } from "../modals/ChangePasswordModal";

const Header = () => {
  const [open, setOpen] = useState(false);
  const access_token = localStorage.getItem("access_token")
  const handleSend = (emails) => {
    console.log("Inviting:", emails);
    // API call here
  };
   const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  // close dropdown on outside click
  useEffect(() => {
    if(!access_token){
      window.location.href = "/login"
    }
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className=" w-full bg-gradient-to-r from-[#0B0E14] to-[#111827] px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <img src="/icons/logo.svg" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Profile */}
          <div ref={profileRef} className="relative">
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              onClick={() => setProfileOpen((v) => !v)}
              className="w-9 h-9 rounded-md border border-gray-600 cursor-pointer"
            />

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                <div className="w-full flex gap-2 border-bottom align-items-center px-4 py-2 font-semibold hover:bg-gray-100">
                  <img
                    src="https://i.pravatar.cc/40"
                    alt="profile"
                    onClick={() => setOpenProfile((v) => !v)}
                    className="w-7 h-7 rounded-md border border-gray-600 cursor-pointer"
                  />
                  Profile
                </div>
                <hr />
                <button  onClick={() => setOpenPassword((v) => !v)} className="w-full flex gap-2 align-items-center px-4 py-2 font-semibold hover:bg-gray-100">
                  <img src="/icons/ic-password.svg" />
                  Change Password
                </button>
                <button className="w-full flex gap-2 align-items-center px-4 py-2 font-semibold hover:bg-gray-100">
                  <img src="/icons/ic-extension.svg" />
                  Social Accounts
                </button>
                <hr />
                <button 
                onClick={()=>{
                  window.location = user?.role_id == 2 ? "/login" :"/admin/login"
                  localStorage.clear()
                }}
                 className="w-full flex gap-2 align-items-center px-4 py-2 font-semibold text-red-600 hover:bg-red-50">
                  <img src="/icons/ic-logout.svg" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Invite Button */}
          <button
            onClick={() => setOpen(true)}
            className="hidden sm:flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-[10px] py-[8px]
             rounded-md text-sm font-medium transition"
          >
            <img src="/icons/ic-add.svg" alt="profile" className="text-white" />{" "}
            Invite
          </button>
        </div>
      </div>
      <InviteModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSend={handleSend}
      />

      <ProfileEditModal
        isOpen={openProfile}
        onClose={() => setOpenProfile(false)}
      />
      <ChangePasswordModal
        isOpen={openPassword}
        onClose={() => setOpenPassword(false)}
      />
    </header>
  );
};

export default Header;
