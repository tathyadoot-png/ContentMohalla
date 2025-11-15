"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { parseStrapiContent, getStrapiMedia } from "@/lib/strapi-api";

export default function PostPage({ params }) {
  const { slug } = params;
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1337/api/posts?filters[slug][$eq]=${slug}&populate=*`
        );

        if (res.data.data.length) {
          const fetchedPost = res.data.data[0];
          setPost(fetchedPost);
        }
      } catch (error) {
        console.error("Error fetching single post:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (isLoading)
    return (
      <p className="text-center py-20 text-xl font-rozha">
        रचना लोड हो रही है...
      </p>
    );

  if (!post)
    return (
      <p className="text-center py-20 text-xl font-rozha text-red-600">
        यह रचना उपलब्ध नहीं है।
      </p>
    );

  // Extract category/ras/vidhaye safely
  const categoryData = post.category?.data?.attributes;
  const categoryType = categoryData?.type || "kavya"; // "kavya" or "gadhya"
  const categorySlug = categoryData?.slug || "unknown"; // Ras or Vidhaye slug
  const categoryName = categoryData?.name || "अज्ञात";

  const renderedContent = parseStrapiContent(post.content);
  const imageUrl = post.featuredImage?.data?.attributes?.url
    ? getStrapiMedia(post.featuredImage.data.attributes.url)
    : null;

  return (
    <main className="min-h-screen py-16 px-4 md:px-8 lg:px-16 bg-antique-paper relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/oldpaper-texture.webp')] bg-cover"></div>

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Back Link */}
        <Link
          href={`/${categoryType}/${categorySlug}`}
          className="inline-flex items-center mb-6 text-lg font-semibold text-kalighat-indigo hover:text-amber-700 transition-colors"
        >
          &larr; {categoryType === "kavya" ? "रस संग्रह" : "विधा संग्रह"} वापस
        </Link>

        {/* Post Container */}
        <div className="bg-[#fffaf2] shadow-2xl rounded-xl border-4 border-amber-600/70 overflow-hidden">
          {/* Header */}
          <header className="p-6 border-b-4 border-kalighat-indigo/50 text-center">
            <h1 className="text-5xl font-playfair-display font-extrabold text-kalighat-indigo mb-2 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl font-handwriting text-inky-charcoal/80">
              कवि: {post.author || "ज्ञात नहीं"}
            </p>
            <span className="text-sm font-semibold text-muted-saffron uppercase block mt-1">
              {categoryType === "kavya" ? "रस" : "विधा"}: {categoryName}
            </span>
          </header>

          {/* Featured Image */}
          {imageUrl && (
            <div className="w-full h-80 bg-gray-200 overflow-hidden border-t-2 border-b-2 border-muted-saffron/70">
              <img
                src={imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <div
            className="p-6 reading-body text-inky-charcoal text-xl font-rozha leading-relaxed space-y-4 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>
      </div>
    </main>
  );
}
