// components/Audio.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiHeart, FiBookmark } from "react-icons/fi";
import { FaPlay, FaPause } from "react-icons/fa";
import { FiHeadphones } from "react-icons/fi";

const FALLBACK_AVATAR = "/mnt/data/2dc9ac12-dadc-4742-8d11-6b98d1ad1189.png";

export default function Audio() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const router = useRouter();

  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 12 });

  useEffect(() => {
    fetchAudioPoems(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchAudioPoems(p = 1) {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/poems/sections/with-audio?page=${p}&limit=12`);
      const data = await res.json();

      if (data && data.success) {
        setPoems(data.poems || []);
        setMeta({ total: data.total || 0, limit: data.limit || 12 });
      } else {
        setPoems([]);
      }
    } catch {
      setPoems([]);
    } finally {
      setLoading(false);
    }
  }

  const safePart = (v) =>
    v ? String(v).trim().toLowerCase().replace(/\s+/g, "-") : "";

  const safeSlug = (s) =>
    s ? encodeURIComponent(String(s).trim().toLowerCase()) : "";

  const resolveAvatar = (avatarField) => {
    if (!avatarField) return FALLBACK_AVATAR;
    return /^http/.test(avatarField) ? avatarField : `${API}/${avatarField}`;
  };

  if (typeof window !== "undefined")
    window.__AUDIO_INSTANCES = window.__AUDIO_INSTANCES || [];

  function CardAudioPlayer({ src, uid }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [curr, setCurr] = useState(0);
    const [dur, setDur] = useState(0);

    useEffect(() => {
      const a = audioRef.current;
      if (!a) return;

      const onLoaded = () => setDur(a.duration || 0);
      const onTime = () => setCurr(a.currentTime || 0);
      const onEnd = () => setPlaying(false);

      a.addEventListener("loadedmetadata", onLoaded);
      a.addEventListener("timeupdate", onTime);
      a.addEventListener("ended", onEnd);

      window.__AUDIO_INSTANCES.push({ id: uid, audio: a });

      return () => {
        a.removeEventListener("loadedmetadata", onLoaded);
        a.removeEventListener("timeupdate", onTime);
        a.removeEventListener("ended", onEnd);
        window.__AUDIO_INSTANCES = window.__AUDIO_INSTANCES.filter((x) => x.id !== uid);
      };
    }, [uid]);

    const toggle = (e) => {
      e.stopPropagation();
      const a = audioRef.current;

      window.__AUDIO_INSTANCES.forEach((player) => {
        if (player.id !== uid) {
          try {
            player.audio.pause();
          } catch {}
        }
      });

      if (!a) return;
      if (a.paused) {
        a.play();
        setPlaying(true);
      } else {
        a.pause();
        setPlaying(false);
      }
    };

    const seek = (e) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const a = audioRef.current;
      if (a && dur) {
        a.currentTime = pct * dur;
        setCurr(a.currentTime);
      }
    };

    const fmt = (t = 0) => {
      if (!t) return "0:00";
      const m = Math.floor(t / 60);
      const s = String(Math.floor(t % 60)).padStart(2, "0");
      return `${m}:${s}`;
    };

    return (
      <div onClick={(e) => e.stopPropagation()}>
        <audio ref={audioRef} src={src} preload="metadata" />

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={toggle}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-600))",
              color: "#fff",
              boxShadow: "0 8px 30px rgba(255,107,0,0.18)",
            }}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <FaPause size={14} /> : <FaPlay size={14} />}
          </button>

          <div className="flex-1">
            <div
              onClick={seek}
              className="w-full h-2 bg-[rgba(0,0,0,0.06)] rounded-full cursor-pointer relative"
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(curr / (dur || 1)) * 100}%`,
                  background: "linear-gradient(90deg, rgba(255,199,150,1), rgba(255,107,0,1))",
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-[var(--text)]/60 mt-1">
              <span>{fmt(curr)}</span>
              <span>{fmt(dur)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <p className="p-6 text-center">लोड हो रहा है...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Section Header - styled close to your SectionHeader but adapted */}
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
              <FiHeadphones className="text-primary stroke-2" size={24} />
            </div>
          </div>

          <div>
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight"
              style={{ color: "var(--primary)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
              ऑडियो कविताएँ
            </h2>
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
              सुनिए — बेहतरीन ऑडियो रचनाओं का संग्रह
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {poems.map((p, idx) => {
          const categoryPart = safePart(p.category);
          const subPart = safePart(p.subcategory);
          const slugPart = safeSlug(p.slug || p.title);
          const href = categoryPart && subPart ? `/${categoryPart}/${subPart}/${slugPart}` : `/poem/${slugPart}`;
          const avatar = resolveAvatar(p.writerAvatar);

          return (
            <article
              key={p._id || idx}
              onClick={() => router.push(href)}
              className="bg-[var(--glass)] rounded-2xl shadow shadow-orange-200 hover:shadow-md hover:shadow-orange-300 transition-all duration-300 cursor-pointer flex flex-col p-4"
              style={{
                // borderColor: "var(--glass-border)",
                // boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
                minHeight: 220,
              }}
            >
              <div className="flex-1 ">
                <h3 className="text-lg font-semibold text-[var(--text)] line-clamp-2">
                  {p.title}
                </h3>

                <p className="text-sm text-[var(--text)]/80 mt-2 line-clamp-2">
                  {String(p.content || p.description || "").replace(/<[^>]+>/g, "").slice(0, 140)}
                  {(p.content || p.description || "").length > 140 ? "..." : ""}
                </p>

                <div className="mt-4">
                  <CardAudioPlayer src={p.audio?.url || ""} uid={`audio_${idx}`} />
                </div>
              </div>

              {/* footer row */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--glass-border)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={avatar}
                      width={36}
                      height={36}
                      alt={p.writerName || "writer"}
                      className="rounded-full object-cover"
                      unoptimized
                      onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                    />
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {p.writerName || "अज्ञात"}
                      </div>
                      <div className="text-xs text-[var(--text)]/60">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString("hi-IN") : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[var(--text)]/80">
                    <div className="flex items-center gap-1">
                      <FiHeart style={{ color: "var(--primary)" }} />
                      <span className="text-sm">{p.likeCount ?? 0}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <FiBookmark style={{ color: "var(--primary)" }} />
                      <span className="text-sm">{p.bookmarkCount ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {!loading && meta.total > meta.limit && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((s) => Math.max(1, s - 1))}
            className="px-4 py-2 rounded bg-[rgba(0,0,0,0.06)] disabled:opacity-50"
          >
            ← Previous
          </button>

          <span className="font-medium">{page}</span>

          <button
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage((s) => s + 1)}
            className="px-4 py-2 rounded"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-600))",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(255,107,0,0.12)",
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
