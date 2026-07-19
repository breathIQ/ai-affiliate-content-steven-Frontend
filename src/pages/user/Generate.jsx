import React from "react";
import Layout from "../../components/Layout/Layout";
import GenerateContentModal from "../../components/modals/GenerateContentModal";
import CampaignContentModal from "../../components/modals/CampaignContentModal";
import ArticleContentModal from "../../components/modals/ArticleContentModal";

// One place to start any kind of post, so the three sources are a choice rather
// than three separate buttons you have to know about. Each card hosts the same
// modal used elsewhere (each renders its own trigger button), so there is no
// second copy of any generation flow to keep in sync.

const SOURCES = [
  {
    key: "chapter",
    title: "From a book chapter",
    blurb:
      "Teach one idea from The Carbonated Body. Carousel slides, an AI presenter video, or an animated image.",
    accent: "border-gray-900/10 hover:border-gray-900/40",
    Modal: GenerateContentModal,
  },
  {
    key: "article",
    title: "From an article",
    blurb:
      "Promote a published carbogenetics.com article. Your post links straight to it, and you get credit for anyone who subscribes there.",
    accent: "border-emerald-200 hover:border-emerald-500",
    Modal: ArticleContentModal,
  },
  {
    key: "product",
    title: "Promote a product",
    blurb:
      "CO2inhaler, BodyStream, BodyStream Sauna, or the free CO2 guide. Uses approved claims and the official product image.",
    accent: "border-purple-200 hover:border-purple-500",
    Modal: CampaignContentModal,
  },
];

export default function Generate() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800">Generate a post</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Pick what you want to post about. Drafting is free in every one of these, so nothing is
          charged until you approve the words.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SOURCES.map(({ key, title, blurb, accent, Modal }) => (
            <div
              key={key}
              className={`bg-white border-2 ${accent} rounded-xl p-5 flex flex-col transition`}
            >
              <h2 className="text-base font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500 mt-2 flex-1">{blurb}</p>
              <div className="mt-5">
                <Modal />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
