import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { authAPI } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isCheckingAuthRef = useRef(false);

  const checkAuthStatus = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuthRef.current) {
      return;
    }

    isCheckingAuthRef.current = true;
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      isCheckingAuthRef.current = false;
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    // Don't check auth status if we're on an auth page
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.startsWith("/auth-");

    if (!isAuthPage) {
      checkAuthStatus();
    } else {
      // On auth pages, just set loading to false without checking
      setLoading(false);
    }
  }, [checkAuthStatus]);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await authAPI.login({ email, password, rememberMe });
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.error || "Network error. Please try again.";
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
