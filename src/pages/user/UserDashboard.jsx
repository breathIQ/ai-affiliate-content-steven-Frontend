import React from "react";
import Layout from "../../components/Layout/Layout";
import DashboardOverview from "../../components/DashboardOverview";
import RecentPostsTable from "../../components/RecentPostsTable";

function UserDashboard() {
  return (
    <Layout>
      <div className=" max-w-7xl mx-auto ">
        <DashboardOverview />

        <div className=" py-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Lorem Ipsum</h3>
            <p className="text-xs text-gray-500 max-w-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et
              massa mi. Aliquam in hendrerit urna.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
              <img src="/icons/insta.svg" alt="Instagram" className="w-4 h-4" />
              <span className="text-sm text-gray-700">@johndoe</span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>

            <button className="flex items-center gap-2 border rounded-lg px-3 py-1.5 hover:bg-gray-50">
              <img src="/icons/tiktok.svg" alt="TikTok" className="w-4 h-4" />
              <span className="text-sm text-gray-700">Connect TikTok</span>
            </button>
          </div>
        </div>
        <div className="py-3">
          <RecentPostsTable />
        </div>
      </div>
    </Layout>
  );
}

export default UserDashboard;
