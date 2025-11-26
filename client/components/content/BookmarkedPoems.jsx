"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { FiBookmark } from "react-icons/fi";

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
    <div
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div className="max-w-6xl mx-auto">

        {/* ===== Section Header (matches your SectionHeader styling) ===== */}
        <div className="w-[96%] lg:w-[88%] mx-auto md:pt-6 pt-8 flex items-end justify-between pb-3 mb-6 transition-all">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div
                className="
                  w-14 h-14 rounded-full
                  bg-white dark:bg-[#141414]
                  border-2 border-primary
                  flex items-center justify-center
                  shadow-md shadow-primary/40
                  transition-all duration-500
                "
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--primary)",
                  boxShadow: "0 8px 30px rgba(255,107,0,0.08)",
                }}
              >
                <FiBookmark className="text-primary stroke-2" size={24} style={{ color: "var(--primary)" }} />
              </div>
            </div>

            <div>
              <h2
                className="
                  text-xl sm:text-2xl md:text-3xl
                  font-extrabold
                  text-primary
                  tracking-tight
                  font-devanagari
                "
                style={{ color: "var(--primary)" }}
              >
                आपकी सहेजी हुई कविताएँ
              </h2>

              <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400 font-devanagari" style={{ color: "var(--text)", opacity: 0.8 }}>
                बाद में पढ़ने के लिए आपने जो भी सेव किया है
              </p>
            </div>
          </div>

          {/* optional action on right */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="btn-style5"
              style={{
                borderColor: "var(--primary)",
                color: "var(--primary)",
              }}
            >
              Home
            </button>
          </div>
        </div>

        {/* ===== Body (loading / error / empty / grid) ===== */}
        {loading && (
          <div
            className="rounded-lg p-8 flex items-center justify-center"
            style={{
              background: "var(--glass)",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            }}
          >
            <svg
              className="animate-spin h-8 w-8 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              style={{ color: "var(--primary)" }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span style={{ color: "var(--text)" }}>बुकमार्क लोड हो रहे हैं...</span>
          </div>
        )}

        {!loading && error && (
          <div
            className="rounded-lg p-4"
            style={{
              background: "rgba(255,235,238,0.9)",
              border: "1px solid rgba(255,205,210,0.6)",
              color: "var(--text)",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && poems.length === 0 && (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              background: "var(--glass)",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
            }}
          >
            <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>
              आपने अभी तक कुछ बुकमार्क नहीं किया।
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text)" }}>
              किसी भी कविता के पास जाकर <strong style={{ color: "var(--primary)" }}>बुकमार्क</strong> आइकन पर क्लिक करें और यह सूची भर जाएगी।
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/")}
                className="btn-style5"
                style={{
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                }}
              >
                होम पर जाएँ
              </button>
            </div>
          </div>
        )}

        {!loading && poems.length > 0 && (
          <section className="mt-6">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {poems.map((p) => {
                const href = buildPoemHref(p);
                return (
                  <motion.div
                    key={p._id}
                    whileHover={{ scale: 1.02, boxShadow: "0 14px 40px rgba(255,107,0,0.08)" }}
                    className="rounded-xl overflow-hidden transition-all duration-300 shadow shadow-orange-400"
                    style={{
                      background: "var(--glass)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <Link href={href} className="group block">
                      <div className="relative h-44 w-full bg-[color:var(--bg)] overflow-hidden">
                        {p.image?.url ? (
                          // keep <img> for legacy simplicity (or replace with next/image if desired)
                          <img src={p.image.url} alt={p.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="flex items-center justify-center h-full" style={{ color: "var(--text)" }}>
                            <svg className="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-semibold line-clamp-2 transition-colors" style={{ color: "var(--text)" }}>
                          {p.title}
                        </h3>
                        <p className="mt-2 text-sm line-clamp-3" style={{ color: "var(--text)" }}>
                          {p.content?.slice(0, 120)}
                          {p.content?.length > 120 ? "..." : ""}
                        </p>

                        <div className="mt-4 flex items-center justify-between text-sm" style={{ color: "var(--text)" }}>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-[color:var(--bg)] border" style={{ borderColor: "var(--glass-border)" }}>
                              {p.writerId?.avatar ? (
                                <img src={p.writerId.avatar} alt={p.writerId.fullName} className="object-cover w-full h-full" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--text)" }}>
                                  {(p.writerId?.fullName || "A").charAt(0)}
                                </div>
                              )}
                            </div>

                            <div>
                              <div style={{ color: "var(--text)", fontWeight: 600 }}>{p.writerId?.penName || p.writerId?.fullName}</div>
                              <div className="text-xs" style={{ color: "var(--text)", opacity: 0.7 }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1" style={{ color: "var(--text)", opacity: 0.9 }}>
                              <FaRegHeart style={{ color: "var(--primary)" }} />
                              <span className="text-sm">{p.likeCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1" style={{ color: "var(--text)", opacity: 0.9 }}>
                              <FaRegBookmark style={{ color: "var(--primary)" }} />
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
              <div className="text-sm" style={{ color: "var(--text)", opacity: 0.85 }}>
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((s) => Math.max(1, s - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded-md"
                  style={{
                    border: "1px solid var(--glass-border)",
                    background: "var(--bg)",
                    color: "var(--text)",
                    opacity: page <= 1 ? 0.5 : 1,
                  }}
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded-md"
                  style={{
                    border: "1px solid var(--glass-border)",
                    background: "var(--bg)",
                    color: "var(--text)",
                    opacity: page >= totalPages ? 0.5 : 1,
                  }}
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
