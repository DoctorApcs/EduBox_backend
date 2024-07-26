"use client";

import React, { useState, useCallback, useRef } from "react";
import { ChevronDown, Layout, MessageSquare } from "lucide-react";

const Chat = () => {
  const [isSideView, setIsSideView] = useState(true);
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(256); // 16rem = 256px
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  const assistants = [
    { id: "1", name: "paper assistant", description: "A helpful Dialog" },
    { id: "2", name: "code assistant", description: "Helps with coding" },
    { id: "3", name: "math assistant", description: "Solves math problems" },
    // Add more assistants as needed
  ];

  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX - sidebarRef.current.offsetLeft;
        if (newWidth > 150 && newWidth < 480) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
      {/* Sidebar */}
      {isSideView && (
        <>
          <aside
            ref={sidebarRef}
            className="bg-white shadow-md overflow-y-auto relative p-4"
            style={{ width: `${sidebarWidth}px` }}
          >
            <h2 className="text-lg font-semibold p-4">Assistants</h2>
            {assistants.map((assistant) => (
              <div
                key={assistant.id}
                className="m-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <h3 className="font-medium text-gray-800">{assistant.name}</h3>
                <p className="text-sm text-gray-600">{assistant.description}</p>
              </div>
            ))}
          </aside>
          <div
            className="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors duration-200"
            onMouseDown={startResizing}
          />
        </>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSideView(!isSideView)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Layout size={20} />
            </button>
            <div className="relative">
              <select
                value={selectedAssistant}
                onChange={(e) => setSelectedAssistant(e.target.value)}
                className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an assistant</option>
                {assistants.map((assistant) => (
                  <option key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={20}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat messages would go here */}
          <div className="flex items-start mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
              <MessageSquare size={16} />
            </div>
            <div className="bg-white p-3 rounded-lg shadow max-w-md">
              <p>Hi! I'm your assistant, what can I do for you?</p>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
