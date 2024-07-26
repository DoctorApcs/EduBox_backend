import React, { useState } from "react";
import { X, Upload, Info } from "lucide-react";

const CreateAssistantModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("Assistant Setting");
  const [assistantName, setAssistantName] = useState("");
  const [opener, setOpener] = useState(
    "Hi! I'm your assistant, what can I do for you?"
  );
  const [showQuote, setShowQuote] = useState(false);
  const [selfRAG, setSelfRAG] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState("");

  if (!isOpen) return null;

  const renderAssistantSetting = () => (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Assistant name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={assistantName}
          onChange={(e) => setAssistantName(e.target.value)}
          placeholder="e.g. Resume Jarvis"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Assistant avatar
        </label>
        <div className="mt-1 flex items-center">
          <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
            <Upload className="h-full w-full text-gray-300" />
          </span>
          <button
            type="button"
            className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Set an opener <Info className="inline-block w-4 h-4 text-gray-400" />
        </label>
        <textarea
          value={opener}
          onChange={(e) => setOpener(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
        />
      </div>

      {/* <div className="flex items-center justify-between">
        <span className="flex items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Show Quote
          </span>
          <Info className="w-4 h-4 text-gray-400" />
        </span>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={showQuote}
              onChange={() => setShowQuote(!showQuote)}
            />
            <div
              className={`block w-10 h-6 rounded-full ${
                showQuote ? "bg-blue-500" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                showQuote ? "transform translate-x-4" : ""
              }`}
            ></div>
          </div>
        </label>
      </div> */}

      <div className="flex items-center justify-between">
        <span className="flex items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Self-RAG
          </span>
          <Info className="w-4 h-4 text-gray-400" />
        </span>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={selfRAG}
              onChange={() => setSelfRAG(!selfRAG)}
            />
            <div
              className={`block w-10 h-6 rounded-full ${
                selfRAG ? "bg-blue-500" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                selfRAG ? "transform translate-x-4" : ""
              }`}
            ></div>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Knowledgebases <span className="text-red-500">*</span>{" "}
          <Info className="inline-block w-4 h-4 text-gray-400" />
        </label>
        <select
          value={knowledgeBase}
          onChange={(e) => setKnowledgeBase(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
        >
          <option value="">Please select</option>
          {/* Add your knowledge base options here */}
        </select>
      </div>
    </form>
  );

  const renderPromptEngine = () => (
    <div className="space-y-4">
      <p>Prompt Engine settings go here.</p>
      {/* Add your Prompt Engine form fields here */}
    </div>
  );

  const renderModelSetting = () => (
    <div className="space-y-4">
      <p>Model Setting options go here.</p>
      {/* Add your Model Setting form fields here */}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-16">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Chat Configuration</h2>
              <p className="text-sm text-gray-500">
                Here, dress up a dedicated assistant for your special knowledge
                bases! 💕
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex space-x-4 mb-6">
            {["Assistant Setting"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === tab
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="transition-opacity duration-300 ease-in-out">
            {activeTab === "Assistant Setting" && renderAssistantSetting()}
            {/* {activeTab === "Prompt Engine" && renderPromptEngine()}
            {activeTab === "Model Setting" && renderModelSetting()} */}
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssistantModal;
