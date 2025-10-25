import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "read-key-xyz789";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

// Request interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const metricsApi = {
  getOverview: () => apiClient.get("/metrics/overview"),
  getTrends: (params = {}) => apiClient.get("/metrics/trends", { params }),
  getRecentCalls: (limit = 10) =>
    apiClient.get("/metrics/recent-calls", { params: { limit } }),
};

export const breakdownsApi = {
  getByLane: () => apiClient.get("/breakdowns/by-lane"),
  getByEquipment: () => apiClient.get("/breakdowns/by-equipment"),
  getByCarrier: () => apiClient.get("/breakdowns/by-carrier"),
};

export const carriersApi = {
  getCarriers: () => apiClient.get("/carriers"),
  getCarrier: (id) => apiClient.get(`/carriers/${id}`),
  getCarrierEquipment: (id) => apiClient.get(`/carriers/${id}/equipment`),
  getCarrierLanes: (id) => apiClient.get(`/carriers/${id}/lanes`),
};

export const matchingApi = {
  findCarriers: (request) => apiClient.post("/matching/find-carriers", request),
};

export const intelligenceApi = {
  getRecommendations: (origin, destination) =>
    apiClient.get("/intelligence/recommendations", {
      params: { origin, destination },
    }),
};

export default apiClient;
