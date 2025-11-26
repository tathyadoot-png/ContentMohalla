"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaPaperPlane,
  FaUserCircle,
  FaThumbsUp,
  FaShareAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import RelatedPoems from "../../../../components/content/RelatedPoems";
import Cookies from "js-cookie";

// 🔢 Format 1.4K numbers
const formatCount = (num) => {
  if (!num) return 0;
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num;
};

export default function KavyaPostPage() {
  const { rasSlug, postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = Cookies.get("token");

  // 📌 Fetch Poem
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/poems/slug/${postSlug}`,
          {
            cache: "no-store",
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const data = await res.json();
        setPost(data.poem || data);
        setComments(data.poem?.comments || data.comments || []);
        setLiked(data.userLiked || false);
        setBookmarked(data.userBookmarked || false);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug, token]);

  // ❤️ Like
  const handleLike = async () => {
    if (!post?._id) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poems/${post._id}/like`,
        {
          method: "POST",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.status === 401) return alert("कृपया लॉगिन करें!");

      const data = await res.json();
      if (data.success) {
        setLiked(data.isLiked);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  // 🔖 Bookmark
  const handleBookmark = async () => {
    if (!post?._id) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poems/${post._id}/bookmark`,
        {
          method: "POST",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (res.status === 401) return alert("कृपया लॉगिन करें!");

      const data = await res.json();
      if (data.success) setBookmarked(!bookmarked);
    } catch (error) {
      console.error("Bookmark error:", error);
    }
  };

  // 💬 Add Comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poems/${post._id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ commentText: newComment }),
          credentials: "include",
        }
      );

      if (res.status === 401) return alert("कृपया लॉगिन करें!");

      const data = await res.json();
      if (data.success) {
        setComments(data.comments || []);
        setNewComment("");
      }
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${post.category}/${post.subcategory}/${post.slug}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: "इस कविता को पढ़ें!",
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert("🔗 लिंक कॉपी हो गया!");
      }
    } catch {
      navigator.clipboard.writeText(shareUrl);
      alert("🔗 लिंक कॉपी हो गया!");
    }
  };

  if (loading)
    return <p className="text-center py-10" style={{ color: "var(--text)" }}>लोड हो रहा है...</p>;

  if (!post)
    return <p className="text-center py-10" style={{ color: "var(--text)" }}>पोस्ट नहीं मिली।</p>;

  return (
    <main
      className="min-h-screen pt-4 pb-12 px-4"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-serif, ui-serif, Georgia)" }}
    >
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image */}
          {post.image?.url && (
            <div
              className="relative w-full overflow-hidden rounded-xl shadow-sm shadow-orange-200"
              style={{
                aspectRatio: "16 / 9",
                background: "var(--glass)",
                // border: "1px solid var(--glass-border)",
                // boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >
              <Image
                src={post.image.url}
                alt={post.title}
                fill
                style={{ objectFit: "contain", objectPosition: "center" }}
                className="hover:scale-105 transition-all duration-300"
              />
            </div>
          )}

          {/* TITLE */}
          <div className="pt-4 px-2">
            <h1 className="text-4xl font-extrabold mb-2" style={{ color: "var(--text)" }}>
              {post.title}
            </h1>

            {/* AUTHOR SECTION */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              {/* Left: Avatar + Writer */}
              <Link
                href={`/writer/${post.writerId?._id}`}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {post.writerId?.avatar ? (
                  <Image
                    src={post.writerId.avatar}
                    width={48}
                    height={48}
                    alt="writer"
                    className="rounded-full  w-12 h-12 border"
                    style={{ borderColor: "var(--glass-border)" }}
                  />
                ) : (
                  <FaUserCircle className="text-gray-400 text-5xl group-hover:text-gray-600 transition" />
                )}

                <div>
                  <p className="text-sm font-semibold transition" style={{ color: "var(--text)" }}>
                    {post.writerId?.penName || post.writerId?.fullName}
                  </p>

                  <p className="text-xs" style={{ color: "var(--text)" }}>
                    <span className="w-2 h-2 bg-green-600 rounded-full inline-block mr-2" />
                    {new Date(post.createdAt).toLocaleDateString("hi-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>

              {/* Right: Like + Bookmark Count / Buttons */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className="flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{
                    color: liked ? "var(--primary)" : "var(--text)",
                    border: `1px solid ${liked ? "rgba(255,107,0,0.12)" : "transparent"}`,
                    background: "transparent",
                  }}
                >
                  {liked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
                  <span style={{ color: "var(--text)" }}>{formatCount(post.likeCount ?? 0)}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookmark}
                  className="flex items-center gap-2 px-3 py-1 rounded-full border"
                  style={{
                    color: bookmarked ? "var(--primary)" : "var(--text)",
                    borderColor: "var(--glass-border)",
                    background: "transparent",
                  }}
                >
                  {bookmarked ? <FaBookmark className="text-lg" /> : <FaRegBookmark className="text-lg" />}
                  <span style={{ color: "var(--text)" }}>सहेजें</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{
                    color: "var(--text)",
                    border: "1px solid var(--glass-border)",
                    background: "transparent",
                  }}
                >
                  <FaShareAlt className="text-lg" />
                  <span style={{ color: "var(--text)" }}>साझा करें</span>
                </motion.button>
              </div>
            </div>

         {/* ===== CONTENT (preserve original poem formatting) ===== */}
{(() => {
  const content = post.content ?? "";
  const looksLikeHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  if (looksLikeHTML) {
    // अगर HTML है — वैसे ही डालो
    return (
      <div
        className="prose max-w-none text-[1.06rem] leading-8"
        style={{
          color: "var(--text)",
          fontWeight: 500,
          fontFamily: "var(--font-devanagari, 'Noto Sans Devanagari', serif)",
          whiteSpace: "normal",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  } else {
    // अगर plain text है — line breaks बचाकर दिखाओ
    return (
      <div
        className="text-[1.06rem] leading-8"
        style={{
          color: "var(--text)",
          fontWeight: 500,
          fontFamily: "var(--font-devanagari, 'Noto Sans Devanagari', serif)",
          whiteSpace: "pre-wrap", /* preserve newlines and spacing */
          overflowWrap: "anywhere",
        }}
      >
        {content}
      </div>
    );
  }
})()}


            {/* VIDEO */}
            {post.videoLink && (
              <a
                href={post.videoLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mt-6"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--bg)",
                  // boxShadow: "0 8px 30px rgba(255,107,0,0.12)",
                }}
              >
                ▶ वीडियो देखें
              </a>
            )}

            {/* AUDIO */}
            {post.audio?.url && (
              <div className="mt-8" style={{ background: "var(--glass)", padding: 12, borderRadius: 12 }}>
                <audio controls className="w-full">
                  <source src={post.audio.url} />
                </audio>
              </div>
            )}
          </div>

          {/* INTERACTION BAR */}
          <div
            className="flex items-center justify-between border-t border-b py-4 px-2 text-sm"
            style={{ borderColor: "var(--glass-border)", color: "var(--text)" }}
          >
            <div className="flex items-center gap-6">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleLike} className="flex items-center gap-2">
                {liked ? <FaHeart className="text-primary" /> : <FaRegHeart />}
                <span style={{ color: "var(--text)" }}>{formatCount(post.likeCount ?? 0)}</span>
              </motion.button>

            
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare} className="flex items-center gap-2">
                <FaShareAlt />
                <span style={{ color: "var(--text)" }}>साझा करें</span>
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBookmark}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{
                color: "var(--primary)",
                border: "1px solid var(--primary)",
                background: "transparent",
              }}
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              <span style={{ color: "var(--primary)" }}>सहेजें</span>
            </motion.button>
          </div>

          {/* COMMENTS SECTION */}
          <div className="p-2 space-y-6">
            <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              टिप्पणियाँ ({comments.length})
            </h2>

            {/* Input */}
            <div style={{ border: "1px solid var(--glass-border)", borderRadius: 12, background: "var(--glass)", padding: 12 }}>
              <textarea
                value={newComment}
                rows={2}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="अपनी टिप्पणी लिखें..."
                className="w-full bg-transparent outline-none resize-none"
                style={{ color: "var(--text)" }}
              />
              <div className="flex justify-end mt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 rounded-md"
                  style={{
                    background: "var(--primary)",
                    color: "var(--bg)",
                    opacity: !newComment.trim() ? 0.6 : 1,
                  }}
                >
                  टिप्पणी भेजें
                </motion.button>
              </div>
            </div>

            {/* Comments List */}
            {comments.length > 0 ? (
              comments.map((c, i) => (
                <div key={i} className="flex gap-4 border-b pb-4" style={{ borderColor: "var(--glass-border)" }}>
                  {c.profilePic ? (
                    <Image src={c.profilePic} width={40} height={40} className="rounded-full border" alt={c.username} style={{ borderColor: "var(--glass-border)" }} />
                  ) : (
                    <FaUserCircle className="text-gray-400 text-4xl" />
                  )}

                  <div>
                    <p style={{ fontWeight: 700, color: "var(--text)" }}>{c.username}</p>
                    <p style={{ color: "var(--text)" }}>{c.commentText}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center" style={{ color: "var(--text)" }}>अभी कोई टिप्पणी नहीं।</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE RELATED */}
        <div className="lg:col-span-1 pt-4">
          <div style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 12, padding: 12 }}>
            <RelatedPoems poemId={post._id} />
          </div>
        </div>
      </div>
    </main>
  );
}
 