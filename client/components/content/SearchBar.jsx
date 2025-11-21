"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);

  async function handleSearch(text) {
    setQuery(text);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_BASE}/api/search?q=${text}`);
      const data = await res.json();

      setResults(data.results || []);
      setShow(true);
    } catch (err) {
      console.error("Search failed:", err);
    }
  }

  return (
    <div className="relative w-full max-w-lg">
      {/* Input Box */}
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setShow(true)}
        placeholder="कवि, कविता, शीर्षक, विषय खोजें..."
        className="w-full border rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
      />

      {/* Search Results */}
      {show && results.length > 0 && (
        <div className="absolute left-0 right-0 bg-white mt-2 shadow-xl rounded-xl max-h-80 overflow-y-auto z-50 border">
          {results.map((item) => (
            <Link
              onClick={() => setShow(false)}
              key={item._id}
              href={
                item.type === "writer"
                  ? `/writers/${item.slug}`
                  : `/poem/${item.slug}`
              }
              className="block p-3 border-b hover:bg-gray-100"
            >
              <div className="font-semibold text-gray-900">
                {item.title || item.fullName || "Untitled"}
              </div>

              <div className="text-xs text-gray-600">
                {item.type === "writer"
                  ? "कवि प्रोफ़ाइल"
                  : "कविता"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
