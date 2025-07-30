const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(fs.readFileSync('./server/serviceAccountKey.json', 'utf8'));
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'rugcraftpro'
    });
  }
  
  const db = admin.firestore();

  async function checkUsers() {
    console.log('📋 Checking current users in Firestore...');
    
    // Get users collection
    const usersSnapshot = await db.collection('users').limit(10).get();
    console.log(`Found ${usersSnapshot.size} users in Firestore:`);
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in Firestore');
      return;
    }
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n🔍 User: ${doc.id}`);
      console.log(`  Email: ${data.email || data.Email}`);
      console.log(`  Role: ${data.role || data.Role}`);
      console.log(`  Department: ${data.department || data.DepartmentId}`);
      console.log(`  Departments: ${JSON.stringify(data.departments)}`);
      console.log(`  Roles: ${JSON.stringify(data.roles)}`);
      console.log(`  Tabs: ${JSON.stringify(data.tabs)}`);
      console.log(`  Permissions: ${JSON.stringify(data.permissions)}`);
      console.log(`  IsActive: ${data.isActive}`);
    });
  }

  checkUsers().then(() => {
    console.log('\n✅ User check complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}