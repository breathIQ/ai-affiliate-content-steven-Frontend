import React, { useEffect, useState } from "react";

// Promotes the "CO2Body - Share to Instagram" Chrome extension. Shows only
// when it makes sense: on desktop Chromium browsers, when the extension is not
// already installed, and when the user hasn't dismissed it. Installation is
// detected by messaging the published extension (it answers CO2BODY_DETECT via
// externally_connectable for co2body.com).

const EXT_ID = "fambfkbkjgfnielhkjmfbbamngideaoj";
const STORE_URL = `https://chromewebstore.google.com/detail/${EXT_ID}`;
const DISMISS_KEY = "co2body-ext-card-dismissed";

function isDesktopChromium() {
  const ua = navigator.userAgent || "";
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  // Chrome, Edge, Brave, etc. all carry "Chrome" in the UA and can install from
  // the Chrome Web Store. Exclude mobile (extensions don't run there).
  return /Chrome\//.test(ua) && !isMobile;
}

export default function ExtensionInstallCard() {
  // "checking" until we know; then "show" or "hide".
  const [state, setState] = useState("checking");

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1" || !isDesktopChromium()) {
      setState("hide");
      return;
    }

    let settled = false;
    const finish = (installed) => {
      if (settled) return;
      settled = true;
      setState(installed ? "hide" : "show");
    };

    try {
      if (window.chrome?.runtime?.sendMessage) {
        window.chrome.runtime.sendMessage(EXT_ID, { type: "CO2BODY_DETECT" }, (res) => {
          // lastError => extension not installed / not reachable.
          if (window.chrome.runtime.lastError) return finish(false);
          finish(Boolean(res?.installed));
        });
        // Fallback in case the callback never fires.
        setTimeout(() => finish(false), 1500);
      } else {
        finish(false);
      }
    } catch {
      finish(false);
    }
  }, []);

  if (state !== "show") return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setState("hide");
  };

  return (
    <div className="relative mt-4 mb-2 rounded-xl border border-[#e6dcff] bg-gradient-to-r from-[#f6f2ff] to-[#eef4ff] p-4 sm:p-5">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-lg leading-none"
      >
        ×
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <img
          src="/android-chrome-192x192.png"
          alt=""
          className="w-12 h-12 rounded-lg flex-shrink-0"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] text-[#0D0F17]">
            Post to Instagram in one click
          </p>
          <p className="text-sm text-[#6E6C81] mt-0.5">
            Install the free <span className="font-medium">CO2Body - Share to Instagram</span> Chrome
            extension to share your posts to a personal Instagram account. Your media, caption, and
            affiliate link are filled in for you - you just review and hit Share.
          </p>
        </div>
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center justify-center rounded-lg bg-[#7239EA] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5f2fc4] transition-colors"
        >
          Add to Chrome - free
        </a>
      </div>
    </div>
  );
}
