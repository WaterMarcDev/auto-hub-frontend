import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button, Space, Card, message, Select, Tag, Tooltip } from "antd";
import { Link } from "react-router-dom";
import StockActions from "../../components/inventory/StockActions";
import { cacheManager } from "../../utils/cacheManager";

const SALE_CHANNEL_LABEL = { ebay: "on eBay", wix: "on Wix", crm: "in store" };
import {
  PlusOutlined,
  SearchOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { makeAPI, modelAPI, trimAPI, inventoryAPI } from "../../utils/api";
import TitleBox from "../../components/TitleBox";
import PageContentWrapper from "../../components/PageContentWrapper";
import AddInventoryModal from "../../components/AddInventoryModal";

const MasterList = () => {
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [makeOptions, setMakeOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [trimOptions, setTrimOptions] = useState([]);

  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTrim, setSelectedTrim] = useState(null);
  const [addInventoryModalVisible, setAddInventoryModalVisible] =
    useState(false);
  // Stock filter: parts sold on eBay/Wix are out of stock, so the list shows
  // available parts by default. "sold" / "all" show sold parts too.
  const [stockFilter, setStockFilter] = useState("available");

  // Stock adjustments are for admins/managers; anyone can record a sale.
  const canAdjust = (() => {
    try {
      const role = JSON.parse(localStorage.getItem("user"))?.role?.toLowerCase();
      return role === "admin" || role === "manager";
    } catch {
      return false;
    }
  })();

  const loadMakes = async () => {
    try {
      const res = await makeAPI.getAll({ limit: 1000 });
      const data = res.data || res;
      const items = data.makes || data || [];
      setMakeOptions(items.map((m) => ({ label: m.name, value: m._id })));
    } catch (err) {
      console.error("Failed to load makes", err);
    }
  };

  const loadModels = async (makeId) => {
    if (!makeId) {
      setModelOptions([]);
      return;
    }
    try {
      const res = await modelAPI.getAll({ make: makeId, limit: 1000 });
      const data = res.data || res;
      const items = data.models || data || [];
      setModelOptions(items.map((m) => ({ label: m.name, value: m._id })));
    } catch (err) {
      console.error("Failed to load models", err);
    }
  };

  const loadTrims = async (modelId) => {
    if (!modelId) {
      setTrimOptions([]);
      return;
    }
    try {
      const res = await trimAPI.getAll({ model: modelId, limit: 1000 });
      const data = res.data || res;
      const items = data.trims || data || [];
      setTrimOptions(items.map((t) => ({ label: t.name, value: t._id })));
    } catch (err) {
      console.error("Failed to load trims", err);
    }
  };

  const fetchParts = async (
    p = 1,
    l = limit,
    q = search,
    make = selectedMake,
    model = selectedModel,
    trim = selectedTrim,
    stock = stockFilter
  ) => {
    setLoading(true);
    try {
      const params = { page: p, limit: l };
      if (q && String(q).trim()) params.search = String(q).trim();
      if (make) params.make = make;
      if (model) params.model = model;
      if (trim) params.trim = trim;
      if (stock && stock !== "all") params.saleStatus = stock;

      const res = await inventoryAPI.getPartsMaster(params);
      const data = res.data || res;
      setParts(data.parts || []);
      if (data.pagination) {
        setPage(data.pagination.page || p);
        setLimit(data.pagination.limit || l);
        setTotal(data.pagination.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch master parts", err);
      message.error(`Failed to fetch parts: ${err.message}`);
      setParts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load: makes + parts (inline to avoid stale-deps warnings)
    loadMakes();
    (async () => {
      try {
        const params = { page: 1, limit, saleStatus: "available" };
        const res = await inventoryAPI.getPartsMaster(params);
        const data = res.data || res;
        setParts(data.parts || []);
        if (data.pagination) {
          setPage(data.pagination.page || 1);
          setLimit(data.pagination.limit || limit);
          setTotal(data.pagination.total || 0);
        }
      } catch (err) {
        console.error("Failed to fetch master parts", err);
      }
    })();
  }, [limit]);

  useEffect(() => {
    // when make changes, reload models and clear dependent filters
    if (selectedMake) loadModels(selectedMake);
    setSelectedModel(null);
    setSelectedTrim(null);
    setModelOptions([]);
    setTrimOptions([]);
  }, [selectedMake]);

  useEffect(() => {
    if (selectedModel) loadTrims(selectedModel);
    setSelectedTrim(null);
    setTrimOptions([]);
  }, [selectedModel]);

  // Live refresh: any stock change (eBay/Wix sale, in-store sale, return,
  // adjustment) re-loads the current page with the current filters.
  const refreshRef = useRef(null);
  refreshRef.current = () => fetchParts(page, limit);
  useEffect(() => {
    const unsub = cacheManager.subscribe("inventory", () => refreshRef.current?.());
    return () => unsub && unsub();
  }, []);

  const handleSearch = () => {
    setSearch(searchInput);
    fetchParts(
      1,
      limit,
      searchInput,
      selectedMake,
      selectedModel,
      selectedTrim
    );
  };

  return (
    <>
      <TitleBox
        title="Master Parts"
        routes={["Scrap Yard", "Inventory"]}
        current="Master Parts"
      />

      <PageContentWrapper>
        <Card
          title={<span>Master Parts List</span>}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddInventoryModalVisible(true)}
            >
              Add Part
            </Button>
          }
        >
          {/* Search and filters row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <Space.Compact style={{ flex: 1, maxWidth: 600 }} size="middle">
              <Input
                placeholder="Search part name..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (!e.target.value) {
                    setSearch("");
                    fetchParts(
                      1,
                      limit,
                      "",
                      selectedMake,
                      selectedModel,
                      selectedTrim
                    );
                  }
                }}
                onPressEnter={handleSearch}
                size="middle"
                style={{ width: "100%" }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                size="middle"
              >
                Search
              </Button>
            </Space.Compact>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Select
                allowClear
                placeholder="Make"
                options={makeOptions}
                style={{ minWidth: 160 }}
                value={selectedMake}
                onChange={(val) => {
                  // cascade: reset model & trim selections
                  setSelectedMake(val);
                  setSelectedModel(null);
                  setSelectedTrim(null);
                  setModelOptions([]);
                  setTrimOptions([]);
                  // fetch with the new make
                  fetchParts(1, limit, searchInput, val, null, null);
                }}
              />

              <Select
                allowClear
                placeholder="Model"
                options={modelOptions}
                style={{ minWidth: 160 }}
                value={selectedModel}
                onChange={(val) => {
                  setSelectedModel(val);
                  setSelectedTrim(null);
                  setTrimOptions([]);
                  // fetch with the new model
                  fetchParts(1, limit, searchInput, selectedMake, val, null);
                }}
              />

              <Select
                allowClear
                placeholder="Trim"
                options={trimOptions}
                style={{ minWidth: 160 }}
                value={selectedTrim}
                onChange={(val) => {
                  setSelectedTrim(val);
                  // fetch with the new trim
                  fetchParts(
                    1,
                    limit,
                    searchInput,
                    selectedMake,
                    selectedModel,
                    val
                  );
                }}
              />

              <Select
                value={stockFilter}
                style={{ minWidth: 150 }}
                options={[
                  { label: "In stock", value: "available" },
                  { label: "Sold / out of stock", value: "sold" },
                  { label: "All parts", value: "all" },
                ]}
                onChange={(val) => {
                  setStockFilter(val);
                  fetchParts(
                    1,
                    limit,
                    searchInput,
                    selectedMake,
                    selectedModel,
                    selectedTrim,
                    val
                  );
                }}
              />

              <Button
                onClick={() => {
                  // clear all filters and search
                  setSearchInput("");
                  setSearch("");
                  setSelectedMake(null);
                  setSelectedModel(null);
                  setSelectedTrim(null);
                  setModelOptions([]);
                  setTrimOptions([]);
                  setStockFilter("available");
                  // fetch unfiltered list (in-stock parts)
                  fetchParts(1, limit, "", null, null, null, "available");
                }}
                icon={<CloseCircleOutlined />}
              >
                Clear
              </Button>
            </div>
          </div>

          <Table
            dataSource={parts}
            rowKey={(r) => r._id}
            loading={loading}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              onChange: (p, ps) =>
                fetchParts(
                  p,
                  ps,
                  search,
                  selectedMake,
                  selectedModel,
                  selectedTrim
                ),
            }}
            size="small"
            tableLayout="auto"
            bordered
            scroll={{
              y: "calc(100vh - 450px)",
            }}
            columns={[
              {
                title: "S. No.",
                key: "sr",
                width: 80,
                minWidth: 80,
                fixed: "left",
                render: (_, __, i) => (page - 1) * limit + i + 1,
              },
              {
                title: "Part Name",
                dataIndex: "partName",
                key: "partName",
                minWidth: 150,
                fixed: "left",
                render: (text) => {
                  if (!text) return "N/A";
                  return text
                    .replace(/([A-Z])/g, " $1")
                    .replace(/[_-]/g, " ")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();
                },
              },
              {
                title: "Make",
                dataIndex: ["make", "name"],
                key: "make",
                minWidth: 100,
              },
              {
                title: "Model",
                dataIndex: ["model", "name"],
                key: "model",
                minWidth: 120,
              },
              {
                title: "Trim",
                dataIndex: ["trim", "name"],
                key: "trim",
                minWidth: 100,
              },
              { title: "Unit", dataIndex: "unit", key: "unit", minWidth: 100 },
              {
                title: "Quality",
                dataIndex: "quality",
                key: "quality",
                minWidth: 100,
              },
              {
                title: "Cleaned",
                dataIndex: "cleaned",
                key: "cleaned",
                minWidth: 100,
                render: (v) => (v ? "Yes" : "No"),
              },
              {
                title: "Weight",
                dataIndex: "weight",
                key: "weight",
                minWidth: 100,
              },
              {
                title: "Dimensions",
                dataIndex: "dimensions",
                key: "dimensions",
                minWidth: 120,
              },
              {
                title: "Location",
                dataIndex: "location",
                key: "location",
                minWidth: 100,
              },
              {
                title: "Qty",
                key: "qty",
                minWidth: 70,
                render: (_, r) => (
                  <Tooltip title={r.quantitySold ? `${r.quantitySold} sold so far` : undefined}>
                    <strong>{r.quantityAvailable ?? 1}</strong>
                  </Tooltip>
                ),
              },
              {
                title: "Status",
                key: "saleStatus",
                minWidth: 150,
                render: (_, r) => (
                  <Space direction="vertical" size={2}>
                    {r.saleStatus === "sold" ? (
                      <Link to="/sold-products">
                        <Tag color="red">
                          {r.sale?.channel
                            ? `Sold ${SALE_CHANNEL_LABEL[r.sale.channel] || ""}`
                            : "Out of stock"}
                          {r.sale?.orderNumber ? ` #${r.sale.orderNumber}` : ""}
                        </Tag>
                      </Link>
                    ) : (
                      <Tag color="green">In stock</Tag>
                    )}
                    {r.returnStatus && !["inspection_passed", "closed"].includes(r.returnStatus) && (
                      <Link to="/inventory-sync">
                        <Tag color={r.returnStatus === "inspection_failed" ? "red" : "gold"}>
                          Return: {r.returnStatus.replace(/_/g, " ")}
                        </Tag>
                      </Link>
                    )}
                    {r.ebayQuantitySync && r.ebayQuantitySync.status !== "synced" && r.ebayQuantitySync.status !== "skipped" && (
                      <Tooltip title={r.ebayQuantitySync.lastError || "Waiting to update eBay"}>
                        <Tag color={["failed", "dead"].includes(r.ebayQuantitySync.status) ? "red" : "blue"}>
                          eBay {r.ebayQuantitySync.status === "pending" ? "update pending" : "update failed"}
                        </Tag>
                      </Tooltip>
                    )}
                  </Space>
                ),
              },
              {
                title: "SKU",
                dataIndex: "sku",
                key: "sku",
                minWidth: 100,
              },
              {
                title: "Stock",
                key: "stockActions",
                fixed: "right",
                minWidth: 170,
                render: (_, r) => (
                  <StockActions
                    part={r}
                    canAdjust={canAdjust}
                    onDone={() => fetchParts(page, limit)}
                  />
                ),
              },
            ]}
            className="dark-table"
          />
        </Card>

        {/* mount shared AddInventoryModal so it can overlay the page */}
        <AddInventoryModal
          visible={addInventoryModalVisible}
          onCancel={() => setAddInventoryModalVisible(false)}
          onSuccess={() => {
            setAddInventoryModalVisible(false);
            // refresh current list keeping applied filters/search
            fetchParts(
              1,
              limit,
              search,
              selectedMake,
              selectedModel,
              selectedTrim
            );
          }}
          initial={{
            make: selectedMake || undefined,
            model: selectedModel || undefined,
            trim: selectedTrim || undefined,
          }}
        />
      </PageContentWrapper>
    </>
  );
};

export default MasterList;
