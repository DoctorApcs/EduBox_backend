import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const ChatArea = ({ conversation, assistantId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchConversationHistory();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const fetchConversationHistory = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/assistant/${assistantId}/conversations/${conversation.id}/history`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch conversation history");
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching conversation history:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = { sender_type: "user", content: inputMessage };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");
    setIsLoading(true);
    setStreamingMessage("");
    let fullResponse = "";

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/assistant/${assistantId}/conversations/${conversation.id}/chat/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: inputMessage }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk; // Add the chunk to the full response

        setStreamingMessage((prev) => prev + chunk);
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender_type: "assistant", content: fullResponse },
      ]);
      setStreamingMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender_type === "user" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender_type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
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
              {message.sender_type === "assistant" ? (
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800">
              <div className="flex items-center mb-1">
                <Bot size={16} className="mr-2" />
                <span className="font-semibold">Assistant</span>
              </div>
              <ReactMarkdown className="prose prose-sm max-w-none">
                {streamingMessage}
              </ReactMarkdown>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-end bg-white rounded-3xl shadow-lg border border-gray-300">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Message Assistant"
            className="flex-1 bg-transparent border-none rounded-3xl py-4 px-5 focus:outline-none resize-none text-gray-800 min-h-[60px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-transparent text-gray-500 p-4 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 mr-2"
            disabled={isLoading}
          >
            <Send size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;
