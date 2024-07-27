"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, Settings } from "lucide-react";
import UploadFileModal from "@/components/knowledge_base/UploadFileModal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const DatasetView = ({ knowledgeBaseID }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/knowledge_base/${knowledgeBaseID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch knowledge base data");
        }
        const data = await response.json();
        setKnowledgeBase(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchKnowledgeBase();
  }, [knowledgeBaseID]);

  const handleUpload = (files) => {
    // Here you would handle the file upload logic
    console.log("Uploading files:", files);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold">{knowledgeBase.name}</h2>
        </div>
        <nav className="mt-6">
          <a
            href="#"
            className="block py-2 px-4 bg-blue-100 text-blue-700 border-l-4 border-blue-700"
          >
            <FileText className="inline-block mr-2" size={20} />
            Dataset
          </a>
          <a
            href="#"
            className="block py-2 px-4 text-gray-600 hover:bg-gray-100"
          >
            Retrieval testing
          </a>
          <a
            href="#"
            className="block py-2 px-4 text-gray-600 hover:bg-gray-100"
          >
            <Settings className="inline-block mr-2" size={20} />
            Configuration
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Dataset</h1>
          <p className="text-sm text-gray-600">Knowledge Base / Dataset</p>
        </div>

        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Note:</p>
          <p>
            Questions and answers can only be answered after the parsing is
            successful.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded">
              Bulk
            </button>
            <div className="flex">
              <div className="relative mr-2">
                <input
                  type="text"
                  placeholder="Search your files"
                  className="pl-10 pr-4 py-2 border rounded-md"
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={20}
                />
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add file
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-600 bg-gray-100">
                <th className="p-2">Name</th>
                <th className="p-2">File Type</th>
                <th className="p-2">Upload Date</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {knowledgeBase.documents.length > 0 ? (
                knowledgeBase.documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="p-2">{doc.file_name}</td>
                    <td className="p-2">{doc.file_type}</td>
                    <td className="p-2">
                      {new Date(doc.created_at).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <div className="flex flex-col items-center text-gray-400">
                      <FileText size={48} />
                      <p className="mt-2">No data</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default DatasetView;
