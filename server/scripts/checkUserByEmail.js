/**
 * Script to check if a user exists by email in Firebase Auth and Firestore
 * Usage: node server/scripts/checkUserByEmail.js <email>
 */

const { admin, db } = require('../config/firebaseAdmin');

async function checkUserByEmail(email) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Checking for user with email: ${email} (normalized: ${normalizedEmail})`);
    
    // Check Firebase Auth
    let userRecord = null;
    try {
      userRecord = await admin.auth().getUserByEmail(normalizedEmail);
      console.log(`✅ Found in Firebase Auth:`);
      console.log(`   UID: ${userRecord.uid}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Email Verified: ${userRecord.emailVerified}`);
      console.log(`   Created: ${new Date(userRecord.metadata.creationTime).toISOString()}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`❌ NOT found in Firebase Auth`);
      } else {
        throw error;
      }
    }

    // Check Firestore
    console.log(`\n🔍 Checking Firestore...`);
    const firestoreUsers = await db.collection('users')
      .where('email', '==', normalizedEmail)
      .get();
    
    if (!firestoreUsers.empty) {
      console.log(`✅ Found ${firestoreUsers.size} record(s) in Firestore:`);
      firestoreUsers.docs.forEach((doc, index) => {
        const userData = doc.data();
        console.log(`\n   Record ${index + 1}:`);
        console.log(`   Document ID: ${doc.id}`);
        console.log(`   UID: ${userData.uid || 'N/A'}`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Name: ${userData.firstName} ${userData.lastName}`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   Status: ${userData.status || 'N/A'}`);
        console.log(`   Created: ${userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toISOString() : 'N/A'}`);
      });
    } else {
      console.log(`❌ NOT found in Firestore`);
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   Firebase Auth: ${userRecord ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`   Firestore: ${!firestoreUsers.empty ? `✅ EXISTS (${firestoreUsers.size} record(s))` : '❌ NOT FOUND'}`);
    
    if (!userRecord && !firestoreUsers.empty) {
      console.log(`\n⚠️  ORPHANED RECORD DETECTED!`);
      console.log(`   User exists in Firestore but NOT in Firebase Auth.`);
      console.log(`   This can cause registration issues.`);
      console.log(`\n💡 To fix: Delete the Firestore record(s) or create the Firebase Auth user.`);
    } else if (userRecord && firestoreUsers.empty) {
      console.log(`\n⚠️  INCOMPLETE RECORD DETECTED!`);
      console.log(`   User exists in Firebase Auth but NOT in Firestore.`);
      console.log(`   This is usually okay - the user can log in and profile will be created.`);
    } else if (userRecord && !firestoreUsers.empty) {
      console.log(`\n✅ User exists in both places - this is normal.`);
    } else {
      console.log(`\n✅ User does NOT exist anywhere - registration should work.`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.error('Usage: node server/scripts/checkUserByEmail.js <email>');
  process.exit(1);
}

checkUserByEmail(email)
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });

