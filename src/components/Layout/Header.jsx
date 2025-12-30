import React, { useState } from "react";
import InviteModal from "../modals/InviteModal";

const Header = () => {
  const [open, setOpen] = useState(false);

  const handleSend = (emails) => {
    console.log("Inviting:", emails);
    // API call here
  };

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
            className="w-9 h-9 rounded-md border border-gray-600"
          />

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
    </header>
  );
};

export default Header;
