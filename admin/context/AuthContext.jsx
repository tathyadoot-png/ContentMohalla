"use client";
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("adminToken");
    if (token) setAdmin({ token });
  }, []);

  const login = async (email, password) => {
    try {
      // ✅ Correct API route
      const res = await api.post("/auth/login", { email, password });

      // ✅ Save token in cookies
      Cookies.set("adminToken", res.data.token, { expires: 1 });
      setAdmin(res.data.user);

      // ✅ Return full data to login page
      return res.data;
    } catch (err) {
      console.error("❌ Login error =>", err);
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    Cookies.remove("adminToken");
    setAdmin(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
