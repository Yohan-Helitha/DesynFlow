// ProgressBar.jsx
import React from "react";

const ProgressBar = ({ status }) => {
  // Map each status to a percentage and color
  const statusMap = {
    requested: { percent: "w-1/4", color: "bg-brown-primary-400" },
    payment_verified: { percent: "w-2/4", color: "bg-brown-primary-500" },
    in_progress: { percent: "w-3/4", color: "bg-brown-primary-600" },
    done: { percent: "w-full", color: "bg-green-600" },
  };

  const current = statusMap[status] || { percent: "w-1/6", color: "bg-brown-secondary-400" };

  return (
    <div>
      <div className="w-full bg-cream-medium rounded-full h-2.5">
        <div className={`${current.color} ${current.percent} h-2.5 rounded-full`}></div>
      </div>
      <p className="mt-2 text-sm text-brown-secondary">
        Current Status:{" "}
        <span className="capitalize font-semibold">{status || "unknown"}</span>
      </p>
    </div>
  );
};

export default ProgressBar;
