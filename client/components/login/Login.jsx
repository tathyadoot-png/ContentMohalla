"use client";
import React, { useState } from "react";

export default function PoetrySiteLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

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
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include", // 👈 important for cookies
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // token cookies me aa rahi hai because credentials: "include"
      console.log("Logged in via cookies");

      setSuccess("लॉगिन सफल हुआ! स्वागत है।");

      // Redirect to dashboard (if needed)
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("लॉगिन असफल रहा, कृपया सही जानकारी दर्ज करें।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full my-10 flex items-center justify-center px-4">
      <div
        className="
          max-w-md w-full rounded-2xl overflow-hidden
          border transition-colors shadow-md shadow-orange-300 hover:shadow-lg hover:shadow-orange-400 
          bg-white dark:bg-black
          
        "
      >
        <div className="p-10 text-center">
          <h2 className="text-2xl font-extrabold text-gray-700 dark:text-primary">
            साहित्य परिवार में पुनः स्वागत है
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
                className="
                  mt-1 block w-full rounded-lg p-2
                  bg-white dark:bg-[#071014] text-gray-900 dark:text-gray-100
                  border border-[rgba(255,107,0,0.20)] dark:border-[rgba(255,107,0,0.28)]
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.18)]
                "
                placeholder="example@gmail.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-primary ">पासवर्ड</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="
                  mt-1 block w-full rounded-lg p-2
                  bg-white dark:bg-[#071014] text-gray-900 dark:text-gray-100
                  border border-[rgba(255,107,0,0.20)] dark:border-[rgba(255,107,0,0.28)]
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(255,107,0,0.18)]
                "
                placeholder="पासवर्ड"
                required
              />
            </label>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-700">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-2 rounded-lg font-semibold shadow-md
               bg-orange-400
                 hover:bg-orange-500 text-white
                disabled:opacity-60 disabled:cursor-not-allowed
                transition
              "
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
