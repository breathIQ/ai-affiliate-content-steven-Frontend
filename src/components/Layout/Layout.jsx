import React from "react";
import PropTypes from "prop-types";
import Header from "./Header";
import TopNavTabs from "./TopNavTabs";
import Footer from "./Footer";

export default function Layout({ children }) {
    return (
        <>
        <div>
            <Header/>
            <TopNavTabs/>
            <div className="px-[10px]">{children}</div>
            <Footer/>
        </div>
          
        </>
    );
}

