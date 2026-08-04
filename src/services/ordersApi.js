import api from "../utils/api";

/**
 * Orders API Service
 *
 * Dedicated to the new Orders module (backed by the backend's `Order`
 * collection — completely separate from Marketplace/`MarketplaceListing`).
 * Mirrors the shape of marketplaceListingService in socialApi.js.
 */
export const ordersService = {
  getAll: (params = {}) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};
