"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import KnowledgeBaseCard from "@/components/knowledge_base/KnowledgeBaseCard";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import KnowledgeBaseModal from "@/components/knowledge_base/KnowledgeBaseModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorComponent from "@/components/Error";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

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
            docCount: course.document_count,
            lastUpdated: course.last_updated,
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateCourse = (kbId) => {
    // redirect to knowledge/1
    setIsModalOpen(false);
    router.push(`/knowledge/${kbId}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorComponent message={error} />;
  }

  return (
    <div className="flex h-full">
      <main className="flex-1 p-6 bg-custom-background">
        <div className="flex items-center justify-between p-6 bg-custom-primary rounded-lg relative h-52 mt-6">
          <div className="z-1">
            <h2 className="text-4xl font-semibold text-white">
              Welcome back, admin!
            </h2>
            <p className="text-white text-xl">
              You are doing great! Keep it up
            </p>
          </div>
          <div
            className="w-64 h-52 bg-cover bg-center absolute right-8 -top-12"
            style={{ backgroundImage: "url('Idea.svg')" }}
          />
        </div>
        <section className="mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Courses</h3>
            <a
              href="/knowledge"
              className="text-lg text-custom-primary-start hover:underline"
            >
              See All
            </a>
          </div>
          <div className="flex gap-6 mt-4 flex-row overflow-x-auto p-4">
            <Card
              className="flex-shrink-0 flex items-center justify-center border-4 border-dashed border-custom-primary-start cursor-pointer bg-transparent rounded-3xl h-52 w-52"
              onClick={handleOpenModal}
            >
              <PlusIcon className="w-12 h-12 text-purple-600" />
            </Card>
            {courses
              .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
              .slice(0, 3)
              .map((course) => (
                <KnowledgeBaseCard
                  key={course.id}
                  title={course.title}
                  docCount={course.docCount}
                  lastUpdated={course.lastUpdated}
                  onClick={() => router.push(`/knowledge/${course.id}`)}
                  imageUrl={course.imageUrl}
                />
              ))}
          </div>
        </section>
        {/* <section className="mt-6">
          <h3 className="text-xl font-semibold">Recent Activities</h3>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Card className="flex items-center p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                <FileTextIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold">Final Revision</h4>
                <p className="text-gray-600">Calculus 3</p>
                <p className="text-gray-400 text-sm">45mins ago</p>
              </div>
              <div className="ml-auto">
                <ArrowRightIcon className="w-6 h-6 text-gray-600" />
              </div>
            </Card>
            <Card className="flex items-center p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                <FileTextIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold">Final Revision</h4>
                <p className="text-gray-600">Calculus 3</p>
                <p className="text-gray-400 text-sm">45mins ago</p>
              </div>
              <div className="ml-auto">
                <ArrowRightIcon className="w-6 h-6 text-gray-600" />
              </div>
            </Card>
            <Card className="flex items-center justify-center p-4">
              <div
                className="w-32 h-32 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('/placeholder.svg?height=128&width=128')",
                }}
              />
              <div className="ml-4">
                <h4 className="font-semibold">Mind map</h4>
              </div>
            </Card>
          </div>
        </section> */}
      </main>
      <aside className="w-96 p-4 bg-custom-background border-l shadow-lg">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 border-8 border-custom-primary-start mt-8">
            <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <h4 className="mt-4 font-semibold">Admin</h4>
          <Badge variant="secondary" className="mt-2 bg-custom-cta">
            Pro
          </Badge>
        </div>
        <div className="mt-6 flex items-center justify-center">
          <BarChart className="h-32" />
        </div>
        <div className="mt-6 flex flex-col items-center">
          <h4 className="font-semibold">Calendar</h4>
          <Calendar mode="single" className="border rounded-md mt-4" />
        </div>
      </aside>

      <KnowledgeBaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreateCourse}
      />
    </div>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function BarChart(props) {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Hours",
        data: [8, 6, 9, 5, 7, 4, 3],
        backgroundColor: "#6B0ACE",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 12,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          stepSize: 2,
        },
      },
    },
  };

  return (
    <div {...props}>
      <Bar data={data} options={options} />
    </div>
  );
}

function FileTextIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
