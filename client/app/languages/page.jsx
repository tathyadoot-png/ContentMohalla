// components/PoemsExcludingHindiCards.jsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiHeart, FiBookmark, FiTrendingUp } from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_ENDPOINT = `${API_BASE}/api/poems/no-hindi`;
const FALLBACK_AVATAR = "/fallback-avatar.png"; // अपना fallback path यहाँ रखो

export default function PoemsExcludingHindiCards({ rasSlug = "karun" }) {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [langMap, setLangMap] = useState({});

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
      buildLangMapFromResolved(list || []);
      await resolveLanguageIds(list || []);
    } catch (err) {
      console.error("fetchPoems error:", err);
      setPoems([]);
    } finally {
      setLoading(false);
    }
  }

  const buildLangMapFromResolved = (list) => {
    const map = {};
    (list || []).forEach((p) => {
      if (!p) return;
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
      if (Array.isArray(p.languages)) {
        p.languages.forEach((lg) => {
          if (!lg) return;
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
      setLangMap((prev) => ({ ...map, ...prev }));
    }
  };

  const resolveLanguageIds = async (list) => {
    const idSet = new Set();
    (list || []).forEach((p) => {
      if (!p || !Array.isArray(p.languages)) return;
      p.languages.forEach((l) => {
        const candidate = typeof l === "string" ? l : (l.subLanguageName || l.mainLanguage || "");
        if (typeof candidate === "string" && /^[0-9a-fA-F]{24}$/.test(candidate)) {
          idSet.add(candidate);
        }
      });
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

    try {
      const batchUrl = `${API_BASE}/api/languages/batch?ids=${ids.join(",")}`;
      const r = await fetch(batchUrl, { cache: "no-store" });
      if (r.ok) {
        const json = await r.json();
        if (Array.isArray(json) && json.length > 0) {
          const map = {};
          json.forEach((item) => {
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
      // ignore
    }

    const map = {};
    await Promise.all(
      ids.map(async (id) => {
        try {
          const r = await fetch(`${API_BASE}/api/languages/${id}`, { cache: "no-store" });
          if (!r.ok) return;
          const j = await r.json();
          const name = j.mainCategory || j.name || j.title || (j.data && j.data.name) || null;
          if (name) map[id] = name;
          if (Array.isArray(j.subLanguages)) {
            j.subLanguages.forEach((sl) => {
              if (sl && sl._id) map[String(sl._id)] = sl.name || sl.title || name;
            });
          }
        } catch (err) {}
      })
    );
    if (Object.keys(map).length) setLangMap((prev) => ({ ...prev, ...map }));
  };

  useEffect(() => {
    fetchPoems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBadgeText = (poem) => {
    try {
      if (Array.isArray(poem.languagesResolved) && poem.languagesResolved.length > 0) {
        const first = poem.languagesResolved[0];
        return first.subLanguageName || first.mainLanguageName || "Unknown";
      }
      if (Array.isArray(poem.languages) && poem.languages.length > 0) {
        const first = poem.languages[0];
        if (first && typeof first === "object") {
          const sub = first.subLanguageName;
          const main = first.mainLanguage;
          if (typeof sub === "string" && sub.trim() && !/^[0-9a-fA-F]{24}$/.test(sub)) return sub;
          if (typeof main === "string" && main.trim() && !/^[0-9a-fA-F]{24}$/.test(main)) return main;
          if (typeof sub === "string" && /^[0-9a-fA-F]{24}$/.test(sub)) return langMap[sub] || "Unknown";
          if (typeof main === "string" && /^[0-9a-fA-F]{24}$/.test(main)) return langMap[main] || "Unknown";
        }
        if (typeof first === "string" && first.trim()) return first;
      }
      if (poem.attributes && Array.isArray(poem.attributes.languages) && poem.attributes.languages.length > 0) {
        const r = poem.attributes.languages[0].subLanguageName || poem.attributes.languages[0].mainLanguage;
        if (typeof r === "string" && r.trim()) return r;
      }
    } catch (e) {}
    return "Unknown";
  };

  return (
    <section aria-label="Poems excluding Hindi" className="w-full py-8" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto ">
        {/* Header (SectionHeader-like) */}
        <div className="w-[96%] lg:w-[88%] mx-auto md:pt-6 pt-8 flex items-end justify-between pb-3 mb-6 transition-all">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div
                className="w-14 h-14 rounded-full bg-white dark:bg-[#141414] border-2 flex items-center justify-center shadow-md transition-all duration-500"
                style={{
                  borderColor: "var(--primary)",
                  boxShadow: "0 10px 30px rgba(255,107,0,0.12)",
                }}
                aria-hidden
              >
                <FiTrendingUp className="text-primary stroke-2" size={24} style={{ color: "var(--primary)" }} />
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--primary)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                विदेशी भाषाओं की चुनिंदा रचनाएँ
              </h2>
              <p className="mt-1 text-sm md:text-base" style={{ color: "var(--text)", opacity: 0.85 }}>
                Handpicked — curated selections from non-Hindi languages
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16" style={{ color: "var(--text)" }}>Loading…</div>
        ) : poems.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-600" style={{ color: "var(--text)" }}>No poems found.</div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-start">
            {poems.map((poem, idx) => {
              const id = poem._id || poem.id || idx;
              const slug = poem.slug || (poem.attributes && poem.attributes.slug) || poem.id || String(id);
              const title = poem.title || poem.attributes?.title || "अनाम रचना";
              const content = poem.content || poem.attributes?.content || poem.description || "";
              const imageUrl = poem.image?.url || poem.attributes?.image?.url || poem.image || null;
              const writer = (poem.writerId && (poem.writerId.penName || poem.writerId.fullName)) || poem.writerName || "अज्ञात";
              const createdAt = poem.createdAt || poem.attributes?.createdAt || poem.date || poem.createdAt;
              const badgeText = getBadgeText(poem);

              // writer avatar source (handle different shapes)
              const writerAvatar =
                poem.writerAvatar?.url ||
                (typeof poem.writerAvatar === "string" ? poem.writerAvatar : null) ||
                poem.writerId?.avatar?.url ||
                (typeof poem.writerId?.avatar === "string" ? poem.writerId.avatar : null) ||
                FALLBACK_AVATAR;

              return (
                <Link
                  key={id}
                  href={`/kavya/${encodeURIComponent(rasSlug || "general")}/${encodeURIComponent(slug)}`}
                  className="group block rounded-2xl overflow-hidden shadow shadow-orange-200 hover:shadow-md hover:shadow-orange-300 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "var(--glass)",
                    border: "1px solid var(--glass-border)",
                    // boxShadow: "0 6px 20px rgba(255,107,0,0.06)",
                    minWidth: 320,
                    maxWidth: 320,
                    width: "320px",
                  }}
                >
                  {/* IMAGE + BADGE */}
                  <div className="relative w-full aspect-[3/2] overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-[#111]">
                    <span
                      className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-xs font-semibold shadow"
                      style={{
                        background: "rgba(255,239,230,0.95)",
                        color: "var(--primary)",
                        boxShadow: "0 6px 18px rgba(255,107,0,0.06)",
                      }}
                    >
                      {badgeText}
                    </span>

                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full p-4 text-center" style={{ color: "var(--text)" }}>
                        {title.slice(0, 60)}
                      </div>
                    )}

                    {createdAt && (
                      <span
                        className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: "rgba(0,0,0,0.45)",
                          color: "var(--bg)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {new Date(createdAt).toLocaleDateString("hi-IN", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-3 flex flex-col gap-3 min-h-[160px]">
                    <h3 className="text-lg font-bold line-clamp-2 transition-colors" style={{ color: "var(--text)" }}>
                      {title}
                    </h3>

                    <p className="text-sm line-clamp-3" style={{ color: "var(--text)", opacity: 0.85 }}>
                      {String(content).replace(/<[^>]+>/g, "").slice(0, 120)}
                      {String(content).length > 120 ? "..." : ""}
                    </p>

                    <div className="pt-3 mt-auto border-t" style={{ borderColor: "var(--glass-border)" }}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* fixed-size rounded avatar with border & shadow */}
                          <div style={{ width: 44, height: 44 }} className="rounded-full overflow-hidden flex items-center justify-center" aria-hidden>
                            <Image
                              src={writerAvatar || FALLBACK_AVATAR}
                              width={34}
                              height={34}
                              alt={writer}
                              className="rounded-full object-cover"
                              unoptimized
                              onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                            />
                          </div>

                          <div>
                            <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{writer}</div>
                            <div className="text-[10px]" style={{ color: "var(--text)", opacity: 0.7 }}>
                              {createdAt ? new Date(createdAt).toLocaleDateString() : ""}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1" style={{ color: "var(--primary)" }}>
                            <FiHeart size={14} />
                            <span className="font-semibold" style={{ color: "var(--text)" }}>
                              {poem.likeCount ?? poem.likes?.length ?? 0}
                            </span>
                          </div>

                          <div className="flex items-center gap-1" style={{ color: "var(--primary)" }}>
                            <FiBookmark size={14} />
                            <span className="font-semibold" style={{ color: "var(--text)" }}>
                              {poem.bookmarkCount ?? poem.bookmarks?.length ?? 0}
                            </span>
                          </div>
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
