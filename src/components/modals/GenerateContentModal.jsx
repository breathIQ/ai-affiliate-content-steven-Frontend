import { useState } from "react";

export default function GenerateContentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [chapter, setChapter] = useState("Ch-1 :: Lorem ipsum dolor sit amet.");
  const [model, setModel] = useState("ChatGPT");
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    console.log({
      chapter,
      model,
      prompt,
    });

    // 🔥 API call here
    // axios.post("/generate", { chapter, model, prompt })

    setIsOpen(false);
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
            <div className="px-6 py-4 space-y-4">
              {/* Chapter */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Select Chapter
                </label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option>Ch-1 :: Lorem ipsum dolor sit amet.</option>
                  <option>Ch-2 :: Consectetur adipiscing elit.</option>
                  <option>Ch-3 :: Sed do eiusmod tempor.</option>
                </select>
              </div>

              {/* AI Model */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option>ChatGPT</option>
                  <option>GPT-4</option>
                  <option>Claude</option>
                </select>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Custom Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  placeholder="Write your custom instructions..."
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setIsOpen(false)}
                className="py-[10px] px-[16px] rounded-lg text-sm bg-gray-900 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="py-[10px] px-[16px] rounded-lg text-sm bg-purple-600 text-white flex items-center gap-2"
              >
                <span className="text-lg">
                  <img src="/icons/ic-add.svg" />
                </span>{" "}
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
