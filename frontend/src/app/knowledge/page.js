"use client"

import { CourseCard, AddCourseCard } from "@/components/knowledge_base/CourseCard";

export default function KnowledgeBasePage() {
  const courses = [
    { id: 1, title: "Database", documents: 2, imageUrl: "https://placehold.co/300x200?text=Database" },
    { id: 2, title: "Database", documents: 2, imageUrl: "https://placehold.co/300x200?text=Database" },
    { id: 3, title: "Database", documents: 2, imageUrl: "https://placehold.co/300x200?text=Database" },
  ];

  return (
    <div className="min-h-screen bg-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search your courses, activities, knowledge..."
            className="w-full max-w-xl px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Admin</span>
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
              Pro
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
          <AddCourseCard />
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-6">Your Assistants</h2>
        {/* Add assistants section content here */}
      </main>
    </div>
  );
}