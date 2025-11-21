"use client";

import React, { useState, useEffect } from "react";
import {
  FaBookOpen,
  FaFeatherAlt,
  FaHeadphones,
  FaGlobeAsia,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaSun,
  FaMoon,
  FaUserCircle,
} from "react-icons/fa";

const navItems = [
  { name: "Home", path: "/", icon: FaBookOpen },
  { name: "गद्य", path: "/gadhya", icon: FaFeatherAlt },
  { name: "काव्य", path: "/kavya", icon: FaFeatherAlt },
  { name: "भाषाएँ", path: "/languages", icon: FaGlobeAsia },
  { name: "ऑडियो", path: "/audio", icon: FaHeadphones },
  { name: "संपर्क", path: "/contact", icon: FaEnvelope },
];

export default function Header({ theme, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ COOKIE-BASED LOGIN DETECT
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
          { credentials: "include" }
        );

        const data = await res.json();
        if (data?.success) setUser(data.user);
        else setUser(null);
      } catch (error) {
        setUser(null);
      }
    };

    checkUser();
  }, []);

  // ✅ LOGOUT → COOKIE REMOVE
  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    window.location.href = "/login";
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        theme === "dark"
          ? "backdrop-blur-lg bg-gray-900/70 border-b border-gray-700 shadow-gray-800/50 shadow-sm"
          : "backdrop-blur-lg bg-white/70 border-b border-gray-200 shadow-gray-300/30 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-5 h-16">
        {/* LOGO */}
        <a
          href="/"
          className={`text-2xl font-bold flex items-center gap-2 ${
            theme === "dark" ? "text-amber-400" : "text-gray-900"
          }`}
        >
          <span className="text-3xl">✍️</span>
          <span className="font-playfair-display">
            Content{" "}
            <span
              className={`${
                theme === "dark" ? "text-amber-300" : "text-amber-600"
              }`}
            >
              Mohalla
            </span>
          </span>
        </a>

        {/* NAV */}
        <nav className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={`text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "text-gray-200 hover:text-amber-400"
                  : "text-gray-700 hover:text-amber-600"
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* RIGHT SECTION */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-1 rounded-full font-semibold transition"
            >
              Logout
            </button>
          ) : (
            <a
              href="/login"
              className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-1 rounded-full font-semibold transition"
            >
              Login
            </a>
          )}

          <a
            href="/bookmarks"
            className={`border px-3 py-1 rounded-full text-sm transition ${
              theme === "dark"
                ? "text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black"
                : "text-amber-700 border-amber-500 hover:bg-amber-500 hover:text-black"
            }`}
          >
            मेरा संकलन
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-transparent hover:bg-amber-500/20 transition"
            aria-label="toggle theme"
          >
            {theme === "dark" ? (
              <FaSun className="text-amber-300 w-5 h-5" />
            ) : (
              <FaMoon className="text-amber-600 w-5 h-5" />
            )}
          </button>

          {/* Profile */}
          {user && (
            <a href="/profile">
              <FaUserCircle
                className={`w-6 h-6 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              />
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-amber-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div
          className={`md:hidden flex flex-col items-center py-5 space-y-3 transition-all ${
            theme === "dark"
              ? "bg-gray-900 text-gray-100"
              : "bg-white text-gray-800"
          }`}
        >
          {navItems.map((i) => (
            <a
              key={i.name}
              href={i.path}
              className="hover:text-amber-500 transition"
              onClick={() => setIsOpen(false)}
            >
              {i.name}
            </a>
          ))}

          <div className="pt-3 flex gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-amber-500 text-black px-4 py-1 rounded-full hover:bg-amber-400 transition"
              >
                Logout
              </button>
            ) : (
              <a
                href="/login"
                className="bg-amber-500 text-black px-4 py-1 rounded-full hover:bg-amber-400 transition"
              >
                Login
              </a>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-amber-500/20 text-amber-400"
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
