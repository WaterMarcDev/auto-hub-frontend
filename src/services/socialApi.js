import api from "../utils/api";

/**
 * Social & Marketplace Integration API Service
 *
 * Provides clean API methods for all social/marketplace operations.
 * Pattern matches the existing apiService pattern used in the project.
 */

// ─── Social Leads ─────────────────────────────────────────────────────────

export const socialLeadService = {
  getAll: (params = {}) => api.get("/social-leads", { params }),
  getById: (id) => api.get(`/social-leads/${id}`),
  updateStatus: (id, status) => api.patch(`/social-leads/${id}/status`, { status }),
  assignUser: (id, userId) => api.patch(`/social-leads/${id}/assign`, { userId }),
  updateNotes: (id, notes) => api.patch(`/social-leads/${id}/notes`, { notes }),
  updatePriority: (id, priority) => api.patch(`/social-leads/${id}/priority`, { priority }),
  remove: (id) => api.delete(`/social-leads/${id}`),
};

// ─── Marketplace Listings ─────────────────────────────────────────────────
// NOTE: this module was renamed from "Marketplace Leads" to "Marketplace
// Listings" for clarity (it no longer represents leads). The underlying
// backend endpoints stay at /marketplace-leads for backward compatibility —
// only this JS-level name changed.

export const marketplaceListingService = {
  getAll: (params = {}) => api.get("/marketplace-leads", { params }),
  getById: (id) => api.get(`/marketplace-leads/${id}`),
  // `marketplace` is optional and additive — sent alongside id/status so the
  // backend can scope the update to the record's own marketplace (defense
  // in depth against a status update ever affecting the wrong platform's
  // record). Omitting it keeps prior behavior unchanged.
  updateStatus: (id, status, marketplace) => api.patch(`/marketplace-leads/${id}/status`, { status, marketplace }),
  assignUser: (id, userId) => api.patch(`/marketplace-leads/${id}/assign`, { userId }),
  updateNotes: (id, notes) => api.patch(`/marketplace-leads/${id}/notes`, { notes }),
  updateOrderStatus: (id, data) => api.patch(`/marketplace-leads/${id}/order-status`, data),
  // CRM-ONLY removal: deletes this CRM record and nothing else. The backend
  // never calls the marketplace, so the actual eBay listing keeps running.
  remove: (id) => api.delete(`/marketplace-leads/${id}`),
  // Triggers a live order sync for the given marketplace (existing backend
  // endpoint — GET /api/marketplace-leads/orders?platform=... — already used
  // elsewhere; exposed here for the Marketplace Orders page's "Sync Now").
  syncOrders: (platform) => api.get("/marketplace-leads/orders", { params: { platform } }),
  // Manual "Sync eBay Listings": pulls the seller's CURRENTLY ACTIVE eBay
  // listings and reconciles the CRM dataset to match (creates/updates/removes).
  // POST is used so a link prefetch/crawl can never trigger a sync.
  syncListings: (params = {}) => api.post("/marketplace-leads/listings", params),
  // Read-only integrity counts (duplicates, missing ids, unknown status).
  getEbayIntegrity: () => api.get("/marketplace-leads/ebay/integrity"),
};

/**
 * @deprecated Renamed to `marketplaceListingService`. Kept as a
 * backward-compatible alias so any existing import of the old name keeps
 * working — new code should import `marketplaceListingService` directly.
 */
export const marketplaceLeadService = marketplaceListingService;

// ─── Conversations ────────────────────────────────────────────────────────

export const conversationService = {
  getAll: (params = {}) => api.get("/conversations", { params }),
  getById: (id) => api.get(`/conversations/${id}`),
  getMessages: (id, params = {}) => api.get(`/conversations/${id}/messages`, { params }),
  sendReply: (id, data) => api.post(`/conversations/${id}/reply`, data),
  addNote: (id, text) => api.post(`/conversations/${id}/notes`, { text }),
  updateStatus: (id, status) => api.patch(`/conversations/${id}/status`, { status }),
  assignUser: (id, userId) => api.patch(`/conversations/${id}/assign`, { userId }),
  updateTags: (id, tags) => api.patch(`/conversations/${id}/tags`, { tags }),
};

