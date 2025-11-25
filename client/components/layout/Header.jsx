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
// import { CiBookmarkPlus } from "react-icons/ci";
import { LuBookmarkPlus } from "react-icons/lu";
import { HiOutlineLogout } from "react-icons/hi";
import { HiOutlineLogin } from "react-icons/hi";

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

  // Detect user from cookie
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
   

    <header className="sticky top-0 z-50 glass-panel transition-all duration-500">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-5 h-20">

        {/* LOGO */}
        <a href="/" className="flex items-center gap-2 text-xl font-bold">
          <img src={logo.src} alt="Logo" className="w-16 h-20" />
        </a>

        {/* NAV LINKS */}
        <nav className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="nav-link-item text-[18px]"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-4">

          <SearchOverlay theme={theme} />

          {/* Login / Logout */}
          {user ? (
            <button onClick={handleLogout} className="btn-style5">
              <HiOutlineLogout className="font-bold text-xl" />
            </button>
          ) : (
            <a href="/login" className="btn-style5 ">
         <HiOutlineLogin className="font-bold text-xl" />

            </a>
          )}

          {/* Bookmark */}
          <a href="/bookmarks" className="btn-style5 font-bold">
           <LuBookmarkPlus className="font-bold text-xl" />
          </a>

          {/* Theme Toggle - ORANGE on dark mode too */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-orange-500/30 transition"
          >
            {theme === "dark" ? (
              <FaSun className="text-orange-300 w-5 h-5" />
            ) : (
              <FaMoon className="text-orange-600 w-5 h-5" />
            )}
          </button>

          {/* Profile Icon */}
          {user && (
            <a href="/profile">
              <FaUserCircle
                className={`w-6 h-6 ${
                  theme === "dark" ? "text-orange-200" : "text-orange-700"
                }`}
              />
            </a>
          )}
        </div>

        {/* MOBILE MENU BTN */}
        <button
          className="md:hidden text-[26px] text-orange-500"
          onClick={() => setIsOpen(!isOpen)}
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

    {/* मेरा संकलन BUTTON FOR MOBILE */}
    <a
      href="/bookmarks"
      onClick={() => setIsOpen(false)}
      className="btn-style5"
    >
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
<div className="w-full bg-transparent border-b border-orange-300/40  py-1 flex items-center justify-between px-36 text-sm">

  {/* LEFT — EMAIL */}
  <div className="text-orange-600 font-semibold">
    
  </div>

  {/* RIGHT — SOCIAL ICONS */}
  <div className="flex items-center gap-3 text-orange-500 text-lg">
  <div className="font-semibold p-1">   Email us: test@gmail.com</div>
    <a href="#" className="border border-orange-500 p-1 rounded-full hover:bg-orange-500 hover:text-white transition">
      <FaFacebookF />
    </a>
    <a href="#" className="border border-orange-500 p-1 rounded-full hover:bg-orange-500 hover:text-white transition">
      <FaInstagram />
    </a>
    <a href="#" className="border border-orange-500 p-1 rounded-full hover:bg-orange-500 hover:text-white transition">
      <FaTwitter />
    </a>
    <a href="#" className="border border-orange-500 p-1 rounded-full hover:bg-orange-500 hover:text-white transition">
      <FaYoutube />
    </a>
  </div>
</div>

    </>
  );
}
