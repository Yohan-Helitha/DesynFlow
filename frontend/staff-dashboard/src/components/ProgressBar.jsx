import React from "react";
export default function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-6">
      <div
        className="bg-brown-primary h-6 rounded-full flex items-center justify-end pr-2"
        style={{ width: `${progress || 0}%` }}
      >
        <span className="text-white font-bold text-sm">{progress ? `${progress}%` : "0%"}</span>
      </div>
    </div>
  );
}
