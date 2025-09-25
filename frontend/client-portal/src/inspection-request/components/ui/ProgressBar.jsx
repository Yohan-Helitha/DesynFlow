// ProgressBar.jsx
import React from "react";

const ProgressBar = ({ status }) => {
  // Map each status to a percentage and color
  const statusMap = {
    requested: { percent: "w-1/4", color: "bg-yellow-400" },
    payment_verified: { percent: "w-2/4", color: "bg-blue-500" },
    in_progress: { percent: "w-3/4", color: "bg-purple-500" },
    done: { percent: "w-full", color: "bg-green-500" },
  };

  const current = statusMap[status] || { percent: "w-1/6", color: "bg-gray-400" };

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${current.color} ${current.percent} h-2.5 rounded-full`}></div>
      </div>
      <p className="mt-2 text-sm text-gray-700">
        Current Status:{" "}
        <span className="capitalize font-semibold">{status || "unknown"}</span>
      </p>
    </div>
  );
};

export default ProgressBar;
