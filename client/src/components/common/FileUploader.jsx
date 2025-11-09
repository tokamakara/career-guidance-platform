import React, { useState, useRef } from 'react';
import { useNotification } from '../../context/NotificationContext'; // Fixed path
import { storageService } from '../../services/firebase/storage'; // Fixed path
import './FileUploader.css';

const FileUploader = ({
  onUploadComplete,
  onUploadError,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  path,
  metadata = {},
  label = 'Choose files',
  buttonText = 'Upload Files',
  showPreview = true,
  className = ''
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { addNotification } = useNotification();

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate files
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      const validation = storageService.validateFile(file, {
        maxSize,
        allowedTypes: allowedTypes.includes('image/*') ? 
          ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] :
          allowedTypes
      });

      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    });

    // Show errors
    if (errors.length > 0) {
      errors.forEach(error => {
        addNotification({
          type: 'error',
          title: 'Invalid File',
          message: error
        });
      });
    }

    // Check file limit
    if (validFiles.length + files.length > maxFiles) {
      addNotification({
        type: 'error',
        title: 'File Limit Exceeded',
        message: `Maximum ${maxFiles} files allowed`
      });
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Files',
        message: 'Please select files to upload'
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const results = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path || storageService.generateUserDocumentPath(
          'current-user', // This should be replaced with actual user ID
          'documents',
          file.name
        );

        const result = await storageService.uploadFile(file, filePath, {
          ...metadata,
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        });

        results.push(result);
        
        // Update progress
        setProgress(((i + 1) / files.length) * 100);
      }

      // Call success callback
      if (onUploadComplete) {
        onUploadComplete(results);
      }

      addNotification({
        type: 'success',
        title: 'Upload Successful',
        message: `Successfully uploaded ${files.length} file(s)`
      });

      // Clear files after successful upload
      setFiles([]);
      setProgress(0);

    } catch (error) {
      console.error('Upload error:', error);
      
      if (onUploadError) {
        onUploadError(error);
      }

      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    const fileInputEvent = { target: { files: droppedFiles } };
    handleFileSelect(fileInputEvent);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-uploader ${className}`}>
      {/* Drop Zone */}
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <div className="upload-icon">📁</div>
          <p className="drop-zone-text">
            Drag and drop files here or click to browse
          </p>
          <p className="drop-zone-subtext">
            Maximum file size: {formatFileSize(maxSize)} • Maximum files: {maxFiles}
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="file-input"
        />
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files ({files.length}/{maxFiles})</h4>
          <div className="files-list">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <span className="file-icon">
                    {getFileIcon(file.type)}
                  </span>
                  <div className="file-details">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && (
        <button
          type="button"
          className="upload-button"
          onClick={handleUpload}
          disabled={uploading}
        >
          {buttonText} ({files.length})
        </button>
      )}
    </div>
  );
};

export default FileUploader;