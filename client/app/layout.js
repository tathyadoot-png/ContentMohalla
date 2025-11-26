"use client";
import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { SearchProvider } from "@/context/SearchContext";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function RootLayout({ children }) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // load theme: prefer saved, then system
    const saved = typeof window !== "undefined" && localStorage.getItem("theme");
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
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
    const onScroll = () => setShowScrollTop(window.scrollY > 450);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // global gsap reveal for elements with .gsap-reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".gsap-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            stagger: 0.08,
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <html lang="hi" className="font-body">
      <body className={`transition-all duration-400 ease-in-out min-h-screen`}>
        <Header theme={theme} toggleTheme={toggleTheme} />
        <SearchProvider>{children}</SearchProvider>
        <Footer />

        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-5 right-5 p-3 rounded-full shadow-lg transition-transform duration-300 ${
              theme === "dark" ? "bg-black text-orange-400 border border-orange-600" : "bg-orange-500 text-white"
            }`}
            aria-label="scroll to top"
          >
            <FaArrowUp />
          </button>
        )}
      </body>
    </html>
  );
}
