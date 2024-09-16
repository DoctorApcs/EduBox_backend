import React from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css"; // Import KaTeX CSS for styling

const CustomMarkdown = ({ children, onShowSource }) => {
  let processedContent = "";
  if (children) {
    processedContent = children
      .replace(/\\\[/g, "$$")
      .replace(/\\\(/g, "$")
      .replace(/\\\]/g, "$$")
      .replace(/\\\)/g, "$");
    console.log(processedContent);
  }

  const renderMessageWithSources = (content) => {
    if (!content) return content;
    
    const processElement = (element, index) => {
      if (typeof element === 'string') {
        const parts = element.split(/(\[\d+\])/g);
        return parts.map((part, partIndex) => {
          const match = part.match(/\[(\d+)\]/);
          if (match) {
            const sourceIndex = parseInt(match[1]);
            return (
              <React.Fragment key={`${index}-${partIndex}`}>
                {part.substring(0, match.index)}
                <button
                  onClick={() => onShowSource(sourceIndex)}
                  className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {sourceIndex}
                </button>
                {part.substring(match.index + match[0].length)}
              </React.Fragment>
            );
          }
          return <React.Fragment key={`${index}-${partIndex}`}>{part}</React.Fragment>;
        });
      }
      return element;
    };

    return Array.isArray(content)
      ? content.map((element, index) => processElement(element, index))
      : processElement(content, 0);
  };

  return (
    <div className="custom-markdown overflow-x-auto">
      <Markdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold my-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold my-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold my-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold my-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-2 last:mb-0 whitespace-pre-wrap">
              {renderMessageWithSources(props.children)}
            </p>
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="my-4 rounded-md overflow-hidden border border-gray-300 shadow-sm">
                <div className="bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
                  {match[1]}
                </div>
                <div className="overflow-x-auto">
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <code className="bg-gray-100 rounded px-1" {...props}>
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="table-auto border-collapse border border-gray-300 min-w-full">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 border border-gray-300 bg-gray-100 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border border-gray-300">{children}</td>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="pl-1">
              <span className="inline-block align-middle">{children}</span>
            </li>
          ),
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
};

export default CustomMarkdown;
