const { admin, db } = require('../config/firebaseAdmin');

// Admin user details
const adminEmail = 'toka70518@gmail.com';
const adminPassword = 'Pass1234';
const firstName = 'Toka';
const lastName = 'Makara';

async function createAdmin() {
  try {
    console.log(`👤 Creating admin user: ${adminEmail}...`);

    // 1. Create user in Firebase Auth
    console.log('🔐 Creating user in Firebase Auth...');
    const userRecord = await admin.auth().createUser({
      email: adminEmail,
      password: adminPassword,
      emailVerified: true, // Set email as verified
      displayName: `${firstName} ${lastName}`
    });

    const userId = userRecord.uid;
    console.log(`✅ User created in Firebase Auth with UID: ${userId}`);

    // 2. Create user profile in Firestore
    console.log('📝 Creating user profile in Firestore...');
    const userProfile = {
      uid: userId,
      email: adminEmail,
      firstName: firstName,
      lastName: lastName,
      role: 'admin',
      status: 'active',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').doc(userId).set(userProfile);
    console.log('✅ User profile created in Firestore');

    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`🆔 UID: ${userId}`);
    console.log(`👑 Role: admin`);
    console.log('\n⚠️  Please save these credentials securely!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    // If user already exists, provide helpful message
    if (error.code === 'auth/email-already-exists') {
      console.error('\n⚠️  User with this email already exists in Firebase Auth.');
      console.error('   You may need to delete the existing user first or use a different email.');
    } else if (error.code === 'auth/invalid-email') {
      console.error('\n⚠️  Invalid email address.');
    } else if (error.code === 'auth/weak-password') {
      console.error('\n⚠️  Password is too weak. Please use a stronger password.');
    }
    
    process.exit(1);
  }
}

createAdmin();

