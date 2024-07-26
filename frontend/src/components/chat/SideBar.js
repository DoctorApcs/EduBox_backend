import React, { useCallback, useRef, useState, useEffect } from "react";

const Sidebar = ({ isVisible, width, setWidth, assistants }) => {
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX - sidebarRef.current.offsetLeft;
        if (newWidth > 150 && newWidth < 480) {
          setWidth(newWidth);
        }
      }
    },
    [isResizing, setWidth]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  if (!isVisible) return null;

  return (
    <>
      <aside
        ref={sidebarRef}
        className="bg-white shadow-md overflow-y-auto relative"
        style={{ width: `${width}px` }}
      >
        <h2 className="text-lg font-semibold p-4">Messages</h2>
        {assistants.map((assistant) => (
          <div
            key={assistant.id}
            className="m-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <h3 className="font-medium text-gray-800">{assistant.name}</h3>
            <p className="text-sm text-gray-600">{assistant.description}</p>
          </div>
        ))}
      </aside>
      <div
        className="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-400 transition-colors duration-200"
        onMouseDown={startResizing}
      />
    </>
  );
};

export default Sidebar;
