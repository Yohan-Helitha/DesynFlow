import React from "react";
export default function MilestoneList({ milestones }) {
  if (!milestones || milestones.length === 0) return <div className="text-gray-500">No milestones found.</div>;
  return (
    <ul className="space-y-2">
      {milestones.map(m => (
        <li key={m._id || m.name} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
          <span className="font-semibold text-brown-primary">{m.name}</span>
          <span className={`text-xs px-2 py-1 rounded ${m.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.completed ? 'Completed' : 'Pending'}</span>
        </li>
      ))}
    </ul>
  );
}
