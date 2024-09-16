import React from "react";
import { Bot, User } from "lucide-react";
import CustomMarkdown from "../Markdown";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const Message = React.memo(({ message, onShowSource }) => {
    const renderMessage = (message) => {
      try {
        switch (message.type) {
          case "text":
            return (
              <CustomMarkdown onShowSource={onShowSource}>
                {message.content}
              </CustomMarkdown>
            );
          case "video":
            const fullVideoUrl = `${API_BASE_URL}/getfile/${message.content.url}`;
            return (
              <video controls className="w-full max-w-lg mt-2">
                <source src={fullVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            );
          case "image":
            return (
              <img
                src={message.content}
                alt="Assistant generated image"
                className="w-full max-w-lg mt-2"
              />
            );
          default:
            return (
              <CustomMarkdown onShowSource={onShowSource}>
                {message.content}
              </CustomMarkdown>
            );
        }
      } catch (error) {
        // If parsing fails, treat the entire message as plain text
        return (
          <CustomMarkdown onShowSource={onShowSource}>
            {message.content}
          </CustomMarkdown>
        );
      }
    };
  
    return (
      <div
        className={`flex ${
          message.sender_type === "user" ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div
          className={`${
            message.sender_type === "user"
              ? "max-w-[60%] bg-purple-600 text-white"
              : "max-w-[100%] bg-purple-200 text-gray-800"
          } p-3 rounded-lg`}
        >
          <div className="flex items-center mb-1">
            {message.sender_type === "user" ? (
              <User size={16} className="mr-2" />
            ) : (
              <Bot size={16} className="mr-2" />
            )}
            <span className="font-semibold">
              {message.sender_type === "user" ? "You" : "Assistant"}
            </span>
          </div>
          {renderMessage(message)}
        </div>
      </div>
    );
  });