"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  FileText,
  Settings,
  Check,
  FileIcon,
  File,
  Download,
  Trash2,
  Loader,
} from "lucide-react";
import UploadFileModal from "@/components/knowledge_base/UploadFileModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorComponent from "@/components/Error";
import CircularProgress from "@/components/CircularProgress";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const ALLOWED_FILE_TYPES = [
  ".docx",
  ".hwp",
  ".pdf",
  ".epub",
  ".txt",
  ".html",
  ".htm",
  ".ipynb",
  ".md",
  ".mbox",
  ".pptx",
  ".csv",
  ".xml",
  ".rtf",
  ".mp4",
];

const DatasetView = ({ knowledgeBaseID }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);

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
        setDocuments(data.documents);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchKnowledgeBase();
  }, [knowledgeBaseID]);

  useEffect(() => {
    const checkProcessingDocuments = async () => {
      const processingDocs = documents.filter(
        (doc) => doc.status === "processing"
      );
      if (processingDocs.length > 0) {
        const updatedStatuses = await Promise.all(
          processingDocs.map(async (doc) => {
            const response = await fetch(
              `${API_BASE_URL}/api/knowledge_base/document_status/${doc.id}`
            );
            const status = await response.json();
            return { id: doc.id, ...status };
          })
        );

        setDocuments((prevDocs) =>
          prevDocs.map((doc) => {
            const updatedStatus = updatedStatuses.find((s) => s.id === doc.id);
            return updatedStatus ? { ...doc, ...updatedStatus } : doc;
          })
        );
      }
    };

    const intervalId = setInterval(checkProcessingDocuments, 1000);

    return () => clearInterval(intervalId);
  }, [documents]);

  const handleUpload = async (files) => {
    for (const file of files) {
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
        setError(
          `File type ${fileExtension} is not allowed. Allowed types are: ${ALLOWED_FILE_TYPES.join(
            ", "
          )}`
        );
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/knowledge_base/upload_document?knowledge_base_id=${knowledgeBaseID}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to upload document");
        }

        const result = await response.json();
        setDocuments((prevDocuments) => [
          ...prevDocuments,
          {
            id: result.document_id,
            file_name: file.name,
            created_at: result.created_at,
            file_type: result.file_type,
            status: "uploaded",
          },
        ]);
      } catch (error) {
        console.error("Error uploading document:", error);
        setError(error.message);
      }
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/knowledge_base/download_document/${documentId}`
      );
      if (!response.ok) {
        throw new Error("Failed to download document");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      setError(error.message);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/knowledge_base/delete_document/${documentId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete document");
        }
        setDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc.id !== documentId)
        );
      } catch (error) {
        console.error("Error deleting document:", error);
        setError(error.message);
      }
    }
  };

  const handleProcessDocument = async (documentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/knowledge_base/process_document/${documentId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to process document");
      }

      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) =>
          doc.id === documentId ? { ...doc, status: "processing" } : doc
        )
      );
    } catch (error) {
      console.error("Error processing document:", error);
      setError(error.message);
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".pdf")) {
      return <FileIcon className="inline-block mr-2 text-red-500" size={16} />;
    } else if (fileName.endsWith(".docx")) {
      return <FileIcon className="inline-block mr-2 text-blue-500" size={16} />;
    } else {
      return <File className="inline-block mr-2 text-gray-500" size={16} />;
    }
  };

  const truncateFileName = (fileName, maxLength = 30) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split(".").pop();
    const nameWithoutExtension = fileName.slice(0, -(extension.length + 1));
    const truncatedName =
      nameWithoutExtension.slice(0, maxLength - 3 - extension.length) + "...";
    return truncatedName + "." + extension;
  };

  const renderStatus = (doc) => {
    if (doc.status === "processing") {
      const progress = doc.progress
        ? (doc.progress.current / doc.progress.total) * 100
        : 0;
      return (
        <div className="flex items-center">
          <div className="relative mr-2">
            {progress === 0 ? (
              <div className="animate-spin">
                <CircularProgress progress={25} />
              </div>
            ) : (
              <CircularProgress progress={progress} />
            )}
          </div>
          <span className="text-sm text-gray-600">
            {progress > 0 ? `${Math.round(progress)}%` : "Processing"}
          </span>
        </div>
      );
    } else if (doc.status === "processed") {
      return (
        <span className="flex items-center text-green-600">
          <Check className="mr-1" size={16} />
          Processed
        </span>
      );
    } else if (doc.status === "failed") {
      return (
        <span className="text-red-600">
          Failed{" "}
          <button
            onClick={() => handleProcessDocument(doc.id)}
            className="text-blue-500 hover:text-blue-700"
          >
            Retry
          </button>
        </span>
      );
    } else {
      return <span className="text-gray-600">{doc.status}</span>;
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent message={error} />;

  return (
    // <div className="flex h-screen bg-gray-100">
    <div className="flex h-full w-full p-4 sm:p-6 lg:p-8">
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div>
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
              role="alert"
            >
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
            role="alert"
          >
            <p className="font-bold">Note:</p>
            <p>
              Questions and answers can only be answered after the parsing is
              successful.
            </p>
          </div> */}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-white shadow rounded-lg">
          <div className="flex justify-between p-6">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded">
              Bulk
            </button>
            <div className="flex">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-custom-primary-start text-white rounded flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add file
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <table className="w-full">
              <colgroup>
                <col style={{ width: "40%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr className="text-left text-gray-600 bg-gray-100">
                  <th className="p-2">Name</th>
                  <th className="p-2">File Type</th>
                  <th className="p-2">Upload Date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="p-2">
                        <div className="flex items-center">
                          {getFileIcon(doc.file_name)}
                          <span title={doc.file_name} className="truncate">
                            {truncateFileName(doc.file_name)}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">{doc.file_type}</td>
                      <td className="p-2">
                        {new Date(doc.created_at).toLocaleString()}
                      </td>
                      <td className="p-2">{renderStatus(doc)}</td>
                      <td className="p-2">
                        {doc.status === "uploaded" ? (
                          <button
                            onClick={() => handleProcessDocument(doc.id)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Process
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleDownloadDocument(doc.id, doc.file_name)
                              }
                              className="text-blue-500 hover:text-blue-700"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
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
        </div>
      </main>
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        allowedFileTypes={ALLOWED_FILE_TYPES}
      />
    </div>
  );
};

export default DatasetView;
