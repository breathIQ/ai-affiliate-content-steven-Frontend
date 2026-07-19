import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import {
  adminGetCampaigns,
  adminUpdateCampaign,
  adminGetCopyItems,
  adminCreateCopyItem,
  adminUpdateCopyItem,
  adminDeleteCopyItem,
  adminApproveCopyItem,
  adminGetCampaignAssets,
  adminUploadCampaignAsset,
  adminSetCurrentAsset,
  adminDeleteCampaignAsset,
} from "../../services/campaign.api";

const KIND_LABELS = {
  claim: "Claim",
  product_fact: "Product fact",
  safety_copy: "Safety copy",
  resource: "Resource",
  comparison: "Comparison",
};

const CampaignContent = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("copy"); // copy | assets | settings
  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newItem, setNewItem] = useState({ kind: "claim", risk_level: "green", body: "", code: "" });
  const [editing, setEditing] = useState(null); // { id, kind, risk_level, body } | null

  const activeCampaign = campaigns.find((c) => c.id === activeId) || null;

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await adminGetCampaigns();
      const list = res?.data ?? [];
      setCampaigns(list);
      if (list.length && activeId == null) setActiveId(list[0].id);
    } catch {
      toast.error("Could not load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  const loadCopy = async (campaignId) => {
    try {
      const res = await adminGetCopyItems({ campaign_id: campaignId, include_global: true });
      setItems(res?.data ?? []);
    } catch {
      toast.error("Could not load copy items.");
    }
  };

  const loadAssets = async (campaignId) => {
    try {
      const res = await adminGetCampaignAssets(campaignId);
      setAssets(res?.data ?? []);
    } catch {
      toast.error("Could not load assets.");
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (activeId == null) return;
    loadCopy(activeId);
    loadAssets(activeId);
  }, [activeId]);

  const addItem = async () => {
    if (!newItem.body || !newItem.code) {
      toast.error("Code and body are required.");
      return;
    }
    try {
      await adminCreateCopyItem({
        campaign_id: activeId,
        kind: newItem.kind,
        risk_level: newItem.kind === "claim" ? newItem.risk_level : null,
        body: newItem.body,
        code: newItem.code,
        status: "draft",
      });
      toast.success("Item added (draft).");
      setNewItem({ kind: "claim", risk_level: "green", body: "", code: "" });
      loadCopy(activeId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not add item.");
    }
  };

  const approveItem = async (id) => {
    try {
      await adminApproveCopyItem(id);
      toast.success("Approved.");
      loadCopy(activeId);
    } catch {
      toast.error("Approve failed.");
    }
  };

  const startEdit = (item) => {
    setEditing({
      id: item.id,
      kind: item.kind,
      risk_level: item.risk_level || "green",
      body: item.body,
    });
  };

  const saveEdit = async () => {
    if (!editing.body?.trim()) {
      toast.error("Body can't be empty.");
      return;
    }
    try {
      await adminUpdateCopyItem(editing.id, {
        kind: editing.kind,
        risk_level: editing.kind === "claim" ? editing.risk_level : null,
        body: editing.body,
      });
      toast.success("Saved.");
      setEditing(null);
      loadCopy(activeId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed.");
    }
  };

  const archiveItem = async (item) => {
    try {
      await adminUpdateCopyItem(item.id, { status: "archived" });
      loadCopy(activeId);
    } catch {
      toast.error("Update failed.");
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await adminDeleteCopyItem(id);
      loadCopy(activeId);
    } catch {
      toast.error("Delete failed.");
    }
  };

  const uploadAsset = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", activeCampaign?.image_asset_kind || "product");
    fd.append("is_current", "true");
    try {
      await adminUploadCampaignAsset(activeId, fd);
      toast.success("Image uploaded.");
      loadAssets(activeId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed.");
    }
    e.target.value = "";
  };

  const setCurrent = async (assetId) => {
    try {
      await adminSetCurrentAsset(activeId, assetId);
      loadAssets(activeId);
    } catch {
      toast.error("Update failed.");
    }
  };

  const deleteAsset = async (assetId) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await adminDeleteCampaignAsset(activeId, assetId);
      loadAssets(activeId);
    } catch {
      toast.error("Delete failed.");
    }
  };

  const toggleActive = async () => {
    try {
      await adminUpdateCampaign(activeId, { is_active: !activeCampaign.is_active });
      toast.success(activeCampaign.is_active ? "Campaign deactivated." : "Campaign activated.");
      loadCampaigns();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed.");
    }
  };

  const toggleAlwaysReview = async () => {
    try {
      await adminUpdateCampaign(activeId, { always_review: !activeCampaign.always_review });
      loadCampaigns();
    } catch {
      toast.error("Update failed.");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 min-h-screen">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Campaign Content</h1>
        <p className="text-sm text-gray-500 mb-6">
          Approved claims, product facts, safety copy, and official images per campaign. Nothing is usable by the
          generator until you approve it.
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap mb-6">
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`px-4 py-2 rounded-lg text-sm border ${
                    c.id === activeId ? "bg-purple-700 text-white border-purple-700" : "bg-white text-gray-700"
                  }`}
                >
                  {c.name} {c.is_active ? "" : "· off"}
                </button>
              ))}
            </div>

            {activeCampaign && (
              <>
                <div className="flex gap-4 border-b mb-4">
                  {["copy", "assets", "settings"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`pb-2 text-sm capitalize ${
                        tab === t ? "border-b-2 border-purple-700 text-purple-700 font-medium" : "text-gray-500"
                      }`}
                    >
                      {t === "copy" ? "Approved copy" : t}
                    </button>
                  ))}
                </div>

                {tab === "copy" && (
                  <>
                    <div className="bg-white border rounded-xl p-4 mb-6">
                      <p className="text-sm font-medium mb-3">Add an item</p>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <select
                          value={newItem.kind}
                          onChange={(e) => setNewItem({ ...newItem, kind: e.target.value })}
                          className="border rounded-lg px-3 py-2 text-sm"
                        >
                          {Object.entries(KIND_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                        {newItem.kind === "claim" && (
                          <select
                            value={newItem.risk_level}
                            onChange={(e) => setNewItem({ ...newItem, risk_level: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="green">Green</option>
                            <option value="yellow">Yellow</option>
                          </select>
                        )}
                        <input
                          value={newItem.code}
                          onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                          placeholder="Code e.g. CLM-INH-010"
                          className="border rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <textarea
                        value={newItem.body}
                        onChange={(e) => setNewItem({ ...newItem, body: e.target.value })}
                        rows={2}
                        placeholder="Exact approved wording"
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-3"
                      />
                      <div className="flex justify-end mt-3">
                        <button onClick={addItem} className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                          Add draft
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {items.map((item) =>
                        editing?.id === item.id ? (
                          <div key={item.id} className="bg-white border-2 border-purple-300 rounded-lg p-3">
                            <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
                              <span className="font-mono text-gray-500">{item.code}</span>
                              <span className="text-gray-400">editing</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">Kind</label>
                                <select
                                  value={editing.kind}
                                  onChange={(e) => setEditing({ ...editing, kind: e.target.value })}
                                  className="w-full border rounded-lg px-3 py-2 text-sm"
                                >
                                  {Object.entries(KIND_LABELS).map(([v, l]) => (
                                    <option key={v} value={v}>
                                      {l}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {editing.kind === "claim" && (
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Risk level</label>
                                  <select
                                    value={editing.risk_level}
                                    onChange={(e) => setEditing({ ...editing, risk_level: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                  >
                                    <option value="green">Green (usable freely)</option>
                                    <option value="yellow">Yellow (exact wording + forces review)</option>
                                  </select>
                                </div>
                              )}
                            </div>
                            <textarea
                              value={editing.body}
                              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                              rows={3}
                              className="w-full border rounded-lg px-3 py-2 text-sm mt-3"
                            />
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                onClick={() => setEditing(null)}
                                className="text-xs px-3 py-1 rounded-lg border text-gray-600"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEdit}
                                className="text-xs px-3 py-1 rounded-lg bg-purple-700 text-white"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div key={item.id} className="bg-white border rounded-lg p-3 flex justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="font-mono text-gray-500">{item.code}</span>
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  {KIND_LABELS[item.kind]}
                                </span>
                                {item.risk_level && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full ${
                                      item.risk_level === "yellow"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {item.risk_level}
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded-full ${
                                    item.status === "approved"
                                      ? "bg-green-100 text-green-700"
                                      : item.status === "archived"
                                      ? "bg-gray-100 text-gray-500"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {item.status}
                                </span>
                                {item.campaign_id == null && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">global</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{item.body}</p>
                            </div>
                            <div className="flex items-start gap-2 shrink-0">
                              <button
                                onClick={() => startEdit(item)}
                                className="text-xs px-3 py-1 rounded-lg border text-purple-700 border-purple-300"
                              >
                                Edit
                              </button>
                              {item.status !== "approved" && (
                                <button
                                  onClick={() => approveItem(item.id)}
                                  className="text-xs px-3 py-1 rounded-lg bg-green-600 text-white"
                                >
                                  Approve
                                </button>
                              )}
                              {item.status !== "archived" && (
                                <button
                                  onClick={() => archiveItem(item)}
                                  className="text-xs px-3 py-1 rounded-lg border text-gray-600"
                                >
                                  Archive
                                </button>
                              )}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-xs px-3 py-1 rounded-lg border border-red-300 text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )
                      )}
                      {items.length === 0 && <p className="text-sm text-gray-400">No copy items yet.</p>}
                    </div>
                  </>
                )}

                {tab === "assets" && (
                  <div>
                    <div className="mb-4">
                      <label className="inline-block bg-purple-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer">
                        Upload official image
                        <input type="file" accept="image/*" onChange={uploadAsset} className="hidden" />
                      </label>
                      <p className="text-xs text-gray-400 mt-2">
                        The current image is attached, unaltered, to every post for this campaign.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {assets.map((a) => (
                        <div
                          key={a.id}
                          className={`border rounded-xl p-2 ${a.is_current ? "border-green-500" : ""}`}
                        >
                          <img src={a.url} alt={a.alt_text || ""} className="w-full h-40 object-cover rounded-lg" />
                          <p className="text-xs font-mono text-gray-500 mt-2">{a.asset_key}</p>
                          <p className="text-xs text-gray-400">{a.kind}</p>
                          <div className="flex gap-2 mt-2">
                            {!a.is_current && (
                              <button
                                onClick={() => setCurrent(a.id)}
                                className="text-xs px-2 py-1 rounded border text-gray-600"
                              >
                                Set current
                              </button>
                            )}
                            {a.is_current && <span className="text-xs text-green-600">Current</span>}
                            <button
                              onClick={() => deleteAsset(a.id)}
                              className="text-xs px-2 py-1 rounded border border-red-300 text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      {assets.length === 0 && <p className="text-sm text-gray-400">No images uploaded.</p>}
                    </div>
                  </div>
                )}

                {tab === "settings" && (
                  <div className="bg-white border rounded-xl p-5 space-y-4 max-w-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Active</p>
                        <p className="text-xs text-gray-400">Affiliates can generate posts for this campaign.</p>
                      </div>
                      <button
                        onClick={toggleActive}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          activeCampaign.is_active ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {activeCampaign.is_active ? "Active" : "Off"}
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Always review</p>
                        <p className="text-xs text-gray-400">Hold every post for review, not just flagged ones.</p>
                      </div>
                      <button
                        onClick={toggleAlwaysReview}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          activeCampaign.always_review ? "bg-amber-600 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {activeCampaign.always_review ? "On" : "Off"}
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      Domain: {activeCampaign.domain} · Destination: {activeCampaign.destination_path}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default CampaignContent;
