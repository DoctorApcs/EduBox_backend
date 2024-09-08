"use client";
import {
  CourseCard,
  AddCourseCard,
} from "@/components/knowledge_base/CourseCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import KnowledgeBaseModal from "@/components/knowledge_base/KnowledgeBaseModal";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorComponent from "@/components/Error";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function KnowledgeBasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/knowledge_base`);
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(
          data.map((course) => ({
            id: course.id,
            title: course.name,
            documents: course.document_count,
            imageUrl:
              `${API_BASE_URL}/getfile/${course.background_image}` ||
              "https://placehold.co/300x200?text=Course",
          }))
        );
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleAddCourse = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateCourse = () => {
    // Handle course creation logic here
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorComponent message={error} />;
  }

  return (
    <div className="min-h-screen bg-purple-50">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AddCourseCard onClick={handleAddCourse} />
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>

        {/* <h2 className="text-2xl font-bold mt-12 mb-6">Your Assistants</h2> */}
        {/* Add assistants section content here */}
      </main>

      <KnowledgeBaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreateCourse}
        kbId={1} // You may want to adjust this value or make it dynamic
      />
    </div>
  );
}
