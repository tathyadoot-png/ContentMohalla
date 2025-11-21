"use client";

import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

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
        const res = await fetch(`${API}/api/poems/search?q=${q}`);
        const data = await res.json();

        if (data?.poems || data?.writers) {
          setResults([
            ...data.poems.map((p) => ({ ...p, type: "poem" })),
            ...data.writers.map((w) => ({ ...w, type: "writer" })),
          ]);
        }
      } catch (err) {
        console.log("Search error →", err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [q]);

  return (
    <>
      {/* Search Icon in Navbar */}
      <button
        className="p-2 rounded-full hover:bg-amber-300/20 transition transform active:scale-90"
        onClick={() => setOpen(true)}
      >
        <FaSearch className={theme === "dark" ? "text-amber-300" : "text-amber-700"} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className={`fixed inset-0 z-[999] flex flex-col px-6 py-12 backdrop-blur-2xl ${
            theme === "dark"
              ? "bg-black/70 text-white"
              : "bg-white/80 text-gray-900"
          } animate-fadeIn`}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition transform active:scale-90 shadow-lg"
            onClick={() => setOpen(false)}
          >
            <FaTimes />
          </button>

          {/* Input */}
          <div className="max-w-2xl mx-auto w-full">
            <input
              autoFocus
              type="text"
              placeholder="🔍 खोजें — कविता, गद्य, लेखक..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`w-full p-4 rounded-2xl text-lg border outline-none shadow-xl transition-all duration-300 focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-700 text-white focus:ring-amber-400/60"
                  : "bg-white border-gray-300 focus:ring-amber-600/40"
              }`}
            />
          </div>

          {/* Results */}
          <div className="max-w-2xl mx-auto w-full mt-8 space-y-4 animate-slideUp">
            {results.length > 0 ? (
              results.map((item) => {
                const isWriter = item.type === "writer";

                return (
                  <a
                    key={item._id}
                    href={
                      isWriter
                        ? `/writer/${item._id}`
                        : `/poems/slug/${item.slug}`
                    }
                    onClick={() => setOpen(false)}
                    className={`block p-5 rounded-2xl border shadow-lg transition hover:shadow-xl hover:-translate-y-1 ${
                      theme === "dark"
                        ? "bg-gray-900/80 border-gray-700 hover:bg-gray-800"
                        : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {/* Title */}
                    <h3 className="font-semibold text-xl tracking-wide">
                      {isWriter ? item.fullName || item.penName : item.title}
                    </h3>

                    {/* Subtitle */}
                    {isWriter ? (
                      <p className="text-sm opacity-70 mt-1">👤 लेखक प्रोफ़ाइल</p>
                    ) : (
                      <p className="text-sm opacity-70 mt-1">
                        ✍️ {item.writerName || "Unknown Writer"}
                      </p>
                    )}
                  </a>
                );
              })
            ) : q.length > 1 ? (
              <p className="opacity-60 text-center text-lg mt-10">
                कोई परिणाम नहीं मिला…
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.4s ease forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(1.02); }
            to { opacity: 1; transform: scale(1); }
          }

          .animate-slideUp {
            animation: slideUp 0.4s ease forwards;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
}
