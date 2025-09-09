import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

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

  const goToCarIntake = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    navigate("/car-intake-list");
  };

  return (
    <header id="page-topbar">
      <div className="navbar-header">
        <div className="d-flex">
          {/* LOGO */}
          <div className="navbar-brand-box">
            <a
              href="/car-intake-list"
              onClick={goToCarIntake}
              className="logo logo-dark"
            >
              <span className="logo-sm">
                <img src="/assets/images/logo-sm.png" alt="" height="45" />
              </span>
              <span className="logo-lg">
                <img src="/assets/images/logo-dark.png" alt="" height="40" />
              </span>
            </a>
            <a
              href="/car-intake-list"
              onClick={goToCarIntake}
              className="logo logo-light"
            >
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
              <i className="mdi mdi-menu"></i>
            </button>
          )}
        </div>
        <div className="d-flex">
          {/* <div className="dropdown d-inline-block">
            <button
              type="button"
              className="btn header-item noti-icon waves-effect"
              id="page-header-notifications-dropdown"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="mdi mdi-bell-outline bx-tada"></i>
              <span className="badge bg-danger rounded-pill">3</span>
            </button>
            <div
              className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
              aria-labelledby="page-header-notifications-dropdown"
            >
              <div className="p-3">
                <div className="row align-items-center">
                  <div className="col">
                    <h6 className="m-0"> Notifications </h6>
                  </div>
                  <div className="col-auto">
                    <a href="#!" className="small">
                      {" "}
                      View All
                    </a>
                  </div>
                </div>
              </div>
              <div data-simplebar style={{ maxHeight: "230px" }}>
                <a href="" className="text-reset notification-item">
                  <div className="media">
                    <div className="avatar-xs me-3">
                      <span className="avatar-title bg-primary rounded-circle font-size-16">
                        <i className="mdi mdi-cart text-white"></i>
                      </span>
                    </div>
                    <div className="media-body">
                      <h6 className="mt-0 mb-1">Your order is placed</h6>
                      <div className="font-size-13 text-muted">
                        <p className="mb-1">
                          If several languages coalesce the grammar
                        </p>
                        <p className="mb-0">
                          <i className="mdi mdi-clock-outline"></i> 3 min ago
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
              <div className="p-2 border-top">
                <a
                  className="btn btn-sm btn-link font-size-14 w-100 text-center"
                  href="javascript:void(0)"
                >
                  <i className="mdi mdi-arrow-right-circle me-1"></i> View
                  More..
                </a>
              </div>
            </div>
          </div> */}

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
              <span className="d-none d-xl-inline-block ms-1">
                {user ? `${user.first_name} ${user.last_name}` : "User"}
              </span>
              <i className="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
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
