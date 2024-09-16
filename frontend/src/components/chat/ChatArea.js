import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Send, User, Bot, Loader2, Maximize2, FileText } from "lucide-react";
import ErrorMessage from "@/components/chat/ErrorMessage"; // Import the new ErrorMessage component
import PreviewBox from "./PreviewBox";
import { Message } from "@/components/chat/Message";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const ChatArea = ({ conversation, assistantId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [error, setError] = useState(""); // New state for error messages
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sources, setSources] = useState([]);
  const [previewContent, setPreviewContent] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const websocketRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    const ws = new WebSocket(
      `ws://${API_BASE_URL.replace(
        /^https?:\/\//,
        ""
      )}/api/assistant/${assistantId}/conversations/${conversation.id}/ws`
    );

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "message":
          setIsAssistantTyping(false);
          if (data.media_type === "text") {
            setStreamingMessage((prev) => ({
              ...prev,
              content: (prev?.content || "") + data.content,
              type: "text",
            }));
          } else if (data.media_type === "video") {
            setStreamingMessage({
              type: "video",
              content: data.content,
              metadata: data.metadata,
            });
          }
          break;
        case "status":
          console.log("Status update:", data.content);
          break;
        case "error":
          console.error("Error:", data.content);
          setError(data.content); // Set the error message
          break;
        case "end":
          setIsAssistantTyping(false);
          console.log("END MESSAGE");

          let newMessage = {
            sender_type: "assistant",
            media_type: "",
            content: "",
            metadata: {},
          };
          let addNewMessage = false;

          setStreamingMessage((prev) => {
            if (prev) {
              newMessage.type = prev.type;
              newMessage.content = prev.content;
              newMessage.metadata = prev.metadata;
              addNewMessage = true;
            }
            return null;
          });
          setMessages((prevMessages) => [...prevMessages, newMessage]);

          break;
        case "sources":
          setSources(data.content);
          console.log("Received sources:", data);
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");

    websocketRef.current = ws;
  }, [assistantId, conversation.id]);

  useEffect(() => {
    if (conversation) {
      fetchConversationHistory();
      connectWebSocket();
      setError("");
    }

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [conversation, assistantId, connectWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (streamingMessage) {
      scrollToBottom();
    }
  }, [streamingMessage]);

  const fetchConversationHistory = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/assistant/${assistantId}/conversations/${conversation.id}/history`
      );
      if (!response.ok) throw new Error("Failed to fetch conversation history");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      setError("Failed to load conversation history. Please try again."); // Set error message
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      sender_type: "user",
      content: inputMessage,
      type: "text",
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsAssistantTyping(true);
    setError(""); // Clear any previous errors

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ content: inputMessage }));
      } else {
        throw new Error("WebSocket is not connected");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again."); // Set error message
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const adjustTextareaHeight = () => {
    const MAX_TEXTAREA_HEIGHT = 200;
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        MAX_TEXTAREA_HEIGHT
      )}px`;

      // Add scrollbar if content exceeds max height
      textareaRef.current.style.overflowY =
        scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    }
  };

  const togglePreview = () => {
    setIsPreviewOpen(!isPreviewOpen);
  };

  const memoizedMessages = useMemo(() => messages, [messages]);

  const showSource = useCallback((index) => {
    if (sources[index]) {
      const source = sources[index];
      console.log(source);
      
      if (typeof source.url === 'string' && source.url.toLowerCase().endsWith('.pdf')) {
        const fileUrl = `${API_BASE_URL}/getfile/uploads/${source.url}`;
        setPreviewContent(<iframe src={fileUrl} width="100%" height="100%" />);
        setIsPreviewOpen(true);
      } else if (source.url.startsWith('https://')) {
        window.open(source.url, '_blank');
      } else {
        console.error('Unsupported source URL:', source.url);
      }
    }
  }, [sources, API_BASE_URL]);

  return (
    <div className="flex h-full bg-purple-50">
      <div className={`flex-grow flex flex-col ${isPreviewOpen ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
        <div className="flex-grow overflow-y-auto p-4 pb-32">
          <div className="max-w-4xl mx-auto">
            {memoizedMessages.map((message, index) => (
              <Message key={index} message={message} onShowSource={showSource} />
            ))}
            {isAssistantTyping && (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
            {streamingMessage && <Message message={streamingMessage} />}
            {error && <ErrorMessage message={error} />}
            <div ref={messagesEndRef} style={{ height: "1px" }} />
          </div>
        </div>
        <div className="bottom-0 left-0 right-0 border-t border-gray-200 p-4 bg-white">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
            <div className="flex items-end bg-white rounded-3xl shadow-lg border border-gray-300">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message Assistant (Press Enter to send, Shift+Enter for new line)"
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
      </div>
      {isPreviewOpen && (
          <PreviewBox
            isOpen={isPreviewOpen}
            onClose={togglePreview}
            title="Source Preview"
          >
            {previewContent}
          </PreviewBox>
      )}
    </div>
  );
};

export default React.memo(ChatArea);
