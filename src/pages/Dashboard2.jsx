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
} from "../utils/api";
import api from "../utils/api";
import OurProcess from "../components/dashboard/OurProcess";
import PopularPartsCarousel from "../components/dashboard/PopularPartsCarousel";
import RtxRecycling from "../components/dashboard/RtxRecycling";
import { useNavigate } from "react-router-dom";
import ComingSoonModal from "../components/ComingSoonModal";

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

  // Seller search
  const [sellerQuery, setSellerQuery] = useState("");
  const [sellerResults, setSellerResults] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);

  const [comingOpen, setComingOpen] = useState(false);
  const [comingFeature, setComingFeature] = useState("");
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [carSearchOpen, setCarSearchOpen] = useState(false);
  const [partSearchOpen, setPartSearchOpen] = useState(false);

  const navigate = useNavigate();

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

  const searchSellers = async () => {
    if (!sellerQuery || sellerQuery.length < 2) {
      message.info("Enter at least 2 characters to search sellers");
      return;
    }
    setLoadingSellers(true);
    try {
      const res = await api.get(`/sellers/search`, {
        params: { q: sellerQuery },
      });
      const data = res.data || res;
      setSellerResults(data.sellers || data);
    } catch (err) {
      message.error(`Seller search failed: ${err.message}`);
    } finally {
      setLoadingSellers(false);
    }
  };

  const clearSellers = () => {
    setSellerQuery("");
    setSellerResults([]);
  };

  const carColumns = [
    { title: "VIN", dataIndex: "vin", key: "vin" },
    { title: "Make", dataIndex: ["carDetails", "make"], key: "make" },
    { title: "Model", dataIndex: ["carDetails", "model"], key: "model" },
    { title: "Trim", dataIndex: ["carDetails", "trim"], key: "trim" },
  ];

  const partColumns = [
    { title: "Part Name", dataIndex: "partName", key: "partName" },
    { title: "Tag", dataIndex: "tag", key: "tag" },
    { title: "Make", dataIndex: ["make", "name"], key: "make" },
    { title: "Model", dataIndex: ["model", "name"], key: "model" },
    { title: "Trim", dataIndex: ["trim", "name"], key: "trim" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  ];

  const sellerColumns = [
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
          {[
            {
              id: "card-1",
              title: "Dashboard",
              color: "#ef4444",
              onClick: () => navigate("/dashboard"),
            },
            {
              id: "card-2",
              title: "VIN Search",
              color: "#5ba4e5",
              onClick: () => {
                navigate("/car-intake");
              },
            },
            {
              id: "card-3",
              title: "Seller",
              color: "#f59e0b",
              onClick: () => {},
            },
            {
              id: "card-4",
              title: "Buyer",
              color: "#06b6d4",
              onClick: () => {},
            },
            {
              id: "card-5",
              title: "Search",
              color: "#10b981",
              onClick: () => {},
            },
            {
              id: "card-6",
              title: "Check-In",
              color: "#525ce5",
              onClick: () => {
                setComingFeature("Check-In");
                setComingOpen(true);
              },
            },
            {
              id: "card-7",
              title: "Check-Out",
              color: "#23c58f",
              onClick: () => {
                setComingFeature("Check-Out");
                setComingOpen(true);
              },
            },
            {
              id: "card-8",
              title: "Wavier Form",
              color: "#8b5cf6",
              onClick: () => {
                setComingFeature("Waiver Form");
                setComingOpen(true);
              },
            },
          ].map((c) => (
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
                        setSellerModalOpen(true);
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
                        navigate("/seller/register");
                      }}
                    >
                      Register
                    </Tag>
                  </div>
                )}
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
                        transition: "all 0.3s ease",
                      }}
                      color="#2563eb"
                      onClick={(e) => {
                        e.stopPropagation();
                        setComingFeature("Buyer Search");
                        setComingOpen(true);
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
                        setComingFeature("Register Buyer");
                        setComingOpen(true);
                      }}
                    >
                      Register
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
          ))}
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
            rowKey={(r) => r._id || r.tag || `${r.partName}-${Math.random()}`}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "No parts found" }}
          />
        </Modal>

        {/* Seller Search Modal - Independent */}
        <Modal
          open={sellerModalOpen}
          onCancel={() => setSellerModalOpen(false)}
          width="80%"
          footer={null}
          title="Search Seller"
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
              placeholder="Search seller by name / email / phone"
              value={sellerQuery}
              onChange={(e) => setSellerQuery(e.target.value)}
              onPressEnter={searchSellers}
              style={{ width: "100%" }}
            />
            <Button
              icon={<SearchOutlined />}
              loading={loadingSellers}
              onClick={searchSellers}
            >
              Search
            </Button>
            <Button onClick={clearSellers} style={{ marginLeft: 8 }}>
              Clear
            </Button>
          </div>
          <Table
            columns={sellerColumns}
            dataSource={sellerResults}
            rowKey={(r) => r._id || r.email}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "No sellers found" }}
          />
        </Modal>
      </PageContentWrapper>
      <ComingSoonModal
        open={comingOpen}
        onClose={() => setComingOpen(false)}
        featureName={comingFeature}
      />
    </React.Fragment>
  );
};

export default Dashboard2;
