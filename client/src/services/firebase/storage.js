import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './index';

export const storageService = {
  // Upload file to Firebase Storage
  async uploadFile(file, path, metadata = {}) {
    try {
      // Create storage reference
      const storageRef = ref(storage, path);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: metadata
      });
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        path: snapshot.ref.fullPath,
        metadata: snapshot.metadata
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(this.getStorageErrorMessage(error.code));
    }
  },

  // Delete file from Firebase Storage
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(this.getStorageErrorMessage(error.code));
    }
  },

  // Upload multiple files
  async uploadMultipleFiles(files, basePath, metadata = {}) {
    try {
      const uploadPromises = files.map((file, index) => {
        const filePath = `${basePath}/${Date.now()}_${index}_${file.name}`;
        return this.uploadFile(file, filePath, metadata);
      });

      const results = await Promise.all(uploadPromises);
      return { success: true, results };
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error(this.getStorageErrorMessage(error.code));
    }
  },

  // Get file extension
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  // Validate file before upload
  validateFile(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file extension
    const extension = this.getFileExtension(file.name).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate file path for user documents
  generateUserDocumentPath(userId, documentType, filename) {
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-]/g, '_');
    return `users/${userId}/documents/${documentType}/${timestamp}_${safeFilename}`;
  },

  // Generate file path for institution documents
  generateInstitutionDocumentPath(institutionId, documentType, filename) {
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-]/g, '_');
    return `institutions/${institutionId}/documents/${documentType}/${timestamp}_${safeFilename}`;
  },

  // Error message mapping
  getStorageErrorMessage(errorCode) {
    const errorMessages = {
      'storage/unknown': 'An unknown error occurred during file upload',
      'storage/object-not-found': 'File not found',
      'storage/bucket-not-found': 'Storage bucket not found',
      'storage/project-not-found': 'Project not found',
      'storage/quota-exceeded': 'Storage quota exceeded. Please try again later',
      'storage/unauthenticated': 'User is not authenticated. Please login again',
      'storage/unauthorized': 'User is not authorized to perform this action',
      'storage/retry-limit-exceeded': 'Upload failed after multiple attempts. Please try again',
      'storage/invalid-checksum': 'File corruption detected during upload',
      'storage/canceled': 'Upload was cancelled',
      'storage/invalid-event-name': 'Invalid event name',
      'storage/invalid-url': 'Invalid URL provided',
      'storage/invalid-argument': 'Invalid argument provided',
      'storage/no-default-bucket': 'No default storage bucket configured',
      'storage/cannot-slice-blob': 'Cannot slice blob for upload',
      'storage/server-wrong-file-size': 'File size mismatch with server'
    };

    return errorMessages[errorCode] || 'An unexpected storage error occurred';
  }
};