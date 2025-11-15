"use client";
import { motion } from "framer-motion";
import KavyaListItem from "@/components/content/KavyaListItem"; 
import React from "react";

export function MotionKavyaList({ posts, rasSlug, rasTitle }) {
    
    if (posts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-10 mt-10 rounded-lg border-2 border-amber-300/50 bg-inky-charcoal/70"
            >
                <p className="text-2xl font-rozha text-amber-300/80">
                    क्षमा करें, **{rasTitle}** में कोई काव्य उपलब्ध नहीं है।
                </p>
                <p className="text-sm font-calligraphy text-antique-paper/70 mt-2">
                    कृपया अपनी Strapi सेटिंग्स और पोस्ट लिंक्स की जाँच करें।
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-12">
            {posts.map((post, index) => (
                <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, scale: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ type: "spring", stiffness: 90, delay: index * 0.1 }}
                    className={`w-full ${index % 2 === 0 ? 'text-left lg:pr-20' : 'text-right lg:pl-20'}`} 
                >
                    <KavyaListItem post={post} rasSlug={rasSlug} />
                </motion.div>
            ))}
        </div>
    );
}