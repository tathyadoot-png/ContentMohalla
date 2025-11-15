// components/GadhyKavyaAccordion.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import img1 from "../../public/home1.png";
import img2 from "../../public/home2.png";
import img3 from "../../public/home3.png";
import img4 from "../../public/home4.png";
import img6 from "../../public/gulzar.png";
import img5 from "../../public/oldpaper.webp";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiTrendingUp } from "react-icons/fi";

export default function GadhyKavyaAccordion({
  items = null,
  apiEndpoint = "/api/poems/sections/most-liked?limit=4", // default to your sections route
  autoplay = true,
  interval = 4500,
  className = "",
}) {
  const [slides, setSlides] = useState(Array.isArray(items) ? items : []);
  const [loading, setLoading] = useState(!Array.isArray(items));
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);
  const autoRef = useRef();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const fallbackImages = [
    img1?.src ?? img1,
    img2?.src ?? img2,
    img3?.src ?? img3,
    img4?.src ?? img4,
  ];

  // map API item -> slide metadata (no image because we use fallbacks)
  const mapToSlide = (p, idx) => {
    const title = p.title || p.attributes?.title || p.name || "";
    const slug =
      p.slug ||
      p.attributes?.slug ||
      p._id ||
      p.id ||
      (p.attributes && p.attributes.slug) ||
      "";
    const date =
      p.date ||
      p.attributes?.date ||
      p.createdAt ||
      p.attributes?.createdAt ||
      p._createdAt ||
      null;
    const writer =
      p.writerName ||
      (p.writer && (p.writer.penName || p.writer.fullName)) ||
      (p.writerId && (p.writerId.penName || p.writerId.fullName)) ||
      p.attributes?.writerName ||
      "";
    const category =
      p.category ||
      p.attributes?.category ||
      p.mainCategory ||
      p.attributes?.mainCategory ||
      p.categoryName ||
      null;
    const subcategory =
      p.subcategory ||
      p.attributes?.subcategory ||
      p.subCategory ||
      p.attributes?.subCategory ||
      p.subcategoryName ||
      null;
    const description =
      p.description ||
      p.attributes?.description ||
      p.metaDescription ||
      p.attributes?.metaDescription ||
      "";

    return {
      id: p._id || p.id || slug || idx + 1,
      title,
      slug,
      date,
      writerName: writer,
      description,
      category,
      subcategory,
    };
  };

  // fetch when no items provided
  useEffect(() => {
    let abort = false;
    const controller = new AbortController();

    if (Array.isArray(items) && items.length > 0) {
      const normalized = items.map((s, i) =>
        typeof s === "object" ? { id: s.id ?? s._id ?? i + 1, ...s } : { id: i + 1, title: String(s) }
      );
      const mapped = normalized.map((s, i) => mapToSlide(s, i));
      setSlides(mapped);
      setActive(mapped[0]?.id ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}${apiEndpoint.startsWith("/") ? apiEndpoint : "/" + apiEndpoint}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
        }
        const json = await res.json().catch(() => null);

        let list = [];
        if (!json) list = [];
        else if (Array.isArray(json)) list = json;
        else if (json.poems && Array.isArray(json.poems)) list = json.poems;
        else if (json.data && Array.isArray(json.data)) {
          list = json.data.map((d) => ({ id: d.id, ...d.attributes }));
        } else if (json.data && json.data.data && Array.isArray(json.data.data)) {
          list = json.data.data.map((d) => ({ id: d.id, ...d.attributes }));
        } else {
          const arr = Object.values(json).find((v) => Array.isArray(v));
          list = arr || [];
        }

        if (abort) return;
        const mapped = list.map(mapToSlide);
        setSlides(mapped);
        setActive(mapped[0]?.id ?? null);
        setLoading(false);
      } catch (err) {
        if (abort) return;
        if (err.name === "AbortError") return;
        console.error("GadhyKavyaAccordion fetch error:", err);
        setError(err);
        setLoading(false);
      }
    };

    load();
    return () => {
      abort = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, apiEndpoint]);

  // autoplay
  useEffect(() => {
    if (!autoplay || !slides || slides.length === 0) return;
    clearTimeout(autoRef.current);
    autoRef.current = setTimeout(() => {
      setActive((prev) => {
        const idx = slides.findIndex((s) => s.id === prev);
        const nextIdx = idx === slides.length - 1 ? 0 : idx + 1;
        return slides[nextIdx].id;
      });
    }, interval);
    return () => clearTimeout(autoRef.current);
  }, [active, autoplay, interval, slides]);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, active]);

  const goTo = (id) => setActive(id);
  const next = () => {
    if (!slides || slides.length === 0) return;
    const idx = slides.findIndex((s) => s.id === active);
    const nextIdx = idx === slides.length - 1 ? 0 : idx + 1;
    setActive(slides[nextIdx].id);
  };
  const prev = () => {
    if (!slides || slides.length === 0) return;
    const idx = slides.findIndex((s) => s.id === active);
    const prevIdx = idx === 0 ? slides.length - 1 : idx - 1;
    setActive(slides[prevIdx].id);
  };

  const getImageUrl = (index) => fallbackImages[index % fallbackImages.length];

  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(d));
    } catch {
      return String(d).slice(0, 10);
    }
  };

  const buildPostHref = (slide) => {
    const main = slide.category || "kavya";
    const sub = slide.subcategory || "general";
    const slug = slide.slug || slide.id || "";
    return `/${encodeURIComponent(String(main))}/${encodeURIComponent(String(sub))}/${encodeURIComponent(String(slug))}`;
  };

  const rightImageUrl = img5?.src ?? img5;

  // --- RENDER STATES ---
  if (loading) {
    return (
      <div className={`gadhy-kavya-accordion ${className}`}>
        <div className="w-[96%] lg:w-[88%] mx-auto mb-6 flex items-end justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
          <div className="flex items-center gap-4">
            <div
              className="
                w-14 h-14 rounded-full 
                bg-amber-50 dark:bg-gradient-to-br dark:from-teal-900 dark:to-purple-900
                border border-amber-500/80 dark:border-purple-600
                flex items-center justify-center 
                shadow-md dark:shadow-[0_0_15px_rgba(80,70,180,0.3)]
                transition-all duration-500
              "
            >
              <FiTrendingUp className="text-amber-800 dark:text-teal-200 stroke-2" size={24} />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">Our Best Poems of This Week</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Handpicked — सबसे बेहतरीन रचनाएँ</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden">
          <div className="relative h-56 md:h-64 lg:h-72 bg-gray-50 dark:bg-[#0b0b0b] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-dashed rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`gadhy-kavya-accordion ${className}`}>
        <div className="w-[96%] lg:w-[88%] mx-auto mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">Our Best Poems of This Week</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Handpicked — सबसे बेहतरीन रचनाएँ</p>
        </div>

        <div className="rounded-2xl overflow-hidden">
          <div className="relative h-56 md:h-64 lg:h-72 bg-gray-50 dark:bg-[#0b0b0b] flex items-center justify-center p-6 text-center">
            <div>
              <div className="text-red-600 font-semibold mb-2">Error loading poems</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">{error.message}</div>
              <div className="text-xs text-gray-500">Ensure backend running at {API_BASE}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className={`gadhy-kavya-accordion ${className}`}>
        <div className="w-[96%] lg:w-[88%] mx-auto mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">Our Best Poems of This Week</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Handpicked — सबसे बेहतरीन रचनाएँ</p>
        </div>

        <div className="rounded-2xl overflow-hidden">
          <div className="relative h-56 md:h-64 lg:h-72 bg-gray-50 dark:bg-[#0b0b0b] flex items-center justify-center">
            <div className="text-gray-600 dark:text-gray-300">No poems available.</div>
          </div>
        </div>
      </div>
    );
  }

  // --- NORMAL RENDER ---
  return (
    <div className={`gadhy-kavya-accordion ${className}`}>
      <div className="w-[96%] lg:w-[88%] mx-auto mb-6 flex items-end justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex items-center gap-4">
          <div
            className="
              w-14 h-14 rounded-full 
              bg-amber-50 dark:bg-gradient-to-br dark:from-teal-900 dark:to-purple-900
              border border-amber-500/80 dark:border-purple-600
              flex items-center justify-center 
              shadow-md dark:shadow-[0_0_15px_rgba(80,70,180,0.3)]
              transition-all duration-500
            "
          >
            <FiTrendingUp className="text-amber-800 dark:text-teal-200 stroke-2" size={24} />
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">Our Best Poems of This Week</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Handpicked — सबसे बेहतरीन रचनाएँ</p>
          </div>
        </div>
      </div>

      <div className="w-[96%] lg:w-[88%] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* LEFT: carousel (span 2) */}
        <div className="md:col-span-2 space-y-3">
          <div className="rounded overflow-hidden">
            <div className="relative h-56 md:h-64 lg:h-72 bg-gray-100 dark:bg-gray-900">
              <AnimatePresence initial={false} mode="wait">
                {slides.map(
                  (s, idx) =>
                    s.id === active && (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                        className="absolute inset-0 bg-cover bg-center flex items-end"
                        style={{ backgroundImage: `url('${getImageUrl(idx)}')` }}
                      >
                        <div className="w-full bg-gradient-to-t from-black/55 via-black/12 to-transparent p-3 md:p-6 text-white">
                          <h3 className="text-md md:text-xl font-semibold line-clamp-2">{s.title}</h3>
                          <p className="text-xs opacity-90 mt-1">
                            {s.writerName ? `By ${s.writerName}` : ""}
                            {s.date ? ` — ${formatDate(s.date)}` : ""}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            {s.slug && (
                              <Link href={buildPostHref(s)} className="inline-block px-3 py-1 rounded-full bg-amber-400 text-black font-semibold text-xs">
                                Read
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                )}
              </AnimatePresence>

              {/* Controls */}
              <button onClick={prev} aria-label="Previous" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-sm hover:scale-105 transition">
                <FiChevronLeft />
              </button>
              <button onClick={next} aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-sm hover:scale-105 transition">
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* thumbnails */}
          <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {slides.map((s, idx) => (
              <Link
                key={s.id}
                href={buildPostHref(s)}
                onClick={() => goTo(s.id)}
                className={`relative h-16 md:h-20 rounded-md overflow-hidden border transition ${active === s.id ? "border-amber-300" : "border-transparent hover:border-gray-200"}`}
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${getImageUrl(idx)}')` }} />
                <div className="absolute inset-0 bg-black/25" />
                <div className="relative z-10 p-2 text-xs text-white flex flex-col justify-end h-full">
                  <div className="font-semibold truncate">{s.title}</div>
                  <div className="opacity-80 text-[11px] truncate">{s.writerName}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* dots */}
          <div className="mt-2 flex justify-center gap-2">
            {slides.map((s) => (
              <button key={s.id} onClick={() => goTo(s.id)} className={`w-3 h-3 rounded-full ${active === s.id ? "bg-amber-500 scale-110" : "bg-gray-300"}`} aria-label={`Go to slide ${s.id}`} />
            ))}
          </div>
        </div>

{/* Right — Poem card with animation + hover */}
<div className="hidden md:flex md:col-span-1">
      <div
        className="group w-full h-80 lg:h-96 rounded-xl shadow-sm border bg-cover border-gray-300 dark:border-gray-800 flex overflow-hidden 
                   transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl"
        style={{
          backgroundImage: `url(${img5.src})`,
        }}
      >
        {/* LEFT — Poem Text Container */}
        {/* Added 'transition' and 'group-hover:bg-opacity' for the background fade effect */}
        <div
          className="w-1/2 h-full p-6 flex flex-col justify-center transition duration-300 
                     dark:bg-gray-900/60 dark:group-hover:bg-gray-900/80"
          style={{
            fontFamily: "'Noto Sans Devanagari', serif",
            // Added backdrop-filter for a subtle blur behind the text
     
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, fontSize: "1.15rem", lineHeight: "1.9" }}>
            तुझे बेहतर बनाने की कोशिश में<br />
            तुझे ही वक़्त नहीं दे पा रहे हम,<br />
            माफ़ करना ए-ज़िंदगी<br />
            तुझे ही जी नहीं पा रहे हम।
          </p>

          {/* POET NAME: Added 'transition-all', 'translate-y-2 opacity-0' (initial hidden state) and 'group-hover:...' (final visible state) */}
          <div
            className="transition-all duration-500 ease-out translate-y-2 group-hover:translate-y-0 group-hover:opacity-100"
            style={{
              marginTop: 14,
              fontSize: "1.2rem",
              color: "#444",
              fontWeight: 700,
            }}
          >
            — गुलज़ार
          </div>
        </div>

        {/* RIGHT — Image Container (This image is still static but part of the layout) */}
        <div
          className="w-1/2 h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${img6.src})`,
          }}
        ></div>

      </div>
    </div>


      </div>
    </div>
  );
}
