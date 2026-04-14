import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="w-full px-4 sm:px-6 py-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-[#6E6C81] text-[14px]">
                <div>&copy; {new Date().getFullYear()}, CO2Body (The Carbonated Body), Carbogenetics LLC. All Rights Reserved</div>
                <div className="flex gap-4">
                    <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
                    <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;