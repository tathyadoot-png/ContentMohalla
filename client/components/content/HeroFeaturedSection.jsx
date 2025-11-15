// components/FeaturedPoemsSimple.jsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
import img5 from "../../public/oldpaper.webp"; // old paper bg

const poems = [
  {
    id: 1,
    writer: "🖋 सूरदास",
    lines: [
      "मैया! मोहि दाऊ बहुत खिझायो।",
      "मोसों कहत, तू कहाँ गयो?",
      "काहे नाइन आँसू ढरकायो?"
    ],
  },
  {
    id: 2,
    writer: "🖋 रहीम",
    lines: [
      "रहिमन धागा प्रेम का,",
      "मत तोड़ो चटकाय।",
      "टूटे से फिर ना जुड़े,",
      "जुड़े गाँठ पड़ जाय॥"
    ],
  },
  {
    id: 3,
    writer: "🖋   कबीर",
    lines: [
      "बुरा जो देखन मैं चला,",
      "बुरा न मिलिया कोय।",
      "जो दिल खोजा आपना,",
      "मुझसे बुरा न कोय।"
    ],
  },
];

export default function FeaturedPoemsSimple({
  className = "",
  cardMinHeight = "h-56 md:h-64 lg:h-72",
}) {
  return (
    <section
      aria-label="Featured poems"
      className={`w-full py-8 ${className}`}
      style={{ backgroundColor: "rgba(255,248,240,0.9)" }} // subtle warm bg
    >
      <div className="max-w-full mx-auto px-4">
        {/* ===== Header (matches HomeSections width & style) ===== */}
        <div className="w-[96%] lg:w-[88%] mx-auto md:pt-2 pt-4 flex items-end justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-6 transition-all">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div
                className="
                  w-14 h-14 rounded-full 
                  bg-amber-50
                  border border-amber-500/80
                  flex items-center justify-center 
                  shadow-md
                  transition-all duration-500
                "
              >
                <FiTrendingUp
                  className="text-amber-800 stroke-2"
                  size={24}
                />
              </div>
            </div>

            <div>
              <h2
                className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight"
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              >
               Indian Poetic Heritage
              </h2>
              <p className="mt-1 text-sm md:text-base text-gray-600 font-medium">
                Handpicked — क्लासिक पद
              </p>
            </div>
          </div>
        </div>

        {/* ===== Grid: 3 equal columns on md+; cards full-width inside each column ===== */}
        <div className="w-[96%] lg:w-[88%] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {poems.map((p, idx) => (
              <motion.article
                key={p.id}
                className="relative overflow-hidden rounded border border-gray-200"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                whileHover={{ translateY: -6 }}
              >
                {/* background image fills whole card; centered poem box */}
                <div
                  className={`${cardMinHeight} w-full bg-cover bg-center flex items-center justify-center`}
                  style={{
                    backgroundImage: `url(${img5.src})`,
                  }}
                >
                  <div
                    className="px-6 md:px-8 text-center"
                    style={{
                      width: "100%",
                      maxWidth: "560px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Noto Sans Devanagari', serif",
                        lineHeight: 1.85,
                      }}
                    >
                      {p.lines.map((ln, i) => (
                        <p
                          key={i}
                          className="text-gray-900 text-base md:text-lg font-medium"
                          style={{ margin: 0 }}
                        >
                          {ln}
                        </p>
                      ))}
                    </div>

                    <div
                      className="mt-4 text-sm md:text-base font-semibold text-gray-700"
                      style={{ fontFamily: "'Noto Sans Devanagari', serif" }}
                    >
                      — {p.writer}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
