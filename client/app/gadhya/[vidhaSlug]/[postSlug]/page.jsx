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
  FaCommentAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import RelatedGadhya from "../../../../components/content/RelatedPoems";

export default function GadhyaPostPage() {
  const { vidhaSlug, postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/poems/slug/${postSlug}`,
          { cache: "no-store", credentials: "include" }
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
  }, [postSlug]);

  const handleLike = async () => {
    if (!post?._id) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poems/${post._id}/like`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.status === 401) return alert("कृपया पहले लॉगिन करें!");
      const data = await res.json();
      if (data.success) setLiked(data.isLiked);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleBookmark = async () => {
    if (!post?._id) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poems/${post._id}/bookmark`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.status === 401) return alert("कृपया पहले लॉगिन करें!");
      const data = await res.json();
      if (data.success) setBookmarked(!bookmarked);
    } catch (error) {
      console.error("Bookmark error:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!post?._id) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poems/${post._id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: "इस गद्य रचना को पढ़ें!",
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

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading...</p>;

  if (!post)
    return <p className="text-center py-10 text-red-500">Post not found</p>;

  return (
    <main className="min-h-screen py-4 px-4 bg-white font-serif">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Updated image wrapper: object-contain to avoid cropping */}
          {post.image?.url && (
            <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-gray-50 flex items-center justify-center"
                 style={{ aspectRatio: "16 / 9" }}>
              {/* Use Image with fill + objectFit: 'contain' so image never crops */}
              <Image
                src={post.image.url}
                alt={post.title || "Gadhya Image"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 1200px"
                style={{ objectFit: "contain" }}
                className="transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          )}

          <div className="pt-4 px-2">
            <h1 className="text-4xl font-extrabold text-[#1f2937] mb-2">
              {post.title}
            </h1>

            <p className="text-sm text-gray-500 mb-6">
              द्वारा <strong>{post.writerId?.penName || post.writerId?.fullName || "अज्ञात"}</strong> |
              {" "}
              {new Date(post.createdAt || new Date()).toLocaleDateString("hi-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <p className="text-base text-gray-600 border-l-4 border-gray-200 pl-4 italic mb-8">
              यह गद्य रचना आपको विषय के बारे में गहन जानकारी प्रदान करती है।
              लेखक ने यहाँ विचारों और भावनाओं का एक शानदार मिश्रण प्रस्तुत किया है।
            </p>

            <div
              className="text-[#3f3f46] text-xl leading-8 whitespace-pre-wrap font-medium"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

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
          </div>

          <div className="flex items-center justify-between border-t border-b py-4 px-2 text-gray-500 text-sm">
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className="flex items-center gap-1 hover:text-red-500 transition"
              >
                <FaThumbsUp className={`text-lg ${liked ? "text-red-500" : ""}`} />
              </motion.button>

              <div className="flex items-center gap-1">
                {/* Comments count left as placeholder (you can enable icon if needed) */}
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex items-center gap-1 hover:text-[#7a1c10] transition"
              >
                <FaShareAlt className="text-lg" />
                <span>साझा करें</span>
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className="flex items-center gap-2 text-[#7a1c10] hover:text-[#a12717] transition border border-[#7a1c10] px-4 py-1.5 rounded-full"
            >
              {bookmarked ? <FaBookmark className="text-sm" /> : <FaRegBookmark className="text-sm" />}
              <span>सहेजें</span>
            </motion.button>
          </div>

          <div className="p-2 space-y-6">
            <h2 className="text-xl font-bold text-[#1f2937]">
              टिप्पणियाँ ({comments?.length || 0})
            </h2>

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

            {comments?.length > 0 ? (
              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-4 p-3 border-b border-gray-100 last:border-b-0">
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
                          {c.date ? new Date(c.date).toLocaleDateString("hi-IN") : "कुछ देर पहले"}
                        </span>
                      </div>
                      <p className="text-gray-700 text-base mt-1 leading-snug">{c.commentText}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic text-center py-4">अभी तक कोई टिप्पणी नहीं की गई है।</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 pt-4 lg:pt-0">
          <RelatedGadhya poemId={post._id} isSidebar={true} />
        </div>
      </div>
    </main>
  );
}
