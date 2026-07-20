import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import DashboardOverview from "../../components/DashboardOverview";
import RecentPostsTable from "../../components/RecentPostsTable";
import { getUserDashboardData } from "../../services/userDashboard.api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function UserDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const linkResponse = searchParams.get("linkResponse");

    // Mid-onboarding? The social OAuth callbacks always land here, so carry
    // the result back to the onboarding wizard instead of unpacking it.
    if (localStorage.getItem("onboarding_pending") === "1") {
      navigate(
        linkResponse
          ? `/u/onboarding?linkResponse=${encodeURIComponent(linkResponse)}`
          : "/u/onboarding",
        { replace: true }
      );
      return;
    }

    if (linkResponse) {
      try {
        const parsedResponse = JSON.parse(decodeURIComponent(linkResponse));

        if (parsedResponse?.message) {
          parsedResponse.status
            ? toast.success(parsedResponse.message)
            : toast.error(parsedResponse.message);
        }
      } catch (err) {
        console.error("Invalid linkResponse param", err);
      }

      // ✅ Remove query params from URL
      navigate("/u/dashboard", { replace: true });
    }
  }, [searchParams, navigate]);

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

        <div className=" pt-6">
          <RecentPostsTable loadPost={fetchDashboardData} posts={dashboardData?.recent_posts} showSearch={false} />
        </div>
      </div>
    </Layout>
  );
}

export default UserDashboard;
