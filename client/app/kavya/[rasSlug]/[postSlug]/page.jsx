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
    return <p className="text-center py-10 text-gray-500">लोड हो रहा है...</p>;

  if (!post)
    return <p className="text-center py-10 text-red-500">पोस्ट नहीं मिली।</p>;

  return (
    <main className="min-h-screen pt-4 pb-12 px-4 bg-white font-serif">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">

          {/* Image */}
          {post.image?.url && (
            <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-gray-50 flex items-center justify-center"
              style={{ aspectRatio: "16 / 9" }}>
              <Image
                src={post.image.url}
                alt={post.title}
                fill
                style={{ objectFit: "contain" }}
                className="hover:scale-105 transition-all duration-300"
              />
            </div>
          )}

          {/* TITLE */}
          <div className="pt-4 px-2">
            <h1 className="text-4xl font-extrabold text-[#1f2937] mb-2">
              {post.title}
            </h1>

            {/* AUTHOR SECTION (Spotify Style) */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">

              {/* Left: Avatar + Writer */}
               <Link
    href={`/writer/${post.writerId?._id}`}
    className="flex items-center gap-3 cursor-pointer group"
  >
    {post.writerId?.avatar ? (
      <Image
        src={post.writerId.avatar}
        width={42}
        height={42}
        alt="writer"
        className="rounded-full shadow-md w-11 h-11 border border-gray-200 group-hover:scale-110 transition"
      />
    ) : (
      <FaUserCircle className="text-gray-400 text-5xl group-hover:text-gray-600 transition" />
    )}

    <div>
      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#7a1c10] transition">
        {post.writerId?.penName || post.writerId?.fullName}
      </p>

      <p className="text-xs text-gray-500 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
        {new Date(post.createdAt).toLocaleDateString("hi-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  </Link>

              {/* Right: Like + Bookmark Count */}
           
            </div>

            {/* CONTENT */}
            <div
              className="text-[#3f3f46] text-xl leading-9 whitespace-pre-wrap font-medium"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* VIDEO */}
            {post.videoLink && (
              <a
                href={post.videoLink}
                target="_blank"
                className="inline-flex items-center gap-2 bg-[#7a1c10] hover:bg-[#a12717]
                 text-white px-5 py-2.5 rounded-full mt-6"
              >
                ▶ वीडियो देखें
              </a>
            )}

            {/* AUDIO */}
            {post.audio?.url && (
              <div className="mt-8 bg-gray-100 p-4 rounded-xl shadow">
                <audio controls className="w-full">
                  <source src={post.audio.url} />
                </audio>
              </div>
            )}
          </div>

          {/* INTERACTION BAR */}
          <div className="flex items-center justify-between border-t border-b py-4 px-2 text-gray-600 text-sm">

            <div className="flex items-center gap-6">

              {/* LIKE BUTTON */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className="flex items-center gap-2 hover:text-red-500"
              >
                {liked ? (
                  <FaHeart className="text-lg text-red-600" />
                ) : (
                  <FaRegHeart className="text-lg" />
                )}
                <span>{formatCount(post.likeCount ?? item.likes?.length ?? 0)}</span>
              </motion.button>

              {/* COMMENT COUNT */}
             

              {/* SHARE */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-[#7a1c10]"
              >
                <FaShareAlt />
                <span>साझा करें</span>
                  <span>{formatCount(comments.length)}</span>
              </motion.button>
            </div>

            {/* BOOKMARK */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className="flex items-center gap-2 border border-[#7a1c10] text-[#7a1c10] hover:text-[#a12717] hover:border-[#a12717] px-4 py-1.5 rounded-full"
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              <span>सहेजें</span>
            </motion.button>
          </div>

          {/* COMMENTS SECTION */}
          <div className="p-2 space-y-6">
            <h2 className="text-xl font-bold text-[#1f2937]">
              टिप्पणियाँ ({comments.length})
            </h2>

            {/* Input */}
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <textarea
                value={newComment}
                rows={2}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="अपनी टिप्पणी लिखें..."
                className="w-full bg-transparent outline-none resize-none"
              />
              <div className="flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-[#7a1c10] text-white px-5 py-2 rounded-lg mt-2"
                >
                  टिप्पणी भेजें
                </motion.button>
              </div>
            </div>

            {/* Comments List */}
            {comments.length > 0 ? (
              comments.map((c, i) => (
                <div key={i} className="flex gap-4 border-b pb-4">
                  {c.profilePic ? (
                    <Image
                      src={c.profilePic}
                      width={40}
                      height={40}
                      className="rounded-full border"
                    />
                  ) : (
                    <FaUserCircle className="text-gray-400 text-4xl" />
                  )}

                  <div>
                    <p className="font-bold">{c.username}</p>
                    <p className="text-gray-700">{c.commentText}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">अभी कोई टिप्पणी नहीं।</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE RELATED */}
        <div className="lg:col-span-1 pt-4">
          <RelatedPoems poemId={post._id} />
        </div>
      </div>
    </main>
  );
}
