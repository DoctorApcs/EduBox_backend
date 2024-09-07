import React, { useState, useEffect, useRef } from "react";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
// Remove the following import:
// import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const KnowledgeBaseModal = ({ isOpen, onClose, onCreate, kbId }) => {
  const [formData, setFormData] = useState({
    query: "",
    max_sections: 3,
    include_human_feedback: false,
    follow_guidelines: false,
    model: "gpt-4o-mini",
    verbose: false,
  });
  const [courseContent, setCourseContent] = useState("");
  const websocketRef = useRef(null);
  const [humanFeedbackRequired, setHumanFeedbackRequired] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [logs, setLogs] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [sections, setSections] = useState([]);
  const [logsHeight, setLogsHeight] = useState(200); // Initial height for logs
  const logsRef = useRef(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Open WebSocket connection when modal is opened
      websocketRef.current = new WebSocket(`ws://${API_BASE_URL.replace(
        /^https?:\/\//,
        ""
      )}/api/knowledge_base/${1}/generate_course`);

      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "human_feedback") {
          setHumanFeedbackRequired(true);
          setSections(data.output.map((section, index) => ({ id: index + 1, title: section })));
        } else if (data.type === "end") {
          setIsCompleted(true);
          setTimeout(() => {
            onCreate(); // Call onClose instead of router.push
          }, 2000); // Close modal after 2 seconds
        } else {
          setLogs(prevContent => prevContent + JSON.stringify(data, null, 2) + "\n\n");
        }
      };

      // Scroll logs to bottom when content changes
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight;
      }

      return () => {
        // Close WebSocket connection when modal is closed
        if (websocketRef.current) {
          websocketRef.current.close();
        }
        setCourseContent("");
      };
    }
  }, [isOpen, kbId, onClose]); // Add onClose to the dependency array

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(formData));
    }
    // onCreate(formData);
  };

  const handleClose = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    setCourseContent("");
    setHumanFeedbackRequired(false);
    setFeedbackText("");
    onClose();
  };

  const handleFeedback = () => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: "human_feedback",
        content: feedbackText.trim() || "no"
      }));
      setHumanFeedbackRequired(false);
      setFeedbackText("");
    }
  };

  const handleResize = (event, { size }) => {
    setLogsHeight(size.height);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-hidden">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 flex">
        {/* Purple Sidebar */}
        <div className="w-1/3 bg-purple-600 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-white">Create New Course</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Query */}
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-white mb-1">
                Query
              </label>
              <input
                id="query"
                name="query"
                type="text"
                value={formData.query}
                onChange={handleChange}
                className="w-full p-2 border border-purple-400 rounded-md bg-purple-500 text-white placeholder-purple-300"
                required
              />
            </div>

            {/* Max Sections */}
            <div>
              <label htmlFor="max_sections" className="block text-sm font-medium text-white mb-1">
                Max Sections
              </label>
              <input
                id="max_sections"
                name="max_sections"
                type="number"
                min="1"
                value={formData.max_sections}
                onChange={handleChange}
                className="w-full p-2 border border-purple-400 rounded-md bg-purple-500 text-white"
              />
            </div>

            {/* Other checkboxes */}
            <div className="space-y-2">
              {['include_human_feedback', 'follow_guidelines', 'verbose'].map((field) => (
                <label key={field} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name={field}
                    checked={formData[field]}
                    onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-purple-300 border-purple-400 rounded"
                  />
                  <span className="ml-2 text-white text-sm">{field.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-white mb-1">
                Model
              </label>
              <select
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full p-2 border border-purple-400 rounded-md bg-purple-500 text-white"
              >
                <option value="gpt-4o-mini">gpt-4o-mini</option>
              </select>
            </div>

            {/* Image upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-white mb-1">
                Upload Image
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="w-full p-2 border border-purple-400 rounded-md bg-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-purple-600 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
              >
                Create
              </button>
            </div>
          </form>
        </div>

        {/* Main Content Area */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-grow p-6 bg-white overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            {isCompleted && (
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <span className="ml-2 text-lg font-semibold">Course creation completed!</span>
              </div>
            )}
            <div className="overflow-y-auto">
              {sections.map(section => (
                <div key={section.id} className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold">Section {section.id}: {section.title}</h3>
                </div>
              ))}
              {!sections.length && (
                <pre className="whitespace-pre-wrap text-gray-600">
                  {courseContent || "The course content will be displayed here after creation."}
                </pre>
              )}
            </div>
            {humanFeedbackRequired && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter your feedback here (leave empty to accept)"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
                <button
                  onClick={handleFeedback}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
          
          {/* Logs Section */}
          <Resizable
            height={logsHeight}
            width={Infinity}
            onResize={handleResize}
            minConstraints={[Infinity, 100]}
            maxConstraints={[Infinity, window.innerHeight * 0.3]}
          >
            <div style={{ height: `${logsHeight}px` }} className="border-t border-gray-200">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="w-full p-2 text-left text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                {showLogs ? "Hide Logs" : "Show Logs"}
              </button>
              {showLogs && (
                <pre
                  ref={logsRef}
                  className="bg-gray-50 p-4 text-sm text-gray-600 overflow-y-auto"
                  style={{ height: `calc(100% - 40px)` }}
                >
                  {logs || "No logs available."}
                </pre>
              )}
            </div>
          </Resizable>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseModal;