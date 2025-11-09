const admin = require('firebase-admin');

// Initialize Firebase Admin for production
try {
  console.log('🔑 Initializing Firebase Admin for production...');
  
  if (process.env.NODE_ENV === 'production') {
    // Production: Use environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "job-int-123",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "job-int-123.firebasestorage.app"
    });
    console.log('✅ Firebase Admin initialized with environment variables');
  } else {
    // Development: Use service account file
    const path = require('path');
    const serviceAccountPath = path.join(__dirname, 'keys', 'serviceAccountKey.json');
    
    if (require('fs').existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "job-int-123.firebasestorage.app"
      });
      console.log('✅ Firebase Admin initialized with service account file');
    } else {
      // Fallback for development
      admin.initializeApp({
        projectId: "job-int-123",
        storageBucket: "job-int-123.firebasestorage.app"
      });
      console.log('✅ Firebase Admin initialized with default config');
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  
  // Final fallback
  try {
    admin.initializeApp({
      projectId: "job-int-123",
      storageBucket: "job-int-123.firebasestorage.app"
    });
    console.log('✅ Firebase Admin fallback initialization successful');
  } catch (fallbackError) {
    console.error('❌ All Firebase Admin initialization attempts failed');
    // Don't throw error - let server start without Firebase Admin
  }
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, db, auth, storage };
