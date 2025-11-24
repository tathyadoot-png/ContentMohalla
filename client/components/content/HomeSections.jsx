"use client";
import React, { useEffect, useState } from "react";
import { FiHeart, FiBookmark, FiClock, FiTrendingUp } from "react-icons/fi";
import HorizontalSection from "./HorizontalSection";
import GadhyKavyaAccordion from "./GadhyKavyaAccordion";

const SectionHeader = ({ title, subtitle = "", icon: Icon }) => {
  return (
    <div className="w-[96%] lg:w-[88%] mx-auto md:pt-6 pt-8 flex items-end justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-2 transition-all">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
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
            {Icon ? (
              <Icon
                className="text-amber-800 dark:text-teal-200 stroke-2"
                size={24}
              />
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_BASE = `${apiUrl}/api/poems/sections`;

const fetchJson = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("fetchJson error:", e);
    return null;
  }
};

const normalize = (r) => {
  if (!r) return [];
  if (Array.isArray(r)) return r;
  if (r.poems && Array.isArray(r.poems)) return r.poems;
  if (r.data && Array.isArray(r.data)) return r.data;
  if (r.success && Array.isArray(r.poems)) return r.poems;
  return [];
};

const HomeSections = () => {
  const [mostLiked, setMostLiked] = useState([]);
  const [mostBookmarked, setMostBookmarked] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const [likedRes, bookmarkedRes, trendingRes, latestRes] = await Promise.all([
        fetchJson(`${API_BASE}/most-liked?limit=12`),
        fetchJson(`${API_BASE}/most-bookmarked?limit=12`),
        fetchJson(`${API_BASE}/trending?limit=12&days=7`),
        fetchJson(`${API_BASE}/latest?limit=12`),
      ]);

      if (!mounted) return;
      setMostLiked(normalize(likedRes));
      setMostBookmarked(normalize(bookmarkedRes));
      setTrending(normalize(trendingRes));
      setLatest(normalize(latestRes));
      setLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const Loader = () => (
    <div className="w-[96%] lg:w-[88%] mx-auto h-40 flex items-center justify-center">
      <svg
        className="animate-spin h-8 w-8 text-amber-600 dark:text-teal-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="ml-3 text-lg font-medium text-gray-500 dark:text-gray-300">
        सेक्शन लोड हो रहे हैं...
      </p>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen space-y-16 pb-20  dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-all duration-500"   >
      <div className="space-y-16">
        <section className="pt-4">
          <SectionHeader
            title="लोकप्रिय"
            subtitle="सबसे ज़्यादा पसंद की गई रचनाएँ"
            icon={FiHeart}
          />
          <HorizontalSection
            title="Most Liked"
            items={mostLiked}
            categoryType="kavya"
            showArrows={true}
          />
        </section>
<GadhyKavyaAccordion />
        <section className="pt-4">
          <SectionHeader
            title="सहेजी हुई रचनाएँ"
            subtitle="पाठकों द्वारा सहेजी हुई रचनाएँ"
            icon={FiBookmark}
          />
          <HorizontalSection
            title="Most Bookmarked"
            items={mostBookmarked}
            categoryType="kavya"
            showArrows={true}
          />
        </section>
        

        <section className="pt-4">
          <SectionHeader
            title="सबसे नवीन"
            subtitle="हाल ही में प्रकाशित रचनाएँ"
            icon={FiClock}
          />
          <HorizontalSection
            title="Latest"
            items={latest}
            categoryType="kavya"
            showArrows={true}
          />
        </section>
      </div>
    </div>
  );
};

export default HomeSections;
