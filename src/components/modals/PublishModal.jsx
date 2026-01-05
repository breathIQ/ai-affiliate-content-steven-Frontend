import { useState } from "react";
import { CheckmarkIcon } from "react-hot-toast";

export default function PublishModal({ isOpen, onClose, onSubmit }) {
  const [platforms, setPlatforms] = useState({
    instagram: true,
    tiktok: false,
  });

  const [publishType, setPublishType] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    const payload = {
      platforms,
      publishType,
      scheduleDate,
    };

    console.log("Publish Payload:", payload);
    onSubmit?.(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0  bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-[600px]  rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-lg">Publish</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">×</button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
        <div className="flex justify-center">
          {/* Preview */}
          <div className="flex gap-3">
            <img
              src="https://i.pravatar.cc/120"
              className="w-[120px] h-[150px] rounded-lg object-cover"
            />
            <div className="w-[120px] h-[150px] rounded-lg bg-purple-600 text-white flex flex-col justify-center items-center text-xs p-2">
              <p className="font-semibold text-center small">
                Lorem ipsum dolor sit amet
              </p>
              <span className="mt-2 text-[10px]">CO2</span>
            </div>
          </div>
          </div>

          {/* Caption */}
          <p className="text-sm text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et
            massa mi. Aliquam in hendrerit urna. <br />
            #Hashtag01 #Hashtag02 #Hashtag03 #Hashtag04 #Hashtag05
          </p>

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

          {/* Publish When */}
          <div>
            <p className="text-sm font-medium mb-2">Publish When</p>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={publishType === "now"}
                  onChange={() => setPublishType("now")}
                />
                Publish Now
              </label>
              {/* <div className="flex justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={publishType === "schedule"}
                  onChange={() => setPublishType("schedule")}
                />
                Schedule
              </label>

              {publishType === "schedule" && (
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className=" border rounded-md px-3 py-2 text-sm"
                />
              )}

              </div> */}

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
            {publishType === "schedule" ? "Schedule" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
