import React, { useEffect, useRef, useState } from "react";

const Footer = () => {
    return (
        <footer className="w-full px-4 sm:px-6 py-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-[#6E6C81] text-[14px]">
                <div>&copy; {new Date().getFullYear()}, The Carbonated Body. All Rights Reserved. Made by CV Infotech</div>
                <div className="flex gap-4">
                    <a href="/terms" className="hover:underline">Terms & Conditions</a>
                    <a href="/privacy" className="hover:underline">Privacy Policy</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;