import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import SupportChat from "./SupportChat";

// Site-wide floating support widget: a launcher bubble bottom-right on every
// page, opening the CO2Body support chat. Hidden on /support (where the full
// chat is already the page content). Shares session + transcript with the
// /support page via localStorage, so a conversation continues across both.

export default function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Redundant on the dedicated support page.
  if (pathname === "/support") return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[9999] w-[360px] max-w-[calc(100vw-2.5rem)]">
          <SupportChat variant="floating" onClose={() => setOpen(false)} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-2xl transition-transform hover:scale-105 hover:bg-violet-700"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </>
  );
}
