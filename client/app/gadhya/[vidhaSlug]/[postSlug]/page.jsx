"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// removed js-cookie usage
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
import api from "@/utils/api"; // ✅ axios instance (withCredentials: true)

// helper to format counts like 1.4K
const formatCount = (num) => {
  if (!num && num !== 0) return 0;
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num;
};

/* Small reusable interaction button (consistent with KavyaPostPage) */
const ActionButton = ({ icon: Icon, filledIcon: FilledIcon, label, onClick, isActive }) => {
  const IconComp = isActive ? FilledIcon : Icon;
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-smooth text-sm font-medium"
      style={{
        color: isActive ? "var(--primary)" : "var(--text)",
        background: isActive ? "rgba(255,107,0,0.06)" : "transparent",
        border: `1px solid ${isActive ? "rgba(255,107,0,0.12)" : "var(--glass-border)"}`,
      }}
    >
      <IconComp className="text-lg" style={{ color: isActive ? "var(--primary)" : undefined }} />
      <span style={{ color: isActive ? "var(--primary)" : "var(--text)" }}>{label}</span>
    </motion.button>
  );
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

  // 📌 Fetch post (try axios api first, fallback to fetch with credentials)
  useEffect(() => {
    if (!postSlug) return;

    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/poems/slug/${postSlug}`, {
          headers: { "Cache-Control": "no-store" },
        });
        const data = res.data;
        const fetched = data.poem || data;
        setPost(fetched);
        setComments(fetched?.comments || data.comments || []);
        setLiked(data.userLiked ?? false);
        setBookmarked(data.userBookmarked ?? false);
      } catch (axiosErr) {
        console.warn("api.get failed — falling back to fetch():", axiosErr);
        // fallback to fetch using full URL so credentials: 'include' sends httpOnly cookie
        try {
          const base = process.env.NEXT_PUBLIC_API_URL;
          if (!base) throw axiosErr;
          const res = await fetch(`${base.replace(/\/$/, "")}/api/poems/slug/${postSlug}`, {
            cache: "no-store",
            credentials: "include",
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            let body = {};
            try {
              body = text ? JSON.parse(text) : {};
            } catch {
              body = { message: text };
            }
            throw new Error(body?.message || `Fetch failed: ${res.status}`);
          }

          const data = await res.json();
          const fetched = data.poem || data;
          setPost(fetched);
          setComments(fetched?.comments || data.comments || []);
          setLiked(data.userLiked ?? false);
          setBookmarked(data.userBookmarked ?? false);
        } catch (fetchErr) {
          console.error("Error fetching post (both axios & fetch):", fetchErr);
          setPost(null);
          setComments([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSlug]);

  // LIKE
  const handleLike = async () => {
    if (!post?._id) return;
    try {
      // prefer axios
      const res = await api.post(`/poems/${post._id}/like`);
      const data = res.data;
      if (data.success) {
        setLiked(data.isLiked);
        if (data.likesCount !== undefined) {
          setPost((p) => ({ ...p, likeCount: data.likesCount }));
        } else {
          setPost((p) => ({
            ...p,
            likeCount: p?.likeCount ? (data.isLiked ? p.likeCount + 1 : Math.max(p.likeCount - 1, 0)) : (data.isLiked ? 1 : 0),
          }));
        }
      }
    } catch (err) {
      // handle auth or network
      const status = err?.response?.status;
      if (status === 401) {
        alert("कृपया लॉगिन करें!");
        return;
      }
      console.error("Like error (axios):", err);

      // fallback to fetch
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;
        if (!base) throw err;
        const res = await fetch(`${base.replace(/\/$/, "")}/api/poems/${post._id}/like`, {
          method: "POST",
          credentials: "include",
        });
        if (res.status === 401) {
          alert("कृपया लॉगिन करें!");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setLiked(data.isLiked);
          if (data.likesCount !== undefined) setPost((p) => ({ ...p, likeCount: data.likesCount }));
        }
      } catch (fallbackErr) {
        console.error("Like fallback error:", fallbackErr);
      }
    }
  };

  // BOOKMARK
  const handleBookmark = async () => {
    if (!post?._id) return;
    try {
      const res = await api.post(`/poems/${post._id}/bookmark`);
      const data = res.data;
      if (data.success) {
        setBookmarked(data.isBookmarked ?? !bookmarked);
        if (data.bookmarksCount !== undefined) setPost((p) => ({ ...p, bookmarksCount: data.bookmarksCount }));
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        alert("कृपया लॉगिन करें!");
        return;
      }
      console.error("Bookmark error (axios):", err);

      // fallback
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;
        if (!base) throw err;
        const res = await fetch(`${base.replace(/\/$/, "")}/api/poems/${post._id}/bookmark`, {
          method: "POST",
          credentials: "include",
        });
        if (res.status === 401) {
          alert("कृपया लॉगिन करें!");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setBookmarked(data.isBookmarked ?? !bookmarked);
          if (data.bookmarksCount !== undefined) setPost((p) => ({ ...p, bookmarksCount: data.bookmarksCount }));
        }
      } catch (fallbackErr) {
        console.error("Bookmark fallback error:", fallbackErr);
      }
    }
  };

  // ADD COMMENT
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!post?._id) return;

    try {
      const res = await api.post(`/poems/${post._id}/comment`, { commentText: newComment });
      const data = res.data;
      if (data.success) {
        setComments(data.comments || []);
        setNewComment("");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        alert("कृपया लॉगिन करें!");
        return;
      }
      console.error("Comment error (axios):", err);

      // fallback
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;
        if (!base) throw err;
        const res = await fetch(`${base.replace(/\/$/, "")}/api/poems/${post._id}/comment`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commentText: newComment }),
        });
        if (res.status === 401) {
          alert("कृपया लॉगिन करें!");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setComments(data.comments || []);
          setNewComment("");
        }
      } catch (fallbackErr) {
        console.error("Comment fallback error:", fallbackErr);
      }
    }
  };

  // SHARE
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
    return <p className="text-center py-10" style={{ color: "var(--text)" }}>लोड हो रहा है...</p>;

  if (!post)
    return <p className="text-center py-10" style={{ color: "var(--text)" }}>पोस्ट नहीं मिली।</p>;

  // helper to safely access writer object (some apis return writerId or writer)
  const writer = post.writer || post.writerId || post.author || null;
  const writerId = writer?._id || writer?.id;

  // helper to detect whether content contains HTML tags
  const looksLikeHTML = (content) => /<\/?[a-z][\s\S]*>/i.test(content);

  return (
    <main className="min-h-screen pt-4 pb-12 px-4" style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-devanagari, 'Tiro Devanagari Hindi', serif)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT / MAIN */}
        <div className="lg:col-span-2 space-y-8">
          {/* IMAGE (no-crop: object-contain) */}
          {post.image?.url && (
            <div
              className="relative w-full overflow-hidden rounded-xl shadow-lg bg-[var(--glass)] flex items-center justify-center"
              style={{ aspectRatio: "16 / 9", border: "1px solid var(--glass-border)" }}
            >
              <Image
                src={post.image.url}
                alt={post.title || "Image"}
                fill
                style={{ objectFit: "contain", objectPosition: "center" }}
                className="transition-transform duration-300"
                priority
              />
            </div>
          )}

          {/* TITLE + META */}
          <div className="pt-4 px-2">
            <h1 className="text-4xl font-extrabold mb-2" style={{ color: "var(--text)" }}>
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
                    className="rounded-full shadow-md w-12 h-12 object-cover border"
                    style={{ borderColor: "var(--glass-border)" }}
                  />
                ) : (
                  <FaUserCircle className="text-gray-400 text-4xl" />
                )}

                <div>
                  <p className="text-sm font-semibold transition" style={{ color: "var(--text)" }}>
                    {writer?.penName || writer?.fullName || "लेखक"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text)" }}>
                    {new Date(post.createdAt || Date.now()).toLocaleDateString("hi-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {" • "} <span style={{ color: "var(--text)" }}>{post.deskLocation || ""}</span>
                  </p>
                </div>
              </Link>

              {/* Right: Like + Bookmark Count / Buttons (styled) */}
              <div className="flex items-center gap-4">
                <ActionButton
                  icon={FaRegHeart}
                  filledIcon={FaHeart}
                  label={formatCount(post.likeCount ?? post.likes?.length ?? 0)}
                  onClick={handleLike}
                  isActive={liked}
                />

                <ActionButton
                  icon={FaRegBookmark}
                  filledIcon={FaBookmark}
                  label={bookmarked ? "सहेजा गया" : "सहेजें"}
                  onClick={handleBookmark}
                  isActive={bookmarked}
                />

                <ActionButton
                  icon={FaShareAlt}
                  filledIcon={FaShareAlt}
                  label="साझा करें"
                  onClick={handleShare}
                  isActive={false}
                />
              </div>
            </div>

            {/* CONTENT — preserve exact plain-text formatting OR render HTML if present */}
            {(() => {
              const content = post.content ?? "";
              if (looksLikeHTML(content)) {
                // अगर content में HTML टैग दिखते हैं — वही render करें (यदि trusted source हो)
                return (
                  <div
                    className="text-[1.06rem] leading-8 font-medium"
                    style={{ color: "var(--text)" }}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                );
              } else {
                // Plain text — preserve all newlines, spaces and special characters exactly
                return (
                  <div
                    className="text-[1.06rem] leading-8 font-medium"
                    style={{
                      color: "var(--text)",
                      whiteSpace: "pre-wrap",      // preserve newlines & multiple spaces
                      wordBreak: "break-word",     // long words won't overflow
                      overflowWrap: "anywhere",
                    }}
                  >
                    {content}
                  </div>
                );
              }
            })()}

            {/* AUDIO (if available) */}
            {post.audioUrl || post.audio?.url ? (
              <div className="mt-6 bg-[var(--glass)] p-4 rounded-xl" >
                <audio controls className="w-full">
                  <source src={post.audioUrl ?? post.audio.url} />
                  आपका ब्राउज़र ऑडियो टैग सपोर्ट नहीं करता।
                </audio>
              </div>
            ) : null}

            {/* VIDEO Link */}
            {post.videoLink && (
              <a
                href={post.videoLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mt-6 font-semibold transition-smooth"
                style={{ backgroundColor: "var(--primary)", color: "var(--bg)", boxShadow: "0 8px 30px rgba(255,107,0,0.12)" }}
              >
                ▶ वीडियो देखें
              </a>
            )}

            {/* TAGS */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full border" style={{ background: "rgba(255,255,255,0.6)", borderColor: "var(--glass-border)", color: "var(--text)" }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* COMMENTS */}
          <div className="p-2 space-y-6">
            <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>टिप्पणियाँ ({comments?.length || 0})</h2>

            <div style={{ border: "1px solid var(--glass-border)", borderRadius: 12, background: "var(--glass)", padding: 12 }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
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
                  भेजें
                </motion.button>
              </div>
            </div>

            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-4 border-b pb-4" style={{ borderColor: "var(--glass-border)" }}>
                    {c.profilePic ? (
                      <Image src={c.profilePic} width={40} height={40} className="rounded-full" alt={c.username} />
                    ) : (
                      <FaUserCircle className="text-gray-400 text-4xl" />
                    )}
                    <div>
                      <p className="font-bold" style={{ color: "var(--text)" }}>{c.username || "User"}</p>
                      <p style={{ color: "var(--text)" }}>{c.commentText}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center" style={{ color: "var(--text)" }}>अभी कोई टिप्पणी नहीं।</p>
            )}
          </div>
        </div>

        {/* RIGHT / SIDEBAR */}
        <div className="lg:col-span-1 ">
          <div style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", borderRadius: 12, padding: 12 }}>
            <RelatedGadhya poemId={post._id} isSidebar={true} />
          </div>
        </div>
      </div>
    </main>
  );
}
