import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import api from "../../utils/api.js"; // ✅ CHANGED: Import your new api instance

// ❌ REMOVED: No need for axios import or backendURL constant here anymore

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setError("");
      return;
    }
    
    inputRef.current?.focus();

    if (query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    const debounceTimeout = setTimeout(() => {
      // ✅ CHANGED: Use the new api instance. The baseURL is already set.
      api.get(`/search?q=${query}`)
        .then(res => {
          setResults(res.data);
          setError("");
        })
        .catch(err => {
          console.error("Search error:", err);
          setError("Results could not be fetched.");
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [query, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex flex-col items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button onClick={onClose} className="absolute top-5 right-5 text-white text-3xl">
            <FiX />
          </button>
          
          <motion.div
            className="w-full max-w-2xl mt-20"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="यहाँ खोजें..."
                className="w-full p-4 pl-12 text-lg bg-white/10 text-white border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            </div>

            {/* Results */}
            <div className="mt-6 text-white overflow-y-auto max-h-[60vh]">
              {loading && <p>खोज रहा है...</p>}
              {error && <p className="text-red-400">{error}</p>}
              {!loading && query.length > 2 && results.length === 0 && <p>कोई परिणाम नहीं मिला।</p>}

              <div className="space-y-4">
                {results.map(news => (
                  <Link key={news._id} href={`/news/${news.categories[0]?.name || 'main-news'}/${news.slug}`} onClick={onClose}>
                    <div className="bg-white/5 p-3 rounded-lg flex items-center gap-4 hover:bg-white/20 transition-colors">
                      {news.imageUrl && <img src={news.imageUrl} alt={news.title} className="w-16 h-16 object-cover rounded" />}
                      <h3 className="font-semibold">{news.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;