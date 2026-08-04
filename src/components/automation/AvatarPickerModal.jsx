import React, { useState } from "react";

// Visual avatar picker: searchable grid of thumbnails so you can see who
// you're choosing instead of guessing from a name in a dropdown. Multi-select:
// pick one or MORE - campaigns choose one presenter at random per video, so a
// long run isn't stuck with a single face. onDone(idsArray) fires on Done.
export default function AvatarPickerModal({ avatars, selectedIds = [], onDone, onClose }) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(new Set(selectedIds.filter(Boolean)));

  const q = search.trim().toLowerCase();
  const shown = (q
    ? avatars.filter((a) => (a.avatar_name || "").toLowerCase().includes(q))
    : avatars
  ).slice(0, 96);

  const toggle = (id) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-xl shadow-lg z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Choose avatars</h2>
            <p className="text-xs text-gray-500">
              Pick one or more. With several, a random one presents each video.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="px-5 py-3 border-b">
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search avatars by name"
            className="w-full border rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="overflow-y-auto p-5 flex-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {shown.map((a) => {
              const isPicked = picked.has(a.avatar_id);
              return (
                <button
                  key={a.avatar_id}
                  onClick={() => toggle(a.avatar_id)}
                  title={a.avatar_name}
                  className={`relative rounded-lg border p-2 text-center hover:border-purple-400 ${
                    isPicked ? "border-purple-600 ring-2 ring-purple-200" : "border-gray-200"
                  }`}
                >
                  {isPicked && (
                    <span className="absolute top-1 right-1 bg-purple-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      ✓
                    </span>
                  )}
                  {a.preview_image_url ? (
                    <img
                      src={a.preview_image_url}
                      alt={a.avatar_name}
                      loading="lazy"
                      className="w-full aspect-[3/4] object-cover rounded-md bg-gray-100"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      no preview
                    </div>
                  )}
                  <span className="block text-[11px] mt-1 text-gray-700 truncate">
                    {a.avatar_name || a.avatar_id}
                  </span>
                  {a.is_my_avatar && (
                    <span className="block text-[10px] text-purple-600">My avatar</span>
                  )}
                </button>
              );
            })}
          </div>
          {shown.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No avatars match that search.</p>
          )}
        </div>

        {(() => {
          // Many catalog entries are different LOOKS of the same person
          // ("Sofia", "Sofia - Studio Host..."). Picking five Sofias reads as
          // variety in the grid but is the same face in every video - warn.
          const personOf = (a) => ((a.avatar_name || "").split(/[-(]/)[0].trim().toLowerCase() || a.avatar_id);
          const pickedAvatars = avatars.filter((a) => picked.has(a.avatar_id));
          const counts = {};
          pickedAvatars.forEach((a) => {
            const p = personOf(a);
            counts[p] = (counts[p] || 0) + 1;
          });
          const dupes = Object.entries(counts).filter(([, n]) => n > 1);
          if (!dupes.length) return null;
          return (
            <div className="px-5 py-2 border-t bg-amber-50 text-[11px] text-amber-700">
              Heads up: {dupes.map(([p, n]) => `${n} of your picks are the same person (${p})`).join("; ")}.
              Different looks of one avatar are still the same face on screen.
            </div>
          );
        })()}

        <div className="flex items-center justify-between px-5 py-3 border-t">
          <button
            onClick={() => setPicked(new Set())}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            Clear selection
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDone([...picked]);
                onClose();
              }}
              className="bg-purple-700 text-white py-2 px-4 rounded-lg text-sm"
            >
              Done{picked.size ? ` (${picked.size} selected)` : " (none)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
