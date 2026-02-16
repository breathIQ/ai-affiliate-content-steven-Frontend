import React, { useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { trackAffiliateClick } from "../services/common.api";
import NotFound from "./NotFound";
const AffiliateUserLandingPage = () => {
    const { affiliateId } = useParams();
    const navigate = useNavigate();
    const [hasFound, setHasFound] = React.useState(true);

    useEffect(() => {
        const sendAffiliateId = async () => {
            try {
                const res = await trackAffiliateClick(affiliateId);

                if (res?.success) {
                    window.location.href = res.data; // redirect to actual URL
                } else {
                    setHasFound(false);
                }

            } catch (error) {
                if (error.response?.status === 404) {
                    setHasFound(false);
                } else {
                    console.error("Tracking failed:", error.response?.data?.message);
                }
            }
        };

        if (affiliateId) {
            sendAffiliateId();
        }
    }, [affiliateId, navigate]);

    if (!hasFound) {
        return (
            <NotFound />
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-10 rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-4">
                    Please Wait while we are loading...
                </h1>
                <p className="text-gray-600 mb-6">
                    We’re setting things up just for you. Please hold on for a moment.
                </p>
            </div>
        </div>
    );
};

export default AffiliateUserLandingPage;
