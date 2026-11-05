// Sold Products — parts sold on eBay / Wix (backend: /api/sold-products).
import api from "../utils/api";

const SoldProductsService = {
  // { data: rows[], pagination }
  list: async (params = {}) => (await api.get("/sold-products", { params })).data,
  // { data: { total, ebay, wix, last30Days, conflicts, sync: { ebay, wix } } }
  summary: async () => (await api.get("/sold-products/summary")).data,
  // Runs the eBay + Wix sold-status sync now. 409 if one is already running.
  syncNow: async () => (await api.post("/sold-products/sync", {}, { timeout: 300000 })).data,
  getOne: async (id) => (await api.get(`/sold-products/${id}`)).data,
};

export default SoldProductsService;
