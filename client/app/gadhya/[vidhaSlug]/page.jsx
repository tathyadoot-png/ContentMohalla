"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const titleMap = {
  nibandh: "निबंध",
  kahani: "कहानी",
  upanyas: "उपन्यास",
  natak: "नाटक",
  "jeevani-autobiography": "जीवनी / आत्मकथा",
  sansmaran: "संस्मरण",
};

async function getPostsBySubcategory(vidhaSlug) {
  const category = "gadhya";
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/poems/category/${category}/${vidhaSlug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Error fetching gadhya posts:", err);
    return [];
  }
}

export default function VidhaPostListPage({ params }) {
  const { vidhaSlug } = params;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const vidhaTitle = titleMap[vidhaSlug] || vidhaSlug;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getPostsBySubcategory(vidhaSlug);
      setPosts(data);
      setLoading(false);
    };
    fetchData();
  }, [vidhaSlug]);

  return (
    <div className="min-h-screen bg-[#fffaf0] dark:bg-[#01161e] text-[#1b1b1b] dark:text-gray-100 py-16 px-6 sm:px-10 font-serif transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* 🏷️ Header */}
        <header className="text-center mb-14">
          <h1 className="text-5xl md:text-6xl font-bold text-[#7a1c10] dark:text-[#2dd4bf] mb-4 tracking-wide animate-fade-in drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]">
            {vidhaTitle} संग्रह
          </h1>
          <p className="text-lg md:text-xl text-[#6b4f36] dark:text-gray-300 font-body max-w-3xl mx-auto opacity-0 animate-slide-up animation-delay-300">
            हिंदी गद्य साहित्य के अंतर्गत <strong>{vidhaTitle}</strong> की रचनाओं का संग्रह।
          </p>
        </header>

        {/* 🔄 Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-[#7a1c10] dark:text-[#2dd4bf]"></span>
            <p className="ml-4 text-lg text-[#6B4F4F] dark:text-gray-400">
              रचनाएँ लोड हो रही हैं...
            </p>
          </div>
        ) : posts.length > 0 ? (
          /* 🧾 Posts Grid */
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post, i) => (
              <Link
                key={post._id}
                href={`/gadhya/${vidhaSlug}/${post.slug}`}
                className="group block rounded-2xl overflow-hidden bg-white dark:bg-[#042f37] 
                           border border-[#f1e7d3] dark:border-[#0f3a42]
                           shadow-lg dark:shadow-[0_0_10px_rgba(45,212,191,0.15)]
                           hover:shadow-2xl hover:dark:shadow-[0_0_20px_#14b8a6]
                           transition-all duration-300 hover:scale-[1.03] animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* 🖼️ Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  {post.image?.url ? (
                    <Image
                      src={post.image.url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-[#f3e7db] dark:bg-[#06323a] text-[#7a1c10] dark:text-[#2dd4bf] font-semibold text-lg p-4">
                      {post.title?.slice(0, 30) || "चित्र उपलब्ध नहीं"}
                    </div>
                  )}

                  {/* ▶️ Video Button */}
                  {post.videoLink && (
                    <a
                      href={post.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="flex items-center justify-center w-14 h-14 bg-[#2dd4bf] text-white rounded-full shadow-lg hover:bg-[#0891b2] transform hover:scale-110 transition-all">
                        ▶
                      </div>
                    </a>
                  )}
                </div>

                {/* ✍️ Content */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-[#7a1c10] dark:text-[#2dd4bf] mb-2 group-hover:text-[#14b8a6] transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-[#6B4F4F] dark:text-gray-300 text-sm leading-snug line-clamp-3 mb-3">
                    {post.content?.slice(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f1e7d3] dark:border-[#0e474f]">
                    <p className="text-xs italic text-[#6B4F4F] dark:text-gray-400">
                      ✍️{" "}
                      <span className="capitalize text-[#7a1c10] dark:text-[#2dd4bf] font-medium">
                        {post.isAdminPost &&
                        (!post.writerId || post.writerId?.fullName === "Admin")
                          ? "प्रशासन"
                          : post.writerId?.penName ||
                            post.writerId?.fullName ||
                            "अज्ञात"}
                      </span>
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.date).toLocaleDateString("hi-IN", {
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
          <div className="text-center mt-20 p-8 bg-white dark:bg-[#042f37] rounded-xl shadow-lg dark:shadow-[0_0_12px_rgba(45,212,191,0.2)] border border-[#F6A44C] dark:border-[#0e474f]">
            <p className="text-2xl text-[#8b0000] dark:text-[#2dd4bf] font-bold mb-4">
              क्षमा करें!
            </p>
            <p className="text-[#6B4F4F] dark:text-gray-300 text-lg">
              इस <strong>{vidhaTitle}</strong> विधा में अभी कोई रचनाएँ उपलब्ध नहीं हैं।
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
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}
