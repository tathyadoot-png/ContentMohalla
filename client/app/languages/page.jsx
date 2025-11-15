// components/PoemsExcludingHindiCards.jsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoPlaySharp } from "react-icons/io5";

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
                  className="group block rounded-2xl overflow-hidden bg-white dark:bg-[#042f37] border border-[#f1e7d3] dark:border-[#0f3a42] shadow-sm hover:shadow-md transition-transform duration-200 hover:scale-[1.02]"
                >
                  <div className="relative">
                    <div className="absolute z-20 left-3 top-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-200/60 max-w-[110px] truncate inline-block">
                        {badgeText}
                      </span>
                    </div>

                    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#f3e7db]">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-[#f3e7db] dark:bg-[#06323a] text-[#7a1c10] dark:text-[#2dd4bf] font-semibold text-lg p-4">
                          {title.slice(0, 30)}
                        </div>
                      )}

                      {poem.videoLink && (
                        <a
                          href={poem.videoLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute inset-0 flex items-center justify-center bg-black/24 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow transform hover:scale-110 transition-transform">
                            <IoPlaySharp />
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-[#8C2B2B] dark:text-[#2dd4bf] line-clamp-2">{title}</h3>
                    <p className="mt-2 text-sm text-[#6B4F4F] dark:text-gray-300 line-clamp-3">
                      {String(content).replace(/<[^>]+>/g, "").slice(0, 120)}
                      {String(content).length > 120 ? "..." : ""}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <div className="font-medium text-sm text-[#6B4F4F] dark:text-gray-300">✍️ {writer}</div>
                      <div>{createdAt ? new Date(createdAt).toLocaleDateString("hi-IN", { month: "short", day: "numeric" }) : ""}</div>
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
