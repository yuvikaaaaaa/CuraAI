import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
  const token = localStorage.getItem("token");

  console.log("TOKEN IN FETCHME =", token);

  if (!token) {
    console.log("NO TOKEN FOUND");
    setLoading(false);
    return;
  }

  try {
    const res = await authAPI.getMe();

    console.log("GETME RESPONSE =", res.data);

    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
  } catch (err) {
    console.error("GETME FAILED =", err);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  } finally {
    setLoading(false);
  }
}, []);
useEffect(() => {
  fetchMe();
}, [fetchMe]);


  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}