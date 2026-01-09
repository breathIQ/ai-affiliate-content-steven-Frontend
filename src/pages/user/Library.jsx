import { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import PublishModal from "../../components/modals/PublishModal";
import { useParams, useNavigate } from "react-router-dom";
import { set, useForm } from "react-hook-form";
import { createPost } from "../../services/post.api";
import toast from "react-hot-toast";
import { getSinglePost } from "../../services/post.api";

export default function DraftPostPage({generatedData, setGeneratedData, loadPost}) {
  const [mediaType, setMediaType] = useState("carousel");
  const [files, setFiles] = useState([]);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [aiModel, setAiModel] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [script, setScript] = useState("");
  const [viewMedia, setViewMedia] = useState([]);

  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditMode) return;

    const fetchPost = async () => {
      try {
        const res = await getSinglePost(id);

        if (!res?.success) {
          toast.error("Failed to load post");
          return;
        }

        const post = res.data;

        // Prefill fields
        setCaption(post.caption || "");
        setScript(post.script || "");
        setAiModel(post.ai_model || "");

        // Chapter
        if (post.chapter) {
          setChapter({
            id: post.chapter.id,
            code: post.chapter.chapter,
            title: post.chapter.chapter_title,
          });
        }

        // Hashtags
        if (post.hashtags) {
          setHashtags(
            post.hashtags
              .split(",")
              .map(tag => tag.trim())
              .filter(Boolean)
          );
        }

        // Media type (fallback)
        setMediaType(post.media_assets);

        if (post.media?.length) {
          setViewMedia(post.media.map(m => m.url));
        }
      } catch (err) {        
        // console.error("FETCH POST ERROR ❌", err);
        toast.error(err?.response?.data?.error || err?.message||"Something went wrong");
      }
    };

    fetchPost();
  }, [id, isEditMode]);


  const hasUnsavedData =
  !isEditMode &&
  (caption || script || files.length > 0 || hashtags.length > 0);

  useEffect(() => {
    if (!hasUnsavedData) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedData]);


  useEffect(() => {
    if (!generatedData) return;

    setCaption(generatedData.caption || "");
    setScript(generatedData.script || "");

    if (generatedData.hashtags) {
      const tagsArray = generatedData.hashtags
        .split(",")
        .map((tag) => tag.trim());
      setHashtags(tagsArray);
    }

    setChapter({
      id: generatedData.chapter_id,
      code: generatedData.chapter,
      title: generatedData.chapter_title,
    });

    setAiModel(generatedData.model || "");
  }, [generatedData]);

  const { handleSubmit } = useForm();

  const captionWords = caption.trim().split(/\s+/).filter(Boolean).length;
  const scriptWords = script.trim().split(/\s+/).filter(Boolean).length;

  const uploadFiles = (e) => {
    const newFiles = Array.from(e.target.files);

    if (mediaType === "single") {
      // Allow only one file
      setFiles([newFiles[0]]);
      setSelectedMedia([0]);
    } else {
      // Carousel → allow multiple
      setFiles((prev) => [...prev, ...newFiles]);
      setSelectedMedia((prev) => [
        ...prev,
        ...newFiles.map((_, i) => prev.length + i),
      ]);
    }
  };


  const toggleMedia = (index) => {
    if (mediaType === "single") {
      setSelectedMedia([index]); // always single
      return;
    }

    setSelectedMedia((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  useEffect(() => {
    if (mediaType === "single" && files.length > 1) {
      setFiles([files[0]]);
      setSelectedMedia([0]);
    }
  }, [mediaType]);


  const handlePublishSubmit = async ({ platforms, reviewLink }) => {
    try {
      const formData = new FormData();

      formData.append("chapter_id", chapter?.id);
      formData.append("caption", caption);
      formData.append("script", script);
      formData.append("media_assets", mediaType);
      formData.append("status", "published");
      formData.append("ai_model", aiModel);
      formData.append("ai_prompt", generatedData?.ai_prompt);
      
      if (reviewLink) {
        formData.append("affiliate_url", reviewLink);
      }

      selectedMedia.forEach((index, i) => {
        formData.append(`media[${i}][file]`, files[index]);
        formData.append(`media[${i}][media_order]`, i + 1);
      });

      const hashtagString = hashtags
      .map(tag => (tag.startsWith("#") ? tag : `#${tag}`))
      .join(", ");

      formData.append("hashtags", hashtagString);

      Object.entries(platforms).forEach(([key, value], i) => {
        if (value) {
          formData.append(`platforms[${i}]`, key);
        }
      });

      const response = await createPost(formData);

      if (!response?.success) {
        toast.error(response?.messages.join(", ") || "Failed to create post.");
        return;
      }else{
        toast.success(response?.message || "Post created successfully!");
        loadPost();
        setGeneratedData(null);
        setPublishOpen(false);
      }
      
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
              <span
                onClick={() => {
                  if(isEditMode){
                    navigate('/u/library');
                    return;
                  }
                  if (!hasUnsavedData) {
                    setGeneratedData(null);
                    return;
                  }

                  const ok = window.confirm(
                    "Unsaved changes will be lost. Do you want to continue?"
                  );

                  if (ok) {
                    setGeneratedData(null);
                  }
                }}
                role="button"
                className="border bg-white text-dark py-[10px] px-[16px] flex gap-2 rounded-lg text-sm"
              >
                <img src="/icons/folderback.svg" />
                Back To Library
              </span>
              <h1 className="font-semibold">{isEditMode ? "Post Details" : "Post Preview"}</h1>
            </div>

            {!isEditMode && <button
              onClick={() => setPublishOpen(true)}
              className="bg-pink-500 text-white py-[10px] px-[16px] rounded-lg flex gap-2"
            >
              <img src="/icons/publish.svg" /> Publish
            </button>}
          </div>

          {/* MEDIA TYPE */}
          <div className="flex gap-6 text-sm">
            <label className={`flex gap-2 ${isEditMode && "cursor-not-allowed"}`}>
              <input
                type="radio"
                checked={mediaType === "single"}
                disabled={isEditMode}
                onChange={() => setMediaType("single")}
              />
              Single Media
            </label>
            <label className={`flex gap-2 ${isEditMode && "cursor-not-allowed"}`}>
              <input
                type="radio"
                checked={mediaType === "carousel"}
                disabled={isEditMode}
                onChange={() => setMediaType("carousel")}
              />
              Carousel
            </label>
          </div>

          {/* MEDIA GRID */}
          <div className="flex gap-4 flex-wrap">
            {viewMedia.length > 0 &&
              viewMedia.map((url, index) => (
                <div
                  key={`view-${index}`}
                  className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-200"
                >
                  <img
                    src={url}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            }
            {viewMedia.length === 0 && files.map((file, index) => {
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

            {!isEditMode &&<label className="w-28 h-28 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer text-sm text-gray-500">
              <img src="/icons/ic-upload-grey.svg" />
              <p>Upload</p>
              <input
                type="file"
                multiple={mediaType === "carousel"}
                accept="image/*,video/*"
                className="hidden"
                onChange={uploadFiles}
              />
            </label>}
          </div>

          {/* Chapter + AI */}
          <div className="flex justify-between text-sm text-gray-600">
            <p>
              <span className="font-medium">Chapter:</span> <br />
              <span className="text-gray-400">
                {chapter ? `${chapter.code} : ${chapter.title}` : "-"}
              </span>
            </p>

            <p>
              <span className="font-medium">AI Model:</span> <br />
              <span className="text-gray-400">
                {aiModel || "-"}
              </span>
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
                readOnly={isEditMode}
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
                    {!isEditMode && (<button
                      onClick={() =>
                        setHashtags(
                          hashtags.filter((_, idx) => idx !== i)
                        )
                      }
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>)}
                  </span>
                ))}

                <input
                  type="text"
                  value={hashtagInput}
                  disabled={isEditMode}
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
                  className={`text-xs outline-none flex-1 min-w-[120px] ${
                    isEditMode && "bg-transparent cursor-not-allowed"
                  }`}
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
              readOnly={isEditMode}
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
