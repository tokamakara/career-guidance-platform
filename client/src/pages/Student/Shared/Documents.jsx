import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { studentService } from '../../../../services/api/studentService';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await studentService.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      for (const file of files) {
        // Simulate file upload
        const newDocument = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: formatFileSize(file.size),
          uploadedAt: new Date().toISOString(),
          category: determineCategory(file.name),
          status: 'uploaded'
        };

        setDocuments(prev => [newDocument, ...prev]);
      }
      
      setSuccess('Files uploaded successfully!');
      e.target.value = ''; // Reset file input
    } catch (err) {
      setError('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setSuccess('Document deleted successfully!');
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const downloadDocument = (document) => {
    // Simulate download
    console.log('Downloading:', document);
    alert(`Downloading ${document.name}`);
  };

  const determineCategory = (filename) => {
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('transcript')) return 'transcripts';
    if (lowerName.includes('certificate')) return 'certificates';
    if (lowerName.includes('id') || lowerName.includes('passport')) return 'identification';
    if (lowerName.includes('cv') || lowerName.includes('resume')) return 'resume';
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'transcripts':
        return '📊';
      case 'certificates':
        return '🏆';
      case 'identification':
        return '🆔';
      case 'resume':
        return '📄';
      default:
        return '📎';
    }
  };

  const getDocumentsByCategory = () => {
    const categories = {};
    documents.forEach(doc => {
      if (!categories[doc.category]) {
        categories[doc.category] = [];
      }
      categories[doc.category].push(doc);
    });
    return categories;
  };

  const documentCategories = getDocumentsByCategory();

  if (loading) {
    return (
      <div className="documents-loading">
        <div className="loading-spinner"></div>
        <p>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="documents-page">
      <div className="page-header">
        <h1>My Documents</h1>
        <p>Manage your academic and professional documents</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Upload Section */}
      <div className="upload-section">
        <div className="upload-card">
          <h3>Upload New Documents</h3>
          <p>Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 20MB per file)</p>
          
          <div className="upload-area">
            <div className="upload-icon">📤</div>
            <p>Drag and drop files here or click to browse</p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="file-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {uploading && <div className="upload-progress">Uploading...</div>}
          </div>

          <div className="upload-tips">
            <h4>Recommended Documents:</h4>
            <ul>
              <li>High School Transcripts</li>
              <li>O-Level Certificates</li>
              <li>University Transcripts (for graduates)</li>
              <li>Professional Certificates</li>
              <li>CV/Resume</li>
              <li>National ID/Passport</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documents by Category */}
      <div className="documents-categories">
        {Object.keys(documentCategories).length === 0 ? (
          <div className="empty-documents">
            <div className="empty-icon">📁</div>
            <h3>No Documents Yet</h3>
            <p>Upload your first document to get started</p>
          </div>
        ) : (
          Object.entries(documentCategories).map(([category, docs]) => (
            <div key={category} className="category-section">
              <h3 className="category-title">
                <span className="category-icon">{getCategoryIcon(category)}</span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <span className="document-count">({docs.length})</span>
              </h3>
              
              <div className="documents-grid">
                {docs.map(document => (
                  <div key={document.id} className="document-card">
                    <div className="document-icon">
                      {getCategoryIcon(document.category)}
                    </div>
                    
                    <div className="document-info">
                      <h4 className="document-name">{document.name}</h4>
                      <div className="document-meta">
                        <span className="document-size">{document.size}</span>
                        <span className="document-date">
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`document-status status-${document.status}`}>
                        {document.status}
                      </span>
                    </div>

                    <div className="document-actions">
                      <button 
                        onClick={() => downloadDocument(document)}
                        className="download-btn"
                        title="Download"
                      >
                        ⬇️
                      </button>
                      <button 
                        onClick={() => deleteDocument(document.id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Storage Usage */}
      <div className="storage-info">
        <h3>Storage Usage</h3>
        <div className="storage-bar">
          <div 
            className="storage-used"
            style={{ width: '45%' }} // This would be calculated
          ></div>
        </div>
        <div className="storage-stats">
          <span>4.5 MB of 20 MB used</span>
          <span>45%</span>
        </div>
      </div>

      {/* Document Guidelines */}
      <div className="document-guidelines">
        <h3>Document Guidelines</h3>
        <div className="guidelines-grid">
          <div className="guideline-card">
            <h4>📄 File Formats</h4>
            <p>We accept PDF, Word documents, and image files (JPG, PNG).</p>
          </div>
          <div className="guideline-card">
            <h4>💾 File Size</h4>
            <p>Maximum file size is 20MB per document.</p>
          </div>
          <div className="guideline-card">
            <h4>🔒 Security</h4>
            <p>Your documents are stored securely and only shared with institutions you apply to.</p>
          </div>
          <div className="guideline-card">
            <h4>📋 Organization</h4>
            <p>Keep your documents organized by category for easy access.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;