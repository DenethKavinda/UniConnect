import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Safe token state
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken && savedToken !== "undefined" ? savedToken : null;
  });

  // Safe user state with robust JSON parsing
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
        return JSON.parse(savedUser);
      }
      return null;
    } catch (error) {
      console.warn("Invalid user in localStorage:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  // Fetch current user from API if token exists but user is not loaded
  const fetchMe = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (error) {
      console.warn("Failed to fetch user:", error);
      logout();
    }
  };

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user]);

  // Login function
  const login = (tokenValue, userData) => {
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy context usage
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
