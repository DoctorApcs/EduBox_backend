export const CourseCard = ({ title, documents, imageUrl }) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
    <img src={imageUrl} alt={title} className="w-full h-32 object-cover rounded-t-lg" />
    <h3 className="text-lg font-semibold mt-2">{title}</h3>
    <p className="text-sm text-gray-600">{documents} Documents</p>
    <button className="mt-auto bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors">
      Learn!
    </button>
  </div>
);

export const AddCourseCard = () => (
  <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center border-2 border-dashed border-purple-300 cursor-pointer hover:border-purple-500 transition-colors">
    <span className="text-6xl text-purple-500">+</span>
  </div>
);