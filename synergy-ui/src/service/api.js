import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Add JWT token if available
    const jwtToken = localStorage.getItem("JWT_TOKEN");
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    // Handle CSRF token
    let csrfToken = localStorage.getItem("CSRF_TOKEN");
    
    if (!csrfToken) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL || "http://localhost:8080"}/auth/csrf`,
          { withCredentials: true }
        );
        csrfToken = response.data.token;
        localStorage.setItem("CSRF_TOKEN", csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    }
    
    if (csrfToken) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear tokens and redirect to login
      localStorage.removeItem("JWT_TOKEN");
      localStorage.removeItem("USER");
      localStorage.removeItem("CSRF_TOKEN");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;