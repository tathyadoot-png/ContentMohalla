"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaShareAlt,
  FaUserCircle,
  FaPaperPlane,
} from "react-icons/fa";
import { motion } from "framer-motion";
import RelatedGadhya from "../../../../components/content/RelatedPoems"; // adjust if path differs

// helper to format counts like 1.4K
const formatCount = (num) => {
  if (!num && num !== 0) return 0;
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num;
};

export default function GadhyaPostPage() {
  const { vidhaSlug, postSlug } = useParams(); // route params
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = Cookies.get("token");

  useEffect(() => {
    if (!postSlug) return;
    const fetchPost = async () => {
      setLoading(true);
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
        const fetched = data.poem || data;
        setPost(fetched);
        setComments(fetched?.comments || data.comments || []);
        setLiked(data.userLiked ?? false);
        setBookmarked(data.userBookmarked ?? false);
      } catch (err) {
        console.error("Error fetching gadhya post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSlug]);

  // Like toggling
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
      if (res.status === 401) {
        alert("कृपया लॉगिन करें!");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setLiked(data.isLiked);
        // update local counts if returned
        if (data.likesCount !== undefined) {
          setPost((p) => ({ ...p, likeCount: data.likesCount }));
        } else {
          // optimistic adjust
          setPost((p) => ({
            ...p,
            likeCount: p?.likeCount ? (data.isLiked ? p.likeCount + 1 : p.likeCount - 1) : p.likeCount,
          }));
        }
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Bookmark toggling
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
      if (res.status === 401) {
        alert("कृपया लॉगिन करें!");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setBookmarked(data.isBookmarked ?? !bookmarked);
        if (data.bookmarksCount !== undefined) {
          setPost((p) => ({ ...p, bookmarksCount: data.bookmarksCount }));
        }
      }
    } catch (err) {
      console.error("Bookmark error:", err);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!post?._id) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poems/${post._id}/comment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ commentText: newComment }),
        }
      );

      if (res.status === 401) {
        alert("कृपया लॉगिन करें!");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setComments(data.comments || []);
        setNewComment("");
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // Share (navigator.share fallback to clipboard)
  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title || "यह लेख पढ़ें",
          text: "यह लेख पढ़ें",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("लिंक कॉपी हो गया!");
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      alert("लिंक कॉपी हो गया!");
    }
  };

  if (loading)
    return <p className="text-center py-10 text-gray-500">लोड हो रहा है...</p>;

  if (!post)
    return <p className="text-center py-10 text-red-500">पोस्ट नहीं मिली।</p>;

  // helper to safely access writer object (some apis return writerId or writer)
  const writer = post.writer || post.writerId || post.author || null;
  const writerId = writer?._id || writer?.id;

  return (
    <main className="min-h-screen pt-4 pb-12 px-4 bg-white font-serif">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT / MAIN */}
        <div className="lg:col-span-2 space-y-8">
          {/* IMAGE */}
          {post.image?.url && (
            <div
              className="relative w-full overflow-hidden rounded-xl shadow-lg bg-gray-50 flex items-center justify-center"
              style={{ aspectRatio: "16 / 9" }}
            >
              <Image
                src={post.image.url}
                alt={post.title || "Image"}
                fill
                style={{ objectFit: "contain" }}
                className="transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          )}

          {/* TITLE + META */}
          <div className="pt-4 px-2">
            <h1 className="text-4xl font-extrabold text-[#1f2937] mb-2">
              {post.title}
            </h1>

            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <Link
                href={writerId ? `/writer/${writerId}` : "#"}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {writer?.avatar ? (
                  <Image
                    src={writer.avatar}
                    width={48}
                    height={48}
                    alt={writer?.fullName || writer?.penName || "Writer"}
                    className="rounded-full shadow-md w-12 h-12 object-cover border border-gray-100"
                  />
                ) : (
                  <FaUserCircle className="text-gray-400 text-4xl" />
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#7a1c10] transition">
                    {writer?.penName || writer?.fullName || "लेखक"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt || Date.now()).toLocaleDateString("hi-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {" • "} {post.deskLocation || ""}
                  </p>
                </div>
              </Link>

             
            </div>

            {/* CONTENT */}
            <div
              className="text-[#3f3f46] text-xl leading-8 whitespace-pre-wrap font-medium"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* AUDIO (if available) */}
            {post.audioUrl || post.audio?.url ? (
              <div className="mt-6 bg-gray-100 p-4 rounded-xl">
                <audio controls className="w-full">
                  <source src={post.audioUrl ?? post.audio.url} />
                  आपका ब्राउज़र ऑडियो टैग सपोर्ट नहीं करता।
                </audio>
              </div>
            ) : null}

            {/* VIDEO LINK */}
            {post.videoLink && (
              <a
                href={post.videoLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#7a1c10] hover:bg-[#a12717] text-white px-5 py-2.5 rounded-full mt-6"
              >
                ▶ वीडियो देखें
              </a>
            )}

            {/* TAGS (if exist) */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full border bg-white/60">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ACTION BAR */}
          <div className="flex items-center justify-between border-t border-b py-4 px-2 text-gray-600 text-sm">
            <div className="flex items-center gap-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className="flex items-center gap-2 hover:text-red-500"
              >
                {liked ? <FaHeart className="text-lg text-red-600" /> : <FaRegHeart className="text-lg" />}
                <span>{formatCount(post.likeCount ?? post.likes?.length ?? 0)}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-[#7a1c10]"
              >
                <FaShareAlt />
                <span>साझा करें</span>
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBookmark}
              className="flex items-center gap-2 border border-[#7a1c10] text-[#7a1c10] hover:text-[#a12717] hover:border-[#a12717] px-4 py-1.5 rounded-full"
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              <span>{formatCount(post.bookmarksCount ?? post.bookmarks?.length ?? 0)}</span>
            </motion.button>
          </div>

          {/* COMMENTS */}
          <div className="p-2 space-y-6">
            <h2 className="text-xl font-bold text-[#1f2937]">टिप्पणियाँ ({comments?.length || 0})</h2>

            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                placeholder="अपनी टिप्पणी लिखें..."
                className="w-full bg-transparent outline-none resize-none"
              />
              <div className="flex justify-end mt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-[#7a1c10] text-white px-5 py-2 rounded-lg mt-2"
                >
                  भेजें
                </motion.button>
              </div>
            </div>

            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-4 border-b pb-4">
                    {c.profilePic ? (
                      <Image src={c.profilePic} width={40} height={40} className="rounded-full" alt={c.username} />
                    ) : (
                      <FaUserCircle className="text-gray-400 text-4xl" />
                    )}
                    <div>
                      <p className="font-bold">{c.username || "User"}</p>
                      <p className="text-gray-700">{c.commentText}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">अभी कोई टिप्पणी नहीं।</p>
            )}
          </div>
        </div>

        {/* RIGHT / SIDEBAR */}
        <div className="lg:col-span-1 pt-4">
          <RelatedGadhya poemId={post._id} isSidebar={true} />
        </div>
      </div>
    </main>
  );
}
