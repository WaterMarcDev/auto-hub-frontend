import { useState, useEffect } from "react";
import { Card, Button, Row, Col, Spin, Typography, App } from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import PlatformCard from "../components/integrations/PlatformCard";

const { Title } = Typography;

// ─── Supported Platforms ───────────────────────────────────────────────────

/**
 * Configurable platform list.
 * Adding a new platform requires only adding one entry here.
 * No other UI changes needed.
 *
 * To add a new platform:
 *   1. Create a backend adapter
 *   2. Register it with PlatformManager
 *   3. Add it to this array
 *   4. Add its metadata to PLATFORM_META in PlatformCard.jsx
 */
const SUPPORTED_PLATFORMS = [
  { key: "tiktok", comingSoon: true },
  { key: "googleAds", comingSoon: true },
  { key: "amazon", comingSoon: true },
  { key: "ebay" },
];

const IntegrationManager = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  //----------------------------------------------------
  // BUGFIX
  // Use App.useApp() instead of static message API
  // to avoid "Static function cannot consume context" warning.
  //----------------------------------------------------
  const { message } = App.useApp();

  // ─── Handle OAuth callback ──────────────────────────────────────────────

  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected) {
      message.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`);
      // Remove the query param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setLoading(false);
  }, [searchParams, message]);

  // ─── Refresh All Statuses ───────────────────────────────────────────────

  const handleRefreshAll = () => {
    setLoading(true);
    // Force re-render of all PlatformCards by toggling a key
    // Each card fetches its own status on mount
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setLoading(false), 500);
  };

  const [refreshKey, setRefreshKey] = useState(0);

  // ═══════════════════════════════════════════════════════════════════════════
  // OLD MANUAL TOKEN FLOW
  // Deprecated after OAuth architecture.
  // Preserved for rollback/reference.
  //
  // The old implementation used a modal form that required the user to manually
  // enter Access Token, Refresh Token, Platform Email, Platform User ID, and
  // Account Name. This was error-prone and insecure.
  //
  // The new OAuth flow handles everything automatically through the backend:
  //   - User clicks "Connect"
  //   - Frontend calls GET /api/integrations/:platform/connect
  //   - Backend redirects user to Meta OAuth (or platform-specific OAuth)
  //   - User logs in on the platform's site
  //   - Backend stores the IntegrationAccount with tokens
  //   - Frontend refreshes status via GET /api/integrations/:platform/status
  //
  // No manual token entry is required.
  // No sensitive data is exposed in the frontend.
  // ═══════════════════════════════════════════════════════════════════════════

  /*
  // OLD CODE BLOCK — Preserved for reference
  // ----------------------------------------------------------
  // Old imports:
  // import { LinkOutlined, DisconnectOutlined, ReloadOutlined, CheckCircleOutlined } from "@ant-design/icons";
  // import { Button, Tag, Empty, Modal, Form, Select, Input } from "antd";
  //
  // Old state:
  // const [connectModalOpen, setConnectModalOpen] = useState(false);
  // const [connecting, setConnecting] = useState(false);
  // const [form] = Form.useForm();
  //
  // Old connect handler:
  // const handleConnect = async (values) => {
  //   try {
  //     setConnecting(true);
  //     await integrationService.connect(values);
  //     message.success(`${PLATFORM_META[values.platform]?.name || values.platform} connected successfully`);
  //     setConnectModalOpen(false);
  //     form.resetFields();
  //     fetchIntegrations();
  //   } catch (err) {
  //     message.error("Failed to connect platform");
  //   } finally {
  //     setConnecting(false);
  //   }
  // };
  //
  // Old disconnect handler:
  // const handleDisconnect = async (id, platform) => {
  //   try {
  //     await integrationService.disconnect(id);
  //     message.success(`${PLATFORM_META[platform]?.name || platform} disconnected`);
  //     fetchIntegrations();
  //   } catch (err) {
  //     message.error("Failed to disconnect");
  //   }
  // };
  //
  // Old refresh handler:
  // const handleRefreshToken = async (id) => {
  //   try {
  //     await integrationService.refreshToken(id);
  //     message.success("Token refreshed");
  //     fetchIntegrations();
  //   } catch (err) {
  //     message.error("Failed to refresh token");
  //   }
  // };
  //
  // Old formatDate:
  // const formatDate = (date) => {
  //   if (!date) return "—";
  //   return new Date(date).toLocaleString();
  // };
  //
  // OLD MODAL:
  // <Modal
  //   title="Connect Platform"
  //   open={connectModalOpen}
  //   onCancel={() => setConnectModalOpen(false)}
  //   footer={null}
  //   width={500}
  // >
  //   <Form form={form} layout="vertical" onFinish={handleConnect}>
  //     <Form.Item name="platform" label="Platform" rules={[{ required: true, message: "Select a platform" }]}>
  //       <Select placeholder="Select platform">
  //         {Object.entries(PLATFORM_META).map(([key, meta]) => (
  //           <Select.Option key={key} value={key}>{meta.icon} {meta.name}</Select.Option>
  //         ))}
  //       </Select>
  //     </Form.Item>
  //     <Form.Item name="accessToken" label="Access Token" rules={[{ required: true, message: "Access token is required" }]}>
  //       <Input.Password placeholder="Enter platform access token" />
  //     </Form.Item>
  //     <Form.Item name="refreshToken" label="Refresh Token (optional)">
  //       <Input.Password placeholder="Enter refresh token if available" />
  //     </Form.Item>
  //     <Form.Item name="platformEmail" label="Platform Email">
  //       <Input placeholder="Associated email address" />
  //     </Form.Item>
  //     <Form.Item name="platformName" label="Account Name">
  //       <Input placeholder="Friendly account name" />
  //     </Form.Item>
  //     <Form.Item name="platformUserId" label="Platform User ID">
  //       <Input placeholder="Platform user/page ID" />
  //     </Form.Item>
  //     <Form.Item>
  //       <Button type="primary" htmlType="submit" loading={connecting} block>Connect</Button>
  //     </Form.Item>
  //   </Form>
  // </Modal>
  // ----------------------------------------------------------
  */

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW OAUTH-BASED IMPLEMENTATION
  // Uses the generic PlatformCard component for all platforms.
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ padding: "20px" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Title level={4} style={{ margin: 0 }}>Platform Connections</Title>
          </div>
        }
        extra={
          <Row gutter={8}>
            {/* ----------------------------------------------------------
                OLD "Connect Platform" BUTTON
                This button opened a modal with manual token entry form.
                Replaced by per-platform Connect buttons on each card.
            <Col>
              <Button type="primary" icon={<LinkOutlined />} onClick={() => setConnectModalOpen(true)}>
                Connect Platform
              </Button>
            </Col>
                ---------------------------------------------------------- */}
            <Col>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/")}>
                Back
              </Button>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={handleRefreshAll} loading={loading}>
                Refresh All
              </Button>
            </Col>
          </Row>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {SUPPORTED_PLATFORMS.map(({ key, comingSoon }) => (
              <PlatformCard
                key={`${key}-${refreshKey}`}
                platform={key}
                comingSoon={comingSoon}
              />
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
};

export default IntegrationManager;