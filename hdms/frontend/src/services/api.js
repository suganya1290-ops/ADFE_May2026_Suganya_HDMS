import axios from "axios";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Intercept responses to normalise errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail || err.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export const ticketService = {
  getAll: (params = {}) => api.get("/tickets", { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post("/tickets", data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  search: (params) => api.get("/tickets/search", { params }),
};

export const dashboardService = {
  getStats: () => api.get("/dashboard"),
};

export default api;
