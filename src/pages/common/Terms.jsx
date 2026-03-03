import React from "react";
import Layout from "../../components/Layout/Layout";
import { getTerms } from "../../services/common.api";
import Footer from "../../components/Layout/Footer";

const Terms = () => {
    const [termsContent, setTermsContent] = React.useState("");
    const access_token = localStorage.getItem("access_token"); // Check if user is logged in

    React.useEffect(() => {
        const fetchTerms = async () => {
            try {
                const response = await getTerms();
                console.log("Terms of Service response:", response);
                setTermsContent(response?.data?.content?.content || "");
            } catch (error) {
                console.error("Error fetching terms of service:", error);
            }
        };
        fetchTerms();
    }, []);
    
    // If logged in, use Layout with Header
    if (access_token) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto min-h-screen pt-5 termsprivacy">
                    <h5 className="font-bold mb-4 text-[22px]">Terms & Conditions</h5>
                    <div className="bg-[#fff] rounded-[12px] py-6 px-8" dangerouslySetInnerHTML={{__html: termsContent}} />
                </div>
            </Layout>
        );
    }
    
    // If not logged in, show without Layout (no header)
    return (
        <>
            <div className="max-w-7xl mx-auto min-h-screen pt-5 termsprivacy">
                <h5 className="font-bold mb-4 text-[22px]">Terms & Conditions</h5>
                <div className="bg-[#fff] rounded-[12px] py-6 px-8" dangerouslySetInnerHTML={{__html: termsContent}} />
            </div>
            <Footer/>
        </>
    );
};
export default Terms;