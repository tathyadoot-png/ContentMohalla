"use client";

import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaUser, FaFeather } from "react-icons/fa";

export default function SearchOverlay({ theme }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/poems/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
console.log("SEARCH RESPONSE:", data);
        if (data?.poems || data?.writers) {
          setResults([
            ...((data.poems || []).map((p) => ({ ...p, type: "poem" }))),
            ...((data.writers || []).map((w) => ({ ...w, type: "writer" }))),
          ]);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.log("Search error →", err);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [q]);

  const isDark = theme === "dark";

  return (
    <>
      {/* Search Icon in Navbar */}
      <button
        className="p-2 rounded-full hover:bg-amber-300/20 transition transform active:scale-90"
        onClick={() => setOpen(true)}
        aria-label="Open search"
      >
        <FaSearch className={isDark ? "text-amber-300" : "text-amber-700"} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className={`fixed inset-0 z-[999] flex flex-col px-6 py-12 backdrop-blur-2xl ${isDark ? "bg-black/70 text-white" : "bg-white/80 text-gray-900"} animate-fadeIn`}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition transform active:scale-90 shadow-lg"
            onClick={() => setOpen(false)}
            aria-label="Close search"
          >
            <FaTimes />
          </button>

          {/* Input */}
          <div className="max-w-2xl mx-auto w-full">
            <div className="relative">
              <input
                autoFocus
                type="text"
                placeholder="खोजें — कविता, गद्य, लेखक..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className={`w-full p-4 rounded-2xl text-lg border outline-none shadow-xl transition-all duration-300 focus:ring-2
                  ${isDark
                    ? "bg-gray-900 border-[rgba(255,107,0,0.18)] text-white focus:ring-[rgba(255,107,0,0.18)]"
                    : "bg-white border-[rgba(255,107,0,0.12)] text-gray-900 focus:ring-[rgba(255,107,0,0.12)]"
                  }`}
                aria-label="Search input"
              />
              <FaSearch className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-amber-300" : "text-amber-700"}`} />
            </div>
          </div>

          {/* Results */}
          <div className="max-w-2xl mx-auto w-full mt-8 space-y-4 animate-slideUp">
            {results.length > 0 ? (
              results.map((item) => {
                const isWriter = item.type === "writer";

                return (
                  <a
                    key={item._id}
                    href={isWriter ? `/writer/${item._id}` : `/poems/slug/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className={`block p-2 rounded  shadow shadow-orange-200 transition hover:shadow-xl hover:-translate-y-1 ${
                      isDark
                        ? "bg-gray-900/80  hover:bg-gray-800"
                        : "bg-gray-50  hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {isWriter ? (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,107,0,0.08)] text-[rgba(255,107,0,0.9)]">
                            <FaUser />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,107,0,0.08)] text-[rgba(255,107,0,0.9)]">
                            <FaFeather />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text tracking-wide">
                          {isWriter ? (item.fullName || item.penName || "लिखक") : (item.title || "अनाम रचना")}
                        </h3>

                        <p className="text-sm opacity-70 mt-1">
                          {isWriter ? "लेखक प्रोफ़ाइल" : `लेखक: ${item.writerName || "Unknown"}`}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })
            ) : q.length > 1 ? (
              <p className="opacity-60 text-center text-lg mt-10">कोई परिणाम नहीं मिला…</p>
            ) : null}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.28s ease forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(1.01); }
            to { opacity: 1; transform: scale(1); }
          }

          .animate-slideUp {
            animation: slideUp 0.32s ease forwards;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
}
