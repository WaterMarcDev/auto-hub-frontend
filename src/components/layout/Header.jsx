import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Dropdown, Badge, Tag, Space } from "antd";
import {
  MenuOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  CarOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  IdcardOutlined,
  CompassOutlined,
  DownOutlined,
} from "@ant-design/icons";

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const navigate = useNavigate();

  const userRole = user?.role?.toLowerCase();
  const isManager = userRole === "manager";
  const isFrontDesk = userRole === "front_desk";
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Build Guide Menu Items based on role
  const guideMenuItems = [];
  if (isAdmin || isManager) {
    guideMenuItems.push(
      {
        key: "group-process",
        type: "group",
        label: <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Process Guides</span>,
        children: [
          {
            key: "guide-car-intake",
            icon: <CarOutlined style={{ color: "#525BE5" }} />,
            label: "Car Intake Guide",
            onClick: () => navigate("/guide/car-intake"),
          },
          {
            key: "guide-checkin",
            icon: <CheckCircleOutlined style={{ color: "#10B981" }} />,
            label: "Check-In Guide",
            onClick: () => navigate("/guide/check-in"),
          },
        ],
      },
      { type: "divider" },
      {
        key: "group-role",
        type: "group",
        label: <span style={{ color: "#94A3B8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Role Guides</span>,
        children: [
          {
            key: "guide-admin",
            icon: <SafetyCertificateOutlined style={{ color: "#F59E0B" }} />,
            label: "Admin Guide",
            onClick: () => navigate("/guide/admin"),
          },
          {
            key: "guide-manager",
            icon: <TeamOutlined style={{ color: "#525BE5" }} />,
            label: "Manager Guide",
            onClick: () => navigate("/guide/manager"),
          },
          {
            key: "guide-frontdesk",
            icon: <IdcardOutlined style={{ color: "#06B6D4" }} />,
            label: "Front Desk Guide",
            onClick: () => navigate("/guide/front-desk"),
          },
          {
            key: "guide-staff",
            icon: <UserOutlined style={{ color: "#94A3B8" }} />,
            label: "Staff Guide",
            onClick: () => navigate("/guide/staff"),
          },
        ],
      }
    );
  } else if (isFrontDesk) {
    guideMenuItems.push({
      key: "guide-frontdesk",
      icon: <IdcardOutlined style={{ color: "#06B6D4" }} />,
      label: "Front Desk Guide",
      onClick: () => navigate("/guide/front-desk"),
    });
  } else if (isStaff) {
    guideMenuItems.push({
      key: "guide-staff",
      icon: <UserOutlined style={{ color: "#94A3B8" }} />,
      label: "Staff Guide",
      onClick: () => navigate("/guide/staff"),
    });
  }

  // User Profile Dropdown Menu
  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      label: (
        <div style={{ padding: "4px 0", cursor: "default" }}>
          <div style={{ fontWeight: 600, color: "#F8FAFC" }}>
            {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "User" : "User"}
          </div>
          <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "2px" }}>
            {user?.email || ""}
          </div>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#EF4444" }} />,
      danger: true,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin": return "#525BE5";
      case "manager": return "#06B6D4";
      case "front_desk": return "#10B981";
      case "staff": return "#F59E0B";
      default: return "#64748B";
    }
  };

  return (
    <header id="page-topbar">
      <div className="navbar-header">
        {/* Left Section: Brand & Mobile Menu Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="/assets/images/logo-dark.png"
                alt="AutoHub"
                height="34"
                style={{ objectFit: "contain", filter: "brightness(1.05)" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/images/logo-sm.png";
                }}
              />
            </span>
          </Link>

          {isMobile && (
            <button
              type="button"
              onClick={onMenuToggle}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                color: "#F8FAFC",
                padding: "6px 10px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Toggle Navigation"
            >
              <MenuOutlined style={{ fontSize: "16px" }} />
            </button>
          )}

          {/* Operational Yard Indicator (hidden on small mobile) */}
          <div
            style={{
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              gap: "6px",
              marginLeft: "12px",
              padding: "3px 10px",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.10)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#34D399",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 6px rgba(16, 185, 129, 0.8)",
              }}
            />
            Main Yard • AutoHub Express
          </div>
        </div>

        {/* Right Section: Guides & User Dropdowns */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Guide Dropdown */}
          {guideMenuItems.length > 0 && (
            <Dropdown menu={{ items: guideMenuItems }} placement="bottomRight" trigger={["click"]}>
              <button
                type="button"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "#CBD5E1",
                  padding: "7px 12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.color = "#CBD5E1";
                }}
              >
                <CompassOutlined style={{ fontSize: "15px", color: "#525BE5" }} />
                <span style={{ display: isMobile ? "none" : "inline" }}>Guide</span>
                <DownOutlined style={{ fontSize: "10px", opacity: 0.7 }} />
              </button>
            </Dropdown>
          )}

          {/* User Profile Dropdown */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
            <button
              type="button"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                color: "#F8FAFC",
                padding: "5px 10px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #525BE5 0%, #363DA8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "13px",
                  boxShadow: "0 2px 6px rgba(82, 91, 229, 0.35)",
                }}
              >
                {user?.first_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {!isMobile && (
                <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#F8FAFC" }}>
                    {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "User" : "User"}
                  </div>
                  <Tag
                    bordered={false}
                    style={{
                      background: "rgba(82, 91, 229, 0.15)",
                      color: getRoleBadgeColor(user?.role),
                      fontSize: "10.5px",
                      lineHeight: "15px",
                      padding: "0 6px",
                      margin: "2px 0 0 0",
                      textTransform: "capitalize",
                      fontWeight: 600,
                    }}
                  >
                    {user?.role?.replace("_", " ") || "Staff"}
                  </Tag>
                </div>
              )}

              <DownOutlined style={{ fontSize: "10px", color: "#94A3B8", marginLeft: "2px" }} />
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
