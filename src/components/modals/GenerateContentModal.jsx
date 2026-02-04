import { useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";
import { getChapter } from "../../services/post.api";
import { FaPlus, FaInfoCircle } from "react-icons/fa";
import { generateAIPost } from "../../services/post.api";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function GenerateContentModal({ setGeneratedData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chapters, setChapters] = useState([]);

  const [searchParams] = useSearchParams();
  const generate = searchParams.get("generate");
  const isGenerate = generate === "true";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      post_type: "single",
    },
  });

  const postType = watch("post_type");
  const slidesCount = watch("slides");

  // const slideTexts = watch("slide_texts");
  // const hasText =
  //   postType === "single"
  //     ? slideTexts?.[0]?.trim()
  //     : Array.isArray(slideTexts) && slideTexts.some(t => t?.trim());

  // const slideInputsCount =
  //   postType === "carousel"
  //     ? Number(slidesCount || 0)
  //     : postType === "single"
  //       ? 1
  //       : 0;

  useEffect(() => {
    if (isGenerate) {
      setIsOpen(true);
      searchParams.delete("generate");
    }
  }, [isGenerate]);

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
  /* 🔹 Submit */
  const onSubmit = async (formData) => {
    try {
      // Filter slide_texts to only include filled ones and match the count
      let slideTexts = formData.slide_texts || [];

      if (postType === "carousel") {
        // Only include texts up to the selected slides count
        const count = Number(formData.slides || 0);
        slideTexts = slideTexts.slice(0, count);
      } else if (postType === "single") {
        // For single, only take first text
        slideTexts = slideTexts.slice(0, 1);
      }

      // Filter out empty/whitespace-only values
      slideTexts = slideTexts.filter(text => text?.trim());

      const hasText = slideTexts.length > 0;

      const payload = {
        chapter: formData.chapter_id,
        model: formData.model,
        prompt: formData.prompt,
        post_type: formData.post_type,
        slides: postType === "single" ? 1 : Number(formData.slides),
        design: {
          image_style: formData.image_style,
          content_angle: formData.content_angle,
          human_presence: formData.human_presence,
          visual_mood: formData.visual_mood,
        },
      };

      // Only add slide_texts if there are non-empty values
      // if (hasText) {
      //   payload.slide_texts = slideTexts;
      // }

      // // Add design fields ONLY if text exists
      // if (hasText) {
      //   payload.design = {
      //     overlay_color: formData.overlay_color,
      //     text_placement: formData.text_placement,
      //     font_family: formData.font_family,
      //     font_size: formData.font_size,
      //     font_weight: formData.font_weight,
      //   };
      // }

      console.log("Generate Payload 👉", payload);

      const res = await generateAIPost(payload);

      if (res?.success) {
        setGeneratedData(res.data);
        setIsOpen(false);
        reset();
      } else {
        toast.error(res?.message || "Failed to generate content");
      }
    } catch (error) {
      console.error("GENERATE CONTENT ERROR ❌", error);
      toast.error(error?.response?.data?.message || "An error occurred while generating content");
    }
  };

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    if (postType) {
      // Reset slide_texts array when switching post types
      reset({
        ...watch(), // Keep other form values
        slide_texts: [], // Clear all slide texts
        slides: postType === "single" ? undefined : watch("slides"), // Clear slides count for single
      });
    }
  }, [postType]);
  // Add this to handle when slides count changes in carousel mode
  useEffect(() => {
    if (postType === "carousel" && slidesCount) {
      const currentTexts = watch("slide_texts") || [];
      const count = Number(slidesCount);

      // If reducing slides, trim the array
      if (currentTexts.length > count) {
        reset({
          ...watch(),
          slide_texts: currentTexts.slice(0, count), // Keep only first N texts
        });
      }
    }
  }, [slidesCount, postType]);

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
          <div className="relative bg-white w-full max-w-xl h-screen rounded-xl shadow-lg z-50 overflow-y-auto">
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
                    Select Chapter <span className="text-red-500">*</span>
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
                    AI Model <span className="text-red-500">*</span>
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
                  <label className="text-sm font-medium mb-1 block flex items-center">
                    Custom Prompt <span className="text-red-500 ms-1">*</span>

                    <div className="relative group cursor-pointer inline-block ms-2">
                      <span className="text-gray-400 hover:text-gray-600">
                        <FaInfoCircle className="text-md" />
                      </span>

                      {/* Tooltip */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                        hidden group-hover:block
                        bg-black text-white text-xs px-3 py-2 rounded-md
                        w-56 text-center z-50"
                      >
                        This custom prompt is used only to generate the post’s caption, hashtags, and script. It does not affect image generation.

                        {/* Notch / Arrow */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                          style={{
                            borderLeft: "7px solid transparent",
                            borderRight: "7px solid transparent",
                            borderTop: "7px solid black",
                            borderBottom: "0",
                          }}
                        />
                      </div>
                    </div>
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Post Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Post Type <span className="text-red-500">*</span></label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          value="single"
                          {...register("post_type")}
                        />
                        Single Post
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          value="carousel"
                          {...register("post_type")}
                        />
                        Carousel
                      </label>
                    </div>
                  </div>

                  {/* Carousel Slides */}
                  <div>
                    {postType === "carousel" && (
                      <>
                        <label className="text-sm font-medium mb-1 block">
                          No. of Carousel Slides {postType === "carousel" ? <span className="text-red-500">*</span> : ''}
                        </label>
                        <select
                          {...register("slides", {
                            required: postType === "carousel"
                              ? "Slides is required for carousel posts"
                              : false,
                          })}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">Select Slides</option>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    {errors.slides && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.slides.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* {slideInputsCount > 0 &&
                  [...Array(slideInputsCount)].map((_, index) => (
                    <div key={index}>
                      <label className="text-sm font-medium mb-1 block">
                        {postType === "single"
                          ? "Post Text"
                          : `Slide ${index + 1}'s Text`}
                      </label>
                      <input
                        type="text"
                        {...register(`slide_texts.${index}`)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder={
                          postType === "single"
                            ? "Enter post text"
                            : `Enter text for slide ${index + 1}`
                        }
                      />
                    </div>
                  ))} */}

                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Image Overlay Color
                    </label>
                    <input
                      type="color"
                      {...register("overlay_color", {
                        required: hasText ? "Overlay color is required" : false,
                      })}
                      className="w-full h-[42px] border rounded-lg p-1"
                    />
                    {errors.overlay_color && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.overlay_color.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Text Placement
                    </label>
                    <select
                      {...register("text_placement", {
                        required: hasText ? "Text placement is required" : false,
                      })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Placement</option>

                      <option value="top-left">Top Left</option>
                      <option value="top-center">Top Center</option>
                      <option value="top-right">Top Right</option>

                      <option value="center">Centered</option>

                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                    {errors.text_placement && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.text_placement.message}
                      </p>
                    )}
                  </div>
                </div> */}

                {/* <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Font Family</label>
                    <select
                      {...register("font_family", {
                        required: hasText ? "Font family is required" : false,
                      })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Font</option>
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Roboto">Roboto</option>
                    </select>
                    {errors.font_family && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.font_family.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Font Size</label>
                    <select
                      {...register("font_size", {
                        required: hasText ? "Font size is required" : false,
                      })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Size</option>
                      <option value="H1">H1</option>
                      <option value="H2">H2</option>
                      <option value="H3">H3</option>
                      <option value="H4">H4</option>
                      <option value="H5">H5</option>
                      <option value="H6">H6</option>
                    </select>
                    {errors.font_size && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.font_size.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Font Weight</label>
                    <select
                      {...register("font_weight", {
                        required: hasText ? "Font weight is required" : false,
                      })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Weight</option>
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semi Bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="900">Bolder (900)</option>
                    </select>
                    {errors.font_weight && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.font_weight.message}
                      </p>
                    )}
                  </div>
                </div> */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Image Style <span className="text-red-500">*</span></label>
                    <select
                      {...register("image_style", { required: "Image style is required" })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Style</option>
                      <option value="Minimalist / Modern">Minimalist / Modern</option>
                      <option value="Clinical / Physiological">Clinical / Physiological</option>
                      <option value="Scientific / Conceptual">Scientific / Conceptual</option>
                      <option value="Human / Real People">Human / Real People</option>
                      <option value="Lifestyle / Wellness">Lifestyle / Wellness</option>
                      <option value="Nature-Inspired">Nature-Inspired</option>
                      <option value="Hyper-Realistic">Hyper-Realistic</option>
                      <option value="Illustrated / Graphic">Illustrated / Graphic</option>
                      <option value="Text-Forward / Typography-Led">
                        Text-Forward / Typography-Led
                      </option>
                    </select>

                    {errors.image_style && (
                      <p className="text-xs text-red-500 mt-1">{errors.image_style.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Content Angle <span className="text-red-500">*</span></label>
                    <select
                      {...register("content_angle", { required: "Content angle is required" })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Angle</option>
                      <option value="Beginner Friendly">Beginner Friendly</option>
                      <option value="Myth-Busting">Myth-Busting</option>
                      <option value="Contrarian Insight">Contrarian Insight</option>
                      <option value="Educational / Explainer">Educational / Explainer</option>
                      <option value="Clinical Perspective">Clinical Perspective</option>
                      <option value="Story-Driven">Story-Driven</option>
                      <option value="Problem → Reframe">Problem → Reframe</option>
                    </select>
                    {errors.content_angle && (
                      <p className="text-xs text-red-500 mt-1">{errors.content_angle.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Human Presence <span className="text-red-500">*</span></label>
                    <select
                      {...register("human_presence", { required: "Human presence is required" })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Option</option>
                      <option value="No People">No People</option>
                      <option value="Single Person">Single Person</option>
                      <option value="Everyday People">Everyday People</option>
                      <option value="Athletic / Active">Athletic / Active</option>
                      <option value="Clinical / Professional">Clinical / Professional</option>
                    </select>
                    {errors.human_presence && (
                      <p className="text-xs text-red-500 mt-1">{errors.human_presence.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Visual Mood <span className="text-red-500">*</span></label>
                    <select
                      {...register("visual_mood", { required: "Visual mood is required" })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Mood</option>
                      <option value="Calm & Grounded">Calm & Grounded</option>
                      <option value="Curious & Thoughtful">Curious & Thoughtful</option>
                      <option value="Serious & Clinical">Serious & Clinical</option>
                      <option value="Empowering">Empowering</option>
                      <option value="Quietly Provocative">Quietly Provocative</option>
                      <option value="Warm & Reassuring">Warm & Reassuring</option>
                    </select>
                    {errors.visual_mood && (
                      <p className="text-xs text-red-500 mt-1">{errors.visual_mood.message}</p>
                    )}
                  </div>

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
                    <FaPlus size={22} className="bg-[#ffffff28] rounded-[4px] p-[5px]" />
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
