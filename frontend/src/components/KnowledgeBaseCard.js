import React from "react";

const KnowledgeBaseCard = ({ title, docCount, lastUpdated }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-64">
      <div className="flex justify-between items-center mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <button className="text-gray-400">...</button>
      </div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="flex items-center text-gray-500 text-sm">
        <svg
          className="w-4 h-4 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 2v7h7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {docCount} Docs
      </div>
      <div className="text-gray-500 text-sm mt-1">{lastUpdated}</div>
    </div>
  );
};

export default KnowledgeBaseCard;
