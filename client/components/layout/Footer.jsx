// components/Footer.jsx
"use client";
import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      aria-label="site-footer"
      className="w-full border-t border-[var(--glass-border)] bg-[var(--bg)] text-[var(--text)] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,var(--primary),var(--primary-600))",
                  boxShadow: "0 8px 30px var(--btn-shadow)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12h16M4 6h10M4 18h16" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div>
                <div className="text-lg font-extrabold" style={{ color: "var(--primary)" }}>
                  साहित्य पोर्टल
                </div>
                <div className="text-xs text-[var(--text)]/75">शब्दों का घर — कविताएँ, कहानियाँ और विचार</div>
              </div>
            </div>

            <p className="mt-3 text-sm text-[var(--text)]/85 max-w-md">
              साहित्य और संस्कृति के नये और पुराने हिस्सों को हम यहाँ सजाकर रखते हैं — पढ़ें, साझा करें और महसूस करें।
            </p>
          </div>

          {/* Vertical Menu (one below another) */}
          <nav>
            <h4 className="text-md font-semibold mb-3" style={{ color: "var(--primary)" }}>त्वरित लिंक</h4>
            <ul className="flex flex-col space-y-1 text-[var(--text)]/90 font-medium">
              <li><a href="/" className="block px-2 py-1 hover:text-[var(--primary)] transition">होम</a></li>
              <li><a href="/about" className="block px-2 py-1 hover:text-[var(--primary)] transition">हमारे बारे में</a></li>
              <li><a href="/archive" className="block px-2 py-1 hover:text-[var(--primary)] transition">संकलन</a></li>
              <li><a href="/contact" className="block px-2 py-1 hover:text-[var(--primary)] transition">संपर्क करें</a></li>
            </ul>
          </nav>

          {/* Socials */}
          <div className="flex flex-col items-start md:items-end gap-3">
            <div>
              <h4 className="text-md font-semibold" style={{ color: "var(--primary)" }}>हमें फॉलो करें</h4>
              <div className="mt-2 flex items-center gap-3">
                {[
                  { icon: <FaFacebookF />, href: "#" },
                  { icon: <FaTwitter />, href: "#" },
                  { icon: <FaInstagram />, href: "#" },
                  { icon: <FaYoutube />, href: "#" },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    aria-label="social"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ color: "var(--text)" }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-[var(--text)]/70 text-left md:text-right">
              © {new Date().getFullYear()} <span className="font-semibold text-[var(--primary)]">साहित्य पोर्टल</span> — सर्वाधिकार सुरक्षित
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
