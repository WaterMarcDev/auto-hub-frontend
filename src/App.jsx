import React from "react";
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
import Dashboard from "./pages/Dashboard";
import CarIntake from "./pages/CarIntake";
import CarIntakeList from "./pages/CarIntakeList";
import CarIntakeDetails from "./pages/CarIntakeDetails";
import Login from "./pages/Login";

import { ConfigProvider, theme } from "antd";
import Make from "./pages/Make";
import Model from "./pages/Model";
import Trim from "./pages/Trim";
import Part from "./pages/Part";
import Element from "./pages/Element";
import PartInventoryAdd from "./pages/PartInventory/Add";
import PartInventoryList from "./pages/PartInventory/List";
import Dashboard2 from "./pages/Dashboard2";
import CarInventoryList from "./pages/CarInventory/List";
import AddScrap from "./pages/Scrap/Add";
import ScrapList from "./pages/Scrap/List";
import SellerRegister from "./pages/Seller/Register";
import SellerList from "./pages/Seller/List";

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
            <Route path="/auth-login" element={<Login />} />
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
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <React.Fragment>
                            <Navigate to="/dashboard" replace />
                          </React.Fragment>
                        }
                      />
                      <Route path="/main-dashboard" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard2 />} />
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
                      <Route
                        path="/car-intake/:id"
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
                    </Routes>
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
