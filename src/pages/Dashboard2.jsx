import React, { useState, useEffect } from "react";
import TitleBox from "../components/TitleBox";
import PageContentWrapper from "../components/PageContentWrapper";
import { Card, Tabs, Input, Button, Table, Select, Space, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  carIntakeAPI,
  makeAPI,
  modelAPI,
  trimAPI,
  inventoryAPI,
} from "../utils/api";
import api from "../utils/api";

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
      <TitleBox title="Dashboard" routes={["Scrap Yard"]} current="Dashboard" />
      <PageContentWrapper>
        <Card>
          {/* Inline results tables inside tabs */}
          <Tabs defaultActiveKey="1">
            <TabPane tab="Search Car" key="1">
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
            </TabPane>

            <TabPane tab="Search Part" key="2">
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
                rowKey={(r) =>
                  r._id || r.tag || `${r.partName}-${Math.random()}`
                }
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "No parts found" }}
              />
            </TabPane>

            <TabPane tab="Search Seller" key="3">
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
            </TabPane>
          </Tabs>
        </Card>
      </PageContentWrapper>
    </React.Fragment>
  );
};

export default Dashboard2;
