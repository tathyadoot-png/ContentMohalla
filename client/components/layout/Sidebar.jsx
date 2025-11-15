// components/Sidebar.jsx

"use client";

import Link from 'next/link';
import { useState } from "react";
import {
  FaBars, FaMapMarkerAlt, FaGlobeAsia, FaFlag, FaPrayingHands, FaPalette, FaFutbol,
  FaBriefcase, FaBookOpen, FaMicrochip, FaCloudSun, FaFilm, FaHeartbeat, FaBlog,
  FaVideo, FaHeadphones, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaHome
} from 'react-icons/fa';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'होम', href: '/', icon: <FaHome /> },
    { name: 'देश', href: '/news/desh', icon: <FaGlobeAsia /> },
    { name: 'विदेश', href: '/news/videsh', icon: <FaFlag /> },
    { name: 'मध्य प्रदेश', href: '/news/madhya-pradesh', icon: <FaMapMarkerAlt /> },
    { name: 'राजनीति', href: '/news/rajneeti', icon: <FaPrayingHands /> },
    { name: 'धर्म', href: '/news/dharm', icon: <FaPrayingHands /> },
    { name: 'कला', href: '/news/kala', icon: <FaPalette /> },
    { name: 'खेल', href: '/news/sports', icon: <FaFutbol /> },
    { name: 'व्यापार', href: '/news/vyapaar', icon: <FaBriefcase /> },
    { name: 'शिक्षा', href: '/news/education', icon: <FaBookOpen /> },
    { name: 'तकनीक', href: '/news/taknik', icon: <FaMicrochip /> },
    { name: 'जलवायु', href: '/news/climate', icon: <FaCloudSun /> },
    { name: 'मनोरंजन', href: '/news/manoranjan', icon: <FaFilm /> },
    { name: 'स्वास्थ्य', href: '/news/health', icon: <FaHeartbeat /> },
    { name: 'ब्लॉग', href: '/blog', icon: <FaBlog /> },
    { name: 'वीडियो गैलरी', href: '/videos', icon: <FaVideo /> },
    { name: 'ऑडियो गैलरी', href: '/audios', icon: <FaHeadphones /> },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-secondary p-2 rounded shadow-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <FaBars />
      </button>

      {/* --- This is the Overlay for Mobile --- */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- This is the Main Sidebar Container --- */}
      <div
        className={`bg-primary text-secondary w-64 p-6 flex flex-col justify-between transition-transform duration-300 z-40 h-screen overflow-y-auto
          fixed top-0 left-0 ${ sidebarOpen ? 'translate-x-0' : '-translate-x-full' }
          md:static md:w-auto md:translate-x-0 md:h-auto md:overflow-y-visible`}
      >
        {/* Navigation Links */}
        <div className="flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 
                  ${isActive ? 'bg-accent text-white' : 'hover:bg-accent/20 hover:text-accent'}`
                }
              >
                <div className="bg-secondary/20 p-2 rounded-full flex items-center justify-center text-sm">
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Social Media Links */}
        <div className="flex gap-3 mt-6 justify-center">
          <Link href="https://facebook.com" target="_blank" className="p-2 bg-blue-600 rounded-full text-white hover:scale-110 transition-transform">
            <FaFacebookF size={16} />
          </Link>
          <Link href="https://twitter.com" target="_blank" className="p-2 bg-blue-400 rounded-full text-white hover:scale-110 transition-transform">
            <FaTwitter size={16} />
          </Link>
          <Link href="https://instagram.com" target="_blank" className="p-2 bg-pink-500 rounded-full text-white hover:scale-110 transition-transform">
            <FaInstagram size={16} />
          </Link>
          <Link href="https://linkedin.com" target="_blank" className="p-2 bg-blue-700 rounded-full text-white hover:scale-110 transition-transform">
            <FaLinkedinIn size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}