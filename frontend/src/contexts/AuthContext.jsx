import { createContext, useContext, useState, useEffect } from "react";
import api from "../../helpers/api";
import { useNavigate } from "react-router";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Stable function reference for user check
  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        return;
      }

      const res = await api.get("/auth/me");
      setCurrentUser(res.data);
    } catch (err) {
      setCurrentUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await api.post("/auth/login", credentials);
      localStorage.setItem("token", res.data.token);
      setCurrentUser(res.data.user);
      navigate("/"); // Redirect to home after login
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout API error:", err);
      // Continue with client-side logout even if API fails
    } finally {
      localStorage.removeItem("token");
      setCurrentUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        checkAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
