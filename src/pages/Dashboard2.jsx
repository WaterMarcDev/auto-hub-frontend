import React, { useState, useEffect } from "react";
import TitleBox from "../components/TitleBox";
import PageContentWrapper from "../components/PageContentWrapper";
import { Tabs, Input, Button, Table, Select, message, Modal, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  carIntakeAPI,
  makeAPI,
  modelAPI,
  trimAPI,
  inventoryAPI,
  customerAPI,
} from "../utils/api";
import OurProcess from "../components/dashboard/OurProcess";
import PopularPartsCarousel from "../components/dashboard/PopularPartsCarousel";
import RtxRecycling from "../components/dashboard/RtxRecycling";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ComingSoonModal from "../components/ComingSoonModal";
import CreateCheckInModal from "../components/CheckIn/CreateCheckInModal";

const { TabPane } = Tabs;

const Dashboard2 = () => {
  // Car search
  const [carQuery, setCarQuery] = useState("");
  const [carResults, setCarResults] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);

  // Part search (make/model/trim)
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTrim, setSelectedTrim] = useState(null);
  const [partResults, setPartResults] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);

  // Customer search
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [comingOpen, setComingOpen] = useState(false);
  const [comingFeature, _setComingFeature] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [carSearchOpen, setCarSearchOpen] = useState(false);
  const [partSearchOpen, setPartSearchOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Role checks (mirror Sidebar logic)
  const userRole = user?.role?.toLowerCase();
  const isManager = userRole === "manager";
  const isFrontDesk = userRole === "front_desk";
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff";

  useEffect(() => {
    // fetch makes on mount
    const fetchMakes = async () => {
      try {
        const { data } = await makeAPI.getAll({ limit: 100 });
        setMakes(data.makes || data.makes || data);
      } catch (err) {
        console.error("Failed to fetch makes", err);
      }
    };
    fetchMakes();
  }, []);

  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      return;
    }
    const fetchModels = async () => {
      try {
        const { data } = await modelAPI.getAll({
          make: selectedMake,
          limit: 100,
        });
        setModels(data.models || data.models || data);
      } catch (err) {
        console.error("Failed to fetch models", err);
      }
    };
    fetchModels();
  }, [selectedMake]);

  useEffect(() => {
    if (!selectedModel) {
      setTrims([]);
      return;
    }
    const fetchTrims = async () => {
      try {
        const { data } = await trimAPI.getAll({
          model: selectedModel,
          limit: 100,
        });
        setTrims(data.trims || data.trims || data);
      } catch (err) {
        console.error("Failed to fetch trims", err);
      }
    };
    fetchTrims();
  }, [selectedModel]);

  const searchCars = async () => {
    setLoadingCars(true);
    try {
      const res = await carIntakeAPI.getAll({
        page: 1,
        limit: 50,
        search: carQuery,
      });
      const data = res.data || res;
      setCarResults(data.carIntakes || data);
    } catch (err) {
      message.error(`Car search failed: ${err.message}`);
    } finally {
      setLoadingCars(false);
    }
  };

  const clearCars = () => {
    setCarQuery("");
    setCarResults([]);
  };

  const searchParts = async () => {
    setLoadingParts(true);
    try {
      // Query inventory directly by make/model/trim (inventory stores refs)
      const params = { page: 1, limit: 200 };
      if (selectedMake) params.make = selectedMake;
      if (selectedModel) params.model = selectedModel;
      if (selectedTrim) params.trim = selectedTrim;

      const res = await inventoryAPI.getAll(params);
      const data = res.data || res;
      // Expecting { inventories, pagination }
      const inventories = data.inventories || data.inventoryItems || data;
      setPartResults(inventories);
    } catch (err) {
      message.error(`Part search failed: ${err.message}`);
    } finally {
      setLoadingParts(false);
    }
  };

  const clearParts = () => {
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedTrim(null);
    setPartResults([]);
  };

  const searchCustomers = async (opts = {}) => {
    const q = (opts.query ?? customerQuery ?? "").trim();
    if (!q || q.length < 2) {
      message.info("Enter at least 2 characters to search customers");
      return;
    }
    setLoadingCustomers(true);
    try {
      const res = await customerAPI.getAll({
        search: q,
        page: 1,
        limit: 50,
      });
      const data = res.data || res;
      setCustomerResults(data.customers || []);
    } catch (err) {
      message.error(
        `Customer search failed: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setLoadingCustomers(false);
    }
  };

  const clearCustomers = () => {
    setCustomerQuery("");
    setCustomerResults([]);
  };

  const carColumns = [
    { title: "VIN", dataIndex: "vin", key: "vin" },
    { title: "Make", dataIndex: ["carDetails", "make"], key: "make" },
    { title: "Model", dataIndex: ["carDetails", "model"], key: "model" },
    { title: "Trim", dataIndex: ["carDetails", "trim"], key: "trim" },
  ];

  const partColumns = [
    { title: "Part Name", dataIndex: "partName", key: "partName" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Make", dataIndex: ["make", "name"], key: "make" },
    { title: "Model", dataIndex: ["model", "name"], key: "model" },
    { title: "Trim", dataIndex: ["trim", "name"], key: "trim" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  ];

  const customerColumns = [
    {
      title: "Name",
      key: "name",
      render: (_, r) => `${r.firstName || ""} ${r.lastName || ""}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "mobileNo", key: "mobileNo" },
  ];

  return (
    <React.Fragment>
      <TitleBox title="Home" routes={["Scrap Yard"]} current="Home" />
      <PageContentWrapper>
        <div className="dashboard-cards-grid mb-4">
          {(() => {
            const cards = [
              {
                id: "card-1",
                title: "Dashboard",
                color: "#ef4444",
                onClick: () => navigate("/dashboard"),
                // visible to manager and admin (same as Sidebar)
                visible: isManager || isAdmin,
              },
              {
                id: "card-2",
                title: "VIN Search",
                color: "#5ba4e5",
                onClick: () => {
                  navigate("/car-intake");
                },
                // Car Intake access: admin, manager, staff
                visible: isAdmin || isManager || isStaff,
              },
              {
                id: "card-3",
                title: "Customer",
                color: "#f59e0b",
                onClick: () => { },
                // Customer: front desk, admin, manager
                visible: isFrontDesk || isAdmin || isManager,
              },
              // Added by shiva
              {
                id: "card-4",
                title: "Requests",
                color: "#f97316",
                onClick: () => {},
                visible: isAdmin || isManager || isStaff,
              },
              //end here
              {
                id: "card-5",
                title: "Search",
                color: "#10b981",
                onClick: () => { },
                // Search (part/car) - restrict to inventory/car roles (admin, manager, staff)
                visible: isAdmin || isManager || isStaff,
              },
              {
                id: "card-6",
                title: "Check-In",
                color: "#525ce5",
                onClick: () => {
                  setCheckInOpen(true);
                },
                // Check-In: front desk, admin, manager
                visible: isFrontDesk || isAdmin || isManager,
              },
              {
                id: "card-7",
                title: "Check-Out",
                color: "#23c58f",
                onClick: () => {
                  navigate("/checkins");
                },
                // Check-In lists: front desk, admin, manager
                visible: isFrontDesk || isAdmin || isManager,
              },
              {
                id: "card-8",
                title: "Waiver Form",
                color: "#8b5cf6",
                onClick: () => navigate("/waivers/add"),
                // Waiver: front desk, admin, manager
                visible: isFrontDesk || isAdmin || isManager,
              },
            ];

            // compute visible cards using the same RBAC flags as Sidebar
            let visibleCards = cards.filter((c) => c.visible);

            // If user is front desk, enforce a custom ordering:
            // Waiver Form, Check-In, Check-Out, Seller, Buyer
            if (isFrontDesk) {
              const order = [
                "card-8", // Waiver Form
                "card-6", // Check-In
                "card-7", // Check-Out
                "card-3", // Customer
              ];
              const idx = (id) => {
                const i = order.indexOf(id);
                return i === -1 ? 999 : i;
              };
              visibleCards.sort((a, b) => idx(a.id) - idx(b.id));
            }

            return visibleCards.map((c) => (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={c.onClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 100,
                  borderRadius: 8,
                  color: "#fff",
                  cursor: "pointer",
                  minWidth: 0,
                  boxSizing: "border-box",
                  backgroundImage: `url('/assets/images/title-img.png')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: c.color,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                  userSelect: "none",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{c.title}</div>
                  {c.id === "card-3" && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 10,
                        justifyContent: "center",
                      }}
                    >
                      <Tag
                        style={{
                          cursor: "pointer",
                          padding: "6px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 6,
                          border: "none",
                          margin: 0,
                          transition: "all 0.3s ease",
                        }}
                        color="#2563eb"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerModalOpen(true);
                        }}
                      >
                        Search
                      </Tag>
                      <Tag
                        style={{
                          cursor: "pointer",
                          padding: "6px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 6,
                          border: "none",
                          margin: 0,
                          transition: "all 0.3s ease",
                        }}
                        color="#16a34a"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/customer/register");
                        }}
                      >
                        Register
                      </Tag>
                    </div>
                  )}

                  {/* Added by shiva */}
                  {c.id === "card-4" && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 10,
                        justifyContent: "center",
                      }}
                    >
                      <Tag
                        style={{
                          cursor: "pointer",
                          padding: "6px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 6,
                          border: "none",
                          margin: 0,
                        }}
                        color="#2563eb"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/part-requests");
                        }}
                      >
                        Part
                      </Tag>

                      <Tag
                        style={{
                          cursor: "pointer",
                          padding: "6px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 6,
                          border: "none",
                          margin: 0,
                        }}
                        color="#16a34a"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/junk-car-requests");
                        }}
                      >
                        Junk
                      </Tag>
                    </div>
                  )}

                  {c.id === "card-5" && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 10,
                        justifyContent: "center",
                      }}
                    >
                      <Tag
                        style={{
                          cursor: "pointer",
                          padding: "6px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 6,
                          border: "none",
                          margin: 0,
                          transition: "all 0.3s ease",
                        }}
                        color="#2563eb"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarSearchOpen(true);
                        }}
                      >
                        Car Search
                      </Tag>
                      <Tag
                        style={{
                          cursor: "pointer",
                          padding: "6px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 6,
                          border: "none",
                          margin: 0,
                          transition: "all 0.3s ease",
                        }}
                        color="#16a34a"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPartSearchOpen(true);
                        }}
                      >
                        Part Search
                      </Tag>
                    </div>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
        <div className="row">
          {/* Our Process */}
          <div className="col-xl-4 col-lg-6 col-md-12 mb-4">
            <OurProcess />
          </div>

          {/* RTX Recycling */}
          <div className="col-xl-4 col-lg-6 col-md-12 mb-4">
            <RtxRecycling />
          </div>
          {/* Earning Goal */}
          <div className="col-xl-4 col-lg-12 col-md-12 mb-4">
            <PopularPartsCarousel />
          </div>
        </div>
        {/* Car Search Modal - Independent */}
        <Modal
          open={carSearchOpen}
          onCancel={() => setCarSearchOpen(false)}
          width="80%"
          footer={null}
          title="Search Car"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 12,
              gap: 8,
              width: "100%",
            }}
          >
            <Input
              placeholder="Search VIN / Make / Model "
              value={carQuery}
              onChange={(e) => setCarQuery(e.target.value)}
              onPressEnter={searchCars}
              style={{ width: "100%" }}
            />

            <Button
              icon={<SearchOutlined />}
              loading={loadingCars}
              onClick={searchCars}
            >
              Search
            </Button>
            <Button onClick={clearCars} style={{ marginLeft: 8 }}>
              Clear
            </Button>
          </div>
          <Table
            columns={carColumns}
            dataSource={carResults}
            rowKey={(r) => r._id || r.vin}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "No cars found" }}
          />
        </Modal>

        {/* Part Search Modal - Independent */}
        <Modal
          open={partSearchOpen}
          onCancel={() => setPartSearchOpen(false)}
          width="80%"
          footer={null}
          title="Search Part"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: 12,
              gap: 8,
            }}
          >
            <Select
              allowClear
              placeholder="Select Make"
              style={{ width: "100%" }}
              value={selectedMake}
              onChange={(val) => setSelectedMake(val)}
            >
              {makes.map((m) => (
                <Select.Option
                  key={m._id || m.id || m.name}
                  value={m._id || m.id || m.name}
                >
                  {m.name || m}
                </Select.Option>
              ))}
            </Select>

            <Select
              allowClear
              placeholder="Select Model"
              style={{ width: "100%" }}
              value={selectedModel}
              onChange={(val) => setSelectedModel(val)}
            >
              {models.map((m) => (
                <Select.Option
                  key={m._id || m.id || m.name}
                  value={m._id || m.id || m.name}
                >
                  {m.name || m}
                </Select.Option>
              ))}
            </Select>

            <Select
              allowClear
              placeholder="Select Trim"
              style={{ width: "100%" }}
              value={selectedTrim}
              onChange={(val) => setSelectedTrim(val)}
            >
              {trims.map((t) => (
                <Select.Option
                  key={t._id || t.id || t.name}
                  value={t._id || t.id || t.name}
                >
                  {t.name || t}
                </Select.Option>
              ))}
            </Select>

            <Button
              icon={<SearchOutlined />}
              loading={loadingParts}
              onClick={searchParts}
            >
              Search Parts
            </Button>
            <Button onClick={clearParts} style={{ marginLeft: 8 }}>
              Clear
            </Button>
          </div>
          <Table
            columns={partColumns}
            dataSource={partResults}
            rowKey={(r) => r._id || r.sku || `${r.partName}-${Math.random()}`}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "No parts found" }}
          />
        </Modal>

        {/* Customer Search Modal - Independent */}
        <Modal
          open={customerModalOpen}
          onCancel={() => setCustomerModalOpen(false)}
          width="80%"
          footer={null}
          title="Search Customer"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: 12,
              gap: 8,
            }}
          >
            <Input
              placeholder="Search customer by name / email / phone"
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              onPressEnter={searchCustomers}
              style={{ width: "100%" }}
            />
            <Button
              icon={<SearchOutlined />}
              loading={loadingCustomers}
              onClick={searchCustomers}
            >
              Search
            </Button>
            <Button onClick={clearCustomers} style={{ marginLeft: 8 }}>
              Clear
            </Button>
          </div>
          <Table
            columns={customerColumns}
            dataSource={customerResults}
            rowKey={(r) => r._id || r.email}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "No customers found" }}
          />
        </Modal>
      </PageContentWrapper>
      <ComingSoonModal
        open={comingOpen}
        onClose={() => setComingOpen(false)}
        featureName={comingFeature}
      />
      <CreateCheckInModal
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onCreated={(created) => {
          // close modal and optionally navigate or show message; keep simple for now
          setCheckInOpen(false);
          if (created) {
            // navigate to checked-in list to show the new item
            navigate("/checkins");
          }
        }}
      />
    </React.Fragment>
  );
};

export default Dashboard2;
