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
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

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
  const [isOpen, setIsOpen] = useState(false); // mobile nav
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const SCROLL_THRESHOLD = 60;
  const EMAIL = "contentmohalla@gmail.com";

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
    const onScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
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
      {/* MAIN HEADER */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "backdrop-blur-sm bg-white/85 dark:bg-black/70 shadow-md" : "bg-transparent"
          }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto flex gap-4 items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 h-20">
          {/* LOGO */}
          <a href="/" className="flex items-center ">
            <img src={logo.src} alt="Logo" className="w-12 h-12 md:w-40 md:h-40  object-contain" />
          
          </a>

          {/* NAV (desktop) */}
          <nav className="hidden md:flex gap-6 items-center">
            {navItems.map((item) => (
              <a key={item.name} href={item.path} className="nav-link-item text-[15px]">
                {item.name}
              </a>
            ))}
          </nav>

          {/* RIGHT SIDE (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search (keeps its own open state) */}
            <div className="mr-1">
              <SearchOverlay theme={theme} />
            </div>

            {/* Auth / Bookmarks */}
            {user ? (
              <button onClick={handleLogout} className="btn-style5" aria-label="Logout">
                <HiOutlineLogout className="font-bold text-xl" />
              </button>
            ) : (
              <a href="/login" className="btn-style5" aria-label="Login">
                <HiOutlineLogin className="font-bold text-xl" />
              </a>
            )}

            <a href="/bookmarks" className="btn-style5 font-bold" aria-label="Bookmarks">
              <LuBookmarkPlus className="font-bold text-xl" />
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover-primary transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FaSun className="text-primary w-5 h-5" /> : <FaMoon className="text-primary w-5 h-5" />}
            </button>

            {/* Profile */}
            {user && (
              <a href="/profile" aria-label="Profile">
                <FaUserCircle className="w-6 h-6 text-primary" />
              </a>
            )}
          </div>

          {/* MOBILE: hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <SearchOverlay theme={theme} />
            <button
              className="text-primary p-2 rounded-lg focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE NAV PANEL */}
        <div className={`md:hidden transition-max-h duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-screen" : "max-h-0"}`}>
          <div className="px-4 pb-6 pt-4 border-t bg-white dark:bg-black">
            {/* nav items */}
            <div className="flex flex-col gap-2">
              {navItems.map((i) => (
                <a
                  key={i.name}
                  href={i.path}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-3 rounded-lg nav-link-item"
                >
                  {i.name}
                </a>
              ))}
            </div>

            {/* auth + theme + bookmarks (mobile) */}
            <div className="flex items-center gap-3 mt-4">
              {user ? (
                <button onClick={handleLogout} className="btn-style5">
                  <HiOutlineLogout className="font-bold text-xl" />
                </button>
              ) : (
                <a href="/login" className="btn-style5">
                  <HiOutlineLogin className="font-bold text-xl" />
                </a>
              )}

              <a href="/bookmarks" className="btn-style5">
                <LuBookmarkPlus className="font-bold text-xl" />
              </a>

              <button onClick={toggleTheme} className="btn-style5" aria-label="Toggle theme">
                {theme === "dark" ? <FaSun /> : <FaMoon />}
              </button>
            </div>

            {/* social + email (mobile panel) */}
            <div className="mt-4 border-t pt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <a href="https://www.facebook.com/Contentmohalla" aria-label="Facebook" className="p-2 rounded-full border border-[rgba(0,0,0,0.06)] hover:bg-primary/10 transition">
                  <FaFacebookF />
                </a>
                <a href="https://www.instagram.com/content_mohalla" aria-label="Instagram" className="p-2 rounded-full border border-[rgba(0,0,0,0.06)] hover:bg-primary/10 transition">
                  <FaInstagram />
                </a>
                <a href="https://x.com/contentmohalla" aria-label="X / Twitter" className="p-2 rounded-full border border-[rgba(0,0,0,0.06)] hover:bg-primary/10 transition">
                  <FaTwitter />
                </a>
                <a href="https://www.youtube.com/@contentmohalla3" aria-label="YouTube" className="p-2 rounded-full border border-[rgba(0,0,0,0.06)] hover:bg-primary/10 transition">
                  <FaYoutube />
                </a>

                {/* Email next to icons (mobile) */}
                <a href={`mailto:${EMAIL}`} aria-label="Email" className="flex items-center gap-2 ml-2 text-sm text-gray-700 dark:text-gray-200 underline">
                  <FaEnvelope className="w-4 h-4" /> <span className="hidden sm:inline">{EMAIL}</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* THIN ORANGE LINE (responsive container) */}
      <div className="thin-orange-line"></div>

      {/* TOP BAR (desktop only) */}
      <div className="hidden lg:flex items-center justify-between max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-1 text-sm">
        <div></div>

        <div className="flex items-center gap-3 text-primary text-lg">
          <a href="https://www.facebook.com/Contentmohalla" className="border-primary border p-1 rounded-full hover-primary transition" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="https://www.instagram.com/content_mohalla" className="border-primary border p-1 rounded-full hover-primary transition" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="https://x.com/contentmohalla" className="border-primary border p-1 rounded-full hover-primary transition" aria-label="X / Twitter">
            <FaTwitter />
          </a>
          <a href="https://www.youtube.com/@contentmohalla3" className="border-primary border p-1 rounded-full hover-primary transition" aria-label="YouTube">
            <FaYoutube />
          </a>

          {/* Email next to social icons (desktop) */}
          <a href={`mailto:${EMAIL}`} aria-label="Email" className="flex items-center gap-2 ml-3 text-sm text-primary ">
           <FaEnvelope href="contentmohalla@gmail.com" className="w-4 h-4" /><span className="font-semibold">जुड़िये :</span> <span className="hidden xl:inline">{EMAIL}</span>
          </a>
        </div>
      </div>
    </>
  );
}
