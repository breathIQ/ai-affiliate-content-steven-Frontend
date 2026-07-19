import { useEffect, useMemo, useState } from "react";

// Visual avatar picker. The catalog runs to thousands of entries, which is
// unusable as a <select> - you cannot see who you are choosing. This shows the
// preview images, defaults to the avatars that are actually yours, and only
// renders a page at a time so a 4,000-entry list stays responsive.

const PAGE_SIZE = 60;

const TABS = [
  { key: "mine", label: "My avatars" },
  { key: "favorites", label: "Favorites" },
  { key: "all", label: "All" },
];

const AvatarPickerModal = ({ isOpen, onClose, avatars = [], selectedId, onSelect }) => {
  const [tab, setTab] = useState("mine");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Start on whichever tab actually has something in it.
  useEffect(() => {
    if (!isOpen) return;
    const mine = avatars.filter((a) => a.is_my_avatar).length;
    setTab(mine > 0 ? "mine" : "all");
    setSearch("");
    setVisible(PAGE_SIZE);
  }, [isOpen, avatars]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return avatars.filter((a) => {
      if (tab === "mine" && !a.is_my_avatar) return false;
      if (tab === "favorites" && !a.is_favorite) return false;
      if (!term) return true;
      return String(a.avatar_name || a.name || "").toLowerCase().includes(term);
    });
  }, [avatars, tab, search]);

  useEffect(() => setVisible(PAGE_SIZE), [tab, search]);

  if (!isOpen) return null;

  const shown = filtered.slice(0, visible);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative flex max-h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-lg animate-scaleIn">
        <div className="border-b p-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Choose an avatar</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 text-2xl leading-none text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full px-3 py-1 text-sm ${
                  tab === t.key
                    ? "bg-gray-900 text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="ml-auto w-full rounded-lg border px-3 py-1.5 text-sm sm:w-64"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No avatars match “{search}”.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {shown.map((a) => {
                const isSelected = a.avatar_id === selectedId;
                return (
                  <button
                    key={a.avatar_id}
                    type="button"
                    onClick={() => {
                      onSelect(a);
                      onClose();
                    }}
                    className={`group overflow-hidden rounded-lg border text-left transition ${
                      isSelected
                        ? "border-gray-900 ring-2 ring-gray-900"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="aspect-[3/4] w-full bg-gray-100">
                      {a.preview_image_url ? (
                        <img
                          src={a.preview_image_url}
                          alt={a.avatar_name || a.avatar_id}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          No preview
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-gray-800">
                        {a.avatar_name || a.name || a.avatar_id}
                      </p>
                      {a.premium && <p className="text-[11px] text-amber-600">Premium</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {filtered.length > visible && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Show more ({filtered.length - visible} remaining)
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t p-4">
          <span className="text-xs text-gray-500">
            {filtered.length} avatar{filtered.length === 1 ? "" : "s"}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                onClose();
              }}
              className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerModal;
