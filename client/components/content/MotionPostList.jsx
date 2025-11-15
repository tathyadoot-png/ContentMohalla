"use client";
import { motion } from "framer-motion";
import PostListItem from "@/components/content/PostListItem"; 
import React from "react";

// Client component wrapper for the actual list
export function MotionPostList({ posts, vidhaSlug, vidhaTitle }) {
    
    // Fallback message for no posts
    if (posts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-10 mt-10 rounded-lg border-2 border-muted-saffron bg-inky-charcoal/70"
            >
                <p className="text-2xl font-rozha text-amber-300/80">
                    क्षमा करें, **{vidhaTitle}** विधा में कोई पोस्ट उपलब्ध नहीं है।
                </p>
                <p className="text-sm font-calligraphy text-antique-paper/70 mt-2">
                    कृपया सुनिश्चित करें कि Strapi में पोस्ट प्रकाशित हैं और `nibandh` जैसी कैटेगरी के साथ सही ढंग से जुड़े हुए हैं।
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-10">
            {posts.map((post, index) => (
                <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ type: "spring", stiffness: 80, delay: index * 0.1 }}
                    // Apply a width restriction and alternating placement for the timeline look
                    className={`w-full ${index % 2 === 0 ? 'lg:pr-40' : 'lg:pl-40'}`} 
                >
                    {/* PostListItem needs to be imported and styled to fit this antique look */}
                    <PostListItem post={post} vidhaSlug={vidhaSlug} />
                </motion.div>
            ))}
        </div>
    );
}