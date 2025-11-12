const multer = require('multer');
const logger = require('../utils/logger');

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  document: 10 * 1024 * 1024, // 10MB
  image: 5 * 1024 * 1024, // 5MB
  profilePicture: 2 * 1024 * 1024, // 2MB
  transcript: 10 * 1024 * 1024, // 10MB
};

// Allowed MIME types
const ALLOWED_TYPES = {
  document: [
    'application/pdf' // Only PDF files allowed
  ],
  image: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif'
  ],
  profilePicture: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif'
  ],
  transcript: [
    'application/pdf' // Only PDF files allowed
  ]
};

// File filter function
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  };
};

// Create multer upload configuration
const createUploadConfig = (fileType = 'document', maxFiles = 1) => {
  const maxSize = FILE_SIZE_LIMITS[fileType] || FILE_SIZE_LIMITS.document;
  const allowedTypes = ALLOWED_TYPES[fileType] || ALLOWED_TYPES.document;

  const storage = multer.memoryStorage(); // Store in memory for Firebase upload

  return multer({
    storage,
    limits: {
      fileSize: maxSize,
      files: maxFiles
    },
    fileFilter: createFileFilter(allowedTypes)
  });
};

// Middleware to validate file upload
const validateFileUpload = (fileType = 'document', maxFiles = 1) => {
  const upload = createUploadConfig(fileType, maxFiles);
  
  return (req, res, next) => {
    const uploadMiddleware = maxFiles > 1 
      ? upload.array('files', maxFiles)
      : upload.single('file');

    uploadMiddleware(req, res, (err) => {
      if (err) {
        logger.logError(err, {
          fileType,
          maxFiles,
          fileName: req.file?.originalname || req.files?.map(f => f.originalname)
        });

        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds the maximum limit of ${FILE_SIZE_LIMITS[fileType] / (1024 * 1024)}MB`
          });
        }

        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Maximum ${maxFiles} file(s) allowed`
          });
        }

        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message
        });
      }

      // Additional validation
      const files = req.file ? [req.file] : (req.files || []);
      
      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Validate each file
      for (const file of files) {
        if (file.size > FILE_SIZE_LIMITS[fileType]) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname} exceeds the maximum size limit of ${FILE_SIZE_LIMITS[fileType] / (1024 * 1024)}MB`
          });
        }

        if (!ALLOWED_TYPES[fileType].includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname} has an invalid type. Allowed types: ${ALLOWED_TYPES[fileType].join(', ')}`
          });
        }
      }

      next();
    });
  };
};

// Export pre-configured validators
const validators = {
  document: validateFileUpload('document', 1),
  documents: validateFileUpload('document', 10),
  image: validateFileUpload('image', 1),
  images: validateFileUpload('image', 5),
  profilePicture: validateFileUpload('profilePicture', 1),
  transcript: validateFileUpload('transcript', 1),
};

module.exports = {
  validateFileUpload,
  validators,
  FILE_SIZE_LIMITS,
  ALLOWED_TYPES
};

