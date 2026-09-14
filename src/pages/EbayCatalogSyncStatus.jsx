import { useState, useEffect, useCallback } from "react";
import { Card, Button, Row, Col, Statistic, Tag, Typography, Spin, App, Divider, Descriptions } from "antd";
import { SyncOutlined, ReloadOutlined, CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";
import api from "../utils/api";

const { Title, Text } = Typography;

const EbayCatalogSyncStatus = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState(null);
  const { message } = App.useApp();

  const fetchStatus = useCallback(async () => {
    try { setLoading(true); const res = await api.get("/ebay/catalog-sync/status"); setStatus(res.data); }
    catch (err) { console.error("Failed to fetch eBay sync status:", err); message.error("Failed to fetch eBay sync status"); }
    finally { setLoading(false); }
  }, [message]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleSyncNow = async () => {
    try {
      setSyncing(true); const res = await api.post("/ebay/catalog-sync/run");
      message.success(`Sync completed: published=${res.data?.data?.summary?.totalPublished || 0}`);
      await fetchStatus();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      if (err.response?.status === 409) message.warning("A sync is already in progress");
      else message.error(`Sync failed: ${errMsg}`);
    } finally { setSyncing(false); }
  };

  const handleDryRun = async () => {
    try { setSyncing(true); const res = await api.post("/ebay/catalog-sync/run?dryRun=true");
      message.success(`Dry run complete. Eligible: ${res.data?.data?.summary?.totalEligible || 0}`); }
    catch (err) { message.error(`Dry run failed: ${err.response?.data?.error || err.message}`); }
    finally { setSyncing(false); }
  };

  const lastRun = status?.data?.lastRun;
  const configured = status?.data?.configured;
  const missingConfig = status?.data?.missingConfiguration || [];
  const nextScheduled = status?.data?.nextScheduledAt;

  return (
    <div style={{ padding: "20px" }}>
      <Card title={<Title level={4} style={{ margin: 0 }}>eBay Catalog Sync</Title>}
        extra={<Row gutter={8}>
          <Col><Button icon={<ReloadOutlined />} onClick={fetchStatus} loading={loading}>Refresh</Button></Col>
          <Col><Button icon={<SyncOutlined />} onClick={handleDryRun} loading={syncing} disabled={!configured}>Dry Run</Button></Col>
          <Col><Button type="primary" icon={<SyncOutlined />} onClick={handleSyncNow} loading={syncing} disabled={!configured}>Sync Now</Button></Col>
        </Row>}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
        ) : (<>
          <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Sync Status">
              <Tag icon={lastRun?.status === "completed" ? <CheckCircleOutlined /> : <WarningOutlined />}
                   color={lastRun?.status === "completed" ? "green" : "default"}>
                {lastRun?.status || "Not Run"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Environment">
              <Tag>{status?.data?.environment || "production"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Configuration">
              <Tag color={configured ? "green" : "red"}>{configured ? "Ready" : "Incomplete"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Next Scheduled Sync">
              {nextScheduled ? new Date(nextScheduled).toLocaleString() : "\u2014"}
            </Descriptions.Item>
          </Descriptions>

          {!configured && missingConfig.length > 0 && (
            <Card size="small" style={{ marginBottom: 16, background: "#fff3f3", borderColor: "#ff4d4f" }}>
              <Text type="danger"><strong>Configuration Required:</strong> {missingConfig.join(", ")}</Text>
            </Card>
          )}

          {lastRun && (<>
            <Divider>Last Run Summary</Divider>
            <Row gutter={[16, 16]}>
              <Col span={6}><Statistic title="Discovered" value={lastRun.totalDiscovered || 0} /></Col>
              <Col span={6}><Statistic title="Eligible" value={lastRun.totalEligible || 0} /></Col>
              <Col span={6}><Statistic title="Published" value={lastRun.totalPublished || 0} valueStyle={{ color: "#3f8600" }} /></Col>
              <Col span={6}><Statistic title="Failed" value={lastRun.totalFailed || 0} valueStyle={{ color: "#cf1322" }} /></Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={6}><Statistic title="Excluded" value={lastRun.totalExcluded || 0} /></Col>
              <Col span={6}><Statistic title="Updated" value={lastRun.totalUpdated || 0} /></Col>
              <Col span={6}><Statistic title="Created" value={lastRun.totalCreated || 0} /></Col>
              <Col span={6}><Statistic title="Duration" value={lastRun.durationMs ? `${Math.round(lastRun.durationMs / 1000)}s` : "\u2014"} /></Col>
            </Row>
            {lastRun.completedAt && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Ran at: {new Date(lastRun.completedAt).toLocaleString()}</Text>
                {lastRun.error && <div><Text type="danger">Error: {lastRun.error}</Text></div>}
              </div>
            )}
          </>)}

          {!lastRun && configured && (
            <div style={{ textAlign: "center", padding: 20 }}>
              <Text type="secondary">No sync has been run yet.</Text>
            </div>
          )}
        </>)}
      </Card>
    </div>
  );
};

export default EbayCatalogSyncStatus;