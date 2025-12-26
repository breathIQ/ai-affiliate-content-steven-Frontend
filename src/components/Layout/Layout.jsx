import React from "react";
import PropTypes from "prop-types";
import Header from "./Header";
import TopNavTabs from "./TopNavTabs";

export default function Layout({ children }) {
    return (
        <>
        <div>
            <Header/>
            <TopNavTabs/>
            {children}
        </div>
          
        </>
    );
}

