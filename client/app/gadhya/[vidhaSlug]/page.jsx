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
    <div
      className="min-h-screen py-16 px-4 sm:px-10 font-serif transition-colors duration-500"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
     <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

  {/* HEADER SECTION */}
  <header className="text-center mb-14 ">
    <div className="border border-orange-600 p-4 sm:p-6 w-full sm:w-4/5 md:w-3/5 lg:w-1/2 mx-auto flex flex-col justify-center items-center text-center rounded-lg">
      <h1
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-wide animate-fade-in"
        style={{
          color: "var(--primary)",
          textShadow: "0 0 10px rgba(255,107,0,0.12)",
        }}
      >
        {vidhaTitle} संग्रह
      </h1>

      <p
        className="text-base sm:text-lg md:text-xl leading-7 mt-3 max-w-3xl mx-auto"
        style={{ color: "var(--text)", opacity: 0.95 }}
      >
        हिंदी गद्य साहित्य के अंतर्गत{" "}
        <strong style={{ color: "var(--primary)" }}>{vidhaTitle}</strong> की रचनाओं का संग्रह।
      </p>
    </div>
  </header>

  {/* POSTS GRID */}
  <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {posts.map((post, i) => (
      <Link
        key={post._id ?? i}
        href={`/gadhya/${vidhaSlug}/${post.slug}`}
        className="group block rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] animate-fade-in-up shadow shadow-orange-200 hover:shadow-md hover:shadow-orange-300"
        style={{
          backgroundColor: "var(--glass)",
          border: "1px solid var(--glass-border)",
          // boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        }}
      >
        {/* IMAGE */}
        <div className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden bg-white dark:bg-black/20">
          {post.image?.url ? (
            <Image
              src={post.image.url}
              alt={post.title}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="100vw"
            />
          ) : (
            <div
              className="flex items-center justify-center w-full h-full font-semibold text-lg p-4"
              style={{ backgroundColor: "var(--glass)", color: "var(--primary)" }}
            >
              {post.title?.slice(0, 30) || "चित्र उपलब्ध नहीं"}
            </div>
          )}

          {/* VIDEO BUTTON */}
          {post.videoLink && (
            <a
              href={post.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div
                className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all"
                style={{ backgroundColor: "var(--primary)", color: "#fff" }}
              >
                ▶
              </div>
            </a>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-5">
          <h2
            className="text-lg sm:text-xl font-bold mb-2 line-clamp-2 transition-colors"
            style={{ color: "var(--primary)" }}
          >
            {post.title}
          </h2>

          <p className="text-sm sm:text-base leading-snug line-clamp-3 mb-3" style={{ color: "var(--text)" }}>
            {post.content ? post.content.slice(0, 100) + "..." : ""}
          </p>

          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
            <p className="text-xs italic" style={{ color: "var(--text)" }}>
              ✍️{" "}
              <span className="capitalize font-medium" style={{ color: "var(--primary)" }}>
                {post.isAdminPost && (!post.writerId || post.writerId?.fullName === "Admin")
                  ? "प्रशासन"
                  : post.writerId?.penName || post.writerId?.fullName || "अज्ञात"}
              </span>
            </p>

            <span className="text-xs" style={{ color: "var(--text)" }}>
              {post.date
                ? new Date(post.date).toLocaleDateString("hi-IN", {
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </span>
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>


      {/* ✨ Animations */}
      <style jsx global>{`
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
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
