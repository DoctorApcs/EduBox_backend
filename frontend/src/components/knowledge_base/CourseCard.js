import { useRouter } from 'next/navigation';

export function CourseCard({ id, title, documents, imageUrl }) {
  const router = useRouter();

  const handleStartLearning = () => {
    router.push(`/knowledge/${id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:scale-105 transition-all duration-300">
      <div className="relative mb-4">
        <img src={imageUrl} alt={title} className="w-full h-40 object-cover shadow-md" />
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {documents} Docs
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{documents} documents</p>
        <button
          onClick={handleStartLearning}
          className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}

export const AddCourseCard = ({ onClick }) => (
  <div className="bg-transparent rounded-2xl shadow-md p-4 flex items-center justify-center border-4 border-dashed border-custom-primary-start cursor-pointer hover:border-purple-500 transition-colors" onClick={onClick}>
    <span className="text-6xl text-custom-primary-start">+</span>
  </div>
);