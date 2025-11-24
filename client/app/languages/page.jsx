// components/PoemsExcludingHindiCards.jsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoPlaySharp } from "react-icons/io5";
import {
  FiHeart,
  FiBookmark,
} from "react-icons/fi";


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_ENDPOINT = `${API_BASE}/api/poems/no-hindi`;

/**
 * PoemsExcludingHindiCards — improved badge detection (uses languagesResolved if backend provides it)
 */
export default function PoemsExcludingHindiCards({ rasSlug = "karun" }) {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [langMap, setLangMap] = useState({}); // id -> name

  // fetch poems from backend
  async function fetchPoems() {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, { cache: "no-store" });
      if (!res.ok) {
        setPoems([]);
        setLoading(false);
        return;
      }
      const json = await res.json();

      // normalize to an array (support multiple response shapes)
      let list = [];
      if (!json) list = [];
      else if (Array.isArray(json)) list = json;
      else if (json.poems && Array.isArray(json.poems)) list = json.poems;
      else if (json.data && Array.isArray(json.data)) list = json.data;
      else {
        const arr = Object.values(json).find((v) => Array.isArray(v));
        list = arr || [];
      }

      setPoems(list || []);

      // build initial langMap from any server-provided languagesResolved
      buildLangMapFromResolved(list || []);

      // then try to resolve remaining ids (if any)
      await resolveLanguageIds(list || []);
    } catch (err) {
      console.error("fetchPoems error:", err);
      setPoems([]);
    } finally {
      setLoading(false);
    }
  }

  // build a map from any languagesResolved the backend might have returned
  const buildLangMapFromResolved = (list) => {
    const map = {};
    (list || []).forEach((p) => {
      if (!p) return;
      // If backend included languagesResolved array (recommended)
      if (Array.isArray(p.languagesResolved)) {
        p.languagesResolved.forEach((lr) => {
          if (lr && lr.mainLanguageId && lr.mainLanguageName) {
            map[String(lr.mainLanguageId)] = lr.mainLanguageName;
          }
          if (lr && lr.subLanguageId && lr.subLanguageName) {
            map[String(lr.subLanguageId)] = lr.subLanguageName;
          }
        });
      }
      // Also handle if languages array already contains readable names
      if (Array.isArray(p.languages)) {
        p.languages.forEach((lg) => {
          if (!lg) return;
          // case: { subLanguageName: "Urdu" }
          if (typeof lg.subLanguageName === "string" && lg.subLanguageName.trim() && !/^[0-9a-fA-F]{24}$/.test(lg.subLanguageName)) {
            map[lg.subLanguageName] = lg.subLanguageName;
          }
          if (typeof lg.mainLanguage === "string" && lg.mainLanguage.trim() && !/^[0-9a-fA-F]{24}$/.test(lg.mainLanguage)) {
            map[lg.mainLanguage] = lg.mainLanguage;
          }
        });
      }
    });

    if (Object.keys(map).length) {
      setLangMap((prev) => ({ ...map, ...prev })); // prefer resolved map entries
    }
  };

  // resolve any language ids (24-hex) seen in poems by calling language endpoints
  const resolveLanguageIds = async (list) => {
    const idSet = new Set();
    (list || []).forEach((p) => {
      if (!p || !Array.isArray(p.languages)) return;
      p.languages.forEach((l) => {
        // languages item might be string or object
        const candidate = typeof l === "string" ? l : (l.subLanguageName || l.mainLanguage || "");
        if (typeof candidate === "string" && /^[0-9a-fA-F]{24}$/.test(candidate)) {
          idSet.add(candidate);
        }
      });
      // also accept resolved shape names stored as ids in languagesResolved (rare)
      if (Array.isArray(p.languagesResolved)) {
        p.languagesResolved.forEach((lr) => {
          if (lr && lr.mainLanguageId && /^[0-9a-fA-F]{24}$/.test(String(lr.mainLanguageId))) {
            idSet.add(String(lr.mainLanguageId));
          }
          if (lr && lr.subLanguageId && /^[0-9a-fA-F]{24}$/.test(String(lr.subLanguageId))) {
            idSet.add(String(lr.subLanguageId));
          }
        });
      }
    });

    const ids = Array.from(idSet);
    if (ids.length === 0) return;

    // try batch endpoint first (if you implement it on backend)
    try {
      const batchUrl = `${API_BASE}/api/languages/batch?ids=${ids.join(",")}`;
      const r = await fetch(batchUrl, { cache: "no-store" });
      if (r.ok) {
        const json = await r.json();
        if (Array.isArray(json) && json.length > 0) {
          const map = {};
          json.forEach((item) => {
            // language schema: { _id, mainCategory, subLanguages: [{ name, _id }, ...] }
            map[String(item._id)] = item.mainCategory || item.name || item.title || String(item._id);
            if (Array.isArray(item.subLanguages)) {
              item.subLanguages.forEach((sl) => {
                if (sl && sl._id) map[String(sl._id)] = sl.name || sl.title || map[String(item._id)];
              });
            }
          });
          setLangMap((prev) => ({ ...prev, ...map }));
          return;
        }
      }
    } catch (e) {
      // ignore and fallback
    }

    // fallback: per-id requests
    const map = {};
    await Promise.all(
      ids.map(async (id) => {
        try {
          const r = await fetch(`${API_BASE}/api/languages/${id}`, { cache: "no-store" });
          if (!r.ok) return;
          const j = await r.json();
          // Expected shapes handled:
          // { _id, mainCategory, subLanguages }
          // or { _id, name }
          const name = j.mainCategory || j.name || j.title || (j.data && j.data.name) || null;
          if (name) map[id] = name;
          if (Array.isArray(j.subLanguages)) {
            j.subLanguages.forEach((sl) => {
              if (sl && sl._id) map[String(sl._id)] = sl.name || sl.title || name;
            });
          }
        } catch (err) {
          // ignore individual failures
        }
      })
    );

    if (Object.keys(map).length) {
      setLangMap((prev) => ({ ...prev, ...map }));
    }
  };

  useEffect(() => {
    fetchPoems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // derive badge text — prefer backend-resolved, fallback to local map or strings
  const getBadgeText = (poem) => {
    try {
      // 1) backend-resolved shape
      if (Array.isArray(poem.languagesResolved) && poem.languagesResolved.length > 0) {
        const first = poem.languagesResolved[0];
        return first.subLanguageName || first.mainLanguageName || "Unknown";
      }

      // 2) languages array — can be object or string
      if (Array.isArray(poem.languages) && poem.languages.length > 0) {
        const first = poem.languages[0];
        // if object
        if (first && typeof first === "object") {
          const sub = first.subLanguageName;
          const main = first.mainLanguage;
          // plain string names:
          if (typeof sub === "string" && sub.trim() && !/^[0-9a-fA-F]{24}$/.test(sub)) return sub;
          if (typeof main === "string" && main.trim() && !/^[0-9a-fA-F]{24}$/.test(main)) return main;
          // ids -> lookup in langMap
          if (typeof sub === "string" && /^[0-9a-fA-F]{24}$/.test(sub)) return langMap[sub] || "Unknown";
          if (typeof main === "string" && /^[0-9a-fA-F]{24}$/.test(main)) return langMap[main] || "Unknown";
        }
        // if first is plain string
        if (typeof first === "string" && first.trim()) return first;
      }

      // 3) older/other shapes (attributes)
      if (poem.attributes && Array.isArray(poem.attributes.languages) && poem.attributes.languages.length > 0) {
        const r = poem.attributes.languages[0].subLanguageName || poem.attributes.languages[0].mainLanguage;
        if (typeof r === "string" && r.trim()) return r;
      }
    } catch (e) {
      // fallback below
    }
    return "Unknown";
  };

  return (
    <section aria-label="Poems excluding Hindi" className="w-full py-8" style={{ backgroundColor: "rgba(255,248,240,0.95)" }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header (matching the style you used earlier) */}
        <div className="w-[96%] lg:w-[88%] mx-auto md:pt-2 pt-4 flex items-end justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-6 transition-all">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full border border-amber-500/80 dark:border-purple-600 flex items-center justify-center shadow-md transition-all duration-500" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-amber-800">
                  <path d="M3 12h18M3 6h12M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight tracking-tight" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                Our Best Poems
              </h2>
              <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">Handpicked — विदेशी भाषाओं की चुनिंदा रचनाएँ</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">Loading…</div>
        ) : poems.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-600">No poems found.</div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {poems.map((poem, idx) => {
              const id = poem._id || poem.id || idx;
              const slug = poem.slug || (poem.attributes && poem.attributes.slug) || poem.id || String(id);
              const title = poem.title || poem.attributes?.title || "अनाम रचना";
              const content = poem.content || poem.attributes?.content || poem.description || "";
              const imageUrl = poem.image?.url || poem.attributes?.image?.url || poem.image || null;
              const writer = (poem.writerId && (poem.writerId.penName || poem.writerId.fullName)) || poem.writerName || "अज्ञात";
              const createdAt = poem.createdAt || poem.attributes?.createdAt || poem.date || poem.createdAt;

              const badgeText = getBadgeText(poem);

              return (
           <Link
  key={id}
  href={`/kavya/${encodeURIComponent(rasSlug || "general")}/${encodeURIComponent(slug)}`}
 className="group block bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 
rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1
w-full sm:w-[320px] min-h-[320px]"

>
  {/* IMAGE + BADGE */}
  <div className="relative w-full aspect-[3/2] overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-[#1a1a1a]">
    
    {/* Badge — Language */}
    <span className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 text-xs font-semibold shadow">
      {badgeText}
    </span>

    {/* Image */}
    {imageUrl ? (
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    ) : (
      <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300 p-4 text-center">
        {title.slice(0, 40)} 
        
      </div>
    )}

    {/* DATE on Image (top-right) */}
{createdAt && (
  <span className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full 
    bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
    {new Date(createdAt).toLocaleDateString("hi-IN", {
      month: "short",
      day: "numeric",
    })}
  </span>
)}

  </div>

  {/* CONTENT */}
  <div className="p-4 flex flex-col gap-3">

    {/* TITLE */}
    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-teal-300 transition-colors">
      {title}
    </h3>

    {/* DESCRIPTION */}
    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
      {String(content).replace(/<[^>]+>/g, "").slice(0, 120)}
      {String(content).length > 120 ? "..." : ""}
    </p>

    {/* FOOTER — WRITER + DATE */}
{/* FOOTER — WRITER + LIKE & BOOKMARK */}
<div className="pt-3 mt-auto border-t border-gray-200 dark:border-gray-800 
flex items-center justify-between">

  {/* Writer */}
  <Link
    href={`/writer/${poem.writerId?._id || poem.writerId || ""}`}
    onClick={(e) => e.stopPropagation()}
    className="flex items-center gap-2 group/writer"
  >
    {poem.writerAvatar || poem.writerId?.avatar ? (
      <Image
        src={poem.writerAvatar || poem.writerId.avatar}
        width={30}
        height={30}
        className="rounded-full object-cover"
        alt={writer}
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
        ✍️
      </div>
    )}

    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover/writer:underline">
      {writer}
    </span>
  </Link>

  {/* LIKE + BOOKMARK */}
  <div className="flex items-center gap-3 text-xs">

    <div className="flex items-center gap-1 text-red-500">
      <FiHeart size={14} />
      <span className="font-bold text-gray-600 dark:text-gray-400">
        {poem.likeCount ?? poem.likes?.length ?? 0}
      </span>
    </div>

    <div className="flex items-center gap-1 text-amber-600 dark:text-teal-300">
      <FiBookmark size={14} />
      <span className="font-bold text-gray-600 dark:text-gray-400">
        {poem.bookmarkCount ?? poem.bookmarks?.length ?? 0}
      </span>
    </div>

  </div>
</div>

  </div>
</Link>

              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
