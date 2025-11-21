"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion"; // framer-motion import
// Cookies import is not strictly needed in the component's render/logic flow here

// --- Animation Variants (made a bit faster and simpler) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Slightly faster staggering
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const tabVariants = {
  initial: { opacity: 0, y: -5 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};
// --------------------------------------------------------

export default function MyCreations() {
  const [poems, setPoems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState("gadhya");
  const [loading, setLoading] = useState(true);

  const tabs = ["gadhya", "kavya", "audio"];

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchMyPoems = async () => {
      // ... (Rest of your fetching logic remains the same)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/poems/my-poems`,
          {
            credentials: "include",
            method: "GET",
          }
        );

        const data = await res.json();
        if (data.success) {
          setPoems(data.data);
          filterPosts("gadhya", data.data);
        }
      } catch (err) {
        console.log("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPoems();
  }, []);

  // --- Filtering Logic ---
  const filterPosts = (type, list = poems) => {
    setActiveTab(type);

    let result = [];
    if (type === "gadhya") {
      result = list.filter((p) => p.category?.toLowerCase() === "gadhya");
    } else if (type === "kavya") {
      result = list.filter((p) => p.category?.toLowerCase() === "kavya");
    } else if (type === "audio") {
      result = list.filter((p) => p.audio?.url); // audio available
    }

    setFiltered(result);
  };
  // -------------------------

  if (loading) {
    return (
      <p className="text-center mt-12 font-medium text-base text-gray-500 animate-pulse">
        Loading Creations...
      </p>
    );
  }

  return (
    // Max width and center alignment for sleek, contained look
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12"> 
      
      {/* Sleek Heading */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">
        My Creations
      </h2>

      {/* Tabs with Minimal Styling and Framer Motion */}
      <motion.div
        className="flex gap-2 sm:gap-3 mb-8 justify-start"
        initial="initial"
        animate="animate"
        variants={tabVariants}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab}
            onClick={() => filterPosts(tab)}
            className={`
              px-4 sm:px-5 py-1.5 text-sm rounded-lg font-semibold transition-all duration-200 ease-in-out
              ${
                activeTab === tab
                  ? "bg-orange-600 text-white shadow-md shadow-orange-300/50" // Sleek primary color
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50" // Minimal hover
              }
            `}
            whileHover={{ scale: 1.05 }} // Subtle hover scale
            whileTap={{ scale: 0.98 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Post List */}
      {filtered.length === 0 ? (
        <motion.p
          className="text-gray-400 text-center text-lg mt-12 p-8 border border-dashed border-gray-200 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          No <span className="font-bold text-orange-500">{activeTab}</span> posts found. Start writing!
        </motion.p>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6" // More compact grid
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((poem) => (
            <motion.div
              key={poem._id}
              variants={cardVariants}
              whileHover={{
                scale: 1.02, // Very subtle lift
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)", // Light shadow
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }} // Quick and springy transition
            >
              <Link
                href={`/${poem.category.toLowerCase().replace(/\s+/g, "-")}/${poem.subcategory.toLowerCase().replace(/\s+/g, "-")}/${poem.slug}`}
                className="block h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 group border border-gray-50" // Minimal styling
              >
                {/* Image - Smaller aspect ratio for compact look */}
                <div className="w-full h-32 sm:h-40 bg-gray-100 relative overflow-hidden"> 
                 <Image
  src={poem.image?.url || "/placeholder-image.jpg"}
  alt={poem.title || "Creation Image"}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
/>

                  {/* Category/Audio Indicator Overlay */}
                 
                </div>

                <div className="p-3 sm:p-4">
                  
                  {/* Title */}
                  <h3 className="font-semibold text-base text-gray-800 line-clamp-2 min-h-[3rem]"> 
                    {poem.title || "Untitled Creation"}
                  </h3>

                  {/* Badge & Writer (Compact Layout) */}
                  <div className="flex items-center justify-between mt-3 text-xs">
                    
                    {/* Badge */}
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">
                      {poem.languages?.[0]?.subLanguageName || "General"}
                    </span>

                    {/* Writer Avatar */}
                    <div className="flex items-center gap-1">
                      <Image
                        src={poem.writerId?.avatar || "/default-avatar.png"}
                        width={20}
                        height={20}
                        className="rounded-full border border-gray-200 object-cover aspect-square"
                        alt="writer avatar"
                      />
                      <p className="text-gray-500 line-clamp-1 hidden sm:block">
                        {poem.writerId?.fullName || "Writer"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}