"use client";

import React, { useState } from "react";
import Sidebar from "@/components/chat/SideBar";
import ChatArea from "@/components/chat/ChatArea";
import TopBar from "@/components/chat/TopBar";

const Chat = () => {
  const [isSideView, setIsSideView] = useState(true);
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(256);

  const assistants = [
    { id: "1", name: "paper assistant", description: "A helpful Dialog" },
    { id: "2", name: "code assistant", description: "Helps with coding" },
    { id: "3", name: "math assistant", description: "Solves math problems" },
  ];

  const handleCreateAssistant = () => {
    // Implement create assistant logic here
    console.log("Creating new assistant");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
      <Sidebar
        isVisible={isSideView}
        width={sidebarWidth}
        setWidth={setSidebarWidth}
        assistants={assistants}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          isSideView={isSideView}
          setIsSideView={setIsSideView}
          selectedAssistant={selectedAssistant}
          setSelectedAssistant={setSelectedAssistant}
          assistants={assistants}
          onCreateAssistant={handleCreateAssistant}
        />
        <ChatArea />
      </main>
    </div>
  );
};

export default Chat;
