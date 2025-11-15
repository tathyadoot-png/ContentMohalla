"use client";

import React, { useState } from "react";
import { FaWhatsapp, FaFacebookF, FaTwitter, FaLinkedinIn, FaTelegramPlane } from "react-icons/fa";

export default function ShareButton({ title, byline, url, image, onShareSuccess }) {
  const [showMenu, setShowMenu] = useState(false);

  const uniqueUrl = `${url}?t=${new Date().getTime()}`;

  const triggerShareSuccess = () => {
    if (onShareSuccess) {
      onShareSuccess();
    }
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: byline, url: uniqueUrl });
        console.log("Native share successful");
        triggerShareSuccess(); // Call backend to increment count
      } else {
        // Fallback for desktop or unsupported browsers
        setShowMenu((prev) => !prev);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const socialUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + "\n" + byline + "\n" + uniqueUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title + " - " + byline)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + " - " + byline)}`,
  };

  const openSocial = (link) => {
    window.open(link, "_blank", "width=600,height=500");
    triggerShareSuccess(); // Also increment count when using fallback social buttons
    setShowMenu(false); // Close menu after sharing
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:bg-hoverAccent transition-all duration-300 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v.01M12 4v.01M20 12v.01M12 20v.01M12 12v.01M16.24 7.76l-.01-.01M7.76 16.24l-.01-.01M16.24 16.24l-.01-.01M7.76 7.76l-.01-.01" />
        </svg>
        Share
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 flex flex-col space-y-2 z-50">
          <button onClick={() => openSocial(socialUrls.whatsapp)} className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
            <FaWhatsapp className="text-green-500" /> WhatsApp
          </button>
          <button onClick={() => openSocial(socialUrls.facebook)} className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
            <FaFacebookF className="text-blue-600" /> Facebook
          </button>
          <button onClick={() => openSocial(socialUrls.twitter)} className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
            <FaTwitter className="text-blue-400" /> Twitter
          </button>
          <button onClick={() => openSocial(socialUrls.linkedin)} className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
            <FaLinkedinIn className="text-blue-700" /> LinkedIn
          </button>
          <button onClick={() => openSocial(socialUrls.telegram)} className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
            <FaTelegramPlane className="text-blue-400" /> Telegram
          </button>
        </div>
      )}
    </div>
  );
}