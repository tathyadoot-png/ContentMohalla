"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiHeart, FiBookmark, FiUser } from "react-icons/fi";

const getWriterLabel = (item) => {
  if (!item) return "लेखक";
  if (item.writerName) return item.writerName;
  const w = item.writer;
  if (!w) return item.authorName || "लेखक";
  if (typeof w === "string") return w;
  return w.penName || w.name || w.fullName || item.authorName || "लेखक";
};

const getAvatarSrc = (item) => {
  const w = item.writer;
  return (
    (w && (w.avatar || w.profilePic)) ||
    item.writerAvatar ||
    item.authorAvatar ||
    null
  );
};

const Card = ({ item = {}, categoryType = "kavya" }) => {
  const img =
    item.image?.url ||
    item.featuredImage?.[0]?.url ||
    item.featuredImage?.url ||
    "/placeholder.jpg";
  const slug = item.slug || item._id || item.id || "unknown";
  const subcategorySlug = item.subcategory || item.category?.slug || "unknown";
  const writerName = getWriterLabel(item);
  const avatarSrc = getAvatarSrc(item);

  return (
    <div
      className="
        snap-start flex-shrink-0
        w-[calc(min(90vw,320px))]
        rounded-2xl overflow-hidden
        bg-[var(--glass)] backdrop-blur-sm
        border border-[var(--glass-border)]
        shadow-soft-orange
        hover:shadow-[0_10px_30px_var(--btn-shadow)]
        transition-all duration-500 ease-out hover:scale-[1.03]
      "
    >
      <Link href={`/${categoryType}/${subcategorySlug}/${slug}`} className="group flex flex-col h-full">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="relative w-full aspect-[3/2] bg-gray-100 dark:bg-[#1a1a1a]"
        >
          <Image src={img} alt={item.title || "item"} fill className="object-contain transition-transform duration-700 group-hover:scale-105" />
        </motion.div>

        <div className="flex flex-col justify-between flex-1 p-4">
          <div>
            <h4
              className="
                font-extrabold text-lg mb-2 line-clamp-2 leading-snug
                text-[var(--text)]
                group-hover:text-primary transition-colors duration-300
              "
            >
              {item.title || "Untitled Poem"}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {item.metaDescription ||
                (item.content &&
                  String(item.content).replace(/<[^>]+>/g, "").slice(0, 70).trim() + "...") ||
                "रचना का संक्षेप..."}
            </p>
          </div>

          <div className="pt-3 mt-auto border-t border-[var(--glass-border)] flex items-center justify-between">
            <Link
              href={`/writer/${item.writer?._id || item.writerId || item.authorId}`}
              className="flex items-center gap-2 hover:opacity-80 transition"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                {avatarSrc ? (
                  <Image src={avatarSrc} alt={writerName} fill className="object-cover" />
                ) : (
                  <FiUser className="text-gray-400 dark:text-gray-500 text-lg" />
                )}
              </div>
              <span className="font-semibold text-sm text-[var(--text)] truncate max-w-[120px]">
                {writerName}
              </span>
            </Link>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-primary">
                <FiHeart size={14} />
                <span className="font-bold text-[var(--text)]">
                  {item.likeCount ?? item.likes?.length ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <FiBookmark size={14} />
                <span className="font-bold text-[var(--text)]">
                  {item.bookmarkCount ?? item.bookmarks?.length ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

const HorizontalSection = ({ title, items = [], categoryType = "kavya", showArrows = true }) => {
  const scroller = useRef(null);
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const prev = () => scrollToIndex(index - 1);
  const next = () => scrollToIndex(index + 1);

  const scrollToIndex = (i) => {
    const node = scroller.current;
    if (!node) return;
    const children = Array.from(node.querySelectorAll(".snap-start"));
    const clamped = Math.max(0, Math.min(i, Math.max(0, children.length - visibleCount)));
    const el = children[clamped];
    const targetLeft = el?.offsetLeft || 0;
    node.scrollTo({ left: targetLeft, behavior: "smooth" });
    setIndex(clamped);
  };

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;

    const recalc = () => {
      const visible = Math.max(1, Math.floor(node.clientWidth / 320));
      setVisibleCount(visible);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(node);
    return () => ro.disconnect();
  }, [items.length]);

  return (
    <section className="relative w-[96%] lg:w-[88%] mx-auto">
      {showArrows && (
        <>
          <motion.button
            onClick={prev}
            whileTap={{ scale: 0.9 }}
            className="
              hidden md:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full
              bg-white/80 dark:bg-black/50 border border-[var(--glass-border)]
              shadow-soft-orange text-primary hover:scale-110 transition-all
            "
          >
            <FiChevronLeft size={20} />
          </motion.button>

          <motion.button
            onClick={next}
            whileTap={{ scale: 0.9 }}
            className="
              hidden md:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full
              bg-white/80 dark:bg-black/50 border border-[var(--glass-border)]
              shadow-soft-orange text-primary hover:scale-110 transition-all
            "
          >
            <FiChevronRight size={20} />
          </motion.button>
        </>
      )}

      <div
        ref={scroller}
        className="
          overflow-x-auto py-4 px-2 sm:px-4 md:px-6 hide-scrollbar
          flex gap-4 snap-x snap-mandatory
        "
      >
        {items?.length > 0 ? (
          items.map((it, idx) => <Card key={idx} item={it} categoryType={categoryType} />)
        ) : (
          <div className="text-gray-500 dark:text-gray-400 py-6 px-4">कोई आइटम नहीं मिला।</div>
        )}
      </div>
    </section>
  );
};

export default HorizontalSection;
