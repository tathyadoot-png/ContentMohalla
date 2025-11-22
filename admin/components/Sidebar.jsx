"use client";


import React, { useState, useContext, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Feather,
  ListChecks,
  Users,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Post Poem", href: "/dashboard/post", icon: Feather },
    { name: "Admin Pending Posts", href: "/dashboard/adminPendingPosts", icon: ListChecks },
    { name: "Languages", href: "/dashboard/poemLanguages", icon: Users },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "AddUsers", href: "/dashboard/addUser", icon: Users },
  ];

  return (
    <aside
      className={`
        ${isCollapsed ? "w-20" : "w-64"}
        h-screen bg-[#0b132b] text-white flex flex-col shadow-2xl 
        fixed left-0 top-0 overflow-y-auto transition-all duration-300 ease-in-out z-50
      `}
    >
      {/* --- Top Section --- */}
      <div className="p-4 flex items-center justify-between border-b border-[#1f2a44] sticky top-0 bg-[#0b132b] z-10">
        {!isCollapsed && (
          <h1 className="text-2xl font-extrabold text-[#FFD700] tracking-wide">
            Admin Panel
          </h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-[#1a2035] text-[#FFD700] transition duration-300"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronLeft
            className={`w-6 h-6 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {/* --- Navigation --- */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 p-3 rounded-lg font-medium transition duration-200
                ${
                  isActive
                    ? "bg-[#FFD700] text-[#0b132b] shadow-md border-l-4 border-[#e63946]"
                    : "text-white hover:bg-[#1f2a44] hover:text-[#FFD700]"
                }
              `}
            >
              <Icon
                className={`${isCollapsed ? "mx-auto" : ""} w-5 h-5 shrink-0`}
              />
              <span
                className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 
                  ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
                `}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* --- Footer / Logout --- */}
      <div className="p-4 border-t border-[#1f2a44] sticky bottom-0 bg-[#0b132b]">
        <button
          onClick={logout}
          className={`
            w-full flex items-center justify-center gap-2 p-3 rounded-lg 
            bg-[#e63946] text-white font-semibold shadow-md 
            hover:bg-[#ff4d5a] transition duration-200
          `}
        >
          <LogOut className={`${isCollapsed ? "mx-auto" : ""} w-5 h-5`} />
          <span
            className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 
              ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
            `}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
