import React from "react";
import Layout from "../../components/Layout/Layout";
import { getPrivacy } from "../../services/common.api";

const Privacy = () => {
    const [privacyContent, setPrivacyContent] = React.useState("");

    React.useEffect(() => {
        const fetchPrivacy = async () => {
            try {
                const response = await getPrivacy();
                console.log("Privacy Policy response:", response);
                setPrivacyContent(response?.data?.content?.content || ""); // Adjust based on actual response structure
            } catch (error) {
                console.error("Error fetching privacy policy:", error);
            }
        };
        fetchPrivacy();
    }, []);
    return (
        <Layout>
        <div className="max-w-7xl mx-auto min-h-screen pt-5 termsprivacy">
            <h5 className="font-bold mb-4 text-[22px]">Privacy Policy</h5>
            <div className="bg-[#fff] rounded-[12px] py-6 px-8" dangerouslySetInnerHTML={{__html: privacyContent}} />
        </div>
        </Layout>
    );
};
export default Privacy;