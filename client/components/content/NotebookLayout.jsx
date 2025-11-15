"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { flattenStrapiResponse, getStrapiMedia } from "@/lib/strapi-api";

const STRAPI_API_BASE = "http://127.0.0.1:1337";
const API_URL = `${STRAPI_API_BASE}/api`;

const AllPostsGrid = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const url = `${API_URL}/posts?sort=createdAt:desc&populate=*&pagination[limit]=500`;
        const res = await fetch(url);
        const data = await res.json();
        const flattenedPosts = flattenStrapiResponse(data);
        setPosts(flattenedPosts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const getImageUrl = (post) => {
    const imageObject = post.featuredImage?.[0];
    const url = imageObject?.url;
    return url ? getStrapiMedia(url) : "/placeholder.jpg";
  };

  return (
    <section className="py-16">
      <div className="w-[90%] md:w-[80%] lg:w-[70%] mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold font-playfair-display text-[#3b2f1e] mb-8 text-center">
          {/* सभी रचनाएँ */}
        </h2>

        {loading ? (
          <p className="text-center text-[#7d6b52]">सामग्री लोड हो रही है...</p>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => {
              const categoryType = post.category?.type || "kavya"; // kavya or gadhya
              const subcategorySlug = post.category?.slug || "unknown"; // ras or vidhaye

              return (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.03 }}
                  className="border border-[#e6d9b8] rounded-xl shadow-sm hover:shadow-md bg-[#fffaf2] overflow-hidden"
                >
                  <Link href={`/${categoryType}/${subcategorySlug}/${post.slug}`}>
                    <div className="relative w-full h-48">
                      <Image
                        src={getImageUrl(post)}
                        alt={post.title || "Post image"}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-t-xl"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-lg text-[#3c2e1c] mb-1 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[#5a4630] line-clamp-2">
                        {post.metaDescription || post.content?.substring(0, 50) || "कहानी या कविता का अंश..."}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-[#7d6b52]"></p>
        )}
      </div>
    </section>
  );
};

export default AllPostsGrid;
