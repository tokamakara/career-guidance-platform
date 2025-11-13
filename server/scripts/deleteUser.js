const { admin, db } = require('../config/firebaseAdmin');

// User to delete
const userId = 'ka32Bei1ngSWsKNyQa8udEDyPKN2';
const userEmail = 'toka70518@gmail.com';

async function deleteUser() {
  try {
    console.log(`🗑️  Starting deletion process for user: ${userEmail} (${userId})...`);

    // 1. Delete from Firestore users collection
    console.log('📝 Deleting from Firestore users collection...');
    await db.collection('users').doc(userId).delete();
    console.log('✅ Deleted from users collection');

    // 2. Delete from Firebase Auth
    console.log('🔐 Deleting from Firebase Auth...');
    await admin.auth().deleteUser(userId);
    console.log('✅ Deleted from Firebase Auth');

    // 3. Delete from any other collections (if exists)
    // Check educationApplications
    const educationApps = await db.collection('educationApplications')
      .where('studentId', '==', userId)
      .get();
    
    if (!educationApps.empty) {
      console.log(`📚 Deleting ${educationApps.size} education applications...`);
      const batch = db.batch();
      educationApps.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Deleted education applications');
    }

    // Check jobApplications
    const jobApps = await db.collection('jobApplications')
      .where('studentId', '==', userId)
      .get();
    
    if (!jobApps.empty) {
      console.log(`💼 Deleting ${jobApps.size} job applications...`);
      const batch = db.batch();
      jobApps.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Deleted job applications');
    }

    // Check notifications
    const notifications = await db.collection('notifications')
      .where('userId', '==', userId)
      .get();
    
    if (!notifications.empty) {
      console.log(`🔔 Deleting ${notifications.size} notifications...`);
      const batch = db.batch();
      notifications.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Deleted notifications');
    }

    console.log('✅ User deletion completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    process.exit(1);
  }
}

deleteUser();
