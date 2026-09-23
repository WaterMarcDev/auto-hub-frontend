import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Check user roles
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
  const navigate = useNavigate();

  const goToDashboard = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    navigate("/");
  };

  return (
    <header id="page-topbar">
      <div className="navbar-header">
        <div className="d-flex">
          {/* LOGO */}
          <div className="navbar-brand-box">
            <a href="/" onClick={goToDashboard} className="logo logo-dark">
              <span className="logo-sm">
                <img src="/assets/images/logo-sm.png" alt="" height="45" />
              </span>
              <span className="logo-lg">
                <img src="/assets/images/logo-dark.png" alt="" height="40" />
              </span>
            </a>
            <a href="/" onClick={goToDashboard} className="logo logo-light">
              <span className="logo-sm">
                <img src="/assets/images/logo-sm.png" alt="" height="45" />
              </span>
              <span className="logo-lg">
                <img src="/assets/images/logo-light.png" alt="" height="40" />
              </span>
            </a>
          </div>
          {isMobile && (
            <button
              type="button"
              className="btn btn-sm px-3 font-size-24 header-item waves-effect"
              id="vertical-menu-btn"
              onClick={onMenuToggle}
            >
              <i className="mdi mdi-menu text-light"></i>
            </button>
          )}
        </div>
        <div className="d-flex">
          {/* Guide Dropdown */}
          <div className="dropdown d-inline-block me-2">
            <button
              type="button"
              className="btn header-item waves-effect"
              id="page-header-guide-dropdown"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="mdi mdi-book-open-variant font-size-20 text-light"></i>
              <span className="d-none d-xl-inline-block ms-1 text-light">
                Guide
              </span>
              <i className="mdi mdi-chevron-down d-none d-xl-inline-block text-light ms-1"></i>
            </button>
            <div className="dropdown-menu dropdown-menu-end">
              {/* Admin and Manager see all guides */}
              {(isAdmin || isManager) && (
                <>
                  <h6 className="dropdown-header">Process Guides</h6>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/guide/car-intake")}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <i className="mdi mdi-car font-size-16 align-middle me-1"></i>
                    Car Intake Guide
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/guide/check-in")}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <i className="mdi mdi-account-check font-size-16 align-middle me-1"></i>
                    Check-In Guide
                  </button>
                  <div className="dropdown-divider"></div>
                  <h6 className="dropdown-header">Role-Based Guides</h6>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/guide/admin")}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <i className="mdi mdi-shield-crown font-size-16 align-middle me-1"></i>
                    Admin Guide
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/guide/manager")}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <i className="mdi mdi-account-tie font-size-16 align-middle me-1"></i>
                    Manager Guide
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/guide/front-desk")}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <i className="mdi mdi-desk font-size-16 align-middle me-1"></i>
                    Front Desk Guide
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/guide/staff")}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <i className="mdi mdi-account-hard-hat font-size-16 align-middle me-1"></i>
                    Staff Guide
                  </button>
                </>
              )}

              {/* Front Desk sees only their guide */}
              {isFrontDesk && (
                <>
                  <h6 className="dropdown-header">Your Guide</h6>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/guide/front-desk")}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <i className="mdi mdi-desk font-size-16 align-middle me-1"></i>
                    Front Desk Guide
                  </button>
                </>
              )}

              {/* Staff sees only their guide */}
              {isStaff && (
                <>
                  <h6 className="dropdown-header">Your Guide</h6>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/guide/staff")}
                    style={{
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <i className="mdi mdi-account-hard-hat font-size-16 align-middle me-1"></i>
                    Staff Guide
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Dropdown */}
          <div className="dropdown d-inline-block">
            <button
              type="button"
              className="btn header-item waves-effect"
              id="page-header-user-dropdown"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <img
                className="rounded-circle header-profile-user"
                src="/assets/images/logo-sm1.png"
                alt="Header Avatar"
              />
              <span className="d-none d-xl-inline-block ms-1 text-light">
                {user ? `${user.first_name} ${user.last_name}` : "User"}
              </span>
              <i className="mdi mdi-chevron-down d-none d-xl-inline-block text-light"></i>
            </button>
            <div className="dropdown-menu dropdown-menu-end">
              <a className="dropdown-item" href="#">
                <i className="mdi mdi-account-circle-outline font-size-16 align-middle me-1"></i>{" "}
                Profile
              </a>

              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger"
                onClick={handleLogout}
                style={{
                  border: "none",
                  background: "none",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <i className="mdi mdi-power font-size-16 align-middle me-1 text-danger"></i>{" "}
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
