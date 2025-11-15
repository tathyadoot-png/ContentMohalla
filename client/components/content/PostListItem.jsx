"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Helper function to create a safe excerpt
// Inside your components/content/PostListItem.jsx file

// Helper function to create a safe excerpt (UPDATED)
const createExcerpt = (content) => {
    if (!content) return "सारांश उपलब्ध नहीं है।";

    let rawText = "";

    // 1. Check if the content is the Strapi Rich Text JSON structure (Blocks)
    if (Array.isArray(content)) {
        // Iterate through the JSON blocks (paragraphs, etc.)
        rawText = content.map(block => {
            if (block?.children && Array.isArray(block.children)) {
                // Extract and join text from all children nodes
                return block.children.map(child => child.text || "").join(" ");
            }
            return "";
        }).join(" ");
    } else if (typeof content === 'string') {
        // 2. If it's already a string (simple text field), use it directly
        rawText = content;
    } else {
        return "सारांश उपलब्ध नहीं है।";
    }

    // 3. Truncate the extracted raw text
    return rawText.substring(0, 150) + (rawText.length > 150 ? '...' : '');
};


// ... (The rest of your PostListItem component remains the same)

// Component for a single item in the list
export default function PostListItem({ post, vidhaSlug }) {
    
    // Safely get the title, slug, and create the excerpt
    const title = post.title || "अनाम रचना";
    const postSlug = post.slug || post.id;
    const excerptText = createExcerpt(post.content);
    const authorName = post.author || "अज्ञात"; // Assuming 'author' is a direct attribute

    return (
        <Link href={`/gadhya/${vidhaSlug}/${postSlug}`} passHref>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 150 }}
                className="p-6 mb-6 rounded-lg border-2 border-inky-charcoal/50 bg-antique-paper/90 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-kalighat-red/70"
                style={{
                    // Use your own background styles here
                    backgroundImage: "url('/oldpaper.webp')",
                    backgroundSize: "cover",
                }}
            >
                <h2 className="text-3xl font-playfair-display font-bold text-kalighat-red mb-2">{title}</h2>
                <p className="text-inky-charcoal text-base leading-relaxed font-devanagari mb-3 line-clamp-2">
                    {excerptText}
                </p>
                <p className="text-sm italic text-muted-saffron/80">लेखक: {authorName}</p>
            </motion.div>
        </Link>
    );
}