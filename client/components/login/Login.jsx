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

      // Save token to localStorage
   
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
    <div className="min-h-full my-10 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl overflow-hidden border border-[#e3caca]">
        <div className="p-10 text-center">
          <h2 className="text-3xl font-extrabold text-[#8B1E3F]">
            साहित्य परिवार में पुनः स्वागत है
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            कृपया अपने खाते में लॉगिन करें और अपनी रचनाएँ साझा करें।
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
            <label className="block">
              <span className="text-sm text-gray-700">ईमेल</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-[#8B1E3F] p-2"
                placeholder="example@gmail.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">पासवर्ड</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-[#8B1E3F] p-2"
                placeholder="पासवर्ड"
                required
              />
            </label>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-700">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B1E3F] hover:bg-[#a42a4c] text-white py-2 rounded-lg font-semibold shadow-md"
            >
              {loading ? "लॉगिन जारी है..." : "लॉगिन करें"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500">
            नया सदस्य हैं?{" "}
            <a href="/register" className="text-[#8B1E3F] underline">
              यहाँ पंजीकरण करें
            </a>
          </p>

          <p className="mt-3 text-xs text-gray-400">
            <a href="/forgot-password" className="hover:text-[#8B1E3F] underline">
              पासवर्ड भूल गए?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
