"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Knowledge Base", path: "/knowledge" },
    { name: "Chat", path: "/chat" },
    { name: "File Management", path: "/file-management" },
    { name: "Analytics", path: "/analytics" },
  ];

  const isActive = (path) => {
    if (pathname === "/") return false;
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <svg
            className="w-8 h-8 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-bold text-xl">EduBox</span>
        </div>
        <nav className="flex-1 flex justify-center">
          <div className="flex w-full max-w-2xl bg-gray-100 rounded-full p-1 relative">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex-1 px-3 py-2 text-center rounded-full transition-all duration-300 ease-in-out z-10 relative ${
                  isActive(item.path)
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div
              className="absolute top-1 left-1 bottom-1 rounded-full bg-blue-500 transition-all duration-300 ease-in-out"
              style={{
                width: `${100 / navItems.length}%`,
                transform: `translateX(${
                  navItems.findIndex((item) => isActive(item.path)) * 100
                }%)`,
              }}
            ></div>
          </div>
        </nav>
        <div className="flex items-center space-x-4">
          <select className="bg-gray-100 rounded-md px-2 py-1">
            <option>English</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
