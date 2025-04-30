import React from 'react';

const SnakeLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <svg
        className="w-24 h-24 animate-spin-slow"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          className="text-gray-300"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          className="text-indigo-600"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray="60 200"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default SnakeLoader;
