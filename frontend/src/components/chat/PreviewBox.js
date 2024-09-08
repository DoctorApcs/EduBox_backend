import React from "react";
import { X } from "lucide-react";

const PreviewBox = ({ isOpen, onClose, children, title }) => {
  return (
    <div
      className={`
        right-0 bottom-0 w-1/2 bg-gray-100 flex flex-col shadow-lg
        transform transition-transform duration-300 ease-in-out m-4 rounded-2xl
        ${isOpen ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div className="bg-purple-100 p-4 flex justify-between items-center rounded-t-2xl">
        <h2 className="font-bold">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      <div className="flex-grow overflow-auto p-4 pl-6">{children}</div>
      <div className="bg-purple-100 p-4 rounded-b-2xl">
        <p className="text-sm text-gray-600">Preview Footer</p>
      </div>
    </div>
  );
};

export default PreviewBox;
