"use client";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/AuthContext";

export default function SearchBar() {
  const [query, setQueryLocal] = useState("");
  const { results, setResults } = useSearch();
  const [searched, setSearched] = useState(false); // track if search was done
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/news/search?q=${trimmedQuery}`
      );
      const data = await res.json();
      setResults(data);
      setSearched(true); // mark that search happened
    } catch (err) {
      console.error(err);
      setResults([]);
      setSearched(true);
    }
  };

  return (
    <div className="relative w-64">
      <form
        onSubmit={handleSubmit}
        className="flex items-center border border-border rounded-full overflow-hidden bg-secondary text-primary shadow-sm"
      >
        <input
          type="text"
          placeholder="खोजें..."
          value={query}
          onChange={(e) => setQueryLocal(e.target.value)}
          className="px-3 py-1 bg-transparent text-primary placeholder-primary focus:outline-none flex-1"
        />
        <button
          type="submit"
          className="px-3 py-1 text-primary hover:bg-accent/80 transition"
        >
          <FaSearch />
        </button>
      </form>

      {/* Results Dropdown */}
      {searched && (
        <ul className="absolute top-10 left-0 w-full bg-card border border-border rounded-lg mt-1 shadow-md z-50 max-h-64 overflow-y-auto">
          {results.length > 0 ? (
            results.map((item) => (
              <li
                key={item._id}
                onClick={() => {
                  router.push(`/news/${item.slug}`);
                  setResults([]);
                  setQueryLocal("");
                  setSearched(false);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-muted text-primary"
              >
                <div className="font-medium">{item.title}</div>
                {item.description && (
                  <div className="text-sm text-primary truncate">
                    {item.description.substring(0, 60)}...
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-red-500">
              कोई परिणाम नहीं मिला
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
