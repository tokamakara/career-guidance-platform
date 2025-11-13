const admin = require('firebase-admin');

// Initialize Firebase Admin
// Priority: 1) Environment variables (for production/Render), 2) Service account file (for local dev)
try {
  console.log('🔑 Initializing Firebase Admin...');
  
  const path = require('path');
  const fs = require('fs');
  const serviceAccountPath = path.join(__dirname, 'keys', 'serviceAccountKey.json');
  
  // Check if environment variables are available (for production/Render)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  
  if (privateKey && clientEmail && projectId) {
    // Production: Use environment variables
    console.log('📦 Using environment variables for Firebase Admin...');
    const serviceAccount = {
      type: "service_account",
      project_id: projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: clientEmail,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${projectId}.appspot.com`
    });
    console.log('✅ Firebase Admin initialized with environment variables');
  } else if (fs.existsSync(serviceAccountPath)) {
    // Development: Use service account file
    console.log('📁 Using service account file for Firebase Admin...');
    const serviceAccount = require(serviceAccountPath);
    const storageBucket = serviceAccount.project_id 
      ? `${serviceAccount.project_id}.appspot.com` 
      : "job-int-123.firebasestorage.app";
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket
    });
    console.log('✅ Firebase Admin initialized with service account file');
  } else {
    // Fallback: Use default config (limited functionality)
    console.warn('⚠️  No Firebase credentials found. Using default config (limited functionality).');
    console.warn('   For full functionality, either:');
    console.warn('   1. Set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID environment variables');
    console.warn('   2. Or place serviceAccountKey.json in server/config/keys/');
    
    admin.initializeApp({
      projectId: "job-int-123",
      storageBucket: "job-int-123.firebasestorage.app"
    });
    console.log('✅ Firebase Admin initialized with default config');
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
