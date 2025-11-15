"use client";
import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="transition-all duration-500 
                       bg-gradient-to-b from-[#1a1a1a] via-[#0d1117] to-[#000000]
                       dark:from-[#01161e] dark:via-[#021d25] dark:to-[#01161e]
                       text-yellow-100 dark:text-gray-200 shadow-[0_-4px_15px_rgba(20,184,166,0.2)] 
                       dark:shadow-[0_-6px_25px_rgba(45,212,191,0.25)]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Brand / About */}
        <div>
          <h2 className="text-3xl font-bold mb-4 font-playfair-display 
                         text-[#FCD34D] dark:text-[#5eead4] drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]">
            साहित्य पोर्टल
          </h2>
          <p className="text-white/80 dark:text-gray-300 text-sm leading-relaxed">
            साहित्य और कला का संगम — अतीत की कहानियाँ, आज की कविताएँ,
            और संस्कृति की झलक।
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[#FCD34D] dark:text-[#5eead4]">
            त्वरित लिंक
          </h3>
          <ul className="space-y-3 text-white/80 dark:text-gray-300">
            {[
              { href: "/", label: "होम" },
              { href: "/about", label: "हमारे बारे में" },
              { href: "/archive", label: "आर्काइव" },
              { href: "/contact", label: "संपर्क करें" },
            ].map((item, i) => (
              <li key={i}>
                <a
                  href={item.href}
                  className="hover:text-yellow-300 dark:hover:text-[#2dd4bf] 
                             transition-colors duration-200 hover:drop-shadow-[0_0_8px_#2dd4bf]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[#FCD34D] dark:text-[#5eead4]">
            हमें फॉलो करें
          </h3>
          <div className="flex space-x-5 text-xl">
            {[
              { icon: <FaFacebookF />, label: "Facebook" },
              { icon: <FaTwitter />, label: "Twitter" },
              { icon: <FaInstagram />, label: "Instagram" },
              { icon: <FaYoutube />, label: "YouTube" },
            ].map((social, i) => (
              <a
                key={i}
                href="#"
                aria-label={social.label}
                className="text-white/80 dark:text-gray-300 
                           hover:text-yellow-300 dark:hover:text-[#2dd4bf] 
                           transform hover:scale-110 transition duration-200
                           hover:drop-shadow-[0_0_10px_#2dd4bf]"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 dark:border-[#2dd4bf]/30 text-center py-5 text-sm 
                      text-white/70 dark:text-gray-400 tracking-wide">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#FCD34D] dark:text-[#5eead4] font-semibold">
          साहित्य पोर्टल
        </span>{" "}
        | सर्वाधिकार सुरक्षित
      </div>
    </footer>
  );
};

export default Footer;
