import React from "react";

import Layout from "../components/Layout/Layout";
import TopAffiliates from "../components/TopAffiliates";
import ChapterBubbleChart from "../components/ChapterBubbleChart";
import UsersCard from "../components/UsersCard";
import PublishingSuccess from "../components/PublishingSuccess";
import ClicksConversion from "../components/ClicksConversion";

function Dashboard() {
  return (
    <Layout>
      <div className=" bg-gray-100">
        <div className="max-w-7xl mx-auto  min-h-screen pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <UsersCard />
            <PublishingSuccess />
            <ClicksConversion />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopAffiliates />
            <ChapterBubbleChart />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
