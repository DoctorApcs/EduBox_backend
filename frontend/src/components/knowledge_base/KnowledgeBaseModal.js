import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, Loader, Globe } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Add this import

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const KnowledgeBaseModal = ({ isOpen, onClose, onCreate }) => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sources, setSources] = useState([]);
  const [kbId, setKbId] = useState(null);

  const getHostname = (url) => {
    try {
      return new URL(url).hostname;
    } catch (error) {
      console.error("Invalid URL:", url);
      return "Unknown";
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Open WebSocket connection when modal is opened
      websocketRef.current = new WebSocket(
        `ws://${API_BASE_URL.replace(
          /^https?:\/\//,
          ""
        )}/api/knowledge_base/generate_course`
      );

      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "human_feedback") {
          setHumanFeedbackRequired(true);
          setSections(
            data.output.map((section, index) => ({
              id: index + 1,
              title: section,
            }))
          );
          setIsLoading(false); // Set loading to false when human feedback is required
          setLogs(""); // Clear logs when human feedback is required
        } else if (data.type === "kb_created") {
          console.log("kb_created", data.content);
          setKbId(data.content);
        } else if (data.type === "end") {
          setIsCompleted(true);
          setIsLoading(false);
          setTimeout(() => {
            onCreate(data.metadata.knowledge_base_id); // Call onClose instead of router.push
          }, 2000); // Close modal after 2 seconds
        } else if (data.type === "logs") {
          if (data.content === "added_source_url") {
            const url = data.output
              .split("✅ Added source url to research:")[1]
              .trim();
            setSources((prevSources) => [url, ...prevSources]);
          } else {
            setLogs(data.output);
          }
        }
      };

      return () => {
        // Close WebSocket connection when modal is closed
        if (websocketRef.current) {
          websocketRef.current.close();
        }
        setCourseContent("");
      };
    }
  }, [isOpen, onClose]); // Add onClose to the dependency array

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLogs("Creating course...");
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.send(JSON.stringify(formData));
    }
  };

  const handleClose = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    // Reset all content and data
    setCourseContent("");
    setHumanFeedbackRequired(false);
    setFeedbackText("");
    setLogs("");
    setIsLoading(false);
    setSections([]);
    setIsCompleted(false);
    setSources([]);
    setKbId(null);
    setFormData({
      query: "",
      max_sections: 3,
      include_human_feedback: false,
      follow_guidelines: false,
      model: "gpt-4o-mini",
      verbose: false,
    });
    onClose();
  };

  const handleFeedback = () => {
    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      setIsLoading(true); // Set loading to true when submitting feedback
      setLogs("Processing feedback..."); // Set logs when submitting feedback
      websocketRef.current.send(
        JSON.stringify({
          type: "human_feedback",
          content: feedbackText.trim() || "no",
        })
      );
      setHumanFeedbackRequired(false);
      setFeedbackText("");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center overflow-hidden"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-5/6 flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Purple Sidebar */}
        <div className="w-1/3 bg-purple-600 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Create New Course
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Query */}
            <div>
              <label
                htmlFor="query"
                className="block text-sm font-medium text-white mb-1"
              >
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
              <label
                htmlFor="max_sections"
                className="block text-sm font-medium text-white mb-1"
              >
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
              {["include_human_feedback", "follow_guidelines", "verbose"].map(
                (field) => (
                  <label key={field} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name={field}
                      checked={formData[field]}
                      onChange={handleChange}
                      className="form-checkbox h-4 w-4 text-purple-300 border-purple-400 rounded"
                      defaultChecked={true}
                    />
                    <span className="ml-2 text-white text-sm">
                      {field.replace(/_/g, " ")}
                    </span>
                  </label>
                )
              )}
            </div>

            {/* Model */}
            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-white mb-1"
              >
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
            {/* <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-white mb-1"
              >
                Upload Image
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="w-full p-2 border border-purple-400 rounded-md bg-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div> */}

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
            <div className="overflow-y-auto">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-gray-100 p-4 rounded-lg mb-4"
                >
                  <h3 className="text-lg font-semibold">
                    Section {section.id}: {section.title}
                  </h3>
                </div>
              ))}
              {!sections.length && !isLoading && (
                <pre className="whitespace-pre-wrap text-gray-600">
                  {courseContent ||
                    "The course content will be displayed here after creation."}
                </pre>
              )}
            </div>
            {isLoading && (
              <div className="flex items-center justify-start mt-4">
                <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-lg font-regular truncate">
                  {logs}
                </span>
              </div>
            )}
            {humanFeedbackRequired && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter your feedback here (leave empty to accept)"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleFeedback}
                    className="px-4 py-2 bg-custom-primary-start text-white rounded-md hover:bg-custom-primary-end focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => {
                      setFeedbackText("");
                      handleFeedback();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                    No Feedback
                  </button>
                </div>
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center justify-start mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <span className="ml-2 text-lg font-semibold">
                  Course creation completed!
                </span>
              </div>
            )}

            {/* Updated Sources section */}
            {sources.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-2">Sources</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {sources.map((source, index) => (
                      <motion.a
                        key={source}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-600 truncate">
                            {getHostname(source)}
                          </span>
                        </div>
                      </motion.a>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseModal;
