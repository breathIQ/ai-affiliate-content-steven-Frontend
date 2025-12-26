import React from "react";

const Header = () => {
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
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-9 h-9 rounded-full border border-gray-600"
          />

          {/* Invite Button */}
          <button className="hidden sm:flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition">
            + Invite
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
