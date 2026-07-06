import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Layout/Layout";
import {
  getAvatars,
  toggleFavoriteAvatar,
  createPhotoAvatar,
  getPhotoAvatars,
  deletePhotoAvatar,
} from "../../services/heygen.api";
import toast from "react-hot-toast";

const PAGE_SIZE = 24;

export default function Avatars() {
  const [avatars, setAvatars] = useState([]);
  const [myFavoriteIds, setMyFavoriteIds] = useState(new Set());
  const [globalFavoriteIds, setGlobalFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // Catalog tabs - mirrors HeyGen's categories. Filters client-side on
  // the group_type each avatar carries (stock avatars have none).
  const [tab, setTab] = useState("all");
  const TABS = [
    { id: "all", label: "All" },
    { id: "mine", label: "My Avatars" },
    { id: "public", label: "Public" },
    { id: "ugc", label: "UGC" },
    { id: "community", label: "Community" },
    { id: "studio", label: "Studio" },
  ];
  const matchesTab = (a) => {
    if (tab === "mine") return !!a.is_my_avatar;
    if (tab === "public") return a.group_type === "PUBLIC";
    if (tab === "ugc") return a.group_type === "PUBLIC_PHOTO";
    if (tab === "community") return a.group_type === "COMMUNITY_PHOTO";
    if (tab === "studio") return !a.group_id;
    return true;
  };

  // Selfie -> personal avatar: this user's own uploads (max 3 live).
  const [myPhotoAvatars, setMyPhotoAvatars] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createFile, setCreateFile] = useState(null);
  const [createPreview, setCreatePreview] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [creating, setCreating] = useState(false);
  const pollRef = useRef(null);

  const refreshPhotoAvatars = async () => {
    try {
      const res = await getPhotoAvatars();
      const list = res?.data || [];
      setMyPhotoAvatars(list);

      // Keep polling only while something is still processing.
      if (list.some((a) => a.status === "pending")) {
        clearTimeout(pollRef.current);
        pollRef.current = setTimeout(refreshPhotoAvatars, 5000);
      }
      return list;
    } catch (error) {
      console.error("GET PHOTO AVATARS ERROR ❌", error);
      return [];
    }
  };

  useEffect(() => {
    refreshPhotoAvatars();
    return () => clearTimeout(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitCreateAvatar = async () => {
    if (!createName.trim()) return toast.error("Give your avatar a name");
    if (!createFile) return toast.error("Choose a photo");
    if (!consentChecked) return toast.error("Please confirm you have the right to use this photo");

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("name", createName.trim());
      formData.append("photo", createFile);
      formData.append("consent", "1");
      const res = await createPhotoAvatar(formData);

      if (!res?.success) {
        toast.error(res?.messages?.join(", ") || res?.message || "Could not create the avatar");
        return;
      }

      toast.success("Avatar is being created - it usually takes under a minute.");
      setCreateOpen(false);
      setCreateName("");
      setCreateFile(null);
      setCreatePreview(null);
      setConsentChecked(false);
      refreshPhotoAvatars();
    } catch (error) {
      console.error("CREATE PHOTO AVATAR ERROR ❌", error);
      toast.error(error?.response?.data?.message || error?.response?.data?.messages?.join?.(", ") || "Could not create the avatar");
    } finally {
      setCreating(false);
    }
  };

  const removePhotoAvatar = async (avatar) => {
    if (!window.confirm(`Delete the avatar "${avatar.name}"? Videos already made with it are unaffected.`)) return;
    try {
      await deletePhotoAvatar(avatar.id);
      toast.success("Avatar deleted");
      refreshPhotoAvatars();
    } catch (error) {
      console.error("DELETE PHOTO AVATAR ERROR ❌", error);
      toast.error("Could not delete the avatar");
    }
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      setLoading(true);
      try {
        const res = await getAvatars();
        setAvatars(res?.data?.all || []);
        setMyFavoriteIds(new Set((res?.data?.personal_favorites || []).map((a) => a.avatar_id)));
        setGlobalFavoriteIds((res?.data?.global_favorites || []).map((a) => a.avatar_id));
      } catch (error) {
        console.error("GET AVATARS ERROR ❌", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  const handleToggleFavorite = async (e, avatar) => {
    e.stopPropagation();
    const wasFavorited = myFavoriteIds.has(avatar.avatar_id);

    // Optimistic update - toggling favorites should feel instant while
    // browsing a list of 1000+ avatars.
    setMyFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(avatar.avatar_id);
      else next.add(avatar.avatar_id);
      return next;
    });

    try {
      await toggleFavoriteAvatar(avatar);
    } catch (error) {
      console.error("TOGGLE FAVORITE ERROR ❌", error);
      toast.error("Could not update favorite");
      setMyFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.add(avatar.avatar_id);
        else next.delete(avatar.avatar_id);
        return next;
      });
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const inTab = tab === "all" ? avatars : avatars.filter(matchesTab);
    const base = query ? inTab.filter((a) => a.avatar_name.toLowerCase().includes(query)) : inTab;

    // Priority order, regardless of search: my own favorites first, then
    // whatever's popular across everyone else, then the rest.
    const mine = base.filter((a) => myFavoriteIds.has(a.avatar_id));
    const mineIds = new Set(mine.map((a) => a.avatar_id));
    const globalOrder = new Map(globalFavoriteIds.map((id, i) => [id, i]));
    const popular = base
      .filter((a) => !mineIds.has(a.avatar_id) && globalOrder.has(a.avatar_id))
      .sort((a, b) => globalOrder.get(a.avatar_id) - globalOrder.get(b.avatar_id));
    const popularIds = new Set(popular.map((a) => a.avatar_id));
    const rest = base.filter((a) => !mineIds.has(a.avatar_id) && !popularIds.has(a.avatar_id));

    return { items: [...mine, ...popular, ...rest], mineCount: mine.length, popularCount: popular.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatars, search, tab, myFavoriteIds, globalFavoriteIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.items.length / PAGE_SIZE));
  const pageItems = filtered.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageOffset = (page - 1) * PAGE_SIZE;

  useEffect(() => {
    setPage(1);
  }, [search, tab]);

  const renderStar = (avatar) => {
    const isFavorited = myFavoriteIds.has(avatar.avatar_id);
    return (
      <button
        onClick={(e) => handleToggleFavorite(e, avatar)}
        title={isFavorited ? "Remove from my favorites" : "Add to my favorites"}
        className="absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition"
      >
        <span className={isFavorited ? "text-yellow-400" : "text-gray-300"}>★</span>
      </button>
    );
  };

  const sectionLabelForIndex = (indexOnPage) => {
    const absoluteIndex = pageOffset + indexOnPage;
    if (search.trim()) return null;
    if (absoluteIndex === 0 && filtered.mineCount > 0) return "My Favorites";
    if (absoluteIndex === filtered.mineCount && filtered.popularCount > 0) return "Popular";
    if (absoluteIndex === filtered.mineCount + filtered.popularCount && filtered.items.length > filtered.mineCount + filtered.popularCount)
      return "All Avatars";
    return null;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Avatars</h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse every HeyGen avatar available for your videos. Click one to preview a sample, or star your
              personal favorites. The avatars everyone favorites the most rise to the top for the whole team.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-purple-600 text-white py-[10px] px-[16px] rounded-lg text-sm"
          >
            Create My Avatar
          </button>
        </div>

        {myPhotoAvatars.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-2">My Uploaded Avatars ({myPhotoAvatars.length}/3)</p>
            <div className="flex flex-wrap gap-3">
              {myPhotoAvatars.map((a) => (
                <div key={a.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                  {a.preview_image_url ? (
                    <img src={a.preview_image_url} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.name}</p>
                    {a.status === "pending" && <p className="text-xs text-amber-600">Processing...</p>}
                    {a.status === "ready" && <p className="text-xs text-green-600">Ready to use</p>}
                    {a.status === "failed" && (
                      <p className="text-xs text-red-600" title={a.error_message || ""}>
                        Failed{a.error_message ? ` - ${a.error_message}` : ""}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removePhotoAvatar(a)}
                    className="text-xs text-gray-400 hover:text-red-500 ml-1"
                    title="Delete this avatar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-[6px] px-[14px] rounded-full text-sm border transition ${
                tab === t.id
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "border-gray-300 text-gray-600 hover:border-purple-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search avatars by name..."
          className="w-full max-w-md border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {loading && <p className="text-sm text-gray-500">Loading avatars...</p>}

        {!loading && filtered.items.length === 0 && (
          <p className="text-sm text-gray-500">No avatars found.</p>
        )}

        {!loading && filtered.items.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pageItems.map((avatar, index) => {
                const label = sectionLabelForIndex(index);
                return (
                  <Fragment key={avatar.avatar_id}>
                    {label && (
                      <p className="col-span-full text-xs font-medium text-gray-400 uppercase mt-2">{label}</p>
                    )}
                    <div className="relative group text-left bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                      {renderStar(avatar)}
                      <button onClick={() => setPreviewAvatar(avatar)} className="block w-full text-left">
                        <div className="aspect-square w-full overflow-hidden bg-gray-100">
                          <img
                            src={avatar.preview_image_url}
                            alt={avatar.avatar_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{avatar.avatar_name}</p>
                        </div>
                      </button>
                    </div>
                  </Fragment>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="py-[8px] px-[14px] rounded-lg text-sm border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="py-[8px] px-[14px] rounded-lg text-sm border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {createOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => !creating && setCreateOpen(false)}
        >
          <div
            className="bg-white rounded-xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold text-lg">Create your own avatar</h2>
            <p className="text-sm text-gray-500">
              Upload a clear, front-facing photo of yourself and we'll turn it into an avatar you can use in
              videos. Good light, one face, no sunglasses.
            </p>

            <div>
              <label className="text-sm font-medium mb-1 block">Avatar name</label>
              <input
                type="text"
                value={createName}
                maxLength={60}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. My presenter"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Photo</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setCreateFile(file);
                  setCreatePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full text-sm"
              />
              {createPreview && (
                <img src={createPreview} alt="Preview" className="mt-2 w-24 h-24 rounded-lg object-cover border" />
              )}
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="accent-[#7239EA] mt-0.5 w-[15.75px] h-[15.75px]"
              />
              <span>
                I confirm this photo is of me, or of someone who has authorized me to create an avatar with
                their likeness.
              </span>
            </label>

            <p className="text-xs text-gray-400">You can have up to 3 avatars. Photos are reviewed automatically and may be rejected.</p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setCreateOpen(false)}
                disabled={creating}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submitCreateAvatar}
                disabled={creating}
                className="px-4 py-2 text-sm rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Avatar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewAvatar && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewAvatar(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={previewAvatar.avatar_id}
              src={previewAvatar.preview_video_url}
              poster={previewAvatar.preview_image_url}
              controls
              autoPlay
              className="w-full aspect-[9/16] bg-black object-contain"
            />
            <div className="p-4 flex items-center justify-between">
              <p className="font-medium text-gray-900">{previewAvatar.avatar_name}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => handleToggleFavorite(e, previewAvatar)}
                  className="text-sm flex items-center gap-1"
                >
                  <span className={myFavoriteIds.has(previewAvatar.avatar_id) ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                  {myFavoriteIds.has(previewAvatar.avatar_id) ? "Favorited" : "Favorite"}
                </button>
                <button
                  onClick={() => setPreviewAvatar(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
