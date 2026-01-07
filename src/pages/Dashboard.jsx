import React, { useEffect, useState } from "react";

import Layout from "../components/Layout/Layout";
import TopAffiliates from "../components/TopAffiliates";
import ChapterBubbleChart from "../components/ChapterBubbleChart";
import UsersCard from "../components/UsersCard";
import PublishingSuccess from "../components/PublishingSuccess";
import ClicksConversion from "../components/ClicksConversion";
import API from "../services/api";

function Dashboard() {
  const [details, setDetails] = useState();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await API.get(`admin/dashboard`);
      setDetails(response?.data?.data)
    } catch (error) {
      console.log(error);
    }
  };

 
  return (
    <Layout>
      <div className=" bg-gray-100">
        <div className="max-w-7xl mx-auto  min-h-screen pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <UsersCard details={details} />
            <PublishingSuccess details={details}/>
            <ClicksConversion details={details} />
          </div>
          <div className="grid pb-10 grid-cols-1 lg:grid-cols-2 gap-6">
            <TopAffiliates details={details} />
            {
              details?.most_used_chapters?.length &&
              <ChapterBubbleChart details={ details} />
            }
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
