import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiCopy, FiCheck } from "react-icons/fi";
import { getUserProfile } from "../../services/profile.api";
import {
  getAffiliateProfile,
  updateAffiliateHandle,
} from "../../services/campaign.api";
import {
  instagramAccountLink,
  tiktokAccountLink,
} from "../../services/socialMediaAuth.api";

export const ONBOARDING_FLAG = "onboarding_pending";

// Post-signup onboarding: show the new affiliate their link (and let them
// customize the handle once), then get their social accounts connected.
// The Instagram/TikTok OAuth callbacks always land on /u/dashboard; while
// ONBOARDING_FLAG is set, UserDashboard bounces straight back here so the
// wizard survives the round-trip.
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [hub, setHub] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [handleInput, setHandleInput] = useState("");
  const [savingHandle, setSavingHandle] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const affiliateId = hub?.affiliate_id || profile?.affiliate_id || "";
  const mainLink = `https://co2body.com/${affiliateId}`;
  const social = profile?.social_accounts;

  const loadData = async () => {
    try {
      const [profileRes, hubRes] = await Promise.all([
        getUserProfile(),
        getAffiliateProfile().catch(() => null),
      ]);
      setProfile(profileRes?.data);
      setHub(hubRes?.data);
    } catch (err) {
      console.error("Error loading onboarding data:", err);
    }
  };

  useEffect(() => {
    localStorage.setItem(ONBOARDING_FLAG, "1");
    loadData();
  }, []);

  // Returning from an Instagram/TikTok OAuth link (via the dashboard
  // bounce): surface the result and stay on the connect step.
  useEffect(() => {
    const linkResponse = searchParams.get("linkResponse");
    if (!linkResponse) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(linkResponse));
      if (parsed?.message) {
        parsed.status ? toast.success(parsed.message) : toast.error(parsed.message);
      }
    } catch (err) {
      console.error("Invalid linkResponse param", err);
    }
    setStep(2);
    navigate("/u/onboarding", { replace: true });
  }, [searchParams, navigate]);

  const copyLink = () => {
    navigator.clipboard.writeText(mainLink);
    setCopied(true);
    toast.success("Affiliate link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const saveHandle = async () => {
    const requested = handleInput.trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,32}$/.test(requested)) {
      toast.error("Use 3-32 letters, numbers, dashes or underscores.");
      return;
    }
    try {
      setSavingHandle(true);
      await updateAffiliateHandle(requested);
      toast.success("Affiliate URL updated");
      setEditing(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update the URL");
    } finally {
      setSavingHandle(false);
    }
  };

  const connectInstagram = async () => {
    try {
      const res = await instagramAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to link Instagram account");
    }
  };

  const connectTiktok = async () => {
    try {
      const res = await tiktokAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to link TikTok account");
    }
  };

  const finish = () => {
    localStorage.removeItem(ONBOARDING_FLAG);
    navigate("/u/dashboard");
  };

  const StepDot = ({ n }) => (
    <div
      className={`w-2.5 h-2.5 rounded-full ${
        step === n ? "bg-purple-600" : "bg-gray-300"
      }`}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-8">
        <img src="/icons/logoblue.svg" className="h-8 mb-6 mx-auto" alt="CO2Body" />

        <div className="flex items-center justify-center gap-2 mb-6">
          <StepDot n={1} />
          <StepDot n={2} />
        </div>

        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold text-center mb-1">
              Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-sm text-gray-500 text-center mb-6">
              This is your personal affiliate link. Every sale from content you
              share through it earns you commission.
            </p>

            <div className="border rounded-lg px-4 py-3 flex items-center justify-between gap-3 mb-2 bg-gray-50">
              <span className="text-sm font-medium break-all">
                {affiliateId ? mainLink : "Loading..."}
              </span>
              <button
                type="button"
                onClick={copyLink}
                disabled={!affiliateId}
                className="text-purple-600 hover:text-purple-700 shrink-0"
                title="Copy link"
              >
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            {Number(profile?.affiliate_id_editable) === 1 && !editing && (
              <button
                type="button"
                onClick={() => {
                  setHandleInput(affiliateId);
                  setEditing(true);
                }}
                className="text-xs text-purple-600 hover:underline mb-4"
              >
                Customize your URL
              </button>
            )}

            {editing && (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">co2body.com/</span>
                  <input
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={saveHandle}
                    disabled={savingHandle}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    {savingHandle ? "Saving..." : "Save"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  3-32 letters, numbers, dashes or underscores.
                </p>
              </div>
            )}

            {hub?.links?.length > 1 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">
                  Your link works on every campaign site:
                </p>
                <ul className="space-y-1">
                  {hub.links.map((l) => (
                    <li key={l.domain} className="text-xs text-gray-500 break-all">
                      {l.url}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hub?.coupon && (
              <div className="mb-6 border rounded-lg px-4 py-3 bg-purple-50">
                <p className="text-sm font-medium mb-1">
                  Your {hub.coupon_discount || "$500 off"} coupon
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold tracking-wide">
                    {hub.coupon}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(hub.coupon);
                      toast.success("Coupon copied");
                    }}
                    className="text-purple-600 hover:text-purple-700 shrink-0"
                    title="Copy coupon"
                  >
                    <FiCopy />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share it with your audience — it gives them{" "}
                  {hub.coupon_discount || "$500 off"} any device (
                  {hub.coupon_minimum || "$1,495 minimum order"}) on
                  carbogenetics.com, and the sale is credited to you.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 mt-2"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold text-center mb-1">
              Connect your social accounts
            </h1>
            <p className="text-sm text-gray-500 text-center mb-6">
              Connect Instagram and TikTok so CO2Body can publish your affiliate
              content straight to your accounts.
            </p>

            <div className="space-y-3 mb-6">
              <div
                className={`flex items-center w-full justify-center gap-2 border rounded-lg px-3 py-2.5 text-sm ${
                  social?.instagram?.connected
                    ? "cursor-not-allowed bg-gray-50"
                    : "cursor-pointer hover:bg-gray-50"
                }`}
                onClick={() => {
                  if (!social?.instagram?.connected) connectInstagram();
                }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                  className="w-4"
                  alt=""
                />
                {social?.instagram?.connected ? (
                  <span>
                    Instagram connected — {social.instagram.username}
                  </span>
                ) : (
                  "Connect Instagram"
                )}
              </div>

              <div
                className={`flex items-center w-full justify-center gap-2 border rounded-lg px-3 py-2.5 text-sm ${
                  social?.tiktok?.connected
                    ? "cursor-not-allowed bg-gray-50"
                    : "cursor-pointer hover:bg-gray-50"
                }`}
                onClick={() => {
                  if (!social?.tiktok?.connected) connectTiktok();
                }}
              >
                <img src="/icons/tiktok.svg" className="w-4" alt="" />
                {social?.tiktok?.connected ? (
                  <span>TikTok connected — {social.tiktok.username}</span>
                ) : (
                  "Connect TikTok"
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={finish}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2"
            >
              {social?.instagram?.connected || social?.tiktok?.connected
                ? "Finish"
                : "I'll connect later — go to my dashboard"}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={finish}
          className="w-full text-xs text-gray-400 hover:text-gray-600 mt-4"
        >
          Skip setup for now
        </button>
      </div>
    </div>
  );
}
