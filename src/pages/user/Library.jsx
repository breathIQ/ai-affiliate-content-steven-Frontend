import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import PublishModal from "../../components/modals/PublishModal";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createPost } from "../../services/post.api";

export default function DraftPostPage() {
  const [mediaType, setMediaType] = useState("carousel");
  const [files, setFiles] = useState([]);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
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
  const [hashtagInput, setHashtagInput] = useState("");
  const [script, setScript] = useState("");

  const { handleSubmit } = useForm();

  const captionWords = caption.trim().split(/\s+/).filter(Boolean).length;
  const scriptWords = script.trim().split(/\s+/).filter(Boolean).length;

  const uploadFiles = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    setSelectedMedia((prev) => [
      ...prev,
      ...newFiles.map((_, i) => prev.length + i),
    ]);
  };

  const toggleMedia = (index) => {
    setSelectedMedia((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handlePublishSubmit = async ({ platforms }) => {
    try {
      const formData = new FormData();

      formData.append("chapter_id", 1);
      formData.append("caption", caption);
      formData.append("script", script);
      formData.append("media_assets", mediaType);
      formData.append("status", "published");
      formData.append("ai_model", "gpt-4");
      formData.append("ai_prompt", "Generate social media post");
      formData.append(
        "affiliate_url",
        "http://localhost/ai-affiliate-content-steven/public/"
      );

      selectedMedia.forEach((index, i) => {
        formData.append(`media[${i}][file]`, files[index]);
        formData.append(`media[${i}][media_order]`, i + 1);
      });

      hashtags.forEach((tag, i) => {
        formData.append(
          `hashtags[${i}]`,
          tag.startsWith("#") ? tag : `#${tag}`
        );
      });

      Object.entries(platforms).forEach(([key, value], i) => {
        if (value) {
          formData.append(`platforms[${i}]`, key);
        }
      });

      await createPost(formData);

      console.log("POST CREATED SUCCESSFULLY 🚀");
      setPublishOpen(false);
    } catch (error) {
      console.error("CREATE POST ERROR ❌", error);
    }
  };

  const selectedFiles = selectedMedia.map((i) => files[i]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen">
        <div className="bg-white rounded-xl p-6 space-y-6">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <Link
                to={"/users/labs"}
                className="border bg-white text-dark py-[10px] px-[16px] flex gap-2 rounded-lg text-sm"
              >
                <img src="/icons/folderback.svg" />
                Back To Library
              </Link>
              <h1 className="font-semibold">Post Preview</h1>
            </div>

            <button
              onClick={() => setPublishOpen(true)}
              className="bg-pink-500 text-white py-[10px] px-[16px] rounded-lg flex gap-2"
            >
              <img src="/icons/publish.svg" /> Publish
            </button>
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
            {files.map((file, index) => {
              const isSelected = selectedMedia.includes(index);

              return (
                <div
                  key={index}
                  className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-200"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover"
                  />

                  <button
                    onClick={() => toggleMedia(index)}
                    className={`absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center ${
                      isSelected
                        ? "bg-purple-600 border-purple-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>

                  {isSelected && (
                    <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 rounded-full">
                      {selectedMedia.indexOf(index) + 1}/
                      {selectedMedia.length}
                    </span>
                  )}
                </div>
              );
            })}

            <label className="w-28 h-28 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer text-sm text-gray-500">
              <img src="/icons/ic-upload-grey.svg" />
              <p>Upload</p>
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
              <span className="font-medium">Chapter:</span> <br />
              <span className="text-gray-400">
                Ch-1 : Lorem ipsum dolor sit amet.
              </span>
            </p>
            <p>
              <span className="font-medium">AI Model:</span> <br />
              <span className="text-gray-400">ChatGPT</span>
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
                <span className="text-xs text-gray-400">
                  {hashtags.length}
                </span>
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
                        setHashtags(
                          hashtags.filter((_, idx) => idx !== i)
                        )
                      }
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && hashtagInput.trim()) {
                      e.preventDefault();
                      setHashtags((prev) => [
                        ...prev,
                        hashtagInput.trim(),
                      ]);
                      setHashtagInput("");
                    }
                  }}
                  className="text-xs outline-none flex-1 min-w-[120px]"
                />
              </div>

              <p className="text-xs text-gray-400 text-right mt-1">
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
              <span className="text-xs text-gray-400">
                {scriptWords} words
              </span>
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

        <PublishModal
          isOpen={publishOpen}
          onClose={() => setPublishOpen(false)}
          onSubmit={handlePublishSubmit}
          preview={{
            caption,
            hashtags,
            media: selectedFiles,
          }}
        />
      </div>
    </Layout>
  );
}
