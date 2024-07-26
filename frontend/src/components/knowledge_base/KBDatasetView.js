"use client";

import React from "react";
import { Search, Plus, FileText, Settings } from "lucide-react";

const DatasetView = ({ knowledgeBaseName }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold">{knowledgeBaseName}</h2>
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
              <button className="px-4 py-2 bg-blue-500 text-white rounded flex items-center">
                <Plus size={20} className="mr-2" />
                Add file
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-600 bg-gray-100">
                <th className="p-2">Name</th>
                <th className="p-2">Chunk Number</th>
                <th className="p-2">Upload Date</th>
                <th className="p-2">Chunk Method</th>
                <th className="p-2">Enable</th>
                <th className="p-2">Parsing Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="flex flex-col items-center text-gray-400">
                    <FileText size={48} />
                    <p className="mt-2">No data</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DatasetView;
