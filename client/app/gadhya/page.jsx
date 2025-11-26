"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Roadmap data with slugs matching your Strapi posts
const vidhaye = [
  {
    title: "निबंध",
    slug: "nibandh",
    description:
      "निबंध एक विचारात्मक गद्य विधा है जिसमें लेखक किसी विषय पर अपने विचार, तर्क और अनुभव प्रस्तुत करता है।",
    image: "/vidha1.png",
    position: "left",
    era: "आधुनिक काल (आरंभिक)",
  },
  {
    title: "कहानी",
    slug: "kahani",
    description:
      "कहानी कल्पना और यथार्थ का सुंदर मिश्रण होती है, जिसमें पात्रों और घटनाओं के माध्यम से जीवन का चित्रण किया जाता है।",
    image: "/vidha2.png",
    position: "right",
    era: "मध्य आधुनिक काल",
  },
  {
    title: "उपन्यास",
    slug: "upanyas",
    description:
      "उपन्यास एक विस्तृत गद्य रचना है जिसमें किसी व्यक्ति, समाज या घटना का गहराई से वर्णन किया जाता है।",
    image: "/vidha3.png",
    position: "left",
    era: "आधुनिक काल (परवर्ती)",
  },
  {
    title: "नाटक",
    slug: "natak",
    description:
      "नाटक संवाद प्रधान विधा है जिसे मंच पर प्रस्तुत किया जाता है — इसमें अभिनय, संवाद और दृश्य प्रभाव मुख्य हैं।",
    image: "/vidha4.png",
    position: "right",
    era: "वर्तमान संदर्भ",
  },
  {
    title: "जीवनी / आत्मकथा",
    slug: "jeevani-autobiography",
    description:
      "जीवनी और आत्मकथा में किसी व्यक्ति के जीवन का सजीव वर्णन किया जाता है — आत्मकथा में लेखक स्वयं अपना जीवन बताता है।",
    image: "/vidha6.png",
    position: "left",
    era: "आत्मानुभूति",
  },
  {
    title: "संस्मरण",
    slug: "sansmaran",
    description:
      "संस्मरण में लेखक अपने अनुभवों, घटनाओं और स्मृतियों को भावनात्मक रूप में व्यक्त करता है।",
    image: "/vidha5.png",
    position: "right",
    era: "स्मृति आधारित",
  },
];

// Animation variants for left/right
const itemVariants = (position) => ({
  hidden: { opacity: 0, x: position === "left" ? -150 : 150 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 12,
    },
  },
});

// Single roadmap item
const RoadmapItem = ({ item, index, onClick }) => {
  const isLeft = item.position === "left";

  return (
    <motion.div
      variants={itemVariants(item.position)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.15 }}
      className={`relative mb-24 flex items-center w-full cursor-pointer ${
        isLeft ? "lg:justify-start" : "lg:justify-end"
      }`}
      onClick={() => onClick(item)}
    >
      <div
        className={`group relative w-full lg:w-5/12 p-1 rounded-lg transition-all duration-300`}
        style={{
          boxShadow: isLeft
            ? "15px 15px 0 0 rgba(17,16,19,0.06), 0 0 30px rgba(255,107,0,0.12)"
            : "-15px 15px 0 0 rgba(17,16,19,0.06), 0 0 30px rgba(255,107,0,0.12)",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "var(--primary)",
          backgroundClip: "padding-box",
        }}
      >
        <div
          className={`flex items-stretch rounded-lg overflow-hidden p-4 gap-4`}
          style={{
            backgroundImage: "url('/oldpaper.webp')",
            backgroundSize: "cover",
            backgroundColor: "var(--bg)",
          }}
        >
          <div
            className={`w-2/5 h-44 overflow-hidden relative ${isLeft ? "order-2" : "order-1"}`}
          >
            <div className="absolute inset-0 bg-black/20 z-10 dark:bg-black/30"></div>
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          <div
            className={`w-3/5 flex flex-col justify-center p-0 ${isLeft ? "order-1" : "order-2"}`}
          >
            <h3 className="text-sm font-semibold mb-1 text-gray-700 tracking-wider uppercase font-devanagari">
              {item.era}
            </h3>
            <h2 className="text-3xl font-playfair-display font-extrabold mb-2  text-gray-700 border-b border-primary/30 pb-1 font-devanagari">
              {item.title}
            </h2>
            <p className="text-gray-700  text-sm leading-snug line-clamp-5 reading-body font-rozha">
              {item.description}
            </p>
          </div>
        </div>
      </div>

      {/* Center timeline column with orange circle node */}
      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-0 h-full w-4 z-0">
        {/* vertical track */}
        <div className="w-full bg-primary/60 rounded" />
        {/* orange circle centered on this item */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary flex items-center justify-center z-20"
             style={{
               border: "4px solid var(--bg)",
               boxShadow: "0 6px 18px rgba(255,107,0,0.18)",
             }}
        >
          {/* inner small dot for visual depth */}
          <div className="h-3 w-3 rounded-full bg-white dark:bg-[#141414]" />
        </div>
      </div>
    </motion.div>
  );
};

// Main Roadmap Component
export default function GadhyaRoadmap() {
  const router = useRouter();

  const handleItemClick = (item) => {
    // Navigate to Strapi-based dynamic post page
    router.push(`/gadhya/${item.slug}`);
  };

  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center py-20 px-6 relative">
      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 relative py-8 max-w-4xl mx-auto"
        >
          <div className="absolute inset-0 rounded-lg border-2" style={{ borderColor: "var(--primary)", backgroundColor: "transparent", boxShadow: "0 10px 30px rgba(255,107,0,0.08)" }}></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-500 tracking-wide pb-3 inline-block font-devanagari">
              गद्य विधाओं का विकास-क्रम
            </h1>
            <p className="text-center  dark:text-gray-300 mt-3 text-xl text-primary leading-8 max-w-4xl mx-auto font-devanagari">
              हिंदी साहित्य में गद्य की प्रमुख विधाएँ, उनके उद्भव और विकास के क्रम में यहाँ सचित्र प्रस्तुत हैं।
            </p>
          </div>
        </motion.header>

        {/* Roadmap Items */}
        <div className="relative">
          {/* center vertical line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-4 z-0">
            <div className="w-full bg-primary/50 rounded" />
          </div>

          {vidhaye.map((item, index) => (
            <RoadmapItem key={item.slug} item={item} index={index} onClick={handleItemClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
