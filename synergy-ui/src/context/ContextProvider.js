import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../service/api";

const AppContext = createContext();

export default function ContextProvider({ children }) {
  const [jwtToken, setJwtToken] = useState(
    localStorage.getItem("JWT_TOKEN") || null
  );
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (jwtToken) {
        setLoading(true);
        try {
          const { data } = await api.get("/auth/user");
          setUser(data);
        } catch (error) {
          console.error("Fetch error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, [jwtToken]);

  const contextValue = useMemo(
    () => ({
      jwtToken,
      user,
      sessionId,
      loading,
      setJwtToken,
      setUser,
      setSessionId,
    }),
    [jwtToken, user, sessionId, loading]
  );

  if (loading) {
    return <div className="p-6 text-red-500">Loading...</div>;
  }

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
export const useMyContext = () => useContext(AppContext);
