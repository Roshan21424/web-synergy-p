import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api from "../service/api";

const AppContext = createContext(undefined);

export default function ContextProvider({ children }) {
  const [jwtToken, setJwtToken] = useState(() => 
    sessionStorage.getItem("JWT_TOKEN") || null
  );
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("USER");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    sessionStorage.removeItem("JWT_TOKEN");
    sessionStorage.removeItem("USER");
    sessionStorage.removeItem("CSRF_TOKEN");
    setJwtToken(null);
    setUser(null);
    setSessionId(null);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!jwtToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await api.get("/auth/user");
        setUser(data);
        sessionStorage.setItem("USER", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError(err.message);
        
        // If unauthorized, clear everything
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [jwtToken, logout]);

  const contextValue = useMemo(
    () => ({
      jwtToken,
      user,
      sessionId,
      loading,
      error,
      setJwtToken,
      setUser,
      setSessionId,
      logout,
    }),
    [jwtToken, user, sessionId, loading, error, logout]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export const useMyContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within a ContextProvider");
  }
  return context;
};