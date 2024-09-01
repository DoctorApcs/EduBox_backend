import React, { useState } from "react";
import { ChevronDown, Layout, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const TopBar = ({
  isSideView,
  setIsSideView,
  selectedAssistant,
  setSelectedAssistant,
  assistants,
  onCreateAssistant,
  showSidebarButton = true,
  showAssistantSelect = true,
  showCreateAssistantButton = true,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssistant = async (assistant_id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/assistant/${assistant_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch assistant");
      }
      const data = await response.json();
      setSelectedAssistant(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleAssistantChange = (e) => {
    const assistantId = e.target.value;
    if (assistantId) {
      fetchAssistant(assistantId);
      router.push(`/chat/${assistantId}`);
    } else {
      setSelectedAssistant(null);
    }
  };

  return (
    <div className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {showSidebarButton && (
          <button
            onClick={() => setIsSideView(!isSideView)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Layout size={20} />
          </button>
        )}
        {showAssistantSelect && (
          <div className="relative">
            <select
              value={selectedAssistant ? selectedAssistant.id : ""}
              onChange={handleAssistantChange}
              className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
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
        )}
        {isLoading && <span className="text-sm text-gray-500">Loading...</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
      {showCreateAssistantButton && (
        <button
          onClick={onCreateAssistant}
          className="bg-blue-500 text-white px-3 py-2 rounded-md flex items-center text-sm"
        >
          <Plus size={16} className="mr-2" />
          Create Assistant
        </button>
      )}
    </div>
  );
};

export default TopBar;
