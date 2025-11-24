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
  FaThumbsUp, // Using FaThumbsUp for Like Count icon as seen in SS
  FaShareAlt, // Using a standard Share icon
} from "react-icons/fa";
import { motion } from "framer-motion";
import RelatedPoems from "../../../../components/content/RelatedPoems";
import Cookies from "js-cookie";

// 🎨 SS Matched UI Component
export default function KavyaPostPage() {
  const { rasSlug, postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Note: For matching the SS structure, RelatedPoems is placed in the right column,
  // and Comments are placed in the left column below the poem content.

  const token = Cookies.get("token");

  // --- API / Backend Integration (Kept as is) ---
  // 🟢 Fetch Poem Details
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

  // ❤️ Like Function
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
      if (res.status === 401) return alert("कृपया पहले लॉगिन करें!");
      const data = await res.json();
      if (data.success) setLiked(data.isLiked);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  // 🔖 Bookmark Function
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
      if (res.status === 401) return alert("कृपया पहले लॉगिन करें!");
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
      if (res.status === 401) return alert("कृपया पहले लॉगिन करें!");
      const data = await res.json();
      if (data.success) {
        setComments(data.comments || []);
        setNewComment("");
      }
    } catch (error) {
      console.error("Add comment error:", error);
    }
  };

  // 🔗 Share
  const handleShare = async () => {
    const shareUrl = window.location.href;
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
    } catch (error) {
      navigator.clipboard.writeText(shareUrl);
      alert("🔗 लिंक कॉपी हो गया!");
    }
  };
  // ---------------------------------------------------

  // --- Loading / Error State ---
  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading...</p>;

  if (!post)
    return <p className="text-center py-10 text-red-500">पोस्ट नहीं मिली।</p>;

  // 📝 Main Render
  return (
    // Max width and background adjusted to mimic the overall page container
    <main className="min-h-screen pt-4 pb-12 px-4 bg-white font-serif">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 🖋 Left Section (Poem Content and Comments) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Poem Image (Top span) */}
          {post.image?.url && (
            // Updated wrapper: center contents and use objectFit: 'contain' so image never crops
            <div
              className="relative w-full overflow-hidden rounded-xl shadow-lg bg-gray-50 flex items-center justify-center"
              style={{ aspectRatio: "16 / 9" }}
            >
              <Image
                src={post.image.url}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 1200px"
                style={{ objectFit: "contain" }}
                className="max-w-full max-h-full transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>
          )}

          {/* Title and Metadata */}
          <div className="pt-4 px-2">
            <h1 className="text-4xl font-extrabold text-[#1f2937] mb-2">
              {post.title}
            </h1>

            {/* Author and Date (SS Style) */}
            <p className="text-sm text-gray-600 font-semibold mb-6">
              द्वारा : {post.writerId?.penName || post.writerId?.fullName || "अज्ञात"} |
              {new Date(post.createdAt).toLocaleDateString("hi-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

  
          
            {/* Poem Content */}
            <div
              className="text-[#3f3f46] text-xl leading-9 whitespace-pre-wrap font-medium" // Large font and spacing for poetry
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 🎥 Video Link (Kept below content) */}
            {post.videoLink && (
              <div className="flex justify-start mt-8">
                <a
                  href={post.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#7a1c10] hover:bg-[#a12717] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-md transition-all duration-300"
                >
                  ▶ वीडियो देखें
                </a>
              </div>
            )}

            {/* 🎵 Audio Player */}
{post.audio?.url && (
  <div className="mt-8 bg-gray-100 p-4 rounded-xl shadow">
    <audio controls className="w-full">
      <source src={post.audio.url} type="audio/mpeg" />
      आपका ब्राउज़र ऑडियो प्लेयर को सपोर्ट नहीं करता।
    </audio>
  </div>
)}

          </div>

          {/* SS Style Interaction Bar */}
          <div className="flex items-center justify-between border-t border-b py-4 px-2 text-gray-500 text-sm">
            <div className="flex items-center gap-4">
                {/* Likes */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    className="flex items-center gap-1 hover:text-red-500 transition"
                >
                    <FaThumbsUp className={`text-lg ${liked ? 'text-red-500' : ''}`} />
                    {/* <span className="font-semibold text-gray-800">1.2K</span> Placeholder count */}
                </motion.button>
                {/* Comments Count */}
                <div className="flex items-center gap-1">
                    {/* <span className="font-semibold text-gray-800">420</span> Placeholder count */}
                </div>
                {/* Share */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="flex items-center gap-1 hover:text-[#7a1c10] transition"
                >
                    <FaShareAlt className="text-lg" />
                    <span>साझा करें</span>
                </motion.button>
            </div>
            {/* Bookmark/Save (Moved to the end) */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmark}
                className="flex items-center gap-2 text-[#7a1c10] hover:text-[#a12717] transition border border-[#7a1c10] px-4 py-1.5 rounded-full"
            >
                {bookmarked ? (
                    <FaBookmark className="text-sm" />
                ) : (
                    <FaRegBookmark className="text-sm" />
                )}
                <span>सहेजें</span>
            </motion.button>
          </div>

          {/* SS Style Comments Section (Left Column) */}
          <div className="p-2 space-y-6">
            <h2 className="text-xl font-bold text-[#1f2937]">
              टिप्पणियाँ ({comments?.length || 0})
            </h2>

            {/* Input (Similar to SS, simple text area look) */}
            <div className="mb-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="अपनी टिप्पणी लिखें..."
                rows={2}
                className="w-full resize-none outline-none text-base bg-transparent"
              />
              <div className="flex justify-end mt-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddComment}
                    className="bg-[#7a1c10] hover:bg-[#a12717] text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center justify-center shadow-md transition disabled:opacity-50"
                    disabled={!newComment.trim()}
                  >
                    टिप्पणी भेजें <FaPaperPlane className="ml-2 text-xs" />
                  </motion.button>
              </div>
            </div>

            {/* Comments List */}
            {comments?.length > 0 ? (
              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-3 border-b border-gray-100 last:border-b-0"
                  >
                    {c.profilePic ? (
                      <Image
                        src={c.profilePic}
                        alt={c.username}
                        width={40}
                        height={40}
                        className="rounded-full object-cover w-10 h-10 border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <FaUserCircle className="text-gray-400 text-4xl flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-[#1f2937]">
                          {c.username || "User"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {c.date ? new Date(c.date).toLocaleDateString("hi-IN") : 'कुछ देर पहले'}
                        </span>
                      </div>
                      <p className="text-gray-700 text-base mt-1 leading-snug">
                        {c.commentText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic text-center py-4">
                अभी तक कोई टिप्पणी नहीं की गई है।
              </p>
            )}
          </div>
        </div>

        {/* 💬 Right Section (Related Poems) - Matches SS Sidebar */}
        <div className="lg:col-span-1 pt-4 lg:pt-0">
          <RelatedPoems poemId={post._id} />
        </div>
      </div>
    </main>
  );
}
