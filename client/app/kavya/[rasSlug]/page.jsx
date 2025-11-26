"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoPlaySharp } from "react-icons/io5";

const titleMap = {
  shringar: "शृंगार रस",
  hasya: "हास्य रस",
  karuna: "करुण रस",
  raudra: "रौद्र रस",
  veer: "वीर रस",
  bhayanak: "भयानक रस",
  bibhats: "बीभत्स रस",
  adbhut: "अद्भुत रस",
  shant: "शांत रस",
};

async function getPoemsByRasa(rasSlug) {
  const category = "kavya";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/poems/category/${category}/${rasSlug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default function KavyaRasPage({ params }) {
  const { rasSlug } = params || {};
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const rasTitle = titleMap[rasSlug] || rasSlug;

  useEffect(() => {
    const fetchPoems = async () => {
      setLoading(true);
      const data = await getPoemsByRasa(rasSlug);
      setPoems(data);
      setLoading(false);
    };
    fetchPoems();
  }, [rasSlug]);

  return (
    <div className="min-h-screen py-16 px-4 sm:px-10  dark:bg-black text-[#1b1b1b] dark:text-gray-100">
      <div className="max-w-screen-2xl mx-auto">

        {/* ===== HEADER ===== */}
        <header className="text-center mb-14">
          <div className="border border-orange-600 p-4 sm:p-6 w-full sm:w-4/5 md:w-3/5 lg:w-1/2 mx-auto rounded-xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide"
              style={{
                color: "var(--primary)",
                textShadow: "0 0 10px rgba(255,107,0,0.12)",
              }}
            >
              {rasTitle} संग्रह
            </h1>

            <p className="text-base sm:text-lg md:text-xl mt-7 leading-7"
              style={{ color: "var(--text)", opacity: 0.95 }}
            >
              भारतीय काव्यशास्त्र में <strong style={{ color: "var(--primary)" }}>{rasTitle}</strong> के भावों पर आधारित नवीनतम रचनाएँ।
            </p>
          </div>
        </header>

        {/* ===== LOADER ===== */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-orange-600"></span>
          </div>
        ) : poems.length > 0 ? (

          /* ===== GRID CARDS ===== */
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {poems.map((poem, index) => (
              <Link
                href={`/kavya/${rasSlug}/${poem.slug}`}
                key={poem._id}
                className="group block rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] shadow shadow-orange-200 hover:shadow-md hover:shadow-orange-300"
                style={{
                  backgroundColor: "var(--glass)",
                  border: "1px solid var(--glass-border)",
                  // boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden ">
                  {poem.image?.url ? (
                    <Image
                      src={poem.image.url}
                      alt={poem.title}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-lg font-bold p-4"
                      style={{ color: "var(--primary)" }}
                    >
                      {poem.title.slice(0, 35)}
                    </div>
                  )}

                  {poem.videoLink && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl
                      bg-orange-600 shadow-xl hover:scale-110 transition-all">
                        <IoPlaySharp />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2
                    className="text-xl font-bold mb-2 line-clamp-2"
                    style={{ color: "var(--primary)" }}
                  >
                    {poem.title}
                  </h2>

                  <p className="text-sm leading-snug line-clamp-3 mb-3" style={{ color: "var(--text)" }}>
                    {poem.content?.slice(0, 120)}...
                  </p>

                  <div className="flex justify-between items-center pt-2"
                    style={{ borderTop: "1px solid var(--glass-border)" }}
                  >
                    <p className="text-xs italic" style={{ color: "var(--text)" }}>
                      ✍️ <span className="font-medium capitalize" style={{ color: "var(--primary)" }}>
                        {poem.writerId?.penName || poem.writerId?.fullName || "अज्ञात"}
                      </span>
                    </p>

                    <span className="text-xs" style={{ color: "var(--text)" }}>
                      {new Date(poem.createdAt).toLocaleDateString("hi-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (

          /* ===== EMPTY MESSAGE ===== */
          <div className="text-center mt-20 p-10 rounded-xl border border-orange-600">
            <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>क्षमा करें!</p>
            <p className="text-lg" style={{ color: "var(--text)" }}>
              इस <strong>{rasTitle}</strong> रस में अभी कोई रचनाएँ उपलब्ध नहीं हैं।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
