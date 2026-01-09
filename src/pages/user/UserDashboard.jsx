import React from "react";
import Layout from "../../components/Layout/Layout";
import DashboardOverview from "../../components/DashboardOverview";
import RecentPostsTable from "../../components/RecentPostsTable";

function UserDashboard() {
  return (
    <Layout>
      <div className=" max-w-7xl mx-auto ">
        <DashboardOverview />
        <div className="pb-10 pt-6">
          <RecentPostsTable />
        </div>
      </div>
    </Layout>
  );
}

export default UserDashboard;
