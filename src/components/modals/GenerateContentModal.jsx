import { useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";
import { getChapter } from "../../services/post.api";
import { FaPlus } from "react-icons/fa";
import { generateAIPost } from "../../services/post.api";

export default function GenerateContentModal({setGeneratedData}) {
  const [isOpen, setIsOpen] = useState(false);
  const [chapters, setChapters] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      chapter_id: "",
      model: "ChatGPT",
      prompt: "",
    },
  });

  /* 🔹 Fetch chapters when modal opens */
  useEffect(() => {
    if (!isOpen) return;

    const fetchChapters = async () => {
      try {
        const res = await getChapter();
        setChapters(res?.data || []);
      } catch (error) {
        console.error("GET CHAPTER ERROR ❌", error);
      }
    };

    fetchChapters();
  }, [isOpen]);

  /* 🔹 Submit */
  const onSubmit = async (formData) => {
    try {
      const payload = {
        chapter: formData.chapter_id, // API expects `chapter`
        model: formData.model,
        prompt: formData.prompt,
      };

      console.log("Generate Payload 👉", payload);

      const res = await generateAIPost(payload);

      if (res?.success) {
        setGeneratedData(res.data); // ✅ EXACT response.data saved
        setIsOpen(false);
        reset();
      }
    } catch (error) {
      console.error("GENERATE CONTENT ERROR ❌", error);
    }
  };

  return (
    <>
      {/* Generate Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gray-900 text-white py-[10px] px-[16px] flex align-center gap-2 rounded-lg text-sm"
      >
        <img src="/icons/ic-add.svg" className="text-white" />
        Generate
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Box */}
          <div className="relative bg-white w-full max-w-xl rounded-xl shadow-lg z-50">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Generate Content</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-6 py-4 space-y-4">
                {/* Chapter */}
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Select Chapter
                  </label>
                  <select
                    {...register("chapter_id", {
                      required: "Chapter is required",
                    })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.chapter} :: {item.chapter_title}
                      </option>
                    ))}
                  </select>
                  {errors.chapter_id && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.chapter_id.message}
                    </p>
                  )}
                </div>

                {/* AI Model */}
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    AI Model
                  </label>
                  <select
                    {...register("model", {
                      required: "AI model is required",
                    })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="gpt-4-turbo">ChatGPT</option>
                    <option value="claude-3-haiku-20240307">Claude</option>
                  </select>
                  {errors.model && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.model.message}
                    </p>
                  )}
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Custom Prompt
                  </label>
                  <textarea
                    {...register("prompt", {
                      required: "Prompt is required",
                      minLength: {
                        value: 10,
                        message: "Prompt must be at least 10 characters",
                      },
                    })}
                    rows={5}
                    placeholder="Write your custom instructions..."
                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.prompt && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.prompt.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="py-[10px] px-[16px] rounded-lg text-sm bg-gray-900 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-[10px] px-[16px] rounded-lg text-sm bg-purple-600 text-white flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="text-lg">
                    <FaPlus size={22} className="bg-[#ffffff28] rounded-[4px] p-[5px]"/>
                  </span>
                  {isSubmitting ? "Generating..." : "Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
