"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function WriterProfile({ params }) {
  const { id } = params;

  const [activeTab, setActiveTab] = useState("All");
  const [writer, setWriter] = useState(null);
  const [poems, setPoems] = useState([]);

  // Fetch writer + poems on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const writerRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/writer/${id}`
        );
        const writerData = await writerRes.json();
        setWriter(writerData?.writer);

        const poemsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/writer/writer/${id}`
        );
        const poemsList = await poemsRes.json();
        setPoems(poemsList);
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, [id]);

  // Filter poems
  const filteredPoems =
    activeTab === "All"
      ? poems
      : poems.filter((p) =>
          activeTab === "Audio"
            ? p.audio?.url
            : p.category?.toLowerCase() === activeTab.toLowerCase()
        );

  // Stats
  const poemsCount = poems?.length || 0;
  const gadhyaCount = poems?.filter((p) => p.category === "Gadhya").length || 0;
  const kavyaCount = poems?.filter((p) => p.category === "Kavya").length || 0;
  const audioCount = poems?.filter((p) => p.audio?.url).length || 0;

  if (!writer) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen dark:bg-[#071126] text-center">

      {/* Background Cover */}
      <div className="w-full h-52 sm:h-72 md:h-80 rounded-b-3xl 
        bg-gradient-to-r from-[#F6A760]/90 to-[#F29E7A]/60"
      />

      {/* Header Section */}
      <div className="-mt-20">
        <img
          src={writer?.avatar || "https://i.pravatar.cc/200"}
          className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white shadow-xl object-cover mx-auto"
        />

        {/* Name */}
        <h1 className="text-3xl font-bold mt-4 dark:text-white">
          <span className="text-gray-400 font-medium">{writer?.fullName}</span>
          {writer?.penName && (
            <span className="text-gray-400 font-medium"> ({writer.penName})</span>
          )}
        </h1>

        {/* Tagline */}
        {writer?.tagline && (
          <p className="text-[#8B1E3F] mt-1 font-medium">{writer.tagline}</p>
        )}

        {/* Profession + Location */}
        <div className="flex justify-center gap-3 text-gray-500 mt-2">
          {writer?.profession && <span>{writer.profession}</span>}
          {writer?.location && <span>{writer.location}</span>}
        </div>

        {/* Bio */}
        {writer?.bio && (
          <p className="max-w-xl mx-auto text-gray-600 mt-4">{writer.bio}</p>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-10 mt-6">
          {[
            { label: "Poems", value: poemsCount },
            { label: "Gadhya", value: gadhyaCount },
            { label: "Kavya", value: kavyaCount },
            { label: "Audio", value: audioCount },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-[#E76F51]">{stat.value}</p>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ⭐ Tab Pills Working ⭐ */}
        <div className="flex justify-center gap-3 mt-10">
          {["All", "Gadhya", "Kavya", "Audio"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                ${
                  activeTab === tab
                    ? "bg-[#E76F51] text-white shadow"
                    : "bg-gray-100 text-gray-600 dark:bg-[#0d1a2a] dark:text-gray-300"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Section Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white 
        mt-12 mb-6 border-b border-gray-100 pb-2 mx-auto w-fit"
      >
        {activeTab} Creations
      </h2>

      {/* Poems Grid */}
      {filteredPoems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
          lg:grid-cols-5 gap-4 sm:gap-6 max-w-7xl mx-auto px-4 mb-20"
        >
          {filteredPoems.map((p) => (
            <a
              key={p._id}
                  href={`/${p.category.toLowerCase().replace(/\s+/g, "-")}/${p.subcategory.toLowerCase().replace(/\s+/g, "-")}/${p.slug}`}
              className="block bg-white rounded-xl overflow-hidden shadow-sm 
                hover:shadow-md transition duration-300 border border-gray-50"
            >
              <div className="w-full h-32 sm:h-40 bg-gray-100 relative">
                <Image
                  src={p.image?.url || "/placeholder-image.jpg"}
                  alt={p.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-base text-gray-800 line-clamp-2 min-h-[3rem]">
                  {p.title}
                </h3>

                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 
                  rounded-full font-medium text-xs mt-2 inline-block"
                >
                  {p.languages?.[0]?.subLanguageName || p.category}
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-10 text-lg">No {activeTab} creations.</p>
      )}
    </div>
  );
}
