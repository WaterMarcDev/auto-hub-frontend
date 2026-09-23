import { useState, useEffect, useCallback } from "react";
import { Card, Button, Tag, Space, Spin, Typography, Tooltip, Row, Col, App } from "antd";
import {
  LinkOutlined,
  DisconnectOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  BugOutlined,
} from "@ant-design/icons";
import {
  SiGoogleads,
  SiEbay,
} from "react-icons/si";
import { FaAmazon } from "react-icons/fa";
import { integrationService } from "../../services/socialApi";

const { Text, Title } = Typography;

// ─── Official Platform Logos (Inline SVG) ──────────────────────────────────

const PlatformIcon = ({ platform, size = 40 }) => {
  const icons = {
    tiktok: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="#000000">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    googleAds: <SiGoogleads size={size} color="#4285F4" />,
    amazon: <FaAmazon size={size} color="#FF9900" />,
    ebay: <SiEbay size={size} />,
  };

  return icons[platform] || <span style={{ fontSize: size }}>🔌</span>;
};

// ─── Platform Metadata ─────────────────────────────────────────────────────

const PLATFORM_META = {
  tiktok: { name: "TikTok Business", color: "#000000", description: "Connect TikTok for Business messaging integration." },
  googleAds: { name: "Google Ads", color: "#4285F4", description: "Connect Google Ads to manage leads from ad campaigns." },
  amazon: { name: "Amazon", color: "#FF9900", description: "Connect Amazon Seller Central for order management." },
  ebay: { name: "eBay", color: "#E53238", description: "Connect eBay store for sales and customer management." },
};

// ─── Status Helpers ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  connected: { color: "green", icon: <CheckCircleOutlined />, label: "Connected" },
  connecting: { color: "blue", icon: <SyncOutlined spin />, label: "Connecting..." },
  error: { color: "red", icon: <CloseCircleOutlined />, label: "Error" },
  expired: { color: "orange", icon: <WarningOutlined />, label: "Expired" },
  disconnected: { color: "default", icon: <CloseCircleOutlined />, label: "Not Connected" },
  loading: { color: "default", icon: <SyncOutlined spin />, label: "Loading..." },
  coming_soon: { color: "default", icon: <QuestionCircleOutlined />, label: "Coming Soon" },
};

function getStatus(account, health, comingSoon) {
  if (comingSoon) return "coming_soon";
  if (!account) return "disconnected";
  if (!account.connected) return "disconnected";
  if (account.supported === false) return "coming_soon";
  if (health && !health.healthy) return "error";
  if (account.tokenExpiresAt && new Date(account.tokenExpiresAt) < new Date()) return "expired";
  return "connected";
}

function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return d.toLocaleDateString();
}

// ─── PlatformCard Component ────────────────────────────────────────────────

/**
 * Generic PlatformCard — works with any platform.
 *
 * Props:
 *   - platform: string (e.g., "whatsapp", "facebook")
 *   - comingSoon: boolean (optional) — marks as coming soon
 *
 * No platform-specific logic. Adding a new platform = add to PLATFORM_META.
 */
