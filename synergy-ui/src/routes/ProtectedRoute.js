import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = () => {
  const token = localStorage.getItem("JWT_TOKEN"); // Use localStorage instead of sessionStorage for better security

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      // Token expired
      localStorage.removeItem("JWT_TOKEN");
      localStorage.removeItem("USER");
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Token validation error:", error);
    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("USER");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;