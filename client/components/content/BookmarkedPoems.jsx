"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaRegBookmark, FaRegHeart } from "react-icons/fa";

export default function BookmarkedPoems() {
  const router = useRouter();
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/poems/bookmarks/mine?page=${page}&limit=${limit}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to fetch bookmarks");
        }

        const data = await res.json();
        if (!mounted) return;
        setPoems(data.poems || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Could not load bookmarks");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [page, limit, API_BASE]);

  const mapCategoryToRoute = (cat) => {
    if (!cat) return "gadhya";
    const normalized = String(cat).trim().toLowerCase();
    if (normalized === "gadhya") return "gadhya";
    if (normalized === "kavya") return "kavya";
    return normalized.replace(/\s+/g, "-");
  };

  const buildPoemHref = (p) => {
    const categoryRoute = mapCategoryToRoute(p?.category || p?.mainCategory);
    const subcategory = p?.subcategory || p?.categoryObj?.slug || "general";
    const slug = p?.slug || p?._id || "";
    return `/${encodeURIComponent(categoryRoute)}/${encodeURIComponent(subcategory)}/${encodeURIComponent(slug)}`;
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#021620] dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
              आपकी बुकमार्क की गई कविताएँ
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              ये वो कविताएँ हैं जिन्हें आपने बाद में पढ़ने के लिए संभाला है।
            </p>
          </div>
        </header>

        {loading && (
          <div className="rounded-lg bg-white dark:bg-[#042834] dark:border dark:border-[#08343a] shadow p-8 flex items-center justify-center transition-colors">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600 dark:text-teal-300 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-gray-700 dark:text-gray-200">बुकमार्क लोड हो रहे हैं...</span>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg bg-red-50 dark:bg-[#3b1216] dark:text-red-200 border border-red-200 dark:border-[#5a1f24] p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && poems.length === 0 && (
          <div className="rounded-lg bg-white dark:bg-[#042834] dark:border dark:border-[#08343a] shadow p-8 text-center transition-colors">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              आपने अभी तक कुछ बुकमार्क नहीं किया।
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              किसी भी कविता के पास जाकर <strong>बुकमार्क</strong> आइकन पर क्लिक करें और यह सूची भर जाएगी।
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition"
              >
                होम पर जाएँ
              </button>
            </div>
          </div>
        )}

        {!loading && poems.length > 0 && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {poems.map((p) => {
                const href = buildPoemHref(p);
                return (
                  <motion.div
                    key={p._id}
                    whileHover={{ scale: 1.03 }}
                    className="rounded-xl overflow-hidden transition-all duration-300 
                               bg-white dark:bg-[#042834] dark:border dark:border-[#08343a] 
                               shadow-md hover:shadow-xl 
                               dark:shadow-[0_0_8px_#0f766e] hover:dark:shadow-[0_0_15px_#14b8a6]"
                  >
                    <Link href={href} className="group block">
                      <div className="relative h-44 w-full bg-gray-100 dark:bg-[#06323a]">
                        {p.image?.url ? (
                          <img src={p.image.url} alt={p.title} className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-300">
                            <svg
                              className="h-12 w-12"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-amber-600 transition-colors text-gray-900 dark:text-gray-100">
                          {p.title}
                        </h3>
                        <p className="mt-2 text-sm line-clamp-3 text-gray-600 dark:text-gray-300">
                          {p.content?.slice(0, 120)}
                          {p.content?.length > 120 ? "..." : ""}
                        </p>

                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-[#06323a]">
                                {p.writerId?.avatar ? (
                                  <img
                                    src={p.writerId.avatar}
                                    alt={p.writerId.fullName}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-gray-300">
                                    {(p.writerId?.fullName || "A").charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-gray-800 dark:text-gray-100">
                                  {p.writerId?.penName || p.writerId?.fullName}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-400">
                                  {new Date(p.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-300">
                              <FaRegHeart className="text-pink-500" />
                              <span className="text-sm">{p.likeCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-300">
                              <FaRegBookmark className="text-yellow-600" />
                              <span className="text-sm">{p.bookmarkCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-300">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((s) => Math.max(1, s - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded-md border bg-white dark:bg-transparent text-gray-700 dark:text-gray-200 disabled:opacity-50 transition"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded-md border bg-white dark:bg-transparent text-gray-700 dark:text-gray-200 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
