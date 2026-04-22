import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 10_000,
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Attaches the JWT Bearer token on every outgoing request.
// NOTE: CSRF is intentionally omitted — the backend is a stateless JWT API with
// CSRF disabled (see SecurityConfiguration). Sending a CSRF header would be a
// no-op and the /auth/csrf endpoint no longer exists.
api.interceptors.request.use(
  (config) => {
    const jwtToken = localStorage.getItem("JWT_TOKEN");
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("JWT_TOKEN");
      localStorage.removeItem("USER");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;