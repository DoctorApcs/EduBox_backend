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

  return (
    <div className="min-h-full w-full p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome back, BachNgoH</h1>
      <p className="text-gray-600 mb-8">
        Which knowledge base are we going to use today?
      </p>

      <div className="flex justify-between mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 border rounded-md"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create knowledge base
        </button>
      </div>

      <KnowledgeBaseCard
        title="Papers"
        docCount={2}
        lastUpdated="26/06/2024 17:55:21"
      />

      <KnowledgeBaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateKnowledgeBase}
      />
    </div>
  );
};

export default KnowledgeBasePage;
