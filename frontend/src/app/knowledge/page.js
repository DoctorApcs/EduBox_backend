"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import KnowledgeBaseCard from "@/components/knowledge_base/KnowledgeBaseCard";
import KnowledgeBaseModal from "@/components/knowledge_base/KnowledgeBaseModal";

const KnowledgeBasePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleCreateKnowledgeBase = (name) => {
    // Here you would typically call an API to create the knowledge base
    console.log(`Creating knowledge base: ${name}`);
    // Then redirect to the new knowledge base view
    router.push(`/knowledge/${encodeURIComponent(name)}`);
  };

  // Sample data for multiple knowledge bases
  const knowledgeBases = [
    { title: "Papers", docCount: 2, lastUpdated: "26/06/2024 17:55:21" },
    { title: "Research", docCount: 5, lastUpdated: "25/06/2024 10:30:00" },
    { title: "Projects", docCount: 3, lastUpdated: "24/06/2024 14:15:30" },
    { title: "Case Studies", docCount: 7, lastUpdated: "23/06/2024 09:45:00" },
    { title: "Experiments", docCount: 4, lastUpdated: "22/06/2024 16:20:00" },
    {
      title: "Literature Reviews",
      docCount: 6,
      lastUpdated: "21/06/2024 11:10:00",
    },
    { title: "Data Analysis", docCount: 8, lastUpdated: "20/06/2024 14:30:00" },
    { title: "Methodologies", docCount: 3, lastUpdated: "19/06/2024 09:20:00" },
  ];

  return (
    <div className="min-h-full w-full p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 lg:mb-4">
        Welcome back, BachNgoH
      </h1>
      <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 lg:mb-10">
        Which knowledge base are we going to use today?
      </p>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 lg:mb-10">
        <div className="relative mb-4 sm:mb-0 w-full sm:w-64 md:w-72 lg:w-96 xl:w-[32rem]">
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 sm:py-3 border rounded-md w-full text-base sm:text-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-md flex items-center justify-center w-full sm:w-auto text-base sm:text-lg transition duration-300"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Create knowledge base
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {knowledgeBases.map((kb, index) => (
          <KnowledgeBaseCard
            key={index}
            title={kb.title}
            docCount={kb.docCount}
            lastUpdated={kb.lastUpdated}
          />
        ))}
      </div>

      <KnowledgeBaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateKnowledgeBase}
      />
    </div>
  );
};

export default KnowledgeBasePage;
