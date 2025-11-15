"use client";
import { FaStar } from "react-icons/fa";

export default function SectionDivider({ text }) {
  return (
    <div className="flex items-center justify-center">
      {/* Left Line */}
      <div className="flex-1">
        <div className="h-px bg-yellow-500"></div>
      </div>

      {/* Center Text with Stars */}
      {text && (
        <span className="mx-4 flex items-center gap-2 text-yellow-600 font-bold uppercase tracking-wider text-sm">
          <FaStar className="text-yellow-500" />
          {text}
          <FaStar className="text-yellow-500" />
        </span>
      )}

      {/* Right Line */}
      <div className="flex-1">
        <div className="h-px bg-yellow-500"></div>
      </div>
    </div>
  );
}
