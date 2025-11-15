"use client";
import { useEffect, useState } from "react";
import { IoPlaySharp } from "react-icons/io5";
const useMockParams = () => ({});
const MockLink = ({ href, className, children }) => (
  <a href={href} className={className}>
    {children}
  </a>
);
const MockImage = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    className={`absolute inset-0 w-full h-full object-cover ${className}`}
  />
);

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

// ✅ API Fetch
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
    console.error("Error fetching poems:", error);
    return [];
  }
}

export default function KavyaRasPage({ params }) {
  const { rasSlug } = params || useMockParams();
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
    <div className="min-h-screen bg-[#fffaf0] dark:bg-[#01161e] py-16 px-4 sm:px-8 text-[#1b1b1b] dark:text-gray-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-[#8C2B2B] dark:text-[#2dd4bf] mb-4 tracking-tight animate-fade-in drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]">
            {rasTitle} संग्रह
          </h1>
          <p className="text-lg md:text-xl text-[#6B4F4F] dark:text-gray-300 font-body max-w-3xl mx-auto opacity-0 animate-slide-up animation-delay-300">
            भारतीय काव्यशास्त्र में <strong>{rasTitle}</strong> के भावों पर आधारित नवीनतम रचनाएँ।
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-[#8C2B2B] dark:text-[#2dd4bf]"></span>
            <p className="ml-4 text-lg text-[#6B4F4F] dark:text-gray-400">
              कविताएँ लोड हो रही हैं...
            </p>
          </div>
        ) : poems.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {poems.map((poem, index) => (
              <MockLink
                href={`/kavya/${rasSlug}/${poem.slug}`}
                key={poem._id}
                className="group block rounded-2xl overflow-hidden bg-white dark:bg-[#042f37] 
                           border border-[#f1e7d3] dark:border-[#0f3a42]
                           shadow-lg dark:shadow-[0_0_10px_rgba(45,212,191,0.15)]
                           hover:shadow-2xl hover:dark:shadow-[0_0_20px_#14b8a6]
                           transition-all duration-300 hover:scale-[1.03] animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* ✅ Image Section */}
                <div className="relative w-full aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                  {poem.image?.url ? (
                    <MockImage
                      src={poem.image.url}
                      alt={poem.title}
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-[#f3e7db] dark:bg-[#06323a] text-[#7a1c10] dark:text-[#2dd4bf] font-semibold text-lg p-4">
                      {poem.title?.slice(0, 30) || "चित्र उपलब्ध नहीं"}
                    </div>
                  )}

                  {/* ▶️ Play Button (Updated — same as previous code) */}
                  {poem.videoLink && (
                    <a
                      href={poem.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="flex items-center justify-center w-14 h-14 bg-[#2dd4bf] text-white rounded-full shadow-lg hover:bg-[#0891b2] hover:shadow-[0_0_15px_#14b8a6] transform hover:scale-110 transition-all duration-300">
                        <IoPlaySharp />

                      </div>
                    </a>
                  )}
                </div>

                {/* 📝 Content */}
                <div className="p-5">
                  <h2 className="text-xl font-display font-bold text-[#8C2B2B] dark:text-[#2dd4bf] mb-2 group-hover:text-[#14b8a6] transition-colors line-clamp-2">
                    {poem.title}
                  </h2>

                  <p className="text-[#6B4F4F] dark:text-gray-300 text-sm leading-snug line-clamp-3 mb-3">
                    {poem.content?.slice(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f1e7d3] dark:border-[#0e474f]">
                    <p className="text-xs italic text-[#6B4F4F] dark:text-gray-400">
                      ✍️ लेखक:{" "}
                      <span className="capitalize text-[#8C2B2B] dark:text-[#2dd4bf] font-medium">
                        {poem.writerId?.penName ||
                          poem.writerId?.fullName ||
                          "अज्ञात"}
                      </span>
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(poem.createdAt).toLocaleDateString("hi-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </MockLink>
            ))}
          </div>
        ) : (
          <div className="text-center mt-20 p-8 bg-white dark:bg-[#042f37] rounded-xl shadow-lg dark:shadow-[0_0_12px_rgba(45,212,191,0.2)] border border-[#F6A44C] dark:border-[#0e474f]">
            <p className="text-2xl text-[#8b0000] dark:text-[#2dd4bf] font-bold mb-4">
              क्षमा करें!
            </p>
            <p className="text-[#6B4F4F] dark:text-gray-300 text-lg">
              इस <strong>{rasTitle}</strong> रस में अभी कोई रचनाएँ उपलब्ध नहीं हैं।
            </p>
          </div>
        )}
      </div>

      {/* ✨ Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}
