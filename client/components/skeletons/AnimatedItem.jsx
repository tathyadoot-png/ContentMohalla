// components/AnimatedItem.jsx
"use client"; // ⚠️ Client Component

import { motion } from "framer-motion";
import Image from "next/image";

export default function AnimatedItem({ post, index, position = "left" }) {
  const isLeft = position === "left";

  const variants = {
    hidden: { opacity: 0, x: isLeft ? -150 : 150 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 90, damping: 12 },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.15 }}
      className={`relative mb-24 flex items-center w-full ${
        isLeft ? "lg:justify-start" : "lg:justify-end"
      }`}
    >
      <div
        className={`group relative w-full lg:w-5/12 p-1 shadow-2xl rounded-lg border-4 border-muted-saffron/70 transition-all duration-300 hover:shadow-muted-saffron/70`}
      >
        <div
          className="flex items-stretch rounded-lg overflow-hidden p-4 gap-4"
          style={{
            backgroundImage: "url('/oldpaper.webp')",
            backgroundSize: "cover",
            backgroundColor: "var(--color-antique-paper)",
          }}
        >
          {post.attributes.thumbnail?.data?.attributes.url && (
            <div
              className={`w-2/5 h-44 overflow-hidden relative ${
                isLeft ? "order-2" : "order-1"
              }`}
            >
              <div className="absolute inset-0 bg-inky-charcoal/30 z-10"></div>
              <Image
                src={post.attributes.thumbnail.data.attributes.url}
                alt={post.attributes.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          )}

          <div
            className={`w-3/5 flex flex-col justify-center p-0 ${
              isLeft ? "order-1" : "order-2"
            }`}
          >
            <h3 className="text-sm font-semibold mb-1 text-muted-saffron tracking-wider uppercase">
              {post.attributes.category?.data?.attributes.name || "Uncategorized"}
            </h3>
            <h2 className="text-3xl font-playfair-display font-extrabold text-kalighat-red mb-2 border-b border-kalighat-indigo/50 pb-1">
              {post.attributes.title}
            </h2>
            <p className="text-inky-charcoal text-sm leading-snug line-clamp-10 reading-body font-rozha">
              {post.attributes.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
