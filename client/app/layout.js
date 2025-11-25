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
<html lang="en" className="font-body">
<body
className={`transition-all duration-500 ease-in-out min-h-screen ${
theme === "dark"
? "bg-[#0a0a0a] text-teal-200 shadow-[0_0_30px_#0ff3]"
: "bg-white text-[#222]"
}`}
>
<Header theme={theme} toggleTheme={toggleTheme} />
<SearchProvider>{children}</SearchProvider>
<Footer />


{showScrollTop && (
<button
onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
className={`fixed bottom-5 right-5 p-3 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 ${
theme === "dark"
? "bg-teal-600 text-black hover:bg-teal-500"
: "bg-orange-500 text-white hover:bg-orange-600"
}`}
>
<FaArrowUp />
</button>
)}
</body>
</html>
);
}