import React, { useMemo, useState, useEffect } from "react";
import { Cpu, Book } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const getRandomGradient = () => {
  const colors = ["#FCA5A5", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA"];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  const angle = Math.floor(Math.random() * 360);
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};

const getBadgeText = (createdAt, updatedAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const updated = new Date(updatedAt);
  const daysSinceCreation = (now - created) / (1000 * 60 * 60 * 24);
  const daysSinceUpdate = (now - updated) / (1000 * 60 * 60 * 24);

  if (daysSinceCreation <= 7) {
    return "New";
  } else if (daysSinceUpdate <= 7) {
    return "Recently updated";
  }
  return null;
};

const AssistantCard = ({ assistant, onSelect }) => {
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const randomGradient = useMemo(() => getRandomGradient(), []);
  const badgeText = getBadgeText(assistant.created_at, assistant.updated_at);

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/knowledge_base/${assistant.knowledge_base_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch knowledge base");
        }
        const data = await response.json();
        setKnowledgeBase(data);
      } catch (error) {
        console.error("Error fetching knowledge base:", error);
      }
    };

    fetchKnowledgeBase();
  }, [assistant.knowledge_base_id]);

  return (
    <div
      className="max-w-sm w-full bg-white shadow-lg rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => onSelect(assistant)}
    >
      <div className="relative">
        <div
          className="w-full h-48 rounded-t-2xl"
          style={{ background: randomGradient }}
        ></div>
        {badgeText && (
          <div className="absolute top-2 right-2 bg-indigo-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
            {badgeText}
          </div>
        )}
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 text-gray-800">
          {assistant.name}
        </div>
        <p className="text-gray-600 text-base">{assistant.description}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          <Cpu size={16} className="inline mr-1" />
          {assistant.configuration.model}
        </span>
      </div>
      <div className="px-6 py-4 flex items-center text-gray-700">
        <Book size={20} className="mr-2" />
        <span>
          Knowledge Base: {knowledgeBase ? knowledgeBase.name : "Loading..."}
        </span>
      </div>
    </div>
  );
};

const AssistantCards = ({ assistants, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {assistants.map((assistant) => (
        <AssistantCard
          key={assistant.id}
          assistant={assistant}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default AssistantCards;
