"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function KavyaPostListItem({ post, rasSlug }) {
  return (
    <Link href={`/kavya/${rasSlug}/${post.slug}`} passHref>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: "spring", stiffness: 150 }}
        className="p-6 mb-6 rounded-lg border-2 border-inky-charcoal/50 bg-antique-paper/90 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-kalighat-red/70"
        style={{
          backgroundImage: "url('/oldpaper.webp')",
          backgroundSize: "cover",
        }}
      >
        <h2 className="text-3xl font-playfair-display font-bold text-kalighat-red mb-2">
          {post.title}
        </h2>
        <p className="text-inky-charcoal text-base leading-relaxed font-rozha mb-3 line-clamp-2">
          {post.excerpt || post.title}
        </p>
        <p className="text-sm italic text-muted-saffron/80">
          लेखक: {post.author || "अज्ञात"}
        </p>
      </motion.div>
    </Link>
  );
}

