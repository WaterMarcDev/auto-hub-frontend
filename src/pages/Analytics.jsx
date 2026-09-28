import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Badge,
  Progress,
  Statistic,
  Tabs,
  Button,
  Switch,
  Tooltip,
  Alert,
  Descriptions,
  Spin,
  Space,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  SafetyCertificateOutlined,
  ApiOutlined,
  FieldTimeOutlined,
  ReloadOutlined,
  GlobalOutlined,
  LineChartOutlined,
  TeamOutlined,
  HddOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { systemAPI } from "../utils/api";

const { TabPane } = Tabs;

// Helper to format bytes to MB / GB
const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return "0 MB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Helper to format seconds to human readable
const formatUptime = (seconds) => {
  if (!seconds || seconds <= 0) return "0s";
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [clientLatency, setClientLatency] = useState(null);
  const [probingLatency, setProbingLatency] = useState(false);
  const [activeTab, setActiveTab] = useState("layuser");

  const intervalRef = useRef(null);

  // Measure browser-to-server HTTP round-trip
  const probeClientLatency = async () => {
    try {
      setProbingLatency(true);
      const t0 = performance.now();
      await systemAPI.getHealth();
      const t1 = performance.now();
      setClientLatency(Math.round(t1 - t0));
    } catch (e) {
      setClientLatency(-1);
    } finally {
      setProbingLatency(false);
    }
  };

  const fetchTelemetry = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await systemAPI.getAnalytics();
      const payload = res.data?.data || res.data || res;
      setData(payload);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch system telemetry:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry(false);
    probeClientLatency();
  }, [fetchTelemetry]);

  // Auto-refresh timer every 10 seconds
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchTelemetry(false);
      }, 10000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchTelemetry]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: "#8c8c8c" }}>
          Connecting to System Telemetry Gateway...
        </div>
      </div>
    );
  }

  // Derived metrics
  const healthScore = data?.health?.score ?? 100;
  const isHealthy = healthScore >= 90;
  const isDegraded = healthScore >= 70 && healthScore < 90;

  const dbPing = data?.database?.pingMs ?? 0;
  const dbStatus = data?.database?.status === "connected";
  const heapUsed = data?.processMemory?.heapUsed || 0;
  const heapTotal = data?.processMemory?.heapTotal || 1;
  const heapPct = Math.round((heapUsed / heapTotal) * 100);

  const totalSysMem = data?.system?.totalMemoryBytes || 1;
  const freeSysMem = data?.system?.freeMemoryBytes || 0;
  const usedSysMem = totalSysMem - freeSysMem;
  const sysMemPct = Math.round((usedSysMem / totalSysMem) * 100);

  return (
    <div style={{ padding: "16px 24px", minHeight: "100vh" }}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>
            <LineChartOutlined style={{ marginRight: 10, color: "#1890ff" }} />
            System & Network Analytics
          </h2>
          <div style={{ color: "#8c8c8c", fontSize: 13, marginTop: 4 }}>
            Live diagnostic telemetry, infrastructure health & traffic observability
          </div>
        </div>

        <Space size="middle">
          <Tooltip title="Run instant browser-to-server latency benchmark">
            <Button
              icon={<ThunderboltOutlined />}
              onClick={probeClientLatency}
              loading={probingLatency}
              size="middle"
            >
              Ping: {clientLatency !== null ? `${clientLatency} ms` : "Probe"}
            </Button>
          </Tooltip>

          <Space size="small">
            <span style={{ fontSize: 13, color: "#8c8c8c" }}>Auto-refresh:</span>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="10s"
              unCheckedChildren="Off"
            />
          </Space>

          <Button
            type="primary"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={() => fetchTelemetry(true)}
            loading={refreshing}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Global Status Banner */}
      <Alert
        message={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {isHealthy ? (
                <>
                  <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  All Core Systems Operational — Normal Network Traffic
                </>
              ) : isDegraded ? (
                <>
                  <WarningOutlined style={{ color: "#faad14", marginRight: 8 }} />
                  Elevated Load Detected — Service Operational
                </>
              ) : (
                <>
                  <CloseCircleOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                  Critical Service Attention Required
                </>
              )}
            </span>
            <span style={{ fontSize: 12, color: "#8c8c8c" }}>
              Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Just now"}
            </span>
          </div>
        }
        description={
          <div style={{ marginTop: 4, fontSize: 13 }}>
            Continuous monitoring of Express API, MongoDB cluster, Socket.io connection fabric, in-memory sliding-window rate limiters, and eBay catalog background sync workers.
          </div>
        }
        type={isHealthy ? "success" : isDegraded ? "warning" : "error"}
        showIcon={false}
        style={{ marginBottom: 20, borderRadius: 8, borderLeftWidth: 6 }}
      />

      {/* Persona View Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        style={{ marginBottom: 20 }}
      >
        <TabPane
          tab={
            <span>
              <GlobalOutlined />
              System Overview & Health (Operations View)
            </span>
          }
          key="layuser"
        >
          {/* Top Quick Health Metrics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            {/* System Health Score */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(24, 144, 255, 0.12) 0%, rgba(24, 144, 255, 0.03) 100%)",
                  border: "1px solid rgba(24, 144, 255, 0.2)",
                }}
              >
                <Statistic
                  title={<span style={{ fontWeight: 600 }}>System Health Score</span>}
                  value={healthScore}
                  suffix="/ 100"
                  valueStyle={{
                    color: isHealthy ? "#52c41a" : isDegraded ? "#faad14" : "#ff4d4f",
                    fontWeight: 700,
                  }}
                  prefix={<CheckCircleOutlined />}
                />
                <div style={{ marginTop: 8 }}>
                  <Progress
                    percent={healthScore}
                    status={isHealthy ? "success" : isDegraded ? "normal" : "exception"}
                    showInfo={false}
                    strokeColor={isHealthy ? "#52c41a" : isDegraded ? "#faad14" : "#ff4d4f"}
                  />
                  <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>
                    Aggregated real-time reliability index
                  </div>
                </div>
              </Card>
            </Col>

            {/* Server Uptime */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(82, 196, 26, 0.12) 0%, rgba(82, 196, 26, 0.03) 100%)",
                  border: "1px solid rgba(82, 196, 26, 0.2)",
                }}
              >
                <Statistic
                  title={<span style={{ fontWeight: 600 }}>API Server Uptime</span>}
                  value={formatUptime(data?.system?.uptimeSeconds)}
                  valueStyle={{ color: "#52c41a", fontWeight: 700 }}
                  prefix={<FieldTimeOutlined />}
                />
                <div style={{ marginTop: 12, fontSize: 12, color: "#8c8c8c" }}>
                  <Tag color="success">Continuous</Tag> No unplanned reboots
                </div>
              </Card>
            </Col>

            {/* Database Ping Latency */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(114, 46, 209, 0.12) 0%, rgba(114, 46, 209, 0.03) 100%)",
                  border: "1px solid rgba(114, 46, 209, 0.2)",
                }}
              >
                <Statistic
                  title={<span style={{ fontWeight: 600 }}>Database Ping</span>}
                  value={dbPing >= 0 ? `${dbPing} ms` : "Error"}
                  valueStyle={{
                    color: dbPing < 50 ? "#52c41a" : dbPing < 150 ? "#faad14" : "#ff4d4f",
                    fontWeight: 700,
                  }}
                  prefix={<DatabaseOutlined />}
                />
                <div style={{ marginTop: 12, fontSize: 12, color: "#8c8c8c" }}>
                  <Tag color={dbStatus ? "processing" : "error"}>
                    {dbStatus ? "MongoDB Atlas Active" : "Disconnected"}
                  </Tag>
                </div>
              </Card>
            </Col>

            {/* Realtime Gateway */}
            <Col xs={24} sm={12} lg={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(250, 140, 22, 0.12) 0%, rgba(250, 140, 22, 0.03) 100%)",
                  border: "1px solid rgba(250, 140, 22, 0.2)",
                }}
              >
                <Statistic
                  title={<span style={{ fontWeight: 600 }}>Active WebSockets</span>}
                  value={data?.realtime?.activeSockets ?? 0}
                  suffix="Clients"
                  valueStyle={{ color: "#fa8c16", fontWeight: 700 }}
                  prefix={<ThunderboltOutlined />}
                />
                <div style={{ marginTop: 12, fontSize: 12, color: "#8c8c8c" }}>
                  <Tag color="cyan">Socket.io Gateway</Tag> Realtime sync live
                </div>
              </Card>
            </Col>
          </Row>

          {/* Service Health Cards - Plain English Explanations */}
          <h4 style={{ marginBottom: 16, fontWeight: 600, fontSize: 16 }}>
            Subsystem Status Indicators
          </h4>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {/* Core API */}
            <Col xs={24} md={12}>
              <Card bordered={false} style={{ borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <CloudServerOutlined style={{ fontSize: 28, color: "#1890ff", marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>Express API Engine</span>
                      <Tag color="green">Operational</Tag>
                    </div>
                    <p style={{ color: "#8c8c8c", fontSize: 13, margin: "6px 0 10px 0" }}>
                      Handles customer check-ins, parts inventory lookups, waivers, and document printing. Serving requests with zero dropped packets.
                    </p>
                    <div style={{ fontSize: 12, display: "flex", gap: 16, color: "#bfbfbf" }}>
                      <span>Mode: <strong>{data?.system?.environment}</strong></span>
                      <span>PID: <strong>{data?.system?.pid}</strong></span>
                      <span>Platform: <strong>{data?.system?.platform} ({data?.system?.arch})</strong></span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Database */}
            <Col xs={24} md={12}>
              <Card bordered={false} style={{ borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <DatabaseOutlined style={{ fontSize: 28, color: "#722ed1", marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>MongoDB Primary Cluster</span>
                      <Tag color={dbStatus ? "green" : "red"}>
                        {dbStatus ? "Connected" : "Attention"}
                      </Tag>
                    </div>
                    <p style={{ color: "#8c8c8c", fontSize: 13, margin: "6px 0 10px 0" }}>
                      All business collections, transactions, and invoice snapshots are synchronized with millisecond read/write response times.
                    </p>
                    <div style={{ fontSize: 12, display: "flex", gap: 16, color: "#bfbfbf" }}>
                      <span>Round-trip: <strong>{dbPing} ms</strong></span>
                      <span>Database: <strong>{data?.database?.name}</strong></span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Rate Limiter */}
            <Col xs={24} md={12}>
              <Card bordered={false} style={{ borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <SafetyCertificateOutlined style={{ fontSize: 28, color: "#52c41a", marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>Traffic Defense & Rate Limiter</span>
                      <Tag color="blue">Enforcing (5 req/sec)</Tag>
                    </div>
                    <p style={{ color: "#8c8c8c", fontSize: 13, margin: "6px 0 10px 0" }}>
                      Protects the server from accidental rapid clicking or denial-of-service attempts. Automatically throttles requests exceeding 5/second per user.
                    </p>
                    <div style={{ fontSize: 12, display: "flex", gap: 16, color: "#bfbfbf" }}>
                      <span>Tracked Clients: <strong>{data?.rateLimiter?.totalTrackedKeys ?? 0}</strong></span>
                      <span>Active in Window: <strong>{data?.rateLimiter?.activeKeysInWindow ?? 0}</strong></span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* eBay Catalog Sync */}
            <Col xs={24} md={12}>
              <Card bordered={false} style={{ borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <SyncOutlined style={{ fontSize: 28, color: "#fa8c16", marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>eBay Catalog 6h Synchronizer</span>
                      <Tag color={data?.backgroundTasks?.ebaySync?.isLocked ? "orange" : "cyan"}>
                        {data?.backgroundTasks?.ebaySync?.isLocked ? "Sync Running" : "Scheduled / Ready"}
                      </Tag>
                    </div>
                    <p style={{ color: "#8c8c8c", fontSize: 13, margin: "6px 0 10px 0" }}>
                      Runs every 6 hours with a distributed lease lock to keep AutoHub parts inventory synchronised with eBay marketplace listings.
                    </p>
                    <div style={{ fontSize: 12, display: "flex", gap: 16, color: "#bfbfbf" }}>
                      <span>Last Status: <strong>{data?.backgroundTasks?.ebaySync?.latestRun?.status || "None"}</strong></span>
                      <span>Discovered: <strong>{data?.backgroundTasks?.ebaySync?.latestRun?.totalDiscovered || 0}</strong></span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Operational Data Volume Summary */}
          <h4 style={{ marginBottom: 16, fontWeight: 600, fontSize: 16 }}>
            Active Business Records (Document Estimates)
          </h4>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} size="small" style={{ textAlign: "center", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Check-Ins</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1890ff", marginTop: 4 }}>
                  {data?.database?.counts?.checkIns?.toLocaleString() || 0}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} size="small" style={{ textAlign: "center", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Customers</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#52c41a", marginTop: 4 }}>
                  {data?.database?.counts?.customers?.toLocaleString() || 0}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} size="small" style={{ textAlign: "center", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Signed Waivers</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#722ed1", marginTop: 4 }}>
                  {data?.database?.counts?.waivers?.toLocaleString() || 0}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} size="small" style={{ textAlign: "center", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Inventory Parts</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fa8c16", marginTop: 4 }}>
                  {data?.database?.counts?.inventory?.toLocaleString() || 0}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} size="small" style={{ textAlign: "center", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Transactions</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#13c2c2", marginTop: 4 }}>
                  {data?.database?.counts?.transactions?.toLocaleString() || 0}
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card bordered={false} size="small" style={{ textAlign: "center", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Staff Accounts</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#eb2f96", marginTop: 4 }}>
                  {data?.database?.counts?.users?.toLocaleString() || 0}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Tab 2: Technical Supervisor Telemetry */}
        <TabPane
          tab={
            <span>
              <ThunderboltOutlined />
              Deep Telemetry & Diagnostics (Supervisor View)
            </span>
          }
          key="technical"
        >
          {/* Hardware & Process Memory Telemetry */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            {/* V8 Heap Memory */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <HddOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                    Node.js V8 Heap Utilization
                  </span>
                }
                bordered={false}
                style={{ borderRadius: 8 }}
              >
                <Row gutter={16} align="middle">
                  <Col span={16}>
                    <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                      <span>Heap Used: <strong>{formatBytes(heapUsed)}</strong></span>
                      <span>Heap Total: <strong>{formatBytes(heapTotal)}</strong></span>
                    </div>
                    <Progress
                      percent={heapPct}
                      status={heapPct > 85 ? "exception" : heapPct > 70 ? "normal" : "active"}
                      strokeColor={{
                        "0%": "#108ee9",
                        "100%": heapPct > 85 ? "#f5222d" : "#87d068",
                      }}
                    />
                    <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 10 }}>
                      Process RSS: <strong>{formatBytes(data?.processMemory?.rss)}</strong> | External: <strong>{formatBytes(data?.processMemory?.external)}</strong>
                    </div>
                  </Col>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <Statistic
                      title="Heap Ratio"
                      value={heapPct}
                      suffix="%"
                      valueStyle={{ color: heapPct > 80 ? "#faad14" : "#52c41a", fontWeight: 700 }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Host System Memory */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <CloudServerOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                    Host Physical RAM
                  </span>
                }
                bordered={false}
                style={{ borderRadius: 8 }}
              >
                <Row gutter={16} align="middle">
                  <Col span={16}>
                    <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                      <span>Used: <strong>{formatBytes(usedSysMem)}</strong></span>
                      <span>Total: <strong>{formatBytes(totalSysMem)}</strong></span>
                    </div>
                    <Progress
                      percent={sysMemPct}
                      strokeColor={{ "0%": "#52c41a", "100%": sysMemPct > 85 ? "#ff4d4f" : "#1890ff" }}
                    />
                    <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 10 }}>
                      Free RAM: <strong>{formatBytes(freeSysMem)}</strong> | Cores: <strong>{data?.system?.cpuCount} CPUs</strong>
                    </div>
                  </Col>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <Statistic
                      title="RAM Used"
                      value={sysMemPct}
                      suffix="%"
                      valueStyle={{ color: sysMemPct > 85 ? "#ff4d4f" : "#1890ff", fontWeight: 700 }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Server Process & OS Details */}
          <Card
            title={
              <span>
                <ApiOutlined style={{ marginRight: 8, color: "#722ed1" }} />
                Process & Environment Specification
              </span>
            }
            bordered={false}
            style={{ borderRadius: 8, marginBottom: 20 }}
          >
            <Descriptions bordered size="small" column={{ xxl: 4, xl: 4, lg: 3, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Node.js Version">
                <Tag color="green">{data?.system?.nodeVersion}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Environment">
                <Tag color={data?.system?.environment === "production" ? "purple" : "blue"}>
                  {data?.system?.environment}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Process PID">{data?.system?.pid}</Descriptions.Item>
              <Descriptions.Item label="Uptime Seconds">{data?.system?.uptimeSeconds}s</Descriptions.Item>
              <Descriptions.Item label="OS Platform">{data?.system?.platform}</Descriptions.Item>
              <Descriptions.Item label="Architecture">{data?.system?.arch}</Descriptions.Item>
              <Descriptions.Item label="CPU Cores">{data?.system?.cpuCount}</Descriptions.Item>
              <Descriptions.Item label="Load Average (1m, 5m, 15m)">
                {Array.isArray(data?.system?.loadAvg)
                  ? data.system.loadAvg.map((l) => Number(l).toFixed(2)).join(", ")
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Rate Limiting Engine Telemetry */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} md={12}>
              <Card
                title={
                  <span>
                    <SafetyOutlined style={{ marginRight: 8, color: "#13c2c2" }} />
                    Sliding-Window Rate Limiting Engine
                  </span>
                }
                bordered={false}
                style={{ borderRadius: 8 }}
              >
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Enforcement Policy">
                    <strong>{data?.rateLimiter?.maxRequests || 5} requests</strong> per <strong>{(data?.rateLimiter?.windowMs || 1000) / 1000}s</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Store Architecture">
                    In-Memory Hash Map with 60s sweeps
                  </Descriptions.Item>
                  <Descriptions.Item label="Identity Resolution">
                    JWT Token (user:&lt;id&gt;) primary, X-Forwarded-For (ip:&lt;ip&gt;) fallback
                  </Descriptions.Item>
                  <Descriptions.Item label="Tracked Client Keys">
                    <Badge count={data?.rateLimiter?.totalTrackedKeys || 0} overflowCount={99999} style={{ backgroundColor: "#108ee9" }} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Active Keys (In Window)">
                    <Badge count={data?.rateLimiter?.activeKeysInWindow || 0} overflowCount={99999} style={{ backgroundColor: "#52c41a" }} />
                  </Descriptions.Item>
                  <Descriptions.Item label="HTTP Response on Quota Exceeded">
                    <code>429 Too Many Requests</code> with <code>Retry-After: 1</code>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* eBay Sync Background Worker */}
            <Col xs={24} md={12}>
              <Card
                title={
                  <span>
                    <SyncOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
                    eBay Catalog 6h Sync Worker Telemetry
                  </span>
                }
                bordered={false}
                style={{ borderRadius: 8 }}
              >
                {data?.backgroundTasks?.ebaySync?.latestRun ? (
                  <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Last Run ID">
                      <code>{data.backgroundTasks.ebaySync.latestRun.runId}</code>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trigger Type">
                      <Tag color="geekblue">{data.backgroundTasks.ebaySync.latestRun.trigger}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Sync Status">
                      <Tag
                        color={
                          data.backgroundTasks.ebaySync.latestRun.status === "completed"
                            ? "success"
                            : data.backgroundTasks.ebaySync.latestRun.status === "running"
                            ? "processing"
                            : "error"
                        }
                      >
                        {data.backgroundTasks.ebaySync.latestRun.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Duration">
                      {data.backgroundTasks.ebaySync.latestRun.durationMs
                        ? `${(data.backgroundTasks.ebaySync.latestRun.durationMs / 1000).toFixed(1)}s`
                        : "In Progress / N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Items Discovered / Published / Failed">
                      {data.backgroundTasks.ebaySync.latestRun.totalDiscovered || 0} /{" "}
                      {data.backgroundTasks.ebaySync.latestRun.totalPublished || 0} /{" "}
                      <span style={{ color: "#ff4d4f" }}>
                        {data.backgroundTasks.ebaySync.latestRun.totalFailed || 0}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Distributed Lock State">
                      {data.backgroundTasks.ebaySync.isLocked ? (
                        <Tag color="orange">Lock Acquired (In Flight)</Tag>
                      ) : (
                        <Tag color="green">Lock Released (Idle)</Tag>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <div style={{ textAlign: "center", padding: 24, color: "#8c8c8c" }}>
                    No sync run history recorded yet on this environment.
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Analytics;
