import React from "react";

const CircularProgress = ({ progress }) => {
  const circumference = 2 * Math.PI * 9; // 9 is the radius of the circle
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20">
      <circle
        className="text-gray-200"
        strokeWidth="2"
        stroke="currentColor"
        fill="transparent"
        r="9"
        cx="10"
        cy="10"
      />
      <circle
        className="text-blue-600"
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r="9"
        cx="10"
        cy="10"
        style={{
          transformOrigin: "50% 50%",
          transform: "rotate(-90deg)",
          transition: "stroke-dashoffset 0.35s",
        }}
      />
    </svg>
  );
};

export default CircularProgress;