// ─── Platform Integrations (OAuth-Based) ─────────────────────────────────

/**
 * Platform integration service using the new generic OAuth backend.
 *
 * All methods use the generic /api/integrations/:platform/ endpoints.
 * No platform-specific URLs. No manual token entry required.
 *
 * Backend architecture:
 *   - Generic Integration Controller
 *   - Generic Routes
 *   - Platform Manager + Adapter Registry
 *   - Meta Adapter (shared by Facebook, Instagram, WhatsApp)
 *   - Platform-specific adapters
 */

export const integrationService = {
  /**
   * Get all connected integrations (legacy — returns IntegrationAccount docs).
   * Used for backwards compatibility.
   */
  getAll: (params = {}) => api.get("/integrations", { params }),

  /**
   * Get a single integration by ID (legacy).
   */
  getById: (id) => api.get(`/integrations/${id}`),

  /**
   * Initiate OAuth connection for a platform.
   * Returns { authUrl: "https://..." }.
   * Frontend should redirect the user to authUrl.
   *
   * @param {string} platform - Platform name (e.g., "whatsapp", "facebook")
   * @returns {Promise<{data: {authUrl: string}}>}
   */
  connectPlatform: (platform) => api.get(`/integrations/${platform}/connect`),

  /**
   * Disconnect a platform (revokes token, deactivates account).
   *
   * @param {string} platform - Platform name
   * @returns {Promise<Object>}
   */
  disconnectPlatform: (platform) => api.post(`/integrations/${platform}/disconnect`),

  /**
   * Refresh the OAuth token for a platform.
   *
   * @param {string} platform - Platform name
   * @returns {Promise<Object>}
   */
  refreshPlatform: (platform) => api.post(`/integrations/${platform}/refresh`),

  /**
   * Get the connection status for a platform.
   * Returns { connected, status, businessAccountId, phoneNumberId, health, ... }
   *
   * @param {string} platform - Platform name
   * @returns {Promise<{data: {connected: boolean, status: string, ...}}>}
   */
  getPlatformStatus: (platform) => api.get(`/integrations/${platform}/status`),

  /**
   * Test the connection by running a health check.
   * Delegates to getPlatformStatus which runs healthCheck on the adapter.
   *
   * @param {string} platform - Platform name
   * @returns {Promise<Object>}
   */
  testPlatform: (platform) => api.get(`/integrations/${platform}/status`),

  // ─── Legacy Methods (Preserved for rollback) ─────────────────────────────

  // ----------------------------------------------------------
  // OLD MANUAL TOKEN FLOW
  // Deprecated after OAuth architecture.
  // Preserved for rollback/reference.
  // These methods required the user to manually enter tokens.
  // The new OAuth flow handles everything automatically.
  // ----------------------------------------------------------

  /** @deprecated Replaced by connectPlatform(platform) — OAuth flow */
  connect: (data) => api.post("/integrations/connect", data),

  /** @deprecated Replaced by disconnectPlatform(platform) */
  disconnect: (id) => api.post(`/integrations/${id}/disconnect`),

  /** @deprecated Replaced by refreshPlatform(platform) */
  refreshToken: (id) => api.post(`/integrations/${id}/refresh`),

  /** @deprecated Still used for manual webhook verification */
  verifyWebhook: (id) => api.post(`/integrations/${id}/webhook/verify`),

  /** @deprecated */
  updateWebhookConfig: (id, config) => api.patch(`/integrations/${id}/webhook-config`, { webhookConfig: config }),

  /** @deprecated Replaced by disconnectPlatform(platform) */
  remove: (id) => api.delete(`/integrations/${id}`),
};

// ─── Global Search ────────────────────────────────────────────────────────

export const searchService = {
  search: (query) => api.get("/search", { params: { q: query } }),
};