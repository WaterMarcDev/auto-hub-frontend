import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import api from "../../utils/api";   // added by shiva
import { cacheManager } from "../../utils/cacheManager";


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);   // count unread mails
  const [junkRequestCount, setJunkRequestCount] = useState(0);   // count new junk requests by shiva
  const [partRequestCount, setPartRequestCount] = useState(0);  // count new part requests

  // Initialize Socket.io connection for reactive cache updates across the app
  useEffect(() => {
    let socket;
    let cancelled = false;

    import("socket.io-client")
      .then(({ io }) => {
        if (cancelled) return;
        const socketUrl =
          import.meta.env.VITE_SOCKET_URL ||
          (import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
            : "https://api.autohubexpress.us");
        socket = io(socketUrl);
        cacheManager.initSocket(socket);
      })
      .catch((err) => {
        console.warn("Socket.io initialization error for cache manager:", err);
      });

    return () => {
      cancelled = true;
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

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

  // Unified ultra-lightweight badge counter (replaces 3 heavy full-collection polling loops)
  useEffect(() => {
    let mounted = true;

    const fetchBadgeCounts = async () => {
      try {
        const res = await api.get("/system/badge-counts");
        if (!mounted || !res.data) return;
        setUnreadCount(res.data.unreadCount || 0);
        setPartRequestCount(res.data.partRequestCount || 0);
        setJunkRequestCount(res.data.junkRequestCount || 0);
      } catch (err) {
        // Silent fallback without flooding console
      }
    };

    fetchBadgeCounts();

    // 30s backstop poll (saving 90% CPU/RAM on 2GB server compared to 5s full-collection scan)
    const interval = setInterval(fetchBadgeCounts, 30000);

    // Instant real-time updates when badges change via Socket.io
    const unsubBadge = cacheManager.subscribe("badge", fetchBadgeCounts);
    const unsubJunk = cacheManager.subscribe("junkCars", fetchBadgeCounts);
    const unsubPart = cacheManager.subscribe("partRequests", fetchBadgeCounts);

    return () => {
      mounted = false;
      clearInterval(interval);
      unsubBadge();
      unsubJunk();
      unsubPart();
    };
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
