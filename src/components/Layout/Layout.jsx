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
            {children}
            <Footer/>
        </div>
          
        </>
    );
}

