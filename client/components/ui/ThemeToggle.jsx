"use client";
import { useEffect, useState } from "react";
// Replaced react-icons/fa with Sun and Moon from lucide-react (already in use across the project)
import { Sun, Moon } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

// Ensure 'use client' is at the top for hooks and state management

export default function ThemeToggle() {
  // Use a state to track the dark mode status
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Check local storage and apply theme on initial load
    const savedTheme = localStorage.getItem("theme");
    // Also check system preference if no theme is saved
    const isDark = savedTheme === "dark" || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Set the initial state and attribute
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      setDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      setDark(false);
    }
  }, []); // Run only once on mount

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    
    if (isCurrentlyDark) {
      // Switch to Light
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      // Switch to Dark
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  // Using custom colors from your theme config for antique/classy look
  const trackBg = dark ? "bg-kalighat-indigo" : "bg-muted-saffron";
  const iconColor = dark ? "text-muted-saffron" : "text-inky-charcoal";

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${trackBg}`}
      whileTap={{ scale: 0.9 }}
      title={dark ? "लाइट मोड" : "डार्क मोड"}
    >
      <motion.div
        className={`absolute w-4 h-4 rounded-full bg-antique-paper flex items-center justify-center shadow-md`}
        animate={{ x: dark ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          {dark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              {/* Using Lucide Sun */}
              <Sun size={12} className={iconColor} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              {/* Using Lucide Moon */}
              <Moon size={12} className={iconColor} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}
