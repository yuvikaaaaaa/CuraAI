import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  getGoogleLoginUrl: () => `${API_BASE}/auth/google`,
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const predictAPI = {
  getSymptoms: () => api.get("/predict/symptoms"),
  predict: (symptoms) => api.post("/predict/", { symptoms }),
};

export const historyAPI = {
  getHistory: (skip = 0, limit = 20) =>
    api.get(`/history/?skip=${skip}&limit=${limit}`),
  deleteHistory: (id) => api.delete(`/history/${id}`),
  getAnalytics: () => api.get("/history/analytics"),
};

export const reportAPI = {
  downloadReport: (predictionId) =>
    api.get(`/report/${predictionId}`, { responseType: "blob" }),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (skip = 0, limit = 50) =>
    api.get(`/admin/users?skip=${skip}&limit=${limit}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPredictions: (skip = 0, limit = 50) =>
    api.get(`/admin/predictions?skip=${skip}&limit=${limit}`),
  deletePrediction: (id) => api.delete(`/admin/predictions/${id}`),
};

export default api;