"use client";
import { createContext, useState, useEffect } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      try {
        const res = await api.get("/auth/me"); // server reads cookie
        if (mounted && res.data?.success && res.data.user?.role === "admin") {
          setAdmin(res.data.user);
        } else {
          setAdmin(null);
        }
      } catch (err) {
        setAdmin(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    checkSession();
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      // server will set httpOnly cookie; server also returns user
      if (res.data?.user) setAdmin(res.data.user);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // ignore
    }
    setAdmin(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
