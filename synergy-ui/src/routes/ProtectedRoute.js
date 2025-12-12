import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const Pri = () => {
  const token = localStorage.getItem("JWT_TOKEN");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.removeItem("JWT_TOKEN");
      return <Navigate to="/login" />;
    }

    return <Outlet />;
  } catch (error) {
    localStorage.removeItem("JWT_TOKEN");
    return <Navigate to="/login" />;
  }
};

export default Pri;
