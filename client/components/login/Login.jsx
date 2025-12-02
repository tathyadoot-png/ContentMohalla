"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api"; // axios instance withCredentials: true

export default function PoetrySiteLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  const fetchMe = async () => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data?.user ?? res.data ?? null;
      return user;
    } catch (err) {
      return null;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("कृपया ईमेल और पासवर्ड भरें।");
      return;
    }

    setLoading(true);
    try {
      // 1) Call login endpoint (server should set httpOnly cookie)
      const res = await api.post("/auth/login", form); // axios sends credentials automatically
      // If server returned non-200, axios will throw and go to catch

      // 2) Verify server-set cookie by calling /auth/me
      const user = await fetchMe();
      if (!user) {
        throw new Error(
          "सत्र सत्यापित नहीं हुआ — सर्वर ने cookie सेट नहीं किया या cookie अवैध है। DevTools → Network में /auth/login के response headers देखें।"
        );
      }

      setSuccess("लॉगिन सफल हुआ! स्वागत है।");

      // Optional: do something with user (store in context) if needed

      // Redirect after short delay
      setTimeout(() => {
        router.push("/");
      }, 400);
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "लॉगिन असफल रहा, कृपया सही जानकारी दर्ज करें।";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full my-10 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl overflow-hidden border transition-colors shadow-md bg-white dark:bg-black">
        <div className="p-10 text-center">
          <h2 className="text-2xl font-extrabold text-gray-700 dark:text-primary">
            <span className="text-orange-500">"मोहल्ले"</span> में पुनः स्वागत है
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            कृपया अपने खाते में लॉगिन करें और अपनी रचनाएँ साझा करें।
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
            <label className="block">
              <span className="text-sm text-primary">ईमेल</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg p-2 bg-white dark:bg-[#071014] text-gray-900 dark:text-gray-100 border border-[rgba(255,107,0,0.20)] shadow-sm focus:outline-none"
                placeholder="example@gmail.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-primary">पासवर्ड</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg p-2 bg-white dark:bg-[#071014] text-gray-900 dark:text-gray-100 border border-[rgba(255,107,0,0.20)] shadow-sm focus:outline-none"
                placeholder="पासवर्ड"
                required
              />
            </label>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-700">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg font-semibold shadow-md bg-orange-400 hover:bg-orange-500 text-white disabled:opacity-60 disabled:cursor-not-allowed transition"
              aria-busy={loading}
            >
              {loading ? "लॉगिन जारी है..." : "लॉगिन करें"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            नया सदस्य हैं?{" "}
            <a href="/register" className="text-primary underline">
              यहाँ पंजीकरण करें
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