const PlatformCard = ({ platform, comingSoon = false }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [testing, setTesting] = useState(false);

  //----------------------------------------------------
  // BUGFIX
  // Use App.useApp() instead of static message API
  // to avoid "Static function cannot consume context" warning.
  //----------------------------------------------------
  const { message } = App.useApp();

  const meta = PLATFORM_META[platform] || {
    name: platform,
    color: "#6b7280",
    description: `Connect ${platform}`,
  };

  // ─── Fetch Status ──────────────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    if (comingSoon) {
      setLoading(false);
      return;
    }
    try {
      const res = await integrationService.getPlatformStatus(platform);
      const data = res.data?.data || null;
      setAccount(data);
    } catch (err) {
      // Platform not configured yet — not an error
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, [platform, comingSoon]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ─── Connect Handler ───────────────────────────────────────────────────

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await integrationService.connectPlatform(platform);
      const data = res.data?.data;

      //----------------------------------------------------
      // BUGFIX
      // Handle "coming_soon" response from backend
      // for platforms without registered adapters.
      //----------------------------------------------------
      if (data?.supported === false) {
        message.info(`${meta.name} is coming soon.`);
        setConnecting(false);
        return;
      }

      const authUrl = data?.authUrl;

      if (authUrl) {
        // Backend returned a redirect URL — redirect the user
        window.location.href = authUrl;
      } else {
        // Backend may have already redirected or handled it
        message.success(`Redirecting to ${meta.name} for authorization...`);
        // Fallback: navigate directly to the endpoint
        window.location.href = `/api/integrations/${platform}/connect`;
      }
    } catch (err) {
      // If the backend returned a categorized integration error (currently
      // wired for eBay — see services/integrationErrors.js), show its
      // message plus recovery suggestion. Falls back to the raw error
      // message for every other platform, unchanged from before.
      const categorized = err.response?.data;
      if (categorized?.category && categorized?.message) {
        message.error(
          categorized.recoverySuggestion
            ? `${categorized.message} ${categorized.recoverySuggestion}`
            : categorized.message,
          6
        );
      } else {
        message.error(`Failed to connect ${meta.name}: ${err.message}`);
      }
      setConnecting(false);
    }
  };

  // ─── Disconnect Handler ────────────────────────────────────────────────

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await integrationService.disconnectPlatform(platform);
      message.success(`${meta.name} disconnected successfully`);
      setAccount(null);
    } catch (err) {
      message.error(`Failed to disconnect: ${err.message}`);
    } finally {
      setDisconnecting(false);
    }
  };

  // ─── Refresh Handler ───────────────────────────────────────────────────

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await integrationService.refreshPlatform(platform);
      message.success(`${meta.name} token refreshed`);
      await fetchStatus();
    } catch (err) {
      message.error(`Failed to refresh: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  // ─── Test Connection Handler ───────────────────────────────────────────

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await integrationService.testPlatform(platform);
      const data = res.data?.data;
      if (data?.connected) {
        message.success(`${meta.name} connection is healthy`);
      } else {
        message.warning(`${meta.name} connection test returned: ${data?.status || "unknown"}`);
      }
    } catch (err) {
      message.error(`Connection test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────

  const status = getStatus(account, account?.health, comingSoon);
  const statusConfig = STATUS_CONFIG[status];
  const isConnected = status === "connected";
  const isActionInProgress = connecting || disconnecting || refreshing || testing;

  return (
    <Col xs={24} sm={12} lg={8} xl={6}>
      <Card
        style={{ height: "100%", borderRadius: 12 }}
        //----------------------------------------------------
        // BUGFIX
        // bodyStyle is deprecated in Ant Design v5.
        // Use styles.body instead.
        //----------------------------------------------------
        styles={{
          body: { padding: 24, display: "flex", flexDirection: "column", height: "100%" },
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 48, marginBottom: 8 }}>
            <PlatformIcon platform={platform} size={40} />
          </div>
          <Title level={5} style={{ margin: 0, color: meta.color }}>
            {meta.name}
          </Title>
        </div>

        {/* Description */}
        {!isConnected && status !== "coming_soon" && (
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 16, fontSize: 13 }}>
            {meta.description}
          </Text>
        )}

        {/* Status Badge */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          {loading ? (
            <Spin size="small" />
          ) : (
            <Tag color={statusConfig.color} icon={statusConfig.icon} style={{ fontSize: 13, padding: "4px 12px" }}>
              {statusConfig.label}
            </Tag>
          )}
        </div>

        {/* Connected Details */}
        {isConnected && account && (
          <div style={{ marginBottom: 16, fontSize: 13, color: "#4b5563" }}>
            {account.businessName && (
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Business: </Text>
                <Text strong>{account.businessName}</Text>
              </div>
            )}
            {account.displayName && (
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Account: </Text>
                <Text>{account.displayName}</Text>
              </div>
            )}
            {account.phoneNumberId && (
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Phone: </Text>
                <Text>{account.displayName || account.phoneNumberId}</Text>
              </div>
            )}
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Webhook: </Text>
              <Tag color={account.webhookVerified ? "blue" : "orange"} style={{ fontSize: 11 }}>
                {account.webhookVerified ? "Verified" : "Pending"}
              </Tag>
            </div>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Health: </Text>
              <Tag color={account.health?.healthy ? "green" : "red"} style={{ fontSize: 11 }}>
                {account.health?.healthy ? "Healthy" : "Unhealthy"}
              </Tag>
            </div>
            {account.lastSyncAt && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Last Sync: </Text>
                <Text style={{ fontSize: 12 }}>{formatDate(account.lastSyncAt)}</Text>
              </div>
            )}
            {account.tokenExpiresAt && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Token Expires: </Text>
                <Text style={{ fontSize: 12 }}>{formatDate(account.tokenExpiresAt)}</Text>
              </div>
            )}
          </div>
        )}

        {/* Error Details */}
        {status === "error" && account?.health?.details?.error && (
          <div style={{ marginBottom: 16, padding: 8, background: "#fef2f2", borderRadius: 6, fontSize: 12, color: "#dc2626" }}>
            <Text style={{ color: "#dc2626", fontSize: 12 }}>{account.health.details.error}</Text>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action Buttons */}
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          {comingSoon || status === "coming_soon" ? (
            <Button disabled block>
              Coming Soon
            </Button>
          ) : isConnected ? (
            <>
              <Tooltip title="Test the connection health">
                <Button
                  icon={<BugOutlined />}
                  onClick={handleTestConnection}
                  loading={testing}
                  disabled={isActionInProgress}
                  block
                >
                  Test Connection
                </Button>
              </Tooltip>
              <Tooltip title="Refresh connection and token">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={refreshing}
                  disabled={isActionInProgress}
                  block
                >
                  Refresh
                </Button>
              </Tooltip>
              <Button
                danger
                icon={<DisconnectOutlined />}
                onClick={handleDisconnect}
                loading={disconnecting}
                disabled={isActionInProgress}
                block
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={handleConnect}
              loading={connecting}
              disabled={isActionInProgress}
              block
              style={{ background: meta.color, borderColor: meta.color }}
            >
              {connecting ? "Redirecting..." : "Connect"}
            </Button>
          )}
        </Space>
      </Card>
    </Col>
  );
};

export default PlatformCard;