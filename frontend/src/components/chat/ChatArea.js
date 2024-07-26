import React from "react";
import { MessageSquare } from "lucide-react";

const ChatArea = () => {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Chat messages would go here */}
        <div className="flex items-start mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
            <MessageSquare size={16} />
          </div>
          <div className="bg-white p-3 rounded-lg shadow max-w-md">
            <p>Hi! I'm your assistant, what can I do for you?</p>
          </div>
        </div>
      </div>
      <div className="bg-white border-t p-4">
        <div className="flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600">
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatArea;
