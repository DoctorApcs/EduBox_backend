import React from "react";
import Link from "next/link";
// import { GitHub, Settings } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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
          <span className="font-bold text-xl">RAGFlow</span>
        </div>
        <nav className="flex space-x-4">
          <Link
            href="/"
            className="px-3 py-2 bg-blue-500 text-white rounded-md flex items-center"
          >
            Knowledge Base
          </Link>
          <Link
            href="/chat"
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Chat
          </Link>
          <Link
            href="/graph"
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Graph
          </Link>
          <Link
            href="/file-management"
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            File Management
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <select className="bg-gray-100 rounded-md px-2 py-1">
            <option>English</option>
          </select>
          {/* <GitHub className="w-6 h-6 text-gray-600" />
          <Settings className="w-6 h-6 text-gray-600" /> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
