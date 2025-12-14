import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = () => {
  const token = sessionStorage.getItem("JWT_TOKEN"); // Use sessionStorage instead of localStorage for better security

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      // Token expired
      sessionStorage.removeItem("JWT_TOKEN");
      sessionStorage.removeItem("USER");
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Token validation error:", error);
    sessionStorage.removeItem("JWT_TOKEN");
    sessionStorage.removeItem("USER");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;