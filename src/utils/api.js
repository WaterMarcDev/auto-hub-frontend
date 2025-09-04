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
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${
        config.url
      }`
    );
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
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.data || error.message);

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Redirect to login if not authenticated
      window.location.href = "/auth-login";
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

// Export the configured axios instance as default
export default api;
