import React, { useState, useEffect } from 'react';
import { FaUpload, FaFile, FaDownload, FaTrash, FaEye, FaFolder, FaPlus, FaSearch, FaFilter, FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel } from 'react-icons/fa';
import TeamMemberHeader from './TeamMemberHeader';

export default function PersonalFilesTab() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [fileFilter, setFileFilter] = useState('all'); // 'all', 'documents', 'images', 'others'
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.role === "team member") {
      setUser(userData);
      fetchPersonalFiles(userData._id || userData.id);
      fetchFolders(userData._id || userData.id);
    } else {
      setError("Access denied. Team member role required.");
      setLoading(false);
    }
  }, []);

  const fetchPersonalFiles = async (userId) => {
    try {
      const response = await fetch(`/api/personal-files/${userId}`);
      if (response.ok) {
        const filesData = await response.json();
        setFiles(filesData);
      }
    } catch (error) {
      console.error('Error fetching personal files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async (userId) => {
    try {
      const response = await fetch(`/api/personal-folders/${userId}`);
      if (response.ok) {
        const foldersData = await response.json();
        setFolders(foldersData);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleFileUpload = async (uploadFiles, folderId = null) => {
    for (const file of uploadFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', user._id || user.id);
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size);
      formData.append('mimeType', file.type);
      if (folderId) formData.append('folderId', folderId);

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        const response = await fetch('/api/personal-files/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const uploadedFile = await response.json();
          setFiles(prev => [uploadedFile, ...prev]);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          }, 2000);
        } else {
          alert(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error uploading ${file.name}`);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles, selectedFolder !== 'all' ? selectedFolder : null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/personal-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          createdBy: user._id || user.id
        })
      });

      if (response.ok) {
        const newFolder = await response.json();
        setFolders(prev => [...prev, newFolder]);
        setNewFolderName('');
        setShowCreateFolderModal(false);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Error creating folder');
    }
  };

  const deleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const userId = user._id || user.id;
      const response = await fetch(`/api/personal-files/${fileId}?userId=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file._id !== fileId));
        alert('File deleted successfully');
      } else {
        const error = await response.json();
        alert(`Error deleting file: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const downloadFile = async (file) => {
    try {
      const userId = user._id || user.id;
      const response = await fetch(`/api/personal-files/${file._id}/download?userId=${userId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(`Error downloading file: ${error.message}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (mimeType.includes('image')) return <FaFileImage className="text-green-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FaFileWord className="text-blue-500" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FaFileExcel className="text-green-600" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    // Filter by folder
    if (selectedFolder !== 'all' && file.folderId !== selectedFolder) return false;
    if (selectedFolder === 'all' && file.folderId) return false;

    // Filter by search term
    if (searchTerm && !file.originalName.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    // Filter by file type
    if (fileFilter === 'documents' && !file.mimeType.includes('document') && !file.mimeType.includes('pdf') && !file.mimeType.includes('text')) return false;
    if (fileFilter === 'images' && !file.mimeType.includes('image')) return false;
    if (fileFilter === 'others' && (file.mimeType.includes('document') || file.mimeType.includes('pdf') || file.mimeType.includes('text') || file.mimeType.includes('image'))) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-primary">
        <TeamMemberHeader title="Personal Files" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-primary">
      <TeamMemberHeader title="Personal Files" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary flex items-center gap-2"
            >
              <FaUpload /> Upload Files
            </button>
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FaPlus /> New Folder
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-primary"
              />
            </div>

            {/* Filters */}
            <select
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
            >
              <option value="all">All Types</option>
              <option value="documents">Documents</option>
              <option value="images">Images</option>
              <option value="others">Others</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Folders */}
          <div className="lg:col-span-1">
            <div className="bg-cream-light rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-brown-primary mb-4 flex items-center gap-2">
                <FaFolder /> Folders
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolder('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                    selectedFolder === 'all' ? 'bg-brown-primary text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <FaFolder /> All Files
                </button>
                
                {folders.map(folder => (
                  <button
                    key={folder._id}
                    onClick={() => setSelectedFolder(folder._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                      selectedFolder === folder._id ? 'bg-brown-primary text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    <FaFolder /> {folder.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Files */}
          <div className="lg:col-span-3">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
                dragOver ? 'border-brown-primary bg-brown-primary bg-opacity-10' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop files here, or click to upload</p>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary cursor-pointer"
              >
                Choose Files
              </label>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="bg-cream-light rounded-lg shadow-lg p-4 mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Uploading Files...</h4>
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{fileName}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-brown-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Files Grid */}
            <div className="bg-cream-light rounded-lg shadow-lg">
              {filteredFiles.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FaFile className="mx-auto text-4xl mb-4" />
                  <p>No files found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                  {filteredFiles.map(file => (
                    <div key={file._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.mimeType)}
                          <div className="min-w-0">
                            <h4 className="font-medium text-gray-800 truncate" title={file.originalName}>
                              {file.originalName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-3">
                        Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadFile(file)}
                          className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
                        >
                          <FaDownload size={10} /> Download
                        </button>
                        <button
                          onClick={() => deleteFile(file._id)}
                          className="bg-red-brown text-white px-2 py-1 rounded text-sm hover:bg-red-brown"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-cream-light rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-brown-primary mb-4">Upload Files</h3>
            <input
              type="file"
              multiple
              onChange={(e) => {
                handleFileUpload(Array.from(e.target.files), selectedFolder !== 'all' ? selectedFolder : null);
                setShowUploadModal(false);
              }}
              className="w-full mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-cream-light rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-brown-primary mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-brown-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={createFolder}
                className="flex-1 bg-brown-primary text-white px-4 py-2 rounded-lg hover:bg-brown-secondary"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName('');
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
