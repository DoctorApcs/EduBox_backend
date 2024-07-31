"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AssistantCards from "@/components/chat/AssistantCards";
import TopBar from "@/components/chat/TopBar";
import CreateAssistantModal from "@/components/chat/CreateAssistantModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorComponent from "@/components/Error";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const ChatMainPage = () => {
  const router = useRouter();
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSideView, setIsSideView] = useState(true);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant`);
      if (!response.ok) {
        throw new Error("Failed to fetch assistants");
      }
      const data = await response.json();
      setAssistants(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleCreateAssistant = () => {
    setIsCreateModalOpen(true);
  };

  const handleAssistantSelect = (assistant) => {
    setSelectedAssistant(assistant);
    router.push(`/chat/${assistant.id}`);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopBar
        isSideView={isSideView}
        setIsSideView={setIsSideView}
        selectedAssistant={selectedAssistant}
        setSelectedAssistant={setSelectedAssistant}
        assistants={assistants}
        onCreateAssistant={handleCreateAssistant}
      />
      <main className="flex-1 overflow-auto p-6">
        <AssistantCards
          assistants={assistants}
          onSelect={handleAssistantSelect}
        />
      </main>
      <CreateAssistantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={fetchAssistants}
      />
    </div>
  );
};

export default ChatMainPage;
