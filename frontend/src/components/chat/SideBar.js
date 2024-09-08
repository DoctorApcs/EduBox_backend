import React, { useCallback, useRef, useState, useEffect } from "react";
import { Plus, MessageSquare, HelpCircle } from "lucide-react";

const Sidebar = ({
  isVisible,
  width,
  setWidth,
  conversations,
  selectedConversation,
  onConversationSelect,
  onCreateConversation,
  selectedAssistant,
}) => {
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
          setWidth(newWidth);
        }
      }
    },
    [isResizing, setWidth]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    if (!isVisible) {
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 300); // Adjust the timeout to match the CSS transition duration
    }
  }, [isVisible]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`bg-white shadow-md overflow-hidden relative flex flex-col transition-width duration-300 ${
          isVisible ? "w-auto" : "w-0"
        }`}
        style={{ width: isVisible ? `${width}px` : "0px" }}
      >
        <div className="p-4">
          <button
            onClick={onCreateConversation}
            className={`p-3 rounded-full flex items-center justify-center transition-colors duration-200 ${
              selectedAssistant
                ? "bg-purple-100 text-gray-500 hover:bg-purple-100 duration-300"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!selectedAssistant}
          >
            <Plus size={16} className="mr-2" />
            New Conversation
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
          {!selectedAssistant ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <HelpCircle size={48} className="mb-2" />
              <p className="text-center px-4">
                Choose an Assistant to continue
              </p>
            </div>
          ) : conversations.length > 0 ? (
            conversations
              .slice()
              .reverse()
              .map((conversation) => (
                <div
                  key={conversation.id}
                  className={`m-2 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedConversation &&
                    selectedConversation.id === conversation.id
                      ? "bg-purple-100"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <div className="flex items-center">
                    <MessageSquare size={18} className="mr-2 text-gray-600" />
                    <p className="text-sm text-gray-800">
                      Conversation {conversation.id}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-gray-500 p-4">No conversations yet.</p>
          )}
        </div>
      </aside>
      <div
        className="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors duration-200"
        onMouseDown={startResizing}
      />
    </>
  );
};

export default Sidebar;