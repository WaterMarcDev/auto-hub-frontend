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
import Layout from "./components/Layout/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { Spin } from "antd";
import Requests from "./pages/Requests/Requests";
import AddPartRequest from "./pages/AddPartRequest";
import JunkCarRequests from "./pages/JunkCarRequests";
import AddJunkCarRequest from "./pages/AddJunkCarRequest";
import Inbox from "./pages/Inbox";                               //added by shiva

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const CarIntake = React.lazy(() => import("./pages/CarIntake"));
const CarIntakeList = React.lazy(() => import("./pages/CarIntakeList"));
const ReadyToScrapList = React.lazy(() => import("./pages/ReadyToScrapList"));      //Added by shiva
const CarIntakeDetails = React.lazy(() => import("./pages/CarIntakeDetails"));
const Login = React.lazy(() => import("./pages/Login"));

import { ConfigProvider, theme } from "antd";
const Make = React.lazy(() => import("./pages/Make/Make"));
const Model = React.lazy(() => import("./pages/Model/Model"));
const Trim = React.lazy(() => import("./pages/Trim/Trim"));
const Part = React.lazy(() => import("./pages/Part/Part"));
const Element = React.lazy(() => import("./pages/Element/Element"));
const ElementHub = React.lazy(() => import("./pages/Element/Hub"));
const PartInventoryAdd = React.lazy(() => import("./pages/PartInventory/Add"));
const AddInventoryPage = React.lazy(() =>
  import("./pages/PartInventory/AddInventoryPage")
);
const PartInventoryList = React.lazy(() =>
  import("./pages/PartInventory/List")
);
const AssetTags = React.lazy(() =>
  import("./pages/AssetTags/List")
);
const PartInventoryMaster = React.lazy(() =>
  import("./pages/PartInventory/MasterList")
);
const Dashboard2 = React.lazy(() => import("./pages/Dashboard2"));
const ViewPartsPage = React.lazy(() => import("./pages/ViewPartsPage"));
const CarInventoryList = React.lazy(() => import("./pages/CarInventory/List"));
const AddScrap = React.lazy(() => import("./pages/Scrap/Add"));
const ScrapList = React.lazy(() => import("./pages/Scrap/List"));
const ScrapPurchase = React.lazy(() => import("./pages/ScrapPurchase/ScrapPurchase"));
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
const AdminGuide = React.lazy(() => import("./pages/Guide/AdminGuide"));
const ManagerGuide = React.lazy(() => import("./pages/Guide/ManagerGuide"));
const FrontDeskGuide = React.lazy(() => import("./pages/Guide/FrontDeskGuide"));
const StaffGuide = React.lazy(() => import("./pages/Guide/StaffGuide"));
const CustomerRegister = React.lazy(() => import("./pages/Customer/Register"));
const CustomerList = React.lazy(() => import("./pages/Customer/List"));

const UserList = React.lazy(() => import("./pages/Users/UserList"));
const AddUser = React.lazy(() => import("./pages/Users/AddUser"));
const EntryFeeSetting = React.lazy(() => import("./pages/Admin/EntryFeeSetting"));
const ErrorCodes = React.lazy(() => import("./pages/ErrorCodes"));
const SocialLeads = React.lazy(() => import("./pages/SocialLeads"));
const MarketplaceListings = React.lazy(() => import("./pages/MarketplaceListings"));
const UnifiedInbox = React.lazy(() => import("./pages/UnifiedInbox"));
const Orders = React.lazy(() => import("./pages/Orders"));
const IntegrationManager = React.lazy(() => import("./pages/IntegrationManager"));
const EbayCatalogSync = React.lazy(() => import("./pages/EbayCatalogSyncStatus"));

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
                        <Route
                          path="/dashboard"
                          element={
                            <ErrorBoundary>
                              <Dashboard />
                            </ErrorBoundary>
                          }
                        />
                        <Route path="/make" element={<Make />} />
                        <Route path="/inventory/parts" element={<ViewPartsPage />} />
                        <Route path="/model" element={<Model />} />
                        <Route path="/trim" element={<Trim />} />
                        <Route path="/inventory/add" element={<AddInventoryPage />} />
                        <Route path="/element" element={<Element />} />
                        <Route path="/element-hub" element={<ElementHub />} />
                        <Route path="/part" element={<Part />} />
                        <Route path="/car-intake" element={<CarIntake />} />
                        {/* By Shiva */}
                        <Route path="/part-requests" element={<Requests />} />  
                        <Route path="/add-part-request" element={<AddPartRequest />} />
                        <Route path="/inbox" element={<Inbox />} />
                        <Route path="/junk-car-requests" element={<JunkCarRequests />} />
                        <Route path="/add-junk-car-request" element={<AddJunkCarRequest />} />
                        {/* end here  */}

                        <Route
                          path="/car-intake-list"
                          element={<CarIntakeList />}
                        />

                        {/* ReadyToScrap Route by shiva */}
                        <Route
                          path="/ready-to-scrap"
                        element={<ReadyToScrapList />}
                        />
                        {/* end here */}
                        
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
                          path="/inventory-tags"
                          element={<AssetTags />}
                        />
                        <Route
                          path="/car-inventory"
                          element={<CarInventoryList />}
                        />
                        <Route path="/add-scrap" element={<AddScrap />} />
                        <Route path="/scrap-list" element={<ScrapList />} />
                        {/* Scrap Material Purchase (independent module) */}
                        <Route
                          path="/scrap-purchase"
                          element={<ScrapPurchase />}
                        />
                        <Route path="/customer/list" element={<CustomerList />} />
                        <Route
                          path="/customer/register"
                          element={<CustomerRegister />}
                        />
                        {/* Legacy Routes - redirected to Customer */}
                        <Route path="/seller/list" element={<CustomerList />} />
                        <Route
                          path="/seller/register"
                          element={<CustomerRegister />}
                        />
                        <Route path="/buyer/list" element={<CustomerList />} />
                        <Route
                          path="/buyer/register"
                          element={<CustomerRegister />}
                        />
                        <Route
                          path="/buyer/edit/:id"
                          element={<CustomerRegister />}
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
                        <Route
                          path="/guide/car-intake"
                          element={<CarIntakeGuide />}
                        />
                        <Route
                          path="/guide/check-in"
                          element={<CheckInGuide />}
                        />
                        <Route path="/guide/admin" element={<AdminGuide />} />
                        <Route
                          path="/guide/manager"
                          element={<ManagerGuide />}
                        />
                        <Route
                          path="/guide/front-desk"
                          element={<FrontDeskGuide />}
                        />
                        <Route path="/guide/staff" element={<StaffGuide />} />

                        {/* User Management */}
                        <Route path="/users/list" element={<UserList />} />
                        <Route path="/users/add" element={<AddUser />} />
                        <Route path="/users/edit/:id" element={<AddUser />} />
                        <Route path="/entry-fee" element={<EntryFeeSetting />} />
                        <Route path="/error-codes" element={<ErrorCodes />} />
                        {/* Social & Marketplace Integration Routes */}
                        <Route path="/social-leads" element={<SocialLeads />} />
                        <Route path="/marketplace-leads" element={<MarketplaceListings />} />
                        <Route path="/unified-inbox" element={<UnifiedInbox />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/integrations" element={<IntegrationManager />} />
                        <Route path="/ebay-catalog-sync" element={<EbayCatalogSync />} />
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