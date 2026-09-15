// Scrap Material Purchase — frontend service.
//
// Independent module. Uses the shared axios instance (withCredentials) for
// JSON CRUD and builds the printable bill URL for the proven iframe + autoPrint
// pattern. No other billing/car service is imported.

import api from "../utils/api";

const VITE_API_URL = import.meta.env.VITE_API_URL;

class ScrapPurchaseService {
  // List purchases (paginated + optional search)
  static async getAll(params = {}) {
    const res = await api.get("/scrap-purchase", { params });
    return res.data;
  }

  // Single purchase
  static async getById(id) {
    const res = await api.get(`/scrap-purchase/${id}`);
    return res.data;
  }

  // Create a purchase
  static async create(payload) {
    const res = await api.post("/scrap-purchase", payload);
    return res.data;
  }

  // Update a purchase (or edit its bill line items before printing)
  static async update(id, payload) {
    const res = await api.put(`/scrap-purchase/${id}`, payload);
    return res.data;
  }

  // Soft-delete
  static async remove(id) {
    const res = await api.delete(`/scrap-purchase/${id}`);
    return res.data;
  }

  // Printable bill URL (opened in a hidden iframe with autoPrint=1)
  static printUrl(id) {
    const base = VITE_API_URL || "http://localhost:5000/api";
    return `${base}/scrap-purchase/${id}/print?autoPrint=1`;
  }

  // ── Dedicated sellers (independent from the Customer collection) ──────────
  // Base path /scrap-purchase-sellers is intentionally separate from
  // /scrap-purchase to avoid conflicting with its /:id route.

  // List / search sellers by name or phone
  static async getSellers(params = {}) {
    const res = await api.get("/scrap-purchase-sellers", { params });
    return res.data;
  }

  // Create a seller — stores { name, phone } verbatim (no name splitting)
  static async createSeller(payload) {
    const res = await api.post("/scrap-purchase-sellers", payload);
    return res.data;
  }

  // Update a seller
  static async updateSeller(id, payload) {
    const res = await api.put(`/scrap-purchase-sellers/${id}`, payload);
    return res.data;
  }

  // Hard-delete a seller (seller record only; purchases are never touched)
  static async removeSeller(id) {
    const res = await api.delete(`/scrap-purchase-sellers/${id}`);
    return res.data;
  }
}

export default ScrapPurchaseService;
