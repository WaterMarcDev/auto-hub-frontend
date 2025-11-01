import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://192.168.1.4:5000/api",
  timeout: 10000,
  withCredentials: true, // Include cookies for authentication
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.data || error.message);

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Don't redirect on auth profile endpoint - let the component handle it
      if (!error.config?.url?.includes("/auth/profile")) {
        // Redirect to login if not authenticated for other endpoints
        window.location.href = "/auth-login";
      }
    }

    return Promise.reject(error);
  }
);

// Car Intake API functions
export const carIntakeAPI = {
  create: (formData) => {
    // For FormData, we need to set Content-Type to multipart/form-data
    return api.post("/car-intake", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  createWithJSON: (jsonData) => {
    // For JSON data, use default Content-Type: application/json
    return api.post("/car-intake", jsonData);
  },

  getAll: (params = {}) => api.get("/car-intake", { params }),

  getById: (id) => api.get(`/car-intake/${id}`),

  update: (id, data) => api.put(`/car-intake/${id}`, data),

  delete: (id) => api.delete(`/car-intake/${id}`),

  updateStatus: (id, status) =>
    api.patch(`/car-intake/${id}/status`, { status }),

  getStats: (params = {}) => api.get("/car-intake/stats", { params }),
  bulkUpload: (fileUrl) => api.post("/car-intake/bulk-upload", { fileUrl }),
  // Accept either a string (fileUrl) or an object { fileUrl, defaultYard, defaultYardLocation }
  bulkUploadScraped: (payload) =>
    api.post(
      "/car-intake/bulk-upload-scraped",
      typeof payload === "string" ? { fileUrl: payload } : payload
    ),
};

export const makeAPI = {
  getAll: (params = {}) => api.get("/make", { params }),
  getById: (id) => api.get(`/make/${id}`),
  create: (data) => api.post("/make", data),
  update: (id, data) => api.put(`/make/${id}`, data),
  delete: (id) => api.delete(`/make/${id}`),
};

export const modelAPI = {
  getAll: (params = {}) => api.get("/model", { params }),
  getById: (id) => api.get(`/model/${id}`),
  create: (data) => api.post("/model", data),
  update: (id, data) => api.put(`/model/${id}`, data),
  delete: (id) => api.delete(`/model/${id}`),
};

export const trimAPI = {
  getAll: (params = {}) => api.get("/trim", { params }),
  getById: (id) => api.get(`/trim/${id}`),
  create: (data) => api.post("/trim", data),
  update: (id, data) => api.put(`/trim/${id}`, data),
  delete: (id) => api.delete(`/trim/${id}`),
};

export const partAPI = {
  getAll: (params = {}) => api.get("/part", { params }),
  getById: (id) => api.get(`/part/${id}`),
  create: (data) => api.post("/part", data),
  update: (id, data) => api.put(`/part/${id}`, data),
  delete: (id) => api.delete(`/part/${id}`),
};

export const inventoryAPI = {
  create: (data) => api.post("/inventory", data),
  getByVIN: (vin) => api.get(`/inventory/vin/${vin}`),
  getPartsMaster: (params = {}) => api.get(`/inventory/parts`, { params }),
  getAll: (params = {}) => api.get("/inventory", { params }),
};

export const elementAPI = {
  getAll: (params = {}) => api.get("/element", { params }),
  getById: (id) => api.get(`/element/${id}`),
  create: (data) => api.post("/element", data),
  update: (id, data) => api.put(`/element/${id}`, data),
  delete: (id) => api.delete(`/element/${id}`),
};

export const scrapElementAPI = {
  create: (data) => api.post("/scrap-element", data),
  getByVIN: (vin) => api.get(`/scrap-element/vin/${vin}`),
};

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/profile"),

  register: (userData) => api.post("/auth/register", userData),
};

// VIN API functions
export const vinAPI = {
  getDetails: (vinNumber) => api.get(`/vin/${vinNumber}`),
};

// Upload API functions
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    return api.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteImage: (filename) => api.delete(`/upload/${filename}`),
  // Build a full URL for uploaded files matching legacy behavior
  getImageUrl: (filename) => {
    if (!filename) return "";
    try {
      new URL(filename);
      return filename;
    } catch {
      // Not a full URL
    }

    const base = (
      import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    if (/^\/?api\//i.test(filename)) {
      const cleaned = filename.replace(/^\/?api\//i, "");
      return `${base}/${cleaned}`.replace(/([^:]?)\/\/+/g, "$1/");
    }

    if (/^\/?uploads\//.test(filename)) {
      return `${base}${filename.startsWith("/") ? filename : "/" + filename}`;
    }

    return `${base}/uploads/${filename}`;
  },
};

export const sellerAPI = {
  getAll: (params = {}) => api.get("/sellers", { params }),
  getById: (id) => api.get(`/sellers/${id}`),
  create: (data) => api.post(`/sellers`, data),
  update: (id, data) => api.put(`/sellers/${id}`, data),
  delete: (id) => api.delete(`/sellers/${id}`),
  search: (q) => api.get(`/sellers/search`, { params: { q } }),
};

export const customerAPI = {
  create: (data) => api.post(`/customers`, data),
  getAll: (params = {}) => api.get(`/customers`, { params }),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const buyerAPI = {
  getAll: (params = {}) => api.get("/buyers", { params }),
  getById: (id) => api.get(`/buyers/${id}`),
  create: (data) => api.post(`/buyers`, data),
  update: (id, data) => api.put(`/buyers/${id}`, data),
  delete: (id) => api.delete(`/buyers/${id}`),
  search: (q) => api.get(`/buyers/search`, { params: { q } }),
};

export const waiverAPI = {
  getAll: (params = {}) => api.get("/waivers", { params }),
  getById: (id) => api.get(`/waivers/${id}`),
  create: (data) => api.post(`/waivers`, data),
  update: (id, data) => api.put(`/waivers/${id}`, data),
  delete: (id) => api.delete(`/waivers/${id}`),
  getBySeller: (sellerId) => api.get(`/waivers/seller/${sellerId}`),
  getByBuyer: (buyerId) => api.get(`/waivers/buyer/${buyerId}`),
  getStats: (params = {}) => api.get("/waivers/stats", { params }),
};

export const checkInAPI = {
  getAll: (params = {}) => api.get("/checkins", { params }),
  create: (data) => api.post("/checkins", data),
  checkout: (id) => api.post(`/checkins/${id}/checkout`),
};

// Dashboard APIs (for charts and counts)
export const dashboardAPI = {
  getSummary: (params = {}) => api.get("/dashboard/summary", { params }),
  getRevenueTrend: (params = {}) => {
    // Default to all-time if no start/end provided
    const hasStart = params && (params.startDate || params.start);
    const hasEnd = params && (params.endDate || params.end);
    if (!params || Object.keys(params).length === 0 || (!hasStart && !hasEnd)) {
      const start = new Date(0).toISOString();
      const now = new Date();
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      ).toISOString();
      params = { startDate: start, endDate: end };
    }
    return api.get("/dashboard/revenue-trend", { params });
  },
  getSummaryCounts: (params = {}) =>
    api.get("/dashboard/summary-counts", { params }),
  getEarningGoal: (params = {}) =>
    api.get("/dashboard/earning-goal", { params }),
};

// Export the configured axios instance as default
export default api;
