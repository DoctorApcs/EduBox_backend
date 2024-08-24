import React from "react";
import { X } from "lucide-react";

const PreviewBox = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="bg-gray-100 flex flex-col h-1/2 mb-4">
      <div className="bg-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      <div className="flex-grow overflow-auto p-4">{children}</div>
    </div>
  );
};

export default PreviewBox;
