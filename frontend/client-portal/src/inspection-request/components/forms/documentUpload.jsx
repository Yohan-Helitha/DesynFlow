import React, { useState, useRef } from 'react';

const DocumentUpload = ({ formData, setFormData, errors }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  // Initialize documents array if not present
  React.useEffect(() => {
    if (!formData.attachments) {
      setFormData(prev => ({ ...prev, attachments: [] }));
    }
  }, []);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];

    fileArray.forEach(file => {
      // Basic file validation
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (files) => {
    const newAttachments = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ file: file.name, progress: 0 });

      try {
        // Simulate file upload progress (in real app, this would be actual upload)
        const fileData = await processFile(file);
        
        const attachment = {
          id: Date.now() + i,
          originalName: file.name,
          fileName: `${Date.now()}_${file.name}`,
          fileType: file.type,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          category: detectFileCategory(file.type),
          description: '',
          url: fileData.url || URL.createObjectURL(file), // For preview
          isRequired: false
        };

        newAttachments.push(attachment);
        
        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 25) {
          setUploadProgress({ file: file.name, progress });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error('Upload failed:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploadProgress(null);
    
    // Add new attachments to form data
    const updatedAttachments = [...(formData.attachments || []), ...newAttachments];
    setFormData(prev => ({ ...prev, attachments: updatedAttachments }));
  };

  const processFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          url: e.target.result,
          size: file.size,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const detectFileCategory = (fileType) => {
    if (fileType.startsWith('image/')) return 'photo';
    if (fileType === 'application/pdf') return 'document';
    if (fileType.includes('word')) return 'document';
    return 'other';
  };

  const removeFile = (fileId) => {
    const updatedAttachments = formData.attachments.filter(att => att.id !== fileId);
    setFormData(prev => ({ ...prev, attachments: updatedAttachments }));
  };

  const updateFileDescription = (fileId, description) => {
    const updatedAttachments = formData.attachments.map(att => 
      att.id === fileId ? { ...att, description } : att
    );
    setFormData(prev => ({ ...prev, attachments: updatedAttachments }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    return '📎';
  };

  return (
    <div className="document-upload">
      <h2>Upload Documents & Photos</h2>
      <p className="upload-description">
        Upload property photos, floor plans, design references, or any other relevant documents.
      </p>

      {/* Upload Area */}
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <div className="upload-text">
            <p><strong>Click to browse</strong> or drag and drop files here</p>
            <p className="upload-hint">
              Supported: JPG, PNG, PDF, DOC, DOCX, TXT (Max 10MB each)
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="upload-progress">
          <div className="progress-info">
            <span>Uploading {uploadProgress.file}...</span>
            <span>{uploadProgress.progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {formData.attachments && formData.attachments.length > 0 && (
        <div className="uploaded-files">
          <h3>Uploaded Files ({formData.attachments.length})</h3>
          <div className="files-grid">
            {formData.attachments.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-header">
                  <div className="file-info">
                    <span className="file-icon">{getFileIcon(file.fileType)}</span>
                    <div className="file-details">
                      <div className="file-name" title={file.originalName}>
                        {file.originalName}
                      </div>
                      <div className="file-meta">
                        {formatFileSize(file.fileSize)} • {file.category}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeFile(file.id)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>

                {/* File Preview */}
                {file.fileType.startsWith('image/') && (
                  <div className="file-preview">
                    <img 
                      src={file.url} 
                      alt={file.originalName}
                      style={{ 
                        width: '100%', 
                        height: '120px', 
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                )}

                {/* File Description */}
                <div className="file-description">
                  <textarea
                    placeholder="Add description (optional)"
                    value={file.description}
                    onChange={(e) => updateFileDescription(file.id, e.target.value)}
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required Documents Checklist */}
      <div className="required-docs">
        <h3>Recommended Documents</h3>
        <div className="checklist">
          <div className="checklist-item">
            <input type="checkbox" id="floor-plans" />
            <label htmlFor="floor-plans">Floor Plans or Blueprints</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="property-photos" />
            <label htmlFor="property-photos">Current Property Photos</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="design-refs" />
            <label htmlFor="design-refs">Design References/Inspiration</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="materials" />
            <label htmlFor="materials">Material Specifications</label>
          </div>
        </div>
      </div>

      {errors.attachments && (
        <div className="error-message">{errors.attachments}</div>
      )}

      <style jsx>{`
        .document-upload {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .upload-description {
          margin-bottom: 20px;
          color: #666;
          line-height: 1.5;
        }

        .upload-zone {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .upload-zone:hover,
        .upload-zone.drag-active {
          border-color: #007bff;
          background: #f0f8ff;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .upload-text p {
          margin: 5px 0;
        }

        .upload-hint {
          font-size: 12px;
          color: #888;
        }

        .upload-progress {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .progress-bar {
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #007bff;
          transition: width 0.3s ease;
        }

        .uploaded-files {
          margin-top: 30px;
        }

        .uploaded-files h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .file-card {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 15px;
          background: white;
        }

        .file-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .file-info {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .file-icon {
          font-size: 24px;
          margin-right: 10px;
        }

        .file-details {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-weight: 500;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-meta {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn:hover {
          background: #dc3545;
          color: white;
        }

        .file-preview {
          margin: 10px 0;
        }

        .file-description textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-size: 14px;
          box-sizing: border-box;
        }

        .required-docs {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .required-docs h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
        }

        .checklist-item input {
          margin-right: 10px;
        }

        .checklist-item label {
          cursor: pointer;
          font-size: 14px;
        }

        .error-message {
          color: #dc3545;
          margin-top: 10px;
          padding: 10px;
          background: #f8d7da;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .files-grid {
            grid-template-columns: 1fr;
          }
          
          .upload-zone {
            padding: 30px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentUpload;
