"use client";
import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { SearchProvider } from "@/context/SearchContext";
import "../styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RootLayout({ children }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const active = saved || (prefersDark ? "dark" : "light");
    setTheme(active);
    document.documentElement.classList.toggle("dark", active === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <html lang="en">
      <body
        className={`m-0 p-0 transition-all duration-500 ease-in-out ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100"
            : "bg-[url('/bg4.png')] bg-cover bg-fixed bg-center text-gray-900"
        }`}
      >
        <Header theme={theme} toggleTheme={toggleTheme} />
        <SearchProvider>{children}</SearchProvider>
        <Footer />

        {/* scroll to top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-5 right-5 bg-amber-500 text-white p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-transform duration-300"
          >
            <FaArrowUp />
          </button>
        )}
      </body>
    </html>
  );
}
