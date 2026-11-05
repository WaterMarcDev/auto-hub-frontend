// Inventory sync — stock ledger, in-store sales, returns, eBay quantity sync,
// eBay webhook events, reconciliation (backend: /api/inventory-sync).
import api from "../utils/api";

// Idempotency key for one user action: a double-click or network retry with
// the same id is processed once by the backend.
export const newRequestId = () =>
  (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`).replace(/[^A-Za-z0-9_-]/g, "");

const InventorySyncService = {
  summary: async () => (await api.get("/inventory-sync/summary")).data,
  sell: async (partId, body) => (await api.post(`/inventory-sync/parts/${partId}/sell`, body)).data,
  adjust: async (partId, body) => (await api.post(`/inventory-sync/parts/${partId}/adjust`, body)).data,
  returnReceived: async (partId) => (await api.post(`/inventory-sync/parts/${partId}/return/received`)).data,
  inspection: async (partId, result, notes) =>
    (await api.post(`/inventory-sync/parts/${partId}/return/inspection`, { result, notes })).data,
  transactions: async (params = {}) => (await api.get("/inventory-sync/transactions", { params })).data,
  returns: async (params = {}) => (await api.get("/inventory-sync/returns", { params })).data,
  ebaySync: async (params = {}) => (await api.get("/inventory-sync/ebay-sync", { params })).data,
  retryEbaySync: async (partId) => (await api.post(`/inventory-sync/ebay-sync/${partId}/retry`)).data,
  runEbaySync: async () => (await api.post("/inventory-sync/ebay-sync/run", {}, { timeout: 300000 })).data,
  events: async (params = {}) => (await api.get("/inventory-sync/events", { params })).data,
  retryEvent: async (id) => (await api.post(`/inventory-sync/events/${id}/retry`)).data,
  reconciliation: async () => (await api.get("/inventory-sync/reconciliation")).data,
  runReconciliation: async () => (await api.post("/inventory-sync/reconciliation/run", {}, { timeout: 300000 })).data,
};

export default InventorySyncService;
