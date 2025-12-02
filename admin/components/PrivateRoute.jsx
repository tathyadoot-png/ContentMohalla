"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/utils/api"; // ✅ axios instance (withCredentials: true)

export default function PrivateRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        // 🔒 Verify admin session via server (httpOnly cookie auto-sent)
        await api.get("/auth/me");

        if (mounted) setLoading(false);
      } catch (err) {
        // ❌ Not logged in → redirect to login
        router.push("/login");
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) return null; // Show nothing until verification completes

  return children;
}
