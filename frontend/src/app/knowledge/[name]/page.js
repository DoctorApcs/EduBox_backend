// app/knowledge/[name]/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DatasetView from "@/components/knowledge_base/KBDatasetView";
import LessonContent from "@/components/knowledge_base/LessonContent";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function KnowledgeBasePage() {
  const params = useParams();
  const knowledgeBaseID = decodeURIComponent(params.name);
  const [activeTab, setActiveTab] = useState("Lessons");
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [knowledgeBase, setKnowledgeBase] = useState(null);

  useEffect(() => {
    fetchKnowledgeBase();
    fetchLessons();
  }, [knowledgeBaseID]);

  const fetchKnowledgeBase = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/knowledge_base/${knowledgeBaseID}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setKnowledgeBase(data);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/knowledge_base/${knowledgeBaseID}/lessons`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
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
        return selectedLesson ? (
          <LessonContent
            lesson={selectedLesson}
            onBack={() => setSelectedLesson(null)}
            kbId={knowledgeBaseID}
          />
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center bg-white rounded-lg shadow-md p-4 cursor-pointer"
                onClick={() => setSelectedLesson(lesson)}
              >
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
    <div className="h-full bg-purple-50 overflow-y-auto">
      <header className="bg-custom-bg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search your courses, activities, knowledge..."
            className="w-full max-w-xl px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12 border-4 border-custom-primary-start">
              <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Admin</span>
              <Badge
                variant="secondary"
                className="bg-custom-cta text-white text-xs px-2 py-0.5 rounded-full"
              >
                Pro
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
          <img
            src={
              knowledgeBase
                ? `${API_BASE_URL}/getfile${knowledgeBase.background_image.replace(
                    "./",
                    "/"
                  )}`
                : "https://placehold.co/600x400"
            }
            alt="Course background"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-4 text-black">
            <h1 className="text-2xl font-bold">
              {knowledgeBase?.name || knowledgeBaseID}
            </h1>
          </div>
        </div>
        <div className="flex mb-6">
          {["Lessons", "Sources", "Quick Chat"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 ${
                activeTab === tab
                  ? "text-purple-600 font-bold border-b-2 border-purple-600"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="content-container">{renderContent()}</div>
      </main>
    </div>
  );
}
