const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
try {
  console.log('🔑 Initializing Firebase Admin...');
  
  // Use service account key file - FIXED PATH
  const serviceAccountPath = path.join(__dirname, 'keys', 'serviceAccountKey.json');
  console.log('📁 Service account path:', serviceAccountPath);
  
  // Verify file exists and is readable
  if (fs.existsSync(serviceAccountPath)) {
    console.log('✅ Service account file found');
    
    // Read and parse the file manually to avoid any require caching issues
    const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    console.log('📋 Project ID:', serviceAccount.project_id);
    console.log('📧 Client Email:', serviceAccount.client_email);
    
    // Initialize with the service account
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "job-int-123.firebasestorage.app",
      databaseURL: "https://job-int-123-default-rtdb.firebaseio.com"
    });
    
    console.log('✅ Firebase Admin initialized successfully with service account');
  } else {
    throw new Error('Service account file not found at: ' + serviceAccountPath);
  }

} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  console.error('🔍 Error details:', error);
  
  // Don't continue with fallback - we want the real setup
  throw new Error('Firebase Admin initialization failed. Please check your service account file.');
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Test the connection
console.log('🧪 Testing Firestore connection...');
db.listCollections()
  .then(collections => {
    console.log(`✅ Firestore connected successfully. Collections count: ${collections.length}`);
  })
  .catch(err => {
    console.error('❌ Firestore connection failed:', err.message);
  });

module.exports = { admin, db, auth, storage };