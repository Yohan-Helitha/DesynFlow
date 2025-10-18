import React, { useState } from 'react';

export default function UploadModelModal({ isOpen, onClose, projectId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [designAccessRestriction, setDesignAccessRestriction] = useState('false');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!file) return setError('File is required');
    if (!['model/gltf-binary','model/gltf+json','application/octet-stream'].includes(file.type) && !file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      return setError('Only .glb and .gltf files are allowed');
    }

    const form = new FormData();
    form.append('file', file);
    form.append('designAccessRestriction', designAccessRestriction);

    try {
      setUploading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/project/${projectId}/3dmodel`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      onUploaded(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-cream-light rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Upload 3D Model (.glb/.gltf)</h3>
        <div className="mb-3">
          <label className="block text-sm font-medium">File</label>
          <input required type="file" accept=".glb,.gltf" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Design Access Restriction</label>
          <select required value={designAccessRestriction} onChange={(e) => setDesignAccessRestriction(e.target.value)} className="w-full border rounded p-2">
            <option value="false">False (allow screenshots)</option>
            <option value="true">True (restrict screenshots)</option>
          </select>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" disabled={uploading} className="px-4 py-2 bg-green-600 text-white rounded">{uploading? 'Uploading...' : 'Upload'}</button>
        </div>
      </form>
    </div>
  );
}
