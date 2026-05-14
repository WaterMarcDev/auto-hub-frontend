import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import api from "../../utils/api";   // added by shiva


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);   // count unread mails
  const [junkRequestCount, setJunkRequestCount] = useState(0);   // count new junk requests by shiva
  const [partRequestCount, setPartRequestCount] = useState(0);  // count new part requests


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add/remove body class when sidebar opens/closes
  useEffect(() => {
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

   // (fetch unread count globally by shiva)
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/email/all`);
        const data = await res.json();

        const unread = data.filter(e => e.status === "unread").length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Unread fetch error:", err);
      }
    };

    fetchEmails();

    const interval = setInterval(fetchEmails, 5000); // auto update

    return () => clearInterval(interval);
  }, []);
  // end here

  // Fetch Part Requests by shiva
useEffect(() => {

  const fetchPartRequests = async () => {

    try {

      const res = await api.get("/part-request");

      const data = res.data;

      const activeRequests = Array.isArray(data.data)
        ? data.data.filter(
            (request) =>
              request.status !== "completed"
          ).length
        : 0;

      setPartRequestCount(activeRequests);

    } catch (err) {

      console.error(
        "Part request fetch error:",
        err
      );
    }
  };

  fetchPartRequests();

  const interval = setInterval(
    fetchPartRequests,
    5000
  );

  return () => clearInterval(interval);

}, []);
// end here

  // Fetch Junk Requests by shiva
  useEffect(() => {

  const fetchJunkRequests = async () => {

    try {
      

      const res = await api.get("/junk-car");

      const data = res.data;
      // const res = await fetch(
      //   `${import.meta.env.VITE_API_URL}/junk-car`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      // const data = await res.json();

      console.log("JUNK REQUESTS:", data);   // debug by  shiva

      const activeRequests = Array.isArray(data.data)
        ? data.data.filter(
            (car) => car.status !== "completed"
          ).length
        : 0;

      setJunkRequestCount(activeRequests);

    } catch (err) {

      console.error(
        "Junk request fetch error:",
        err
      );
    }
  };

  fetchJunkRequests();

  const interval = setInterval(
    fetchJunkRequests,
    5000
  );

  return () => clearInterval(interval);

}, []);
// end here

  return (
    <div id="layout-wrapper">
      <Header onMenuToggle={toggleSidebar} />

      {/* Pass unread count here by shiva */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
        junkRequestCount={junkRequestCount}
        partRequestCount={partRequestCount}
        />
        {/* end here */}

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
