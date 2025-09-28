import React from "react";
export default function MilestoneList({ milestones }) {
  if (!milestones || milestones.length === 0) return <div className="text-gray-500">No timeline items found.</div>;
  
  // Helper function to check if a timeline item is completed (past date)
  const isCompleted = (dateString) => {
    const itemDate = new Date(dateString);
    const today = new Date();
    return itemDate < today;
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  return (
    <ul className="space-y-2">
      {milestones.map(m => (
        <li key={m._id || m.name} className="bg-white rounded shadow px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-brown-primary">{m.name}</span>
            <span className={`text-xs px-2 py-1 rounded ${isCompleted(m.date) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {isCompleted(m.date) ? 'Completed' : 'Upcoming'}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <span className="mr-3">📅 {formatDate(m.date)}</span>
          </div>
          {m.description && (
            <div className="text-xs text-gray-500 mt-1">{m.description}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
