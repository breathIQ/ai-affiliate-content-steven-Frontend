import { useState } from "react";
import { CheckmarkIcon } from "react-hot-toast";

export default function PublishModal({
  isOpen,
  onClose,
  onSubmit,
  preview,
}) {
  const [platforms, setPlatforms] = useState({
    instagram: true,
    tiktok: false,
  });

  const [reviewLink, setReviewLink] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      platforms,
      reviewLink,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-[600px] rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-lg">Publish</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex justify-center">
            <div className="flex gap-3">
              {preview.media?.map((file, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(file)}
                  className="w-[120px] h-[150px] rounded-lg object-cover"
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {preview.caption}
            <br />
            {preview.hashtags.map((t, i) => (
              <span key={i}>
                #{t.replace("#", "")}{" "}
              </span>
            ))}
          </p>

          {/* Review Link */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Review Link
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={reviewLink}
              onChange={(e) => setReviewLink(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Publish To */}
          <div>
            <p className="text-sm font-medium mb-2">Publish To:</p>

            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={platforms.instagram}
                    onChange={() =>
                      setPlatforms((p) => ({
                        ...p,
                        instagram: !p.instagram,
                      }))
                    }
                  />
                  <span>Instagram</span>
                </div>

                <div className="flex items-center border px-2 py-1 rounded-md gap-1 text-sm">
                  <img src="/icons/insta.svg" className="w-4" />
                  @johndoe
                  <CheckmarkIcon className="text-green-500" size={14} />
                </div>
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={platforms.tiktok}
                    onChange={() =>
                      setPlatforms((p) => ({
                        ...p,
                        tiktok: !p.tiktok,
                      }))
                    }
                  />
                  <span>TikTok</span>
                </div>

                <button className="text-sm border px-2 py-1 rounded-md flex items-center gap-1">
                  <img src="/icons/tiktok.svg" className="w-4" />
                  Connect TikTok
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-gray-800 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-md bg-purple-600 text-white"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
