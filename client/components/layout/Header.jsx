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

import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import SearchOverlay from "../content/SearchOverlay";
import logo from "../../public/logo.png";
import { LuBookmarkPlus } from "react-icons/lu";
import { HiOutlineLogout, HiOutlineLogin } from "react-icons/hi";

const navItems = [
  { name: "Home", path: "/", icon: FaBookOpen },
  { name: "गद्य", path: "/gadhya", icon: FaFeatherAlt },
  { name: "काव्य", path: "/kavya", icon: FaFeatherAlt },
  { name: "बोली", path: "/languages", icon: FaGlobeAsia },
  { name: "ऑडियो", path: "/audio", icon: FaHeadphones },
  { name: "संपर्क", path: "/contact", icon: FaEnvelope },
];

export default function Header({ theme, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Change this to adjust when header should switch styles (in px)
  const SCROLL_THRESHOLD = 60;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data?.success) setUser(data.user);
      } catch {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    // add scroll listener to toggle isScrolled
    const onScroll = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // run once to set initial state (useful on page refresh with scroll)
    if (typeof window !== "undefined") onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "backdrop-blur-sm bg-white/80 dark:bg-black/70 shadow-md" : "bg-transparent"
          }`}
        // optional: add aria
        role="banner"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-5 h-20">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <img src={logo.src} alt="Logo" className="w-16 h-20 object-contain" />
          </a>

          {/* NAV LINKS */}
          <nav className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="nav-link-item text-[16px]"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="hidden md:flex items-center gap-4">
            <SearchOverlay theme={theme} />

            {user ? (
              <button onClick={handleLogout} className="btn-style5">
                <HiOutlineLogout className="font-bold text-xl" />
              </button>
            ) : (
              <a href="/login" className="btn-style5">
                <HiOutlineLogin className="font-bold text-xl" />
              </a>
            )}

            <a href="/bookmarks" className="btn-style5 font-bold">
              <LuBookmarkPlus className="font-bold text-xl" />
            </a>

            {/* Theme Icon */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover-primary transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <FaSun className="text-primary w-5 h-5" />
              ) : (
                <FaMoon className="text-primary w-5 h-5" />
              )}
            </button>

            {user && (
              <a href="/profile" aria-label="Profile">
                <FaUserCircle className={`w-6 h-6 text-primary`} />
              </a>
            )}
          </div>

          <button
            className="md:hidden text-[26px] text-primary"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="md:hidden flex flex-col items-center py-5 gap-3 glass-panel">
            {navItems.map((i) => (
              <a
                key={i.name}
                onClick={() => setIsOpen(false)}
                href={i.path}
                className="nav-link-item text-lg"
              >
                {i.name}
              </a>
            ))}

            <a href="/bookmarks" className="btn-style5">
              <LuBookmarkPlus className="font-bold text-xl" />
            </a>

            <div className="pt-3 flex gap-3">
              {user ? (
                <button onClick={handleLogout} className="btn-style5">
                  <HiOutlineLogout className="font-bold text-xl" />
                </button>
              ) : (
                <a href="/login" className="btn-style5">
                  <HiOutlineLogin className="font-bold text-xl" />
                </a>
              )}

              <button onClick={toggleTheme} className="btn-style5">
                {theme === "dark" ? <FaSun /> : <FaMoon />}
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="thin-orange-line sticky top-0 z-[60]"></div>

      {/* TOP BAR */}
      <div className="w-full bg-transparent  py-1 flex items-center justify-between px-36 text-sm">
        <div className="text-primary font-semibold"></div>

        <div className="flex items-center gap-3 text-primary text-lg">
          <div className="text-primary font-semibold">Email us : contentmohalla@gmail.com</div>
          <a href="#" className="border-primary border p-1 rounded-full hover-primary transition">
            <FaFacebookF />
          </a>
          <a href="#" className="border-primary border p-1 rounded-full hover-primary transition">
            <FaInstagram />
          </a>
          <a href="#" className="border-primary border p-1 rounded-full hover-primary transition">
            <FaTwitter />
          </a>
          <a href="#" className="border-primary border p-1 rounded-full hover-primary transition">
            <FaYoutube />
          </a>
        </div>
      </div>
    </>
  );
}
