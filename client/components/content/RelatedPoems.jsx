"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBookOpen, FaCalendarAlt, FaUserEdit } from "react-icons/fa"; // FaUserEdit for author/writer
import { motion } from "framer-motion";

function toSlug(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[\s\/]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Custom Loader/Placeholder for no image
const NoImagePlaceholder = () => (
  <div
    className="w-full h-full flex flex-col items-center justify-center text-xs p-2 text-center"
    style={{ color: "var(--primary)", background: "var(--bg-lighter, var(--bg))" }}
  >
    <FaBookOpen className="text-xl mb-1 opacity-70" />
    <span className="text-[10px] font-medium opacity-80">कोई छवि नहीं</span>
  </div>
);


export default function RelatedPoems({ poemId, limit = 6, isSidebar = true }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    if (!poemId) return;
    setLoading(true);
    fetch(`${API}/api/poems/${poemId}/related`)
      .then((r) => r.json())
      .then((data) => {
        const list = data?.related || data?.poems || data || [];
        const filteredList = Array.isArray(list) ? list.filter((p) => p._id !== poemId) : [];
        setRelated(filteredList.slice(0, limit));
      })
      .catch((err) => {
        console.error("Related fetch error:", err);
        setRelated([]);
      })
      .finally(() => setLoading(false));
  }, [poemId, limit, API]);

  if (loading) {
    return (
      <div className="py-4 text-center font-medium" style={{ color: "var(--primary)" }}>
        ✨ संबंधित कविताएँ लोड हो रही हैं...
      </div>
    );
  }
  if (!related.length) {
    return (
      <div className="py-4 text-center text-sm italic" style={{ color: "var(--text-faint, gray)" }}>
        कोई संबंधित पोस्ट नहीं मिली।
      </div>
    );
  }

  // --- SIDEBAR LAYOUT ---
  if (isSidebar) {
    return (
      <aside
        className="mt-0 p-4 rounded-xl sticky top-20 shadow-lg"
        style={{
          background: "var(--glass)",
          backdropFilter: "blur(8px)", // Added backdrop filter for glass effect
        }}
      >
        {/* Sidebar Header */}
        <h3 
          className="flex items-center gap-3 text-lg font-bold pb-4 mb-4 border-b" 
          style={{ color: "var(--primary)", borderColor: "var(--text-faint, #ccc) / 0.3" }}
        >
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ background: "var(--primary)", boxShadow: "0 4px 10px rgba(var(--primary-rgb), 0.3)" }}
          >
            <FaBookOpen className="text-sm" style={{ color: "var(--bg)" }} /> {/* Icon color changed to BG for contrast */}
          </span>
          संबंधित कविताएँ
        </h3>

        <div className="space-y-4"> {/* Increased space-y for better separation */}
          {related.map((r, index) => {
            const categorySegment = (r.category || "").toLowerCase() === "kavya" ? "kavya" : "gadhya";
            const rasSlug = toSlug(r.subcategory || r.languages?.[0]?.subLanguageName || "unknown");
            const postSlug = r.slug || r._id;
            const href = `/${categorySegment}/${rasSlug}/${postSlug}`;

            return (
              <motion.article
                key={r._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }} // Smoother animation
                className="rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.01]"
                style={{ background: "var(--bg)", border: "1px solid var(--text-faint, #eee) / 0.1" }}
              >
                <Link 
                  href={href} 
                  className="flex items-center gap-3 p-3 group"
                >
                  <div
                    className="flex-shrink-0 w-20 h-14 rounded-md overflow-hidden shadow-sm"
                    style={{ background: "var(--glass)" }}
                  >
                    {r.image?.url ? (
                      <Image
                        src={r.image.url}
                        alt={r.title}
                        width={200}
                        height={140}
                        className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110"
                        quality={60}
                      />
                    ) : (
                      <NoImagePlaceholder />
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <h4
                      className="text-sm font-bold leading-tight line-clamp-2 transition-colors duration-300"
                      style={{ color: "var(--text)" }}
                    >
                      <span className="group-hover:text-primary">
                        {r.title}
                      </span>
                    </h4>

                    <div className="mt-2 flex flex-col gap-0.5 text-xs">
                      {/* Author/Writer */}
                      <div className="flex items-center gap-1.5 font-medium truncate" style={{ color: "var(--primary-dark, #666)" }}>
                        <FaUserEdit className="text-[10px] opacity-80" />
                        <span className="text-[11px] group-hover:text-primary transition-colors duration-300">
                          {r.writerId?.penName || r.writerId?.fullName || "अज्ञात लेखक"}
                        </span>
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center gap-1.5" style={{ color: "var(--text-faint, #666)" }}>
                        <FaCalendarAlt className="text-[10px] opacity-80" />
                        <span className="text-[11px]">
                          {r.date
                            ? new Date(r.date).toLocaleDateString("hi-IN", {
                                day: "numeric",
                                month: "long", // Changed to long month name
                                year: "numeric",
                              })
                            : "तिथि अज्ञात"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </aside>
    );
  }

  // --- FULL-WIDTH GRID LAYOUT --- (No significant changes, only motion update)
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-6 border-b pb-2" style={{ borderColor: "var(--text-faint, #ccc) / 0.3" }}>
        <h3 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
          संबंधित पोस्ट्स
        </h3>
        <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{related.length} परिणाम</div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((r, idx) => {
          const categorySegment = (r.category || "").toLowerCase() === "kavya" ? "kavya" : "gadhya";
          const rasSlug = toSlug(r.subcategory || r.languages?.[0]?.subLanguageName || "unknown");
          const postSlug = r.slug || r._id;
          const href = `/${categorySegment}/${rasSlug}/${postSlug}`;

          return (
            <motion.article
              key={r._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
              whileHover={{ y: -6, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              className="bg-[color:var(--glass)] rounded-xl overflow-hidden shadow-md"
            >
              <Link href={href} className="group block">
                <div className="w-full h-44 overflow-hidden bg-[color:var(--bg)]">
                  {r.image?.url ? (
                    <Image
                      src={r.image.url}
                      alt={r.title}
                      width={800}
                      height={480}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                      quality={75}
                    />
                  ) : (
                    <NoImagePlaceholder />
                  )}
                </div>

                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300" style={{ color: "var(--text)" }}>
                    {r.title}
                  </h4>

                  <p className="text-sm mb-3 line-clamp-3" style={{ color: "var(--text-faint, #666)" }}>
                    {(r.content || "").replace(/<\/?[^>]+(>|$)/g, "").slice(0, 140)}...
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: "var(--text-faint, #ccc) / 0.1" }}>
                    <span className="font-medium text-[13px] group-hover:text-primary transition-colors duration-300" style={{ color: "var(--text)" }}>{r.writerId?.penName || r.writerId?.fullName || "अज्ञात लेखक"}</span>
                    <span className="flex items-center gap-1" style={{ color: "var(--text-faint, #666)" }}>
                      <FaCalendarAlt className="text-xs" />
                      <span className="text-[13px]">
                        {r.date ? new Date(r.date).toLocaleDateString("hi-IN", { month: "short", day: "numeric" }) : ""}
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}