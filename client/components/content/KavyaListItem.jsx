"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Helper function to safely extract text from the Strapi Rich Text Blocks
const createExcerpt = (content) => {
    if (!content) return "सारांश उपलब्ध नहीं है।";
    let rawText = "";

    // Safely parse the Rich Text JSON structure (Array of Blocks)
    if (Array.isArray(content)) {
        rawText = content.map(block => {
            if (block?.children && Array.isArray(block.children)) {
                // Extract and join plain text from all children nodes
                return block.children.map(child => child.text || "").join(" ");
            }
            return "";
        }).join(" ");
    } else if (typeof content === 'string') {
        // If it's already a string (simple text field), use it directly
        rawText = content;
    } else {
        return "सारांश उपलब्ध नहीं है।";
    }
    
    // Truncate the text for the summary display
    return rawText.substring(0, 150) + (rawText.length > 150 ? '...' : '');
};


export default function KavyaListItem({ post, rasSlug }) {
    
    const title = post.title || "अनाम काव्य";
    const postSlug = post.slug || post.id;
    const excerptText = createExcerpt(post.content);
    const authorName = post.author || "अज्ञात कवि"; 

    return (
        <Link href={`/kavya/${rasSlug}/${postSlug}`} passHref>
            <div
                className="p-6 rounded-lg border-4 border-amber-600/70 bg-antique-paper/95 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-kalighat-red/90 cursor-pointer"
                style={{
                    backgroundImage: "url('/oldpaper.webp')",
                    backgroundSize: "cover",
                    boxShadow: "0 0 15px var(--color-amber-600)", 
                }}
            >
                <h2 className="text-4xl font-playfair-display font-bold text-kalighat-indigo mb-2 border-b border-kalighat-indigo/50 pb-1">
                    {title}
                </h2>
                <p className="text-inky-charcoal text-base leading-relaxed font-rozha mb-3 line-clamp-3">
                    {excerptText}
                </p>
                <p className="text-sm italic text-muted-saffron/90 mt-2 text-right">
                    रचनाकार: {authorName}
                </p>
            </div>
        </Link>
    );
}