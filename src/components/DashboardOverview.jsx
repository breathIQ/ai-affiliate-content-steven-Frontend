import React from "react";
import TopAffiliates from "./TopAffiliates";
import ClicksConversion from "./ClicksConversion";
import { Link, NavLink } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import AffiliateClicksChart from "./AffiliateClicksChart";
import toast, { CheckmarkIcon } from "react-hot-toast";

import { instagramAccountLink } from "../services/socialMediaAuth.api";
import { tiktokAccountLink } from "../services/socialMediaAuth.api";

export default function DashboardOverview({ data }) {
  console.log("DashboardOverview data:", data);
  const instagramLinkAccount = async () => {
    try {
      const res = await instagramAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to link Instagram account"
      );
    }
  };

  const tiktokLinkAccount = async () => {
    try {
      const res = await tiktokAccountLink();
      window.location.href = res.data;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to link TikTok account"
      );
    }
  };
  return (
    <div className="pt-8">
      <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COLUMN 1 – Large AI Card */}
        <div className="bg-[#1B283F] rounded-2xl p-6 pr-[80px] pb-[150px] text-white flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundImage: "url('/images/bg-shap.png')",
            backgroundSize: "280px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom right",
          }}>
          <div style={{ zIndex: "10" }}>
            <h2 className="text-lg font-semibold mb-4">
              Generate AI-Powered Content
            </h2>
            <p className="text-sm mb-8 text-[#99A1B7]">
              Turn book chapters into ready-to-publish Instagram and TikTok content using AI.
            </p>
            <Link to={"/u/library?generate=true"} className="bg-pink-600 hover:bg-pink-700 py-[10px] px-[16px] rounded-lg text-sm font-medium flex items-center gap-2 w-fit">
              <FaPlus size={20} className="bg-[#ffffff24] p-[5px] rounded-[4px]" /> Generate Content
            </Link>
            <h3 className="text-md mt-10 font-semibold">
              How the Referral Program Works
            </h3>
            <br />
            <p className="text-sm mb-0 text-[#99A1B7]">Create an Affiliate Account</p>
            <p className="text-sm mb-0 text-[#99A1B7]">Sign up to become an official Carbogenetics affiliate.</p>
            <br />
            <p className="text-sm mb-0 text-[#99A1B7]">Receive Your Custom Referral Link</p>
            <p className="text-sm mb-0 text-[#99A1B7]">You’ll get a personalized URL (for example: co2body.com/yourname).</p>
            <br />
            <p className="text-sm mb-0 text-[#99A1B7]">Share Educational Content</p>
            <p className="text-sm mb-0 text-[#99A1B7]">Create and schedule educational Instagram and TikTok posts using ideas, concepts, and excerpts from The Carbonated Body.</p>
            <br />
            <p className="text-sm mb-0 text-[#99A1B7]">Drive Traffic to the Book</p>
            <p className="text-sm mb-0 text-[#99A1B7]">Your custom link directs followers to The Carbonated Body Amazon page.</p>
            <br />
            <p className="text-sm mb-0 text-[#99A1B7]">Earn Commissions on Product Sales</p>
            <p className="text-sm mb-0 text-[#99A1B7]">When someone clicks your link, a referral cookie is placed.</p>
            <p className="text-sm mb-0 text-[#99A1B7]">If they later purchase any products from Carbogenetics.com, you earn a commission on those sales.</p>
          </div>
        </div>

        {/* COLUMN 2 – Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-rose-500 text-white rounded-2xl p-5">
            <img
              src="/icons/ic-posts2.svg"
              alt="book"
            //   className="w-[100%] h-[90%]"
            />
            <h3 className="text-2xl font-bold my-3">{data?.stats?.generated}</h3>
            <p className="text-sm">Posts Published</p>
          </div>

          <div className="bg-purple-600 text-white rounded-2xl p-5">
            <img
              src="/icons/ic-click2.svg"
              alt="book"
            //   className="w-[100%] h-[90%]"
            />
            <h3 className="text-2xl font-bold my-3">{data?.stats?.total_clicks}</h3>
            <p className="text-sm">Affiliate Clicks</p>
          </div>

          <div role="button" onClick={() => window.open(data?.book_url, "_blank", "noopener,noreferrer")} className="col-span-2 bg-emerald-500 rounded-2xl p-6 text-white flex items-center justify-between relative">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                <img src="/icons/ic-book-dashboard.svg" alt="book icon" className="inline-block mr-2" />
                Read CO2 Book
              </h3>
              <p className="text-sm text-emerald-100">
                Access the full digital <br />
                version for reference while creating content.
              </p>
            </div>
            <img
              src="/images/books.png"
              alt="book"
              className="absolute bottom-0 right-10 w-[170px] rounded-lg"
            />
          </div>
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">

            {/* Header */}
            <h2 className="text-lg font-semibold text-gray-900">
              This Month in Stats
            </h2>

            <hr className="my-4 border-gray-200" />

            {/* Main Stat */}
            <div className="mb-4">
              <p className="text-gray-400 text-sm">Affiliate Clicks</p>

              <div className="flex items-center gap-3 mt-1">
                <h3 className="text-4xl font-bold text-gray-900">{data?.month_stats?.affiliate_clicks}</h3>

                <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm font-medium">
                  {data?.month_stats?.growth_rate > 0 ? '↑' : '↓'} {data?.month_stats?.growth_rate}%
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-4">
              <AffiliateClicksChart chartData={data?.month_stats?.clicks_graph} />
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Footer Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="text-blue-500 text-xl">
                  <img src={'/icons/postsIcons.svg'} alt="Posts Icon" />
                </div>
                <div>
                  <p className="text-xl font-bold">{data?.month_stats?.posts_published}</p>
                  <p className="text-gray-500 text-sm">Posts Published</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-blue-500 text-xl">
                  <img src={'/icons/clicksIcon.svg'} alt="Clicks Icon" />
                </div>
                <div>
                  <p className="text-xl font-bold">{data?.month_stats?.avg_clicks_per_post}</p>
                  <p className="text-gray-500 text-sm">Avg Clicks / Post</p>
                </div>
              </div>
            </div>

          </div>
          <div className="col-span-2">
            <div className="flex gap-3">
              {/* Instagram */}
              <button
                className={`flex items-center w-full gap-2 border rounded-md px-3 py-2 text-sm bg-white ${data?.social_accounts_status?.instagram?.connected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => {
                  if (!data?.social_accounts_status?.instagram?.connected) {
                    instagramLinkAccount();
                  }
                }}
              >
                <img src="/icons/insta.svg" alt="Instagram" />

                {data?.social_accounts_status?.instagram?.connected ? (
                  <span className="flex items-center gap-1 font-medium">
                    {data?.social_accounts_status?.instagram?.username}
                    <CheckmarkIcon size={14} />
                  </span>
                ) : (
                  <span className="text-gray-600">Connect Instagram</span>
                )}
                {/* <span className="flex items-center gap-1 text-[#0000008A]">
                  @johndoe
                  <CheckmarkIcon size={14} />
                </span> */}
              </button>

              {/* TikTok */}
              <button
                className={`flex items-center w-full gap-2 border rounded-md px-3 py-2 text-sm bg-white ${data?.social_accounts_status?.tiktok?.connected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => {
                  if (!data?.social_accounts_status?.tiktok?.connected) {
                    tiktokLinkAccount();
                  }
                }}
              >
                <img src="/icons/tiktok.svg" alt="TikTok" />

                {data?.social_accounts_status?.tiktok?.connected ? (
                  <span className="flex items-center gap-1 font-medium">
                    {data?.social_accounts_status?.tiktok?.username}
                    <CheckmarkIcon size={14} />
                  </span>
                ) : (
                  <span className="text-gray-600">Connect TikTok</span>
                )}
                {/* <span className="text-[#0000008A]">Connect TikTok</span> */}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}