import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Functions used for Car Intake menu
  const isSubMenuActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  // Top-level active helper
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const toggleDropdown = (menuKey) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const isDropdownOpen = (menuKey) => {
    return openDropdowns[menuKey] || false;
  };
  useEffect(() => {
    const path = location.pathname;
    const routeMapping = {
      "/add-car-make": "master",
      "/add-car-model": "master",
      "/add-car-trim": "master",
      "/add-inventory-parts": "master",
      "/add-junk-elements": "master",
      "/car-intake": "carIntake",
      "/car-intake-list": "carIntake",
      "/add-inventory": "carPartsInventory",
      "/inventory-lists": "carPartsInventory",
      "/print-tag": "carPartsInventory",
      "/junk-car": "carInventory",
      "/junk-car-lists": "carInventory",
      "/scrap-car": "scrapCar",
      "/scrap-car-lists": "scrapCar",
      "/add-new-seller": "seller",
      "/seller-lists": "seller",
      "/payment-lists": "payment",
      "/print-receipt": "printHub",
      "/auth-login": "authentication",
      "/auth-register": "authentication",
      "/auth-recoverpw": "authentication",
      "/auth-lock-screen": "authentication",
    };

    const menuKey = routeMapping[path];
    if (menuKey) {
      setOpenDropdowns((prev) => ({
        ...prev,
        [menuKey]: true,
      }));
    }
  }, [location.pathname]);

  return (
    <div className={`vertical-menu ${isOpen ? "show" : ""}`}>
      <div data-simplebar className="h-100">
        <div
          className="user-sidebar text-center"
          style={{
            background: "url(/assets/images/user-img.png)",
            backgroundColor: "#525ce5",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="dropdown">
            <div className="user-img">
              <img
                src="/assets/images/logo-sm1.png"
                alt=""
                className="rounded-circle"
              />
              <span className="avatar-online bg-success"></span>
            </div>
            <div className="user-info">
              <h5 className="mt-3 font-size-16 text-white">
                {user ? `${user.first_name} ${user.last_name}` : "User"}
              </h5>
              <span className="font-size-13 text-white-50">
                {user?.role
                  ? user.role.charAt(0).toUpperCase() +
                    user.role.slice(1).toLowerCase()
                  : "User"}
              </span>
            </div>
          </div>
        </div>

        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">Menu</li>
            <li className={isActive("/dashboard")}>
              <Link to="/dashboard" className="waves-effect">
                <i className="dripicons-home"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <a
                href="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("master");
                }}
              >
                <i className="dripicons-suitcase"></i>
                <span>Master</span>
              </a>
              <ul
                className="sub-menu"
                aria-expanded={isDropdownOpen("master")}
                style={{ display: isDropdownOpen("master") ? "block" : "none" }}
              >
                <li className={isSubMenuActive("/add-car-make")}>
                  <Link to="/make">Add Car Make</Link>
                </li>
                {/* <li className={isSubMenuActive("/add-car-model")}>
                  <Link to="/add-car-model">Add Car Model</Link>
                </li>
                <li className={isSubMenuActive("/add-car-trim")}>
                  <Link to="/add-car-trim">Add Car Trim</Link>
                </li>
                <li className={isSubMenuActive("/add-inventory-parts")}>
                  <Link to="/add-inventory-parts">Add Inventory Parts</Link>
                </li>
                <li className={isSubMenuActive("/add-junk-elements")}>
                  <Link to="/add-junk-elements">Add Scrap Elements</Link>
                </li> */}
              </ul>
            </li>

            <li>
              <a
                href="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("carIntake");
                }}
              >
                <i className="dripicons-enter"></i>
                <span>Car Intake</span>
              </a>
              <ul
                className="sub-menu"
                aria-expanded={isDropdownOpen("carIntake")}
                style={{
                  display: isDropdownOpen("carIntake") ? "block" : "none",
                }}
              >
                <li className={isSubMenuActive("/car-intake")}>
                  <Link to="/car-intake">Add New Car</Link>
                </li>
                <li className={isSubMenuActive("/car-intake-list")}>
                  <Link to="/car-intake-list">Lists</Link>
                </li>
              </ul>
            </li>

            {/* <li>
              <a
                href="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("carPartsInventory");
                }}
              >
                <i className="dripicons-gear"></i>
                <span>Car Parts Inventory</span>
              </a>
              <ul
                className="sub-menu"
                aria-expanded={isDropdownOpen("carPartsInventory")}
                style={{
                  display: isDropdownOpen("carPartsInventory")
                    ? "block"
                    : "none",
                }}
              >
                <li>
                  <Link to="/add-inventory">Add Inventory</Link>
                </li>
                <li>
                  <Link to="/inventory-lists">Inventory Lists</Link>
                </li>
                <li>
                  <Link to="/print-tag">Print Tag</Link>
                </li>
              </ul>
            </li> */}

            {/* <li>
              <a
                href="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("carInventory");
                }}
              >
                <i className="dripicons-suitcase"></i>
                <span>Car Inventory</span>
              </a>
              <ul
                className="sub-menu"
                aria-expanded={isDropdownOpen("carInventory")}
                style={{
                  display: isDropdownOpen("carInventory") ? "block" : "none",
                }}
              >
                <li>
                  <Link to="/junk-car">Add New</Link>
                </li>
                <li>
                  <Link to="/junk-car-lists">Car Inventory Lists</Link>
                </li>
              </ul>
            </li> */}

            {/* <li>
              <a
                href="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("scrapCar");
                }}
              >
                <i className="dripicons-box"></i>
                <span>Scrap a Car</span>
              </a>
              <ul
                className="sub-menu"
                aria-expanded={isDropdownOpen("scrapCar")}
                style={{
                  display: isDropdownOpen("scrapCar") ? "block" : "none",
                }}
              >
                <li>
                  <Link to="/scrap-car">Add New</Link>
                </li>
                <li>
                  <Link to="/scrap-car-lists">Scrap Car Lists</Link>
                </li>
              </ul>
            </li> */}

            {/* <li>
              <a
                href="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("seller");
                }}
              >
                <i className="dripicons-user"></i>
                <span>Seller</span>
              </a>
              <ul
                className="sub-menu"
                aria-expanded={isDropdownOpen("seller")}
                style={{ display: isDropdownOpen("seller") ? "block" : "none" }}
              >
                <li>
                  <Link to="/add-new-seller">Add New Seller</Link>
                </li>
                <li>
                  <Link to="/seller-lists">Seller Lists</Link>
                </li>
              </ul>
            </li> */}

            {/* <li>
              <a
                href="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("payment");
                }}
              >
                <i className="dripicons-card"></i>
                <span>Payment</span>
              </a>
              <ul
                className="sub-menu"
                aria-expanded={isDropdownOpen("payment")}
                style={{
                  display: isDropdownOpen("payment") ? "block" : "none",
                }}
              >
                <li>
                  <Link to="/payment-lists">Payment Lists</Link>
                </li>
              </ul>
            </li> */}

            {/* <li>
              <a
                href="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("printHub");
                }}
              >
                <i className="dripicons-print"></i>
                <span>Print Hub</span>
              </a>
              <ul
                className="sub-menu"
                aria-expanded={isDropdownOpen("printHub")}
                style={{
                  display: isDropdownOpen("printHub") ? "block" : "none",
                }}
              >
                <li>
                  <Link to="/print-receipt">Print</Link>
                </li>
              </ul>
            </li> */}

            {/* <li>
              <a href="#" className="waves-effect">
                <i className="dripicons-user"></i>
                <span>Attendance</span>
              </a>
            </li> */}

            {/* <li>
              <a
                href="#"
                className="has-arrow waves-effect"
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown("authentication");
                }}
              >
                <i className="dripicons-user-group"></i>
                <span>Authentication</span>
              </a>
              <ul
                className="sub-menu"
                aria-expanded={isDropdownOpen("authentication")}
                style={{
                  display: isDropdownOpen("authentication") ? "block" : "none",
                }}
              >
                <li>
                  <Link to="/auth-login">Login</Link>
                </li>
                <li>
                  <Link to="/auth-register">Register</Link>
                </li>
                <li>
                  <Link to="/auth-recoverpw">Re-Password</Link>
                </li>
                <li>
                  <Link to="/auth-lock-screen">Lock Screen</Link>
                </li>
              </ul>
            </li> */}

            {/* <li>
              <a href="#" className="waves-effect">
                <i className="dripicons-message"></i>
                <span>Reporting</span>
              </a>
            </li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
