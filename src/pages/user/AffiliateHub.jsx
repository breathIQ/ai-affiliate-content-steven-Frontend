import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import {
  getAffiliateProfile,
  claimAffiliateCoupon,
  updateAffiliateHandle,
} from "../../services/campaign.api";

// The affiliate's hub: their handle, share links, and their discount coupon.
// The coupon lives on carbogenetics.com (that's where it redeems and where the
// sale gets credited back to them); here they just choose the code.

const Copyable = ({ label, value }) => {
  const copy = () => {
    navigator.clipboard?.writeText(value);
    toast.success("Copied");
  };
  return (
    <div className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2 bg-gray-50">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 truncate">{value}</p>
      </div>
      <button onClick={copy} className="text-xs px-3 py-1 rounded-lg border shrink-0 hover:bg-white">
        Copy
      </button>
    </div>
  );
};

const AffiliateHub = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [handle, setHandle] = useState("");
  const [editingHandle, setEditingHandle] = useState(false);
  const [savingHandle, setSavingHandle] = useState(false);

  const load = async () => {
    try {
      const res = await getAffiliateProfile();
      setData(res.data);
      setCode(res.data?.coupon || "");
      setHandle(res.data?.affiliate_id || "");
    } catch {
      toast.error("Could not load your affiliate details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await claimAffiliateCoupon(code.trim());
      setData((d) => ({ ...d, coupon: res.data.coupon, coupon_status: res.data.coupon_status }));
      toast.success("Your coupon is live");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save your coupon.");
    } finally {
      setSaving(false);
    }
  };

  const saveHandle = async () => {
    setSavingHandle(true);
    try {
      const res = await updateAffiliateHandle(handle.trim().toLowerCase());
      // The share links all embed the handle, so re-fetch rather than patch
      // them by hand and risk showing a link that no longer matches.
      await load();
      setEditingHandle(false);
      toast.success(res?.message || "Your handle is updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not change your handle.");
    } finally {
      setSavingHandle(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">Loading…</div>
      </Layout>
    );
  }
  if (!data) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">Could not load your affiliate details.</div>
      </Layout>
    );
  }

  const hasCoupon = !!data.coupon;
  const changed = code.trim().toUpperCase() !== (data.coupon || "").toUpperCase();
  const handleChanged =
    handle.trim().toLowerCase() !== (data.affiliate_id || "").toLowerCase() && handle.trim() !== "";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 min-h-screen">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Your affiliate details</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your links and discount code. Anyone who buys through these is credited to you.
        </p>

        {/* Identity */}
        <div className="bg-white border rounded-xl p-5 mb-5 space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase">Your affiliate ID</p>

          {editingHandle ? (
            <div className="rounded-lg border bg-gray-50 px-4 py-3">
              <label className="block text-xs text-gray-500 mb-1">Handle (used in all your links)</label>
              <div className="flex gap-2">
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="e.g. steven"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={saveHandle}
                  disabled={savingHandle || !handleChanged}
                  className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  {savingHandle ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditingHandle(false);
                    setHandle(data.affiliate_id || "");
                  }}
                  className="px-3 py-2 rounded-lg border text-sm"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                3-32 letters, numbers, dashes or underscores. Your links become{" "}
                <span className="font-mono">co2.education/{handle.trim().toLowerCase() || "…"}</span>.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Posts you already published keep working. Your old handle stays pointed at you, so
                nothing you have shared stops earning.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <Copyable label="Handle (used in all your links)" value={data.affiliate_id} />
              </div>
              <button
                onClick={() => setEditingHandle(true)}
                className="text-xs px-3 py-1 rounded-lg border shrink-0 hover:bg-white mt-6"
              >
                Change
              </button>
            </div>
          )}

          {data.previous_handles?.length > 0 && (
            <p className="text-xs text-gray-400">
              Also still yours (from older posts): {data.previous_handles.join(", ")}
            </p>
          )}

          {data.has_ref_code ? (
            <Copyable label="carbogenetics.com referral code" value={data.ref_code} />
          ) : (
            <p className="text-xs text-amber-600">
              Your carbogenetics.com affiliate account is still being linked. Your links will start earning
              commission automatically once it is.
            </p>
          )}
        </div>

        {/* Coupon */}
        <div className="bg-white border rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-gray-500 uppercase">Your discount code</p>
            {hasCoupon && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Live</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Pick a code your audience will remember. It gives them{" "}
            <strong>{data.coupon_discount}</strong> ({data.coupon_minimum}) and credits the sale to you. It gets
            added to the posts you generate, and to emails sent to leads you bring in.
          </p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ALEX500"
              maxLength={24}
              className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={save}
              disabled={saving || !code.trim() || !changed}
              className="bg-purple-700 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : hasCoupon ? "Update code" : "Create code"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            4–24 letters, numbers, dashes or underscores. Changing it replaces your old code everywhere.
          </p>
        </div>

        {/* Links */}
        <div className="bg-white border rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase mb-3">Your share links</p>
          <div className="space-y-2">
            {(data.links ?? []).map((l) => (
              <Copyable key={l.domain} label={l.campaign} value={l.url} />
            ))}
            {data.book_url && <Copyable label="The Carbonated Body (book)" value={data.book_url} />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AffiliateHub;
