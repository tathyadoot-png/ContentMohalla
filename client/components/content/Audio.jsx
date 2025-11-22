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

  // -------------------------
  // HELPER FUNCTIONS
  // -------------------------

  const safePart = (v) =>
    v ? String(v).trim().toLowerCase().replace(/\s+/g, "-") : "";

  const safeSlug = (s) =>
    s ? encodeURIComponent(String(s).trim().toLowerCase()) : "";

  const resolveAvatar = (avatarField) => {
    if (!avatarField) return FALLBACK_AVATAR;
    return /^http/.test(avatarField)
      ? avatarField
      : `${API}/${avatarField}`;
  };

  // -------------------------
  // AUDIO PLAYER
  // -------------------------

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

      a.addEventListener("loadedmetadata", () => setDur(a.duration || 0));
      a.addEventListener("timeupdate", () => setCurr(a.currentTime || 0));
      a.addEventListener("ended", () => setPlaying(false));

      window.__AUDIO_INSTANCES.push({ id: uid, audio: a });

      return () => {
        window.__AUDIO_INSTANCES = window.__AUDIO_INSTANCES.filter(
          (x) => x.id !== uid
        );
      };
    }, []);

    const toggle = (e) => {
      e.stopPropagation();
      const a = audioRef.current;

      // pause others
      window.__AUDIO_INSTANCES.forEach((player) => {
        if (player.id !== uid) {
          try {
            player.audio.pause();
          } catch {}
        }
      });

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
      const pct = (e.clientX - rect.left) / rect.width;
      const a = audioRef.current;

      a.currentTime = pct * dur;
      setCurr(a.currentTime);
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

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="w-12 h-12 rounded-full bg-[#e33b45] text-white flex items-center justify-center shadow hover:scale-105 transition"
          >
            {playing ? <FaPause size={15} /> : <FaPlay size={15} />}
          </button>

          <div className="flex-1">
            <div
              onClick={seek}
              className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative"
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(curr / (dur || 1)) * 100}%`,
                  background: "linear-gradient(90deg,#ffc7c9,#b83d43)"
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{fmt(curr)}</span>
              <span>{fmt(dur)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------
  // UI
  // -------------------------

  if (loading)
    return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
<div className="w-[96%] lg:w-[88%] mx-auto md:pt-2 pt-4 flex items-end justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-6 transition-all">
  <div className="flex items-center gap-4">

    {/* Icon circle */}
    <div className="flex-shrink-0">
      <div 
        className="w-14 h-14 rounded-full border border-amber-500/80 dark:border-purple-600 flex items-center justify-center shadow-md transition-all duration-500"
        aria-hidden
      >
        {/* 🎧 Headphone icon */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-amber-800">
          <path 
            d="M12 3C7 3 3 7.03 3 12v7a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H5v-2c0-3.86 3.14-7 7-7s7 3.14 7 7v2h-1a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-7c0-4.97-4-9-9-9z"
            stroke="currentColor" 
            strokeWidth="1.6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
    </div>

    {/* Text content */}
    <div>
      <h2
        className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight tracking-tight"
        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
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
          // FULL redirect logic from your first code
          const categoryPart = safePart(p.category);
          const subPart = safePart(p.subcategory);
          const slugPart = safeSlug(p.slug || p.title);

          const href =
            categoryPart && subPart
              ? `/${categoryPart}/${subPart}/${slugPart}`
              : `/poem/${slugPart}`;

          const avatar = resolveAvatar(p.writerAvatar);

          return (
            <div
              key={idx}
              onClick={() => router.push(href)}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer p-4 flex flex-col gap-4"
            >
              {/* Title + content */}
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{p.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{p.content}</p>

              {/* Audio */}
              <CardAudioPlayer
                src={p.audio?.url || ""}
                uid={`audio_${idx}`}
              />

              {/* Writer */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={avatar}
                    width={32}
                    height={32}
                    alt="writer"
                    className="rounded-full object-cover"
                    unoptimized
                  />
                  <div className="text-sm text-gray-700">
                    <div className="font-medium">{p.writerName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1"><FiHeart /> {p.likeCount}</span>
                  <span className="flex items-center gap-1"><FiBookmark /> {p.bookmarkCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {!loading && meta.total > meta.limit && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ← Previous
          </button>

          <span className="font-medium">{page}</span>

          <button
            disabled={page * meta.limit >= meta.total}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-[#b83d43] text-white rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
