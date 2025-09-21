import React from "react";
export default function DocumentList({ documents }) {
  if (!documents || documents.length === 0) return <div className="text-gray-500">No documents found.</div>;
  return (
    <ul className="space-y-2">
      {documents.map((doc, idx) => (
        <li key={idx} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
          <span className="font-semibold text-brown-primary">Document {idx + 1}</span>
          <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
        </li>
      ))}
    </ul>
  );
}
