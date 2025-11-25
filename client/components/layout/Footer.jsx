"use client";
import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className="
      transition-all duration-500 
      bg-gradient-to-b 
      from-[var(--footer-top)] 
      via-[var(--footer-mid)] 
      to-[var(--footer-bottom)]
      text-[var(--text-color)]
      shadow-[0_-4px_12px_var(--primary-glow)]
      dark:shadow-[0_-6px_25px_var(--primary-glow)]
      "
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Brand / About */}
        <div>
          <h2
            className="
            text-3xl font-bold mb-4 font-playfair-display
            text-[var(--primary-color)] 
            drop-shadow-[0_0_10px_var(--primary-glow)]
            "
          >
            साहित्य पोर्टल
          </h2>

          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            साहित्य और कला का संगम — अतीत की कहानियाँ, आज की कविताएँ,
            और संस्कृति की झलक।
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3
            className="
            text-lg font-semibold mb-4 
            text-[var(--primary-color)]
            "
          >
            त्वरित लिंक
          </h3>

          <ul className="space-y-3">
            {[
              { href: "/", label: "होम" },
              { href: "/about", label: "हमारे बारे में" },
              { href: "/archive", label: "आर्काइव" },
              { href: "/contact", label: "संपर्क करें" },
            ].map((item, i) => (
              <li key={i}>
                <a
                  href={item.href}
                  className="
                  text-[var(--text-muted)]
                  hover:text-[var(--primary-color)]
                  transition-colors duration-200
                  hover:drop-shadow-[0_0_8px_var(--primary-glow)]
                  "
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3
            className="
            text-lg font-semibold mb-4 
            text-[var(--primary-color)]
            "
          >
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
                className="
                text-[var(--text-muted)]
                transition duration-200
                transform hover:scale-110
                hover:text-[var(--primary-color)]
                hover:drop-shadow-[0_0_12px_var(--primary-glow)]
                "
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="
        border-t border-[var(--divider)]
        text-center py-5 text-sm 
        text-[var(--text-muted)]
        tracking-wide
        "
      >
        © {new Date().getFullYear()}{" "}
        <span className="text-[var(--primary-color)] font-semibold">
          साहित्य पोर्टल
        </span>{" "}
        | सर्वाधिकार सुरक्षित
      </div>
    </footer>
  );
};

export default Footer;
