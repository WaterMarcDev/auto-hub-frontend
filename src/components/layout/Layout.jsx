import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import RightSidebar from "./RightSidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add/remove body class when sidebar opens/closes
  useEffect(() => {
    // Force dark theme by setting data attributes and classes
    document.body.setAttribute("data-sidebar", "dark");
    document.body.setAttribute("data-layout-mode", "dark");
    document.body.setAttribute("data-topbar", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.classList.add("dark-theme");

    // Add layout wrapper class
    // document.body.classList.add("layout-wrapper");

    if (sidebarOpen) {
      document.body.classList.add("sidebar-enable");
    } else {
      document.body.classList.remove("sidebar-enable");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("sidebar-enable", "layout-wrapper");
    };
  }, [sidebarOpen]);

  return (
    <div id="layout-wrapper">
      <Header onMenuToggle={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <div className="page-content">
          <div className="content">{children}</div>
          <Footer />
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
