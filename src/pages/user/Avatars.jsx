import { Fragment, useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout/Layout";
import { getAvatars, toggleFavoriteAvatar } from "../../services/heygen.api";
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
    const base = query ? avatars.filter((a) => a.avatar_name.toLowerCase().includes(query)) : avatars;

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
  }, [avatars, search, myFavoriteIds, globalFavoriteIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.items.length / PAGE_SIZE));
  const pageItems = filtered.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageOffset = (page - 1) * PAGE_SIZE;

  useEffect(() => {
    setPage(1);
  }, [search]);

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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Avatars</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse every HeyGen avatar available for your videos. Click one to preview a sample, or star your
            personal favorites. The avatars everyone favorites the most rise to the top for the whole team.
          </p>
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
