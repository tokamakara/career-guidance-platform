/**
 * Script to delete a user by email from Firebase Auth and Firestore
 * Usage: node server/scripts/deleteUserByEmail.js <email>
 */

const { admin, db } = require('../config/firebaseAdmin');

async function deleteUserByEmail(email) {
  try {
    console.log(`🔍 Searching for user with email: ${email}`);
    
    // Find user by email in Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log(`✅ Found user in Firebase Auth: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('⚠️ User not found in Firebase Auth');
      } else {
        throw error;
      }
    }

    if (!userRecord) {
      // Try to find in Firestore by email
      console.log('🔍 Searching in Firestore by email...');
      const usersSnapshot = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        console.log('❌ User not found in Firestore either');
        return { success: false, message: 'User not found' };
      }

      const userDoc = usersSnapshot.docs[0];
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`✅ Found user in Firestore: ${userId}`);

      // Delete from Firestore
      await db.collection('users').doc(userId).delete();
      console.log('✅ Deleted from Firestore users collection');

      // Delete related data
      if (userData.role === 'institute' || userData.role === 'institution') {
        try {
          await db.collection('institutions').doc(userId).delete();
          console.log('✅ Deleted from institutions collection');
        } catch (err) {
          console.log('⚠️ No institution record found');
        }
      } else if (userData.role === 'company') {
        try {
          await db.collection('companies').doc(userId).delete();
          console.log('✅ Deleted from companies collection');
        } catch (err) {
          console.log('⚠️ No company record found');
        }
      }

      // Try to delete from Firebase Auth if we have the UID
      try {
        await admin.auth().deleteUser(userId);
        console.log('✅ Deleted from Firebase Auth');
      } catch (err) {
        console.log('⚠️ Could not delete from Firebase Auth (user may not exist there)');
      }

      // Delete related applications
      try {
        const educationAppsSnapshot = await db.collection('educationApplications')
          .where('studentId', '==', userId)
          .get();
        
        const batch = db.batch();
        educationAppsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✅ Deleted ${educationAppsSnapshot.size} education applications`);
      } catch (err) {
        console.log('⚠️ No education applications found');
      }

      // Delete job applications
      try {
        const jobAppsSnapshot = await db.collection('jobApplications')
          .where('studentId', '==', userId)
          .get();
        
        const batch = db.batch();
        jobAppsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✅ Deleted ${jobAppsSnapshot.size} job applications`);
      } catch (err) {
        console.log('⚠️ No job applications found');
      }

      console.log('✅ User deleted successfully');
      return { success: true, message: 'User deleted successfully', userId };
    }

    // If we found user in Firebase Auth, delete everything
    const userId = userRecord.uid;
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // Delete from Firebase Auth
    await admin.auth().deleteUser(userId);
    console.log('✅ Deleted from Firebase Auth');

    // Delete from Firestore
    if (userDoc.exists) {
      await db.collection('users').doc(userId).delete();
      console.log('✅ Deleted from Firestore users collection');

      // Delete related data
      if (userData && (userData.role === 'institute' || userData.role === 'institution')) {
        try {
          await db.collection('institutions').doc(userId).delete();
          console.log('✅ Deleted from institutions collection');
        } catch (err) {
          console.log('⚠️ No institution record found');
        }
      } else if (userData && userData.role === 'company') {
        try {
          await db.collection('companies').doc(userId).delete();
          console.log('✅ Deleted from companies collection');
        } catch (err) {
          console.log('⚠️ No company record found');
        }
      }
    }

    // Delete related applications
    try {
      const educationAppsSnapshot = await db.collection('educationApplications')
        .where('studentId', '==', userId)
        .get();
      
      const batch = db.batch();
      educationAppsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${educationAppsSnapshot.size} education applications`);
    } catch (err) {
      console.log('⚠️ No education applications found');
    }

    // Delete job applications
    try {
      const jobAppsSnapshot = await db.collection('jobApplications')
        .where('studentId', '==', userId)
        .get();
      
      const batch = db.batch();
      jobAppsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${jobAppsSnapshot.size} job applications`);
    } catch (err) {
      console.log('⚠️ No job applications found');
    }

    console.log('✅ User deleted successfully');
    return { success: true, message: 'User deleted successfully', userId };

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return { success: false, message: error.message, error };
  }
}

// Run script if called directly
if (require.main === module) {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node server/scripts/deleteUserByEmail.js <email>');
    process.exit(1);
  }

  deleteUserByEmail(email)
    .then(result => {
      if (result.success) {
        console.log('✅ Success:', result.message);
        process.exit(0);
      } else {
        console.error('❌ Failed:', result.message);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { deleteUserByEmail };

