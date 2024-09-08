import CustomMarkdown from "@/components/Markdown";
import { useState } from "react";
import Quiz from "./Quiz";
import { Loader2 } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function LessonContent({ lesson, onBack, kbId }) {
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);

  const generateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuizData(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/knowledge_base/${kbId}/lessons/${lesson.id}/generate_quiz`
      );
      if (response.ok) {
        const data = await response.json(); // Change this to parse JSON
        setQuizData(data);
      } else {
        console.error("Failed to generate quiz");
        // Handle error
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      // Handle error
    }
    setIsGeneratingQuiz(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <button
        onClick={onBack}
        className="mb-4 text-purple-600 hover:text-purple-800"
      >
        ← Back to Lessons
      </button>
      <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
      <CustomMarkdown className="prose max-w-none">
        {lesson.content}
      </CustomMarkdown>
      <button
        onClick={generateQuiz}
        disabled={isGeneratingQuiz}
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-purple-400 flex items-center justify-center"
      >
        {isGeneratingQuiz ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 text-white animate-spin" />
            Generating Quiz...
          </>
        ) : (
          "Generate Quiz"
        )}
      </button>
      {quizData && (
        <Quiz quizData={quizData} onClose={() => setQuizData(null)} />
      )}
    </div>
  );
}
