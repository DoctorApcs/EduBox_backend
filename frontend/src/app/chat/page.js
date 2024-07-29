"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/chat/SideBar";
import ChatArea from "@/components/chat/ChatArea";
import TopBar from "@/components/chat/TopBar";
import CreateAssistantModal from "@/components/chat/CreateAssistantModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorComponent from "@/components/Error";
import AssistantCards from "@/components/chat/AssistantCards";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const Chat = () => {
  const [isSideView, setIsSideView] = useState(true);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assistants, setAssistants] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssistants();
  }, []);

  useEffect(() => {
    if (selectedAssistant) {
      fetchConversations(selectedAssistant.id);
    } else {
      setConversations([]);
      setSelectedConversation(null);
    }
  }, [selectedAssistant]);

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

  const fetchConversations = async (assistantId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/assistant/conversations?assistant_id=${assistantId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateAssistant = () => {
    setIsCreateModalOpen(true);
  };

  const handleAssistantSelect = (assistant) => {
    setSelectedAssistant(assistant);
    setSelectedConversation(null);
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCreateConversation = async () => {
    if (!selectedAssistant) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/assistant/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assistant_id: selectedAssistant.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const newConversation = await response.json();
      setConversations([...conversations, newConversation]);
      setSelectedConversation(newConversation);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
        <Sidebar
          isVisible={isSideView}
          width={sidebarWidth}
          setWidth={setSidebarWidth}
          conversations={conversations}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
          onCreateConversation={handleCreateConversation}
          selectedAssistant={selectedAssistant}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            isSideView={isSideView}
            setIsSideView={setIsSideView}
            selectedAssistant={selectedAssistant}
            setSelectedAssistant={handleAssistantSelect}
            assistants={assistants}
            onCreateAssistant={handleCreateAssistant}
          />
          {!selectedAssistant ? (
            <AssistantCards
              assistants={assistants}
              onSelect={handleAssistantSelect}
            />
          ) : selectedConversation ? (
            <ChatArea
              conversation={selectedConversation}
              assistantId={selectedAssistant.id}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation or create a new one to start chatting.
            </div>
          )}
        </main>
      </div>
      <CreateAssistantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={fetchAssistants}
      />
    </>
  );
};

export default Chat;
