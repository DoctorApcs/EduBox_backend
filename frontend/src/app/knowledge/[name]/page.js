// app/knowledge/[name]/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DatasetView from "@/components/knowledge_base/KBDatasetView";
import ReactMarkdown from "react-markdown";
import Image from 'next/image';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function KnowledgeBasePage() {
  const params = useParams();
  const knowledgeBaseID = decodeURIComponent(params.name);
  const [activeTab, setActiveTab] = useState("Lessons");
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, [knowledgeBaseID]);

  const fetchLessons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/knowledge_base/${knowledgeBaseID}/lessons`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Lessons":
        return (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="flex items-center bg-white rounded-lg shadow-md p-4 cursor-pointer" onClick={() => setSelectedLesson(lesson)}>
                <span className="text-xl font-bold mr-4">{index + 1}</span>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{lesson.title}</h3>
                  <p className="text-sm text-gray-600">Basic concepts</p>
                </div>
                <div className="text-purple-600 text-xl">▶</div>
              </div>
            ))}
          </div>
        );
      case "Sources":
        return <DatasetView knowledgeBaseID={knowledgeBaseID} />;
      case "Quick Chat":
        return <div>Quick Chat component (to be implemented)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-screen mx-auto p-4 h-screen overflow-y-auto">
      <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
        <Image src="/path-to-your-code-image.jpg" alt="Code background" layout="fill" objectFit="cover" />
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-4 text-white">
          <h1 className="text-2xl font-bold">Database Course</h1>
          <div className="flex items-center space-x-2">
            <Image src="/path-to-admin-icon.jpg" alt="Admin" width={30} height={30} className="rounded-full" />
            <span>Admin</span>
            <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">Pro</span>
          </div>
        </div>
      </div>
      <div className="flex mb-6">
        {["Lessons", "Sources", "Quick Chat"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 ${activeTab === tab ? 'text-purple-600 font-bold border-b-2 border-purple-600' : 'text-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="content-container">
        {renderContent()}
      </div>
    </div>
  );
}