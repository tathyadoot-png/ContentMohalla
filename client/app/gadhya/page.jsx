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
        className={`group relative w-full lg:w-5/12 p-1 shadow-2xl rounded-lg border-4 border-muted-saffron/70 transition-all duration-300 hover:shadow-muted-saffron/70`}
        style={{
          boxShadow: isLeft
            ? "15px 15px 0 0 var(--color-inky-charcoal), 0 0 30px var(--color-muted-saffron)"
            : "-15px 15px 0 0 var(--color-inky-charcoal), 0 0 30px var(--color-muted-saffron)",
        }}
      >
        <div
          className={`flex items-stretch rounded-lg overflow-hidden p-4 gap-4`}
          style={{
            backgroundImage: "url('/oldpaper.webp')",
            backgroundSize: "cover",
            backgroundColor: "var(--color-antique-paper)",
          }}
        >
          <div
            className={`w-2/5 h-44 overflow-hidden relative ${
              isLeft ? "order-2" : "order-1"
            }`}
          >
            <div className="absolute inset-0 bg-inky-charcoal/30 z-10"></div>
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          <div
            className={`w-3/5 flex flex-col justify-center p-0 ${
              isLeft ? "order-1" : "order-2"
            }`}
          >
            <h3 className="text-sm font-semibold mb-1 text-muted-saffron tracking-wider uppercase">
              {item.era}
            </h3>
            <h2 className="text-3xl font-playfair-display font-extrabold text-kalighat-red mb-2 border-b border-kalighat-indigo/50 pb-1">
              {item.title}
            </h2>
            <p className="text-inky-charcoal text-sm leading-snug line-clamp-5 reading-body font-rozha">
              {item.description}
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-0 h-full w-4 bg-muted-saffron/70 z-0">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-10 w-10 bg-kalighat-red rounded-full border-4 border-antique-paper shadow-2xl"></div>
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
          <div className="absolute inset-0 bg-kalighat-red/90 rounded-lg border-4 border-muted-saffron shadow-xl"></div>
          <div className="relative z-10">
            <h1 className="text-6xl font-handwriting font-extrabold text-kalighat-red tracking-wide drop-shadow-lg pb-3 inline-block">
              गद्य विधाओं का विकास-क्रम
            </h1>
            <p className="text-center text-kalighat-indigo mt-3 text-xl leading-8 max-w-4xl mx-auto font-calligraphy">
              हिंदी साहित्य में गद्य की प्रमुख विधाएँ, उनके उद्भव और विकास के क्रम में यहाँ सचित्र प्रस्तुत हैं।
            </p>
          </div>
        </motion.header>

        {/* Roadmap Items */}
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-4 bg-muted-saffron z-0 lg:w-2"></div>

          {vidhaye.map((item, index) => (
            <RoadmapItem
              key={item.slug}
              item={item}
              index={index}
              onClick={handleItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
