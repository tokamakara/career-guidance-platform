import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import FileUploader from '../../../components/common/FileUploader';
import { storageService } from '../../../services/firebase/storage';
import './UploadDocuments.css';

const UploadDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile } = useAuth();
  const { addNotification } = useNotification();

  const documentTypes = [
    { value: 'transcript', label: 'Academic Transcript', icon: '📊' },
    { value: 'certificate', label: 'Certificate', icon: '🏆' },
    { value: 'cv', label: 'Curriculum Vitae', icon: '📝' },
    { value: 'cover_letter', label: 'Cover Letter', icon: '✉️' },
    { value: 'id', label: 'ID Document', icon: '🆔' },
    { value: 'other', label: 'Other Document', icon: '📎' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      // This would fetch from Firestore in a real implementation
      // For now, using mock data
      setDocuments([
        {
          id: '1',
          name: 'Bachelor_Transcript.pdf',
          type: 'transcript',
          url: '#',
          uploadedAt: new Date('2024-01-15'),
          size: 2450000
        },
        {
          id: '2',
          name: 'Lerato_Mokhele_CV.pdf',
          type: 'cv',
          url: '#',
          uploadedAt: new Date('2024-01-10'),
          size: 1500000
        }
      ]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load documents'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (results) => {
    try {
      // Save document metadata to Firestore
      const newDocuments = results.map(result => ({
        id: result.path,
        name: result.metadata.customMetadata?.originalName || 'document',
        type: 'other', // This should be selected by user
        url: result.url,
        path: result.path,
        uploadedAt: new Date(),
        size: result.metadata.size
      }));

      setDocuments(prev => [...prev, ...newDocuments]);

      // Save to Firestore (pseudo-code)
      // for (const doc of newDocuments) {
      //   await setDoc(doc(db, 'users', currentUser.uid, 'documents', doc.id), doc);
      // }

    } catch (error) {
      console.error('Error saving document metadata:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save document information'
      });
    }
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    // Error notification is already shown by FileUploader
  };

  const handleDeleteDocument = async (documentId, documentPath) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      // Delete from storage
      await storageService.deleteFile(documentPath);
      
      // Delete from Firestore
      // await deleteDoc(doc(db, 'users', currentUser.uid, 'documents', documentId));
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      addNotification({
        type: 'success',
        title: 'Document Deleted',
        message: 'Document has been successfully deleted'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete document'
      });
    }
  };

  const getDocumentIcon = (type) => {
    const docType = documentTypes.find(t => t.value === type);
    return docType ? docType.icon : '📎';
  };

  const getTypeLabel = (type) => {
    const docType = documentTypes.find(t => t.value === type);
    return docType ? docType.label : 'Other Document';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="loading">Loading documents...</div>;
  }

  return (
    <div className="upload-documents">
      <div className="page-header">
        <h1>My Documents</h1>
        <p>Upload and manage your career documents</p>
      </div>

      {/* File Upload Section */}
      <div className="upload-section">
        <h2>Upload New Documents</h2>
        <div className="upload-info">
          <p>
            Upload your academic transcripts, CV, certificates, and other important documents. 
            These will be used for job applications and profile verification.
          </p>
          <ul className="upload-requirements">
            <li>Maximum file size: 5MB per file</li>
            <li>Allowed formats: PDF, DOC, DOCX, JPG, PNG</li>
            <li>Recommended: Academic transcripts, CV, Certificates</li>
          </ul>
        </div>

        <FileUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          allowedTypes={[
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
          ]}
          maxSize={5 * 1024 * 1024}
          maxFiles={5}
          buttonText="Upload Documents"
          className="documents-uploader"
        />
      </div>

      {/* Documents List */}
      <div className="documents-section">
        <h2>My Documents ({documents.length})</h2>
        
        {documents.length === 0 ? (
          <div className="empty-documents">
            <div className="empty-icon">📁</div>
            <h3>No documents uploaded yet</h3>
            <p>Upload your documents to start applying for jobs</p>
          </div>
        ) : (
          <div className="documents-grid">
            {documents.map(document => (
              <div key={document.id} className="document-card">
                <div className="document-icon">
                  {getDocumentIcon(document.type)}
                </div>
                
                <div className="document-info">
                  <h4 className="document-name">{document.name}</h4>
                  <div className="document-meta">
                    <span className="document-type">
                      {getTypeLabel(document.type)}
                    </span>
                    <span className="document-size">
                      {formatFileSize(document.size)}
                    </span>
                    <span className="document-date">
                      Uploaded: {document.uploadedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="document-actions">
                  <a 
                    href={document.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-outline small"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(document.id, document.path)}
                    className="btn-danger small"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Types Info */}
      <div className="types-info">
        <h3>Document Types</h3>
        <div className="types-grid">
          {documentTypes.map(type => (
            <div key={type.value} className="type-card">
              <div className="type-icon">{type.icon}</div>
              <h4>{type.label}</h4>
              <p>
                {type.value === 'transcript' && 'Official academic records from your institution'}
                {type.value === 'certificate' && 'Professional certifications and awards'}
                {type.value === 'cv' && 'Your updated curriculum vitae or resume'}
                {type.value === 'cover_letter' && 'Custom cover letters for job applications'}
                {type.value === 'id' && 'Government-issued identification documents'}
                {type.value === 'other' && 'Any other relevant documents'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;