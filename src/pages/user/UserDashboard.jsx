import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import DashboardOverview from "../../components/DashboardOverview";
import RecentPostsTable from "../../components/RecentPostsTable";
import { getUserDashboardData } from "../../services/userDashboard.api";

function UserDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await getUserDashboardData();
      setDashboardData(response?.data); // adjust if API structure differs
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-10 text-center">
          Loading dashboard...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <DashboardOverview data={dashboardData} />

        <div className="pb-10 pt-6">
          <RecentPostsTable loadPost={fetchDashboardData} posts={dashboardData?.recent_posts} />
        </div>
      </div>
    </Layout>
  );
}

export default UserDashboard;
