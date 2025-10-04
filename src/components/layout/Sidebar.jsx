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

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Check user roles
  const userRole = user?.role?.toLowerCase();
  const isManager = userRole === "manager";
  const isFrontDesk = userRole === "front_desk";
  const isAdmin = userRole === "admin";

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
    if (!isManager) {
      items.push({
        key: "/",
        icon: <HomeOutlined />,
        label: <Link to="/">Home</Link>,
      });
      items.push({
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">Dashboard</Link>,
      });
    }

    // Master Menu - Only for Admin
    if (isAdmin) {
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

    // Car Parts Inventory - visible for Front Desk and Admin
    if (isFrontDesk || isAdmin) {
      const carPartsChildren = [];
      if (isAdmin) {
        carPartsChildren.push({
          key: "/add-inventory",
          icon: <BulletIcon />,
          label: <Link to="/add-inventory">Add Inventory</Link>,
        });
      }
      carPartsChildren.push({
        key: "/inventory-list",
        icon: <BulletIcon />,
        label: <Link to="/inventory-list">Inventory Lists</Link>,
      });

      items.push({
        key: "carPartsInventory",
        icon: <ToolOutlined />,
        label: "Car Parts Inventory",
        children: carPartsChildren,
      });
    }

    // Car Inventory - Only for Admin
    if (isAdmin) {
      items.push({
        key: "carInventory",
        icon: <InboxOutlined />,
        label: "Car Inventory",
        children: [
          {
            key: "/car-inventory",
            icon: <BulletIcon />,
            label: <Link to="/car-inventory">Car Inventory Lists</Link>,
          },
        ],
      });
    }

    // Scrap a Car - Only for Admin
    if (isAdmin) {
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
            key: "/scrap-list",
            icon: <BulletIcon />,
            label: <Link to="/scrap-list">Scrap Car Lists</Link>,
          },
        ],
      });
    }

    // Seller - visible for Front Desk and Admin
    if (isFrontDesk || isAdmin) {
      items.push({
        key: "seller",
        icon: <UserOutlined />,
        label: "Seller",
        children: [
          {
            key: "/seller/register",
            icon: <BulletIcon />,
            label: <Link to="/seller/register">Add New Seller</Link>,
          },
          {
            key: "/seller/list",
            icon: <BulletIcon />,
            label: <Link to="/seller/list">Seller Lists</Link>,
          },
        ],
      });
    }

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
      "/car-intake": "carIntake",
      "/car-intake-list": "carIntake",
      "/add-inventory": "carPartsInventory",
      "/inventory-list": "carPartsInventory",
      "/car-inventory": "carInventory",
      "/add-scrap": "scrapCar",
      "/scrap-list": "scrapCar",
      "/seller/register": "seller",
      "/seller/list": "seller",
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
