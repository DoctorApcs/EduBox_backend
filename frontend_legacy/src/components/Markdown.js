import React from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CustomMarkdown = ({ children }) => {
  let processedContent = "";
  if (children) {
    processedContent = children
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$")
      .replace(/\\\[/g, "$$")
      .replace(/\\\]/g, "$$");
  }

  return (
    <div className="custom-markdown overflow-x-auto">
      <style jsx global>{`
        .katex-display {
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0;
          margin: 1em 0;
        }
        .katex {
          font-size: 1em;
        }
        .katex .katex-html {
          display: none;
        }
      `}</style>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
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
            <p className="my-2 last:mb-0 whitespace-pre-wrap" {...props} />
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
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
};

export default CustomMarkdown;
