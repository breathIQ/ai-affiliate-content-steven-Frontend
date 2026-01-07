import React from "react";
import TopAffiliates from "./TopAffiliates";
import ClicksConversion from "./ClicksConversion";
import { Link, NavLink } from "react-router-dom";

export default function DashboardOverview() {
  return (
    <div className="min-h-screen pt-8">
      <div className=" grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1 – Large AI Card */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="w-[70%]" style={{zIndex:"10"}}>
            <h2 className="text-lg font-semibold mb-2">
              Generate AI-Powered Content
            </h2>
            <p className="text-sm text-gray-300 mb-4 max-w-md">
              Turn book chapters into ready-to-publish Instagram and TikTok
              content using AI.
            </p>
            <Link to={"/u/library"} className="bg-pink-600 hover:bg-pink-700 py-[10px] px-[16px] rounded-lg text-sm font-medium">
              Generate Content
            </Link>
          </div>

          {/* Decorative shapes */}
          <div className="absolute right-0 bottom-0 w-full">
           <img
              src="/images/bg-shap.svg"
              alt="book"
              className="w-[100%] h-[90%]"
            />
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
            <h3 className="text-2xl font-bold my-3">25</h3>
            <p className="text-sm">Posts Generated</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
             <img
              src="/icons/ic-draft.svg"
              alt="book"
            //   className="w-[100%] h-[90%]"
            />
            <h3 className="text-2xl font-bold my-3">11</h3>
            <p className="text-sm text-gray-500">Draft Posts</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
             <img
              src="/icons/ic-schedule.svg"
              alt="book"
            //   className="w-[100%] h-[90%]"
            />
            <h3 className="text-2xl font-bold my-3">7</h3>
            <p className="text-sm text-gray-500">Scheduled Posts</p>
          </div>

          <div className="bg-purple-600 text-white rounded-2xl p-5">
             <img
              src="/icons/ic-click2.svg"
              alt="book"
            //   className="w-[100%] h-[90%]"
            />
            <h3 className="text-2xl font-bold my-3">3,900</h3>
            <p className="text-sm">Affiliate Clicks</p>
          </div>

          <div className="col-span-2 bg-emerald-500 rounded-2xl p-6 text-white flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Read CO2 Book</h3>
              <p className="text-sm text-emerald-100">
                Access the full digital version while creating content.
              </p>
            </div>
            <img
              src="/images/books.png"
              alt="book"
              className="w-20 h-28 object-cover rounded-lg"
            />
          </div>
        </div>

        {/* COLUMN 3 – Monthly Stats */}
        <div className="">
          <ClicksConversion/>
        </div>
      </div>
    </div>
  );
}