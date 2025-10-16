import React from "react";

export default function DocumentList({ documents }) {
  if (!documents || documents.length === 0) {
    return <div className="text-gray-500">No documents found.</div>;
  }

  return (
    <ul className="space-y-2">
      {documents.map((attachment, index) => {
        // Handle both object and string attachment formats
        const isObject = typeof attachment === 'object';
        const displayName = isObject 
          ? (attachment.originalName || attachment.filename || 'Document')
          : attachment.split('/').pop() || 'Document';
        const filePath = isObject ? attachment.path : attachment;
        const downloadUrl = `${filePath}`;
        
        return (
          <li key={index} className="bg-white rounded shadow px-4 py-2 flex items-center justify-between">
            <div>
              <span className="font-semibold text-brown-primary">{displayName}</span>
              {isObject && attachment.uploadDate && (
                <div className="text-xs text-gray-500">
                  Uploaded: {new Date(attachment.uploadDate).toLocaleDateString()}
                </div>
              )}
            </div>
            <a 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
              download={displayName}
            >
              Download
            </a>
          </li>
        );
      })}
    </ul>
  );
}
