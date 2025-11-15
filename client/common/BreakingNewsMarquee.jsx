"use client";
import { useEffect, useState } from "react";
import { FaBullhorn, FaFeatherAlt } from "react-icons/fa";
import api from "@/utils/api";

export default function BreakingNewsMarquee() {
  const [breakingNews, setBreakingNews] = useState([]);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const res = await api.get("/news/?isBreaking=true&limit=10");
        setBreakingNews(res.data || []);
      } catch (error) {
        console.error("Failed to fetch breaking news:", error);
      }
    };

    fetchBreakingNews();
    const interval = setInterval(fetchBreakingNews, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!breakingNews.length) return null;

  return (
    <div
      className="sticky top-0 w-full z-40 flex items-center px-3 py-1 border-y border-border shadow-md"
      style={{ backgroundColor: "black" }}
    >
      {/* Breaking Label */}
      <div className="flex items-center text-[12px] font-bold uppercase text-accent border-l-4 border-red-500 px-2 py-1 mr-4">
        <FaBullhorn className="mr-2 text-accent" />
        ताज़ा खबर
      </div>

      {/* Marquee */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex gap-16 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
          {breakingNews.map((news, idx) => (
            <a
              key={`${news._id}-${idx}`}
              href={`/news/${news.categories?.[0]?.slug}/${news.slug}`}
              className="flex items-center text-sm whitespace-nowrap hover:text-yellow-400 transition-colors"
            >
              <FaFeatherAlt className="text-accent text-xs mr-2" />
              <span className="text-accent text-xs">{news.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Marquee Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
