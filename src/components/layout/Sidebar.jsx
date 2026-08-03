import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "antd";
import {
  HomeOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  CarOutlined,
  ToolOutlined,
  InboxOutlined,
  DeleteOutlined,
  UserOutlined,
  FileProtectOutlined,
  SettingOutlined,
  ShopOutlined,
  GlobalOutlined,
  MessageOutlined,
  ApiOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDot } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../hooks/useAuth";

// Custom FontAwesome bullet icon component using circle-dot
const BulletIcon = () => (
  <FontAwesomeIcon
    icon={faCircleDot}
    style={{ fontSize: "8px", marginRight: "10px" }}
  />
);

const Sidebar = ({ isOpen, unreadCount, junkRequestCount, partRequestCount }) => {
  // console.log("Sidebar Loaded");

  const location = useLocation();
  const { user } = useAuth();
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Check user roles
  const userRole = user?.role?.toLowerCase();
  const isManager = userRole === "manager";
  const isFrontDesk = userRole === "front_desk";
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff";
  const isScraper = userRole === "scraper";

  // Setup menu items based on user role
  const getMenuItems = () => {
    const items = [];

    // Menu Title (non-clickable)
    items.push({
      key: "menu-title",
      label: "Menu",
      type: "group",
    });

    // Home and Dashboard - visible for Admin and Front Desk
    // Home - visible to all users
    items.push({
      key: "/",
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    });


    // Master Menu - Only for Admin
    if (isManager || isAdmin) {
      items.push({
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">Dashboard</Link>,
      });

      // added by shiva
      // Requests: Part Request and Junk Car Request combined
      items.push({
        key: "requests",
        icon: <InboxOutlined />,
        label: "Requests",
        children: [
          {
            key: "/part-requests",
            icon: <BulletIcon />,
            label: (
              <Link 
                to="/part-requests"
                style={{ flex: 1 }}
              >
                Part Requests

                {partRequestCount > 0 && (
                  <span
                    style={{
                      background: "#3b82f6",
                      color: "#fff",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: "600",
                      marginLeft: "8px",
                    }}
                  >
                    {partRequestCount}
                  </span>
                )}
              </Link>
            ),
          },
          {
            key: "/junk-car-requests",
            icon: <BulletIcon />,
            label: (
              <Link 
                to="/junk-car-requests"
                style={{ flex: 1 }}
              >
                Junk Car Requests
                
                {junkRequestCount > 0 && (
                  <span
                    style={{
                      background: "#3b82f6",
                      color: "#fff",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: "600",
                      marginLeft: "8px",
                    }}
                  >
                    {junkRequestCount}
                  </span>
                )}
              </Link>
            ),
          },
          // added by shiva Inbox
          {
            key: "/inbox",
            icon: <BulletIcon />,
            label: (
            // <div style={{
            //   alignItems: "center",
            // }}>
            <Link to="/inbox" style={{ flex: 1 }}>
              Inbox
            {unreadCount > 0 && (
              <span style={{
                background: "#3b82f6",
                color: "#fff",
                borderRadius: "999px",
                padding: "2px 8px",
                fontSize: "11px",
                fontWeight: "600",
                marginLeft: "8px"
              }}>
                {unreadCount}
              </span>
            )}
            </Link>
            // </div>
            ),
          }
          // end here
        ],
      });
      //end here
      

      /* User Management moved to bottom as per request */

      items.push({
        key: "master",
        icon: <AppstoreOutlined />,
        label: "Master",
        children: [
          {
            key: "/make",
            icon: <BulletIcon />,
            label: <Link to="/make">Add Car Make</Link>,
          },
          {
            key: "/model",
            icon: <BulletIcon />,
            label: <Link to="/model">Add Car Model</Link>,
          },
          {
            key: "/trim",
            icon: <BulletIcon />,
            label: <Link to="/trim">Add Car Trim</Link>,
          },
          {
            key: "/part",
            icon: <BulletIcon />,
            label: <Link to="/part">Add Inventory Parts</Link>,
          },
          {
            key: "/element",
            icon: <BulletIcon />,
            label: <Link to="/element">Add Scrap Elements</Link>,
          },
        ],
      });
    }

    // Car Intake - visible for Manager, Front Desk, and Admin
    if (isAdmin || isManager || isStaff) {
      items.push({
        key: "carIntake",
        icon: <CarOutlined />,
        label: "Car Intake",
        children: [
          {
            key: "/car-intake",
            icon: <BulletIcon />,
            label: <Link to="/car-intake">Add New Car</Link>,
          },
          {
            key: "/car-intake-list",
            icon: <BulletIcon />,
            label: <Link to="/car-intake-list">Lists</Link>,
          },
        ],
      });
    }

    // Car Parts Inventory - visible for Front Desk and Admin
    if (isAdmin || isManager || isStaff) {
      const carPartsChildren = [];
      carPartsChildren.push({
        key: "/add-inventory",
        icon: <BulletIcon />,
        label: <Link to="/add-inventory">Add Inventory</Link>,
      });
      carPartsChildren.push({
        key: "/inventory-list",
        icon: <BulletIcon />,
        label: <Link to="/inventory-list">Inventory Lists</Link>,
      });
      // Master Parts page (master list view)
      carPartsChildren.push({
        key: "/inventory-master",
        icon: <BulletIcon />,
        label: <Link to="/inventory-master">Master Parts</Link>,
      });

      carPartsChildren.push({
        key: "/inventory-tags",
        icon: <BulletIcon />,
        label: <Link to="/inventory-tags">Asset Tags</Link>,
      });

      items.push({
        key: "carPartsInventory",
        icon: <ToolOutlined />,
        label: "Car Parts Inventory",
        children: carPartsChildren,
      });


      

      
      // Add Requests Module here - Shiva
      // items.push({
      //   key: "/partRequests",
      //   icon: <InboxOutlined />,
      //   label: "Part Requests",
      //   children: [
      //     {
      //       key: "/part-requests",
      //       icon: <BulletIcon />,
      //       label: <Link to="/part-requests">Part Request Lists</Link>,
      //     },

      //     // Add Part Request
      //     // {
      //     //   key: "/add-part-request",
      //     //   icon: <BulletIcon />,
      //     //   label: <Link to="/add-part-request">Add Part Request</Link>,
      //     // },
      //   ],
      // });   // end here

      // Add Junk Car module - shiva
      // items.push({
      //   key: "/junkCarRequests",
      //   icon: <DeleteOutlined />,
      //   label: "Junk Car Requests",
      //   children: [
      //     {
      //       key: "/junk-car-requests",
      //       icon: <BulletIcon />,
      //       label: <Link to="/junk-car-requests">Junk Car Lists</Link>,
      //     },
      //     // {
      //     //   key: "/add-junk-car-request",
      //     //   icon: <BulletIcon />,
      //     //   label: <Link to="/add-junk-car-request">Add Junk Car</Link>,
      //     // },
      //   ],
      // });


    }

    // Social & Marketplace Integrations - Admin and Manager
    if (isAdmin || isManager) {
      items.push({
        key: "integrations",
        icon: <ApiOutlined />,
        label: "Integrations",
        children: [
          {
            key: "/unified-inbox",
            icon: <MessageOutlined />,
            label: <Link to="/unified-inbox">Marketplace Inbox</Link>,
          },
          {
            key: "/social-leads",
            icon: <GlobalOutlined />,
            label: <Link to="/social-leads">Social Media Leads</Link>,
          },
          {
            key: "/marketplace-leads",
            icon: <ShopOutlined />,
            label: <Link to="/marketplace-leads">Marketplace Listings</Link>,
          },
          {
            key: "/orders",
            icon: <ShoppingCartOutlined />,
            label: <Link to="/orders">Marketplace Orders</Link>,
          },
          {
            key: "/integrations",
            icon: <ApiOutlined />,
            label: <Link to="/integrations">Platform Connections</Link>,
          },
        ],
      });
    }

    // Car Inventory - Only for Admin
    if (isAdmin || isManager || isStaff) {
      items.push({
        key: "carInventory",
        icon: <InboxOutlined />,
        label: "Car Inventory for Scrap",
        children: [
          {
            key: "/car-inventory",
            icon: <BulletIcon />,
            label: <Link to="/car-inventory">Car Inventory Lists</Link>,
          },
        ],
      });
      
    }

    // Scrap a Car - Only for Admin, Manager, Staff and Scraper
    if (isAdmin || isManager || isStaff || isScraper) {
      items.push({
        key: "scrapCar",
        icon: <DeleteOutlined />,
        label: "Scrap a Car",
        children: [
          {
            key: "/add-scrap",
            icon: <BulletIcon />,
            label: <Link to="/add-scrap">Add New</Link>,
          },
          {
            key: "/ready-to-scrap",
            icon: <BulletIcon />,
            label: (
              <Link to="/ready-to-scrap">
                Ready To Scrap
              </Link>
            ),
          },
          {
            key: "/scrap-list",
            icon: <BulletIcon />,
            label: <Link to="/scrap-list">Scrap Car Lists</Link>,
          },
          {
            key: "/element-hub",
            icon: <BulletIcon />,
            label: <Link to="/element-hub">Element Hub</Link>,
          },
        ],
      });
    }

    // Customer - visible for Front Desk, Scraper and Admin
    if (isFrontDesk || isScraper || isAdmin || isManager) {
      items.push({
        key: "customer",
        icon: <UserOutlined />,
        label: "Customer",
        children: [
          {
            key: "/customer/register",
            icon: <BulletIcon />,
            label: <Link to="/customer/register">Add New Customer</Link>,
          },
          {
            key: "/customer/list",
            icon: <BulletIcon />,
            label: <Link to="/customer/list">Customer Lists</Link>,
          },
        ],
      });
    }

    // Check-In - visible for Front Desk, Scraper and Admin
    if (isFrontDesk || isScraper || isAdmin || isManager) {
      items.push({
        key: "checkin",
        icon: <CarOutlined />,
        label: "Check-In",
        children: [
          {
            key: "/checkins",
            icon: <BulletIcon />,
            label: <Link to="/checkins">Checked In</Link>,
          },
          {
            key: "/checkins/all",
            icon: <BulletIcon />,
            label: <Link to="/checkins/all">All Check-Ins</Link>,
          },
        ],
      });
    }


    // Waiver - visible for Front Desk, Scraper and Admin
    if (isFrontDesk || isScraper || isAdmin || isManager) {
      items.push({
        key: "waiver",
        icon: <FileProtectOutlined />,
        label: "Waiver Form",
        children: [
          {
            key: "/waivers/add",
            icon: <BulletIcon />,
            label: <Link to="/waivers/add">Fill Waiver Form</Link>,
          },
          {
            key: "/waivers",
            icon: <BulletIcon />,
            label: <Link to="/waivers">Lists</Link>,
          },
        ],
      });
    }

    // User Management - visible for Admin and Manager (Moved to second last)
    if (isManager || isAdmin) {
      items.push({
        key: "userManagement",
        icon: <UserOutlined />,
        label: "User Management",
        children: [
          {
            key: "/users/add",
            icon: <BulletIcon />,
            label: <Link to="/users/add">Add New User</Link>,
          },
          {
            key: "/users/list",
            icon: <BulletIcon />,
            label: <Link to="/users/list">User Lists</Link>,
          },
        ],
      });
    }

    // System Settings - Only for Admin
    if (isAdmin) {
      items.push({
        key: "/entry-fee",
        icon: <SettingOutlined />,
        label: <Link to="/entry-fee">Entry Fee Settings</Link>,
      });
    }
    // Error Codes - Visible to all users
    items.push({
      key: "/error-codes",
      icon: <FileProtectOutlined />,
      label: <Link to="/error-codes">Error Codes</Link>,
    });


    // User Guides - visible for all users
    const guideChildren = [];

    // Admin and Manager see all guides
    if (isAdmin || isManager) {
      guideChildren.push(
        {
          key: "/guide/car-intake",
          icon: <BulletIcon />,
          label: <Link to="/guide/car-intake">Car Intake Guide</Link>,
        },
        {
          key: "/guide/check-in",
          icon: <BulletIcon />,
          label: <Link to="/guide/check-in">Check-In Guide</Link>,
        },
        {
          key: "/guide/admin",
          icon: <BulletIcon />,
          label: <Link to="/guide/admin">Admin Guide</Link>,
        },
        {
          key: "/guide/manager",
          icon: <BulletIcon />,
          label: <Link to="/guide/manager">Manager Guide</Link>,
        },
        {
          key: "/guide/front-desk",
          icon: <BulletIcon />,
          label: <Link to="/guide/front-desk">Front Desk Guide</Link>,
        },
        {
          key: "/guide/staff",
          icon: <BulletIcon />,
          label: <Link to="/guide/staff">Staff Guide</Link>,
        }
      );
    } else if (isFrontDesk) {
      // Front Desk sees only their guide
      guideChildren.push({
        key: "/guide/front-desk",
        icon: <BulletIcon />,
        label: <Link to="/guide/front-desk">Front Desk Guide</Link>,
      });
    } else if (isScraper) {
      // Scraper sees Front Desk guide for now
      guideChildren.push({
        key: "/guide/front-desk",
        icon: <BulletIcon />,
        label: <Link to="/guide/front-desk">Front Desk Guide</Link>,
      });
    } else if (isStaff) {
      // Staff sees only their guide
      guideChildren.push({
        key: "/guide/staff",
        icon: <BulletIcon />,
        label: <Link to="/guide/staff">Staff Guide</Link>,
      });
    }

    items.push({
      key: "userGuides",
      icon: <FileProtectOutlined />,
      label: "User Guides",
      children: guideChildren,
    });
    return items;
  };

  // Update selected and open keys based on current route
  useEffect(() => {
    const path = location.pathname;
    setSelectedKeys([path]);

    // Route to submenu mapping
    const routeMapping = {
      "/make": "master",
      "/model": "master",
      "/trim": "master",
      "/part": "master",
      "/element": "master",
      "/users/add": "userManagement",
      "/users/list": "userManagement",
      "/car-intake": "carIntake",
      "/car-intake-list": "carIntake",
      "/add-inventory": "carPartsInventory",
      "/inventory-list": "carPartsInventory",
      "/inventory-master": "carPartsInventory",
      "/car-inventory": "carInventory",
      "/add-scrap": "scrapCar",
      "/scrap-list": "scrapCar",
      "/element-hub": "scrapCar",
      "/customer/register": "customer",
      "/customer/list": "customer",
      "/seller/register": "customer",
      "/seller/list": "customer",
      "/buyer/register": "customer",
      "/buyer/list": "customer",
      "/waivers/add": "waiver",
      "/waivers": "waiver",
      "/checkins": "checkin",
      "/checkins/all": "checkin",
      "/guide/car-intake": "userGuides",
      "/guide/check-in": "userGuides",
      "/guide/admin": "userGuides",
      "/guide/manager": "userGuides",
      "/guide/front-desk": "userGuides",
      "/guide/staff": "userGuides",
      "/entry-fee": "entryFee",
      "/part-requests": "requests",       // added by shiva
      "/junk-car-requests": "requests",   // added by shiva
      "/inbox": "requests",               // added by shiva
      "/social-leads": "integrations",
      "/marketplace-leads": "integrations",
      "/unified-inbox": "integrations",
      "/orders": "integrations",
      "/integrations": "integrations",
    };
    const parentKey = routeMapping[path];
    if (parentKey && !openKeys.includes(parentKey)) {
      setOpenKeys([parentKey]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleOpenChange = (keys) => {
    // Only allow one submenu open at a time (accordion mode)
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

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
            height: "167px",
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
                  ? user.role
                    .split("_")
                    .map(
                      (part) =>
                        part.charAt(0).toUpperCase() +
                        part.slice(1).toLowerCase()
                    )
                    .join(" ")
                  : "User"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            items={getMenuItems()}
            style={{
              height: "100%",
              borderRight: 0,
              background: "transparent",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;