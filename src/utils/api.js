import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
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
};

export const makeAPI = {
  getAll: (params = {}) => api.get("/make", { params }),
  getById: (id) => api.get(`/make/${id}`),
  create: (data) => api.post("/make", data),
  update: (id, data) => api.put(`/make/${id}`, data),
};

export const modelAPI = {
  getAll: (params = {}) => api.get("/model", { params }),
  getById: (id) => api.get(`/model/${id}`),
  create: (data) => api.post("/model", data),
  update: (id, data) => api.put(`/model/${id}`, data),
};

export const trimAPI = {
  getAll: (params = {}) => api.get("/trim", { params }),
  getById: (id) => api.get(`/trim/${id}`),
  create: (data) => api.post("/trim", data),
  update: (id, data) => api.put(`/trim/${id}`, data),
};

export const partAPI = {
  getAll: (params = {}) => api.get("/part", { params }),
  getById: (id) => api.get(`/part/${id}`),
  create: (data) => api.post("/part", data),
  update: (id, data) => api.put(`/part/${id}`, data),
};

export const inventoryAPI = {
  create: (data) => api.post("/inventory", data),
  getByVIN: (vin) => api.get(`/inventory/vin/${vin}`),
  getAll: (params = {}) => api.get("/inventory", { params }),
};

export const elementAPI = {
  getAll: (params = {}) => api.get("/element", { params }),
  getById: (id) => api.get(`/element/${id}`),
  create: (data) => api.post("/element", data),
  update: (id, data) => api.put(`/element/${id}`, data),
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

// Export the configured axios instance as default
export default api;
