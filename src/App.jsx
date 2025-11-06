import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import { Spin } from "antd";

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const CarIntake = React.lazy(() => import("./pages/CarIntake"));
const CarIntakeList = React.lazy(() => import("./pages/CarIntakeList"));
const CarIntakeDetails = React.lazy(() => import("./pages/CarIntakeDetails"));
const Login = React.lazy(() => import("./pages/Login"));

import { ConfigProvider, theme } from "antd";
const Make = React.lazy(() => import("./pages/Make"));
const Model = React.lazy(() => import("./pages/Model"));
const Trim = React.lazy(() => import("./pages/Trim"));
const Part = React.lazy(() => import("./pages/Part"));
const Element = React.lazy(() => import("./pages/Element"));
const PartInventoryAdd = React.lazy(() => import("./pages/PartInventory/Add"));
const PartInventoryList = React.lazy(() =>
  import("./pages/PartInventory/List")
);
const PartInventoryMaster = React.lazy(() =>
  import("./pages/PartInventory/MasterList")
);
const Dashboard2 = React.lazy(() => import("./pages/Dashboard2"));
const CarInventoryList = React.lazy(() => import("./pages/CarInventory/List"));
const AddScrap = React.lazy(() => import("./pages/Scrap/Add"));
const ScrapList = React.lazy(() => import("./pages/Scrap/List"));
const SellerRegister = React.lazy(() => import("./pages/Seller/Register"));
const SellerList = React.lazy(() => import("./pages/Seller/List"));
const BuyerRegister = React.lazy(() => import("./pages/Buyer/Register"));
const BuyerList = React.lazy(() => import("./pages/Buyer/List"));
const AddWaiver = React.lazy(() =>
  import("./pages/Waiver").then((mod) => ({ default: mod.AddWaiver }))
);
const WaiverList = React.lazy(() =>
  import("./pages/Waiver").then((mod) => ({ default: mod.WaiverList }))
);
const WaiverDetails = React.lazy(() =>
  import("./pages/Waiver").then((mod) => ({ default: mod.WaiverDetails }))
);
const CheckedInList = React.lazy(() => import("./pages/CheckIn/CheckedInList"));
const AllCheckins = React.lazy(() => import("./pages/CheckIn/AllCheckins"));
const CarIntakeGuide = React.lazy(() => import("./pages/Guide/CarIntakeGuide"));
const CheckInGuide = React.lazy(() => import("./pages/Guide/CheckInGuide"));

// Create placeholder components for other routes
const PlaceholderPage = ({ title }) => (
  <div className="page-title-box">
    <div className="container-fluid">
      <div className="row align-items-center">
        <div className="col-sm-6">
          <div className="page-title">
            <h4>{title}</h4>
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item">
                <a href="javascript: void(0);">Scrap Yard</a>
              </li>
              <li className="breadcrumb-item active">{title}</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">{title}</h4>
            <p>This page is under development.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Auth placeholder component (standalone without layout)
const AuthPlaceholderPage = ({ title }) => {
  React.useEffect(() => {
    // Fix body styles for auth page
    document.body.style.display = "block";
    document.body.style.placeItems = "initial";
    document.body.style.minHeight = "100vh";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    // Also fix the root element
    const rootElement = document.getElementById("root");
    rootElement.style.display = "block";
    rootElement.style.placeItems = "initial";
    rootElement.style.minHeight = "100vh";
    rootElement.style.width = "100%";
  }, []);

  return (
    <div className="authentication-bg bg-primary">
      <div className="home-center">
        <div className="home-desc-center">
          <div className="container">
            <div className="home-btn">
              <Link to="/" className="text-white router-link-active">
                <i className="fas fa-home h2"></i>
              </Link>
            </div>
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6 col-xl-5">
                <div className="card">
                  <div className="card-body">
                    <div className="px-2 py-3">
                      <div className="text-center">
                        <Link to="/">
                          <img
                            src="assets/images/logo-dark.png"
                            height="45"
                            alt="logo"
                          />
                        </Link>
                        <h5 className="text-primary mb-2 mt-4">{title}</h5>
                        <p className="text-muted">
                          This page is under development.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-center text-white">
                  <p>
                    <Link to="/auth-login" className="fw-bold text-white">
                      ← Back to Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgContainer: "#1F293D",
          colorBgLayout: "#1F293D",
          colorBgElevated: "#1F293D",
          colorPrimaryActive: "#525BE5",
        },
        components: {
          Modal: {
            contentBg: "#1F293D",
            headerBg: "#1F293D",
            algorithm: true,
          },
          Card: {
            algorithm: true,
          },
          // Button: { algorithm: true, colorPrimary: "#525BE5" },
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            {/* Authentication Routes (without main layout) */}
            <Route
              path="/auth-login"
              element={
                <Suspense
                  fallback={
                    <div style={{ textAlign: "center", padding: 40 }}>
                      <Spin size="large" />
                    </div>
                  }
                >
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/auth-register"
              element={<AuthPlaceholderPage title="Register" />}
            />
            <Route
              path="/auth-recoverpw"
              element={<AuthPlaceholderPage title="Recover Password" />}
            />
            <Route
              path="/auth-lock-screen"
              element={<AuthPlaceholderPage title="Lock Screen" />}
            />

            {/* Main App Routes (with layout and authentication) */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense
                      fallback={
                        <div style={{ textAlign: "center", padding: 40 }}>
                          <Spin size="large" />
                        </div>
                      }
                    >
                      <Routes>
                        <Route path="/" element={<Dashboard2 />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/make" element={<Make />} />
                        <Route path="/model" element={<Model />} />
                        <Route path="/trim" element={<Trim />} />
                        <Route path="/element" element={<Element />} />
                        <Route path="/part" element={<Part />} />
                        <Route path="/car-intake" element={<CarIntake />} />
                        <Route
                          path="/car-intake-list"
                          element={<CarIntakeList />}
                        />
                        {/* Keep details on a specific details route, and use /car-intake/:id for edit (reuse form) */}
                        <Route path="/car-intake/:id" element={<CarIntake />} />
                        <Route
                          path="/car-intake/:id/details"
                          element={<CarIntakeDetails />}
                        />
                        <Route
                          path="/add-inventory"
                          element={<PartInventoryAdd />}
                        />
                        <Route
                          path="/inventory-list"
                          element={<PartInventoryList />}
                        />
                        <Route
                          path="/inventory-master"
                          element={<PartInventoryMaster />}
                        />
                        <Route
                          path="/car-inventory"
                          element={<CarInventoryList />}
                        />
                        <Route path="/add-scrap" element={<AddScrap />} />
                        <Route path="/scrap-list" element={<ScrapList />} />
                        <Route path="/seller/list" element={<SellerList />} />
                        <Route
                          path="/seller/register"
                          element={<SellerRegister />}
                        />
                        <Route path="/buyer/list" element={<BuyerList />} />
                        <Route
                          path="/buyer/register"
                          element={<BuyerRegister />}
                        />
                        <Route
                          path="/buyer/edit/:id"
                          element={<BuyerRegister />}
                        />
                        <Route path="/waivers" element={<WaiverList />} />
                        <Route path="/waivers/add" element={<AddWaiver />} />
                        <Route
                          path="/waivers/:id"
                          element={<WaiverDetails />}
                        />
                        <Route path="/checkins" element={<CheckedInList />} />
                        <Route path="/checkins/all" element={<AllCheckins />} />
                        
                        {/* Guide Routes */}
                        <Route path="/guide/car-intake" element={<CarIntakeGuide />} />
                        <Route path="/guide/check-in" element={<CheckInGuide />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
