"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBookOpen, FaCalendarAlt } from "react-icons/fa"; // Added icons for better context
import { motion } from "framer-motion";

/**
 * RelatedPoems
 * Props:
 * - poemId (required) : id of current poem
 * - limit (optional) : how many to show
 * - isSidebar (optional) : boolean flag to switch between sidebar and full-width grid layout
 *
 * Expects backend route: GET /api/poems/:id/related
 */
function toSlug(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[\s\/]+/g, "-")       // spaces/slashes -> dash
    .replace(/[^\w\-]+/g, "")      // remove non-word chars
    .replace(/\-\-+/g, "-")        // collapse dashes
    .replace(/^-+|-+$/g, "");      // trim dashes
}

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
        // backend returns { success: true, related: [...] }
        const list = data?.related || data?.poems || data || [];
        // Filtering out the current poem if it accidentally returns itself (common API issue)
        const filteredList = Array.isArray(list) ? list.filter(p => p._id !== poemId) : [];
        setRelated(filteredList.slice(0, limit));
      })
      .catch((err) => {
        console.error("Related fetch error:", err);
        setRelated([]);
      })
      .finally(() => setLoading(false));
  }, [poemId, limit]);

  if (loading) return <div className="py-4 text-center text-gray-500">संबंधित कविताएँ लोड हो रही हैं...</div>;
  if (!related.length) return <div className="py-4 text-sm text-gray-500 text-center">कोई संबंधित पोस्ट नहीं मिली।</div>;
  
  // Custom Color Palette: Primary: #7A1C10 (Deep Maroon), Accent: #A12717

  // --- Sidebar Layout Render (Matches Screenshot) ---
  if (isSidebar) {
    return (
      <section className="mt-0 p-4 border rounded-xl bg-[#fffcf5] sticky top-20 shadow-sm">
        <h3 className="text-xl font-bold text-[#7A1C10] mb-5 border-b pb-2">
          <FaBookOpen className="inline mr-2 text-2xl" />
          संबंधित कविताएँ
        </h3>
        
        <div className="space-y-4">
          {related.map((r, index) => {
            const categorySegment = (r.category || "").toLowerCase() === "kavya" ? "kavya" : "gadhya";
            const rasSlug = toSlug(r.subcategory || r.languages?.[0]?.subLanguageName || "unknown");
            const postSlug = r.slug || r._id;
            const href = `/${categorySegment}/${rasSlug}/${postSlug}`;

            return (
              <motion.div 
                key={r._id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden transition duration-300 hover:shadow-lg"
              >
                <Link href={href} className="flex gap-3 items-start p-3">
                  {/* Image (Small and prominent) */}
                  <div className="flex-shrink-0 w-24 h-16 overflow-hidden rounded-md border border-gray-100">
                    {r.image?.url ? (
                      <Image
                        src={r.image.url}
                        alt={r.title}
                        width={100}
                        height={60}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        quality={80}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">NO IMG</div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex-grow">
                    <h4 className="text-base font-semibold text-[#1f2937] leading-snug hover:text-[#A12717] transition line-clamp-2">
                      {r.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {r.writerId?.fullName || r.writerId?.penName || "Unknown"}
                    </p>
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      <span>{new Date(r.createdAt).toLocaleDateString("hi-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    );
  }

  // --- Full-Width Grid Layout Render (Fallback/Alternative) ---
  return (
    <section className="mt-12">
      <h3 className="text-3xl font-bold text-[#7A1C10] mb-8 border-b-2 border-[#7A1C10] border-opacity-30 pb-2">
        संबंधित पोस्ट्स
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((r) => {
          const categorySegment = (r.category || "").toLowerCase() === "kavya" ? "kavya" : "gadhya";
          const rasSlug = toSlug(r.subcategory || r.languages?.[0]?.subLanguageName || "unknown");
          const postSlug = r.slug || r._id;
          const href = `/${categorySegment}/${rasSlug}/${postSlug}`;

          return (
            <motion.div
                key={r._id}
                whileHover={{ y: -5, boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }}
                className="block bg-white rounded-xl shadow-lg overflow-hidden transition duration-300"
            >
              <Link href={href} className="group block">
                {/* Image */}
                <div className="w-full h-40 overflow-hidden">
                  {r.image?.url ? (
                    <Image
                      src={r.image.url}
                      alt={r.title}
                      width={800}
                      height={480}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>

                <div className="p-4">
                    <h4 className="text-xl font-bold text-[#7A1C10] group-hover:text-[#A12717] transition line-clamp-2">{r.title}</h4>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{(r.content || "").slice(0, 150)}...</p>
                    <div className="mt-4 text-xs text-gray-500 flex justify-between items-center border-t pt-3">
                        <span className="font-medium text-gray-700">{r.writerId?.fullName || r.writerId?.penName || "Unknown"}</span>
                        <span><FaCalendarAlt className="inline mr-1 text-sm" />{new Date(r.createdAt).toLocaleDateString("hi-IN", { month: "short", day: "numeric" })}</span>
                    </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}