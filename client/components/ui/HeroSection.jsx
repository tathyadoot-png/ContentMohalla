"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const bgImages = [
  "/img5.png",
  "/img2.png",
  "/img4.png",
  "/img1.png",
  "/img3.png",
];
const floatingImages = Array.from({ length: 14 }, (_, i) => `/img${i + 6}.png`);

const HeroSection = () => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const title = "साहित्य और कला का संगम".split(" ");

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden flex items-center justify-center">
      {/* Background */}
      <motion.div
        key={currentBg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${bgImages[currentBg]})` }}
      />

      {/* Strong overlay for text clarity */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 backdrop-blur-[1px]"></div>

      {/* Floating reel images (hidden on mobile) */}
      <div className="absolute inset-0 justify-between items-start px-6 hidden md:flex">
        {/* Left Reel */}
        <div className="flex flex-col space-y-6 mt-4">
          {floatingImages
            .filter((_, i) => i % 2 === 0)
            .map((img, i) => (
              <motion.img
                key={i}
                src={img}
                className="w-24 md:w-32 opacity-40"
                animate={{ y: [0, 15, 0] }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
        </div>

        {/* Right Reel */}
        <div className="flex flex-col space-y-6 mt-6">
          {floatingImages
            .filter((_, i) => i % 2 !== 0)
            .map((img, i) => (
              <motion.img
                key={i}
                src={img}
                className="w-24 md:w-32 opacity-40"
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
        </div>
      </div>

      {/* Hero Text */}
      <div className="relative z-10 text-center px-4 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-playfair-display text-yellow-100 leading-snug drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        >
          {title.map((word, i) => (
            <span key={i} className="inline-block mx-1 font-rozha">
              {word}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-4 sm:mt-5 text-sm sm:text-base md:text-xl text-gray-100  font-handwriting  drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]"
        >
          आपकी भाषा आपका मंच
        </motion.p>

        <motion.a
          href="/archive"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-6 sm:mt-8 inline-block px-5 sm:px-8 md:px-10 py-2 
             text-sm  font-calligraphy 
             bg-yellow-500 text-black font-semibold rounded-full 
             shadow-lg hover:scale-105 hover:bg-yellow-400 
             transition-all duration-300"
        >
          पढ़ना शुरू करें
        </motion.a>
      </div>
    </section>
  );
};

export default HeroSection;
