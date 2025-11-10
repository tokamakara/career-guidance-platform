import { storageService } from '../firebase/storage';

export const fileUploadService = {
  // Upload student documents
  async uploadStudentDocument(userId, file, documentType, metadata = {}) {
    try {
      // Validate file
      const validation = storageService.validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB for documents
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/jpg'
        ]
      });

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Generate file path
      const filePath = storageService.generateUserDocumentPath(
        userId, 
        documentType, 
        file.name
      );

      // Upload file with additional metadata
      const uploadMetadata = {
        uploadedBy: userId,
        documentType: documentType,
        originalName: file.name,
        fileSize: file.size,
        ...metadata
      };

      const result = await storageService.uploadFile(file, filePath, uploadMetadata);
      
      return {
        ...result,
        documentType,
        originalName: file.name,
        uploadDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading student document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  },

  // Upload multiple student documents
  async uploadMultipleStudentDocuments(userId, files, documentType, metadata = {}) {
    try {
      const uploadPromises = files.map(file => 
        this.uploadStudentDocument(userId, file, documentType, metadata)
      );

      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        uploaded: results.length,
        results: results
      };
    } catch (error) {
      console.error('Error uploading multiple documents:', error);
      throw new Error(`Failed to upload documents: ${error.message}`);
    }
  },

  // Upload institution documents
  async uploadInstitutionDocument(institutionId, file, documentType, metadata = {}) {
    try {
      // Validate file
      const validation = storageService.validateFile(file, {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/jpg'
        ]
      });

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Generate file path
      const filePath = storageService.generateInstitutionDocumentPath(
        institutionId, 
        documentType, 
        file.name
      );

      // Upload file
      const uploadMetadata = {
        uploadedBy: institutionId,
        documentType: documentType,
        originalName: file.name,
        fileSize: file.size,
        ...metadata
      };

      const result = await storageService.uploadFile(file, filePath, uploadMetadata);
      
      return {
        ...result,
        documentType,
        originalName: file.name,
        uploadDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading institution document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  },

  // Upload profile picture
  async uploadProfilePicture(userId, file) {
    try {
      // Validate image file
      const validation = storageService.validateFile(file, {
        maxSize: 2 * 1024 * 1024, // 2MB for profile pictures
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif']
      });

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const filePath = `users/${userId}/profile/picture_${Date.now()}.${storageService.getFileExtension(file.name)}`;
      
      const result = await storageService.uploadFile(file, filePath, {
        uploadedBy: userId,
        fileType: 'profile_picture',
        originalName: file.name
      });

      return result;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }
  },

  // Delete document
  async deleteDocument(filePath) {
    try {
      const result = await storageService.deleteFile(filePath);
      return result;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  },

  // Get document info from URL
  getDocumentInfoFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // Extract information from Firebase Storage URL
      const pathParts = path.split('/');
      const bucketIndex = pathParts.indexOf('b');
      const objectIndex = pathParts.indexOf('o');
      
      if (bucketIndex !== -1 && objectIndex !== -1) {
        const bucket = pathParts[bucketIndex + 1];
        const objectPath = decodeURIComponent(pathParts[objectIndex + 1]).replace(/\+/g, ' ');
        
        return {
          bucket,
          fullPath: objectPath,
          fileName: objectPath.split('/').pop(),
          directory: objectPath.split('/').slice(0, -1).join('/')
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing document URL:', error);
      return null;
    }
  },

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file icon based on type
  getFileIcon(fileType) {
    const iconMap = {
      'application/pdf': '📄',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
      'image/jpeg': '🖼️',
      'image/png': '🖼️',
      'image/jpg': '🖼️',
      'image/gif': '🖼️',
      'default': '📎'
    };
    
    return iconMap[fileType] || iconMap.default;
  }
};

export default fileUploadService;