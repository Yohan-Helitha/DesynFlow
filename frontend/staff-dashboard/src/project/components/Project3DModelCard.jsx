import React from 'react';

export default function Project3DModelCard({ modelUrl, restriction, onView, onDelete, canDelete }) {
  return (
    <div className="bg-cream-light rounded-lg p-3 flex items-center justify-between">
      <div>
        <div className="font-semibold text-brown-primary">3D Model</div>
        <div className="text-xs text-gray-600">{modelUrl?.split('/').pop()}</div>
        {restriction && <div className="text-xs text-red-brown">Screenshots disabled</div>}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onView} className="px-3 py-1 bg-brown-primary text-white rounded">View</button>
        {canDelete && <button onClick={onDelete} className="px-3 py-1 bg-red-brown text-white rounded">Delete</button>}
      </div>
    </div>
  );
}
