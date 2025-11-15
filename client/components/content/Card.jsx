// Card.jsx (Enhanced)
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiHeart, FiBookmark, FiUser } from "react-icons/fi";

const Card = ({ item, categoryType = "kavya" }) => {
  const img = item.image?.url || item.featuredImage?.[0]?.url || "/placeholder.jpg";
  const slug = item.slug || item._id || item.id;
  const subcategorySlug = item.subcategory || item.category?.slug || "unknown";
  const writerName =
    item.writer?.penName ||
    item.writerId?.penName ||
    item.writerName ||
    item.penName ||
    "लेखक";

  // Use a more muted, sophisticated pastel palette
  const pastelColors = [
    "from-[#FEF5ED] to-[#FFFBF5]",
    "from-[#F8FCF9] to-[#F5FCFF]",
    "from-[#FFF5FE] to-[#FDF5FD]",
    "from-[#F9F7F5] to-[#F9FFFB]",
  ];
  const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }} // Slightly larger, more pronounced hover shadow
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        snap-start
        min-w-[180px]       
        sm:min-w-[220px]  
        md:min-w-[240px]
        lg:min-w-[260px]
        flex-shrink-0
        rounded-xl         /* Softer corner radius */
        shadow-lg
        border border-[#f0e9e0]
        overflow-hidden
        bg-gradient-to-br ${color}
        hover:border-[#c39a67]
        transition-all duration-300
      `}
      style={{ minHeight: 280 }} // Slightly increased minimum height for better look
    >
      <Link href={`/${categoryType}/${subcategorySlug}/${slug}`} className="block group">
        {/* Image Section */}
        <div className="relative w-full h-40 lg:h-44 overflow-hidden rounded-t-xl">
          <Image
            src={img}
            alt={item.title || "item"}
            fill
            style={{ objectFit: "cover" }}
            className="group-hover:scale-105 transform transition-transform duration-500"
            priority={false}
          />
          {/* Subtle image overlay */}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition duration-300"></div>
        </div>

        {/* Content Section */}
        <div className="p-4 md:p-5">
          <h4 className="font-serif text-base md:text-lg font-bold text-[#2f2620] mb-1 line-clamp-2">
            {item.title}
          </h4>
          <p className="text-sm text-[#7d6b52] line-clamp-2 mb-4">
            {item.metaDescription || item.content?.slice(0, 80) || "रचना का संक्षेप..."}
          </p>

          {/* Footer / Meta Data */}
          <div className="pt-3 border-t border-[#f0e9e0] flex items-center justify-between text-xs text-[#9b8a74]">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative rounded-full overflow-hidden bg-[#e9e2d8] flex items-center justify-center">
                {item.writer?.avatar ? (
                  <Image src={item.writer.avatar} alt={writerName} fill style={{ objectFit: "cover" }} />
                ) : (
                  <FiUser className="text-[#a09080]" size={14} />
                )}
              </div>
              <span className="font-medium text-[#4c3b2f] text-sm truncate max-w-[80px]">{writerName}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[#b84b4b]">
                <FiHeart size={14} />
                <span>{item.likeCount ?? item.likes?.length ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 text-[#c39a67]">
                <FiBookmark size={14} />
                <span>{item.bookmarkCount ?? item.bookmarks?.length ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};