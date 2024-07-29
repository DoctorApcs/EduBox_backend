"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, File as FileIcon } from "lucide-react";

const UploadFileModal = ({ isOpen, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (!isOpen) return null;

  const handleUpload = async () => {
    setUploading(true);
    await onUpload(files);
    setUploading(false);
    setFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-16">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Upload File</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex space-x-4 mb-4">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded">
              File
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              Directory
            </button>
          </div>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Click or drag file to this area to upload</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Support for a single or bulk upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
          </div>
          {files.length > 0 && (
            <div className="mt-4">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center text-sm text-gray-600"
                >
                  <FileIcon size={16} className="mr-2" />
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={files.length === 0 || uploading}
          >
            {uploading ? "Uploading..." : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileModal;
