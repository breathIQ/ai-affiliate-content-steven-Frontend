import React from "react";
import Layout from "../../components/Layout/Layout";
import { getPrivacy } from "../../services/common.api"; // Assuming you have this API
import Footer from "../../components/Layout/Footer";

const Privacy = () => {
    const [privacyContent, setPrivacyContent] = React.useState("");
    const access_token = localStorage.getItem("access_token");

    React.useEffect(() => {
        const fetchPrivacy = async () => {
            try {
                const response = await getPrivacy();
                setPrivacyContent(response?.data?.content?.content || "");
            } catch (error) {
                console.error("Error fetching privacy policy:", error);
            }
        };
        fetchPrivacy();
    }, []);
    
    // If logged in, use Layout with Header
    if (access_token) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto min-h-screen pt-5 termsprivacy">
                    <h5 className="font-bold mb-4 text-[22px]">Privacy Policy</h5>
                    <div className="bg-[#fff] rounded-[12px] py-6 px-8" dangerouslySetInnerHTML={{__html: privacyContent}} />
                </div>
            </Layout>
        );
    }
    
    // If not logged in, show without Layout (no header)
    return (
        <>
            <div className="max-w-7xl mx-auto min-h-screen pt-5 termsprivacy">
                <h5 className="font-bold mb-4 text-[22px]">Privacy Policy</h5>
                <div className="bg-[#fff] rounded-[12px] py-6 px-8" dangerouslySetInnerHTML={{__html: privacyContent}} />
            </div>
            <Footer/>
        </>
    );
};
export default Privacy;