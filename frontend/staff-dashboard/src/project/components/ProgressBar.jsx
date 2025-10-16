import React from "react";

export default function ProgressBar({ progress, completedWeight, totalWeight }) {
  const percentage = progress || 0;
  
  return (
    <div className="w-full">
      {/* Progress info */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Progress</span>
        <span className="text-sm text-gray-600">
          {completedWeight || 0} / {totalWeight || 0} weight completed
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-6">
        <div
          className="bg-brown-primary h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        >
          <span className="text-white font-bold text-sm">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
