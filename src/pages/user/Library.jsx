import { useState } from "react";
// import Modal from "./Modal";
import Layout from "../../components/Layout/Layout";
import PublishModal from "../../components/modals/PublishModal";
import { Link } from "react-router-dom";

export default function DraftPostPage() {
  const [mediaType, setMediaType] = useState("carousel");
  const [files, setFiles] = useState([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([0, 1, 2, 3]);
  const [open, setOpen] = useState(false);

  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState([
    "Hashtag #01",
    "Hashtag #02",
    "Hashtag #03",
    "Hashtag #04",
    "Hashtag #05",
    "Hashtag #06",
    "Hashtag #07",
    "Hashtag #08",
    "Hashtag #09",
  ]);
  const [script, setScript] = useState("");

  const toggleMedia = (index) => {
    setSelectedMedia((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const captionWords = caption.trim().split(/\s+/).filter(Boolean).length;
  const scriptWords = script.trim().split(/\s+/).filter(Boolean).length;

  const uploadFiles = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{title}</h2>
            <button onClick={onClose}>✕</button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className=" max-w-7xl mx-auto min-h-screen">
        <div className="bg-white rounded-xl p-6 space-y-6">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-center gap-3">
              {/* <span>Back To Library</span> */}
              <Link to={"/users/labs"}
                // onClick={() => setIsOpen(true)}
                className="border bg-white text-dark py-[10px] px-[16px] flex align-center gap-2 rounded-lg text-sm"
              >
                <img src="/icons/folderback.svg" />
                Back To Library
              </Link>

              <h1 className="font-semibold">Post Preview</h1>
            </div>
            <div className="flex gap-2">
              <button
                // onClick={() => setScheduleOpen(true)}
                className=" rounded-lg flex align-center gap-2"
              >
                <img src="/icons/ic-bin.svg" /> 
              </button>
              <button
                onClick={() => setPublishOpen(true)}
                className="bg-pink-500 text-white py-[10px] px-[16px] rounded-lg flex align-center gap-2"
              >
                <img src="/icons/ic-add.svg" /> Publish
              </button>
            </div>
          </div>

          {/* MEDIA TYPE */}
          <div className="flex gap-6 text-sm">
            <label className="flex gap-2">
              <input
                type="radio"
                checked={mediaType === "single"}
                onChange={() => setMediaType("single")}
              />
              Single Media
            </label>
            <label className="flex gap-2">
              <input
                type="radio"
                checked={mediaType === "carousel"}
                onChange={() => setMediaType("carousel")}
              />
              Carousel
            </label>
          </div>

          {/* MEDIA GRID */}
          <div className="flex gap-4 flex-wrap">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-200"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 rounded">
                  {index + 1}/{files.length}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 rounded"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* UPLOAD */}
            <label className="w-28 h-28 border border-dashed rounded-lg flex items-center justify-center cursor-pointer text-sm text-gray-500">
              + Upload
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={uploadFiles}
              />
            </label>
          </div>

          {/* Chapter + AI */}
          <div className="flex justify-between text-sm text-gray-600">
            <p>
              <span className="font-medium">Chapter:</span> Ch-1 : Lorem ipsum
              dolor sit amet.
            </p>
            <p>
              <span className="font-medium">AI Model:</span> ChatGPT
            </p>
          </div>

          {/* Caption + Hashtags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Caption:</label>
                <span className="text-xs text-gray-400">
                  {captionWords} words
                </span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Hashtags:</label>
                <span className="text-xs text-gray-400">{hashtags.length}</span>
              </div>
              <div className="flex flex-wrap gap-2 border rounded-lg p-3">
                {hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 px-3 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() =>
                        setHashtags(hashtags.filter((_, idx) => idx !== i))
                      }
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Hashtags will be appended to the caption when publishing
              </p>
            </div>
          </div>

          {/* Script */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">
                Script (For Video Post):
              </label>
              <span className="text-xs text-gray-400">{scriptWords} words</span>
            </div>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={8}
              className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              Text inside [ ] brackets will be shown as On-Screen Text.
            </p>
          </div>
        </div>


        {/* PUBLISH MODAL */}
        <Modal
          open={publishOpen}
          onClose={() => setPublishOpen(false)}
          title="Confirm Publish"
        >
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to publish this post?
          </p>
          <button
            onClick={() => {
              alert("Post Published 🚀");
              setPublishOpen(false);
            }}
            className="bg-pink-500 text-white w-full py-2 rounded-lg"
          >
            Publish Now
          </button>
        </Modal>
      </div>
      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onSubmit={(data) => console.log(data)}
      />
      ;
    </Layout>
  );
}
