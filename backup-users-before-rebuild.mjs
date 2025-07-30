import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./server/firebaseServiceAccountKey.json', 'utf8'));
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function backupUsers() {
  try {
    console.log('🔍 Backing up current Firebase users before rebuild...');
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = { id: doc.id, ...doc.data() };
      users.push(userData);
      console.log(`📋 User: ${userData.email || 'No email'} | Role: ${userData.role || userData.Role} | Dept: ${userData.departmentId || userData.departments}`);
    });
    
    // Save backup to file
    const backup = {
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      users: users
    };
    
    fs.writeFileSync('./user-backup-before-rebuild.json', JSON.stringify(backup, null, 2));
    console.log(`✅ Backup saved to user-backup-before-rebuild.json (${users.length} users)`);
    
    // Also check permissions collection
    try {
      const permissionsSnapshot = await db.collection('permissions').get();
      console.log(`📊 Found ${permissionsSnapshot.size} permissions entries`);
    } catch (e) {
      console.log('📊 No permissions collection found');
    }
    
    // Check user_tab_permissions
    try {
      const tabPermsSnapshot = await db.collection('user_tab_permissions').get();
      console.log(`📊 Found ${tabPermsSnapshot.size} user_tab_permissions entries`);
    } catch (e) {
      console.log('📊 No user_tab_permissions collection found');
    }
    
    return users;
    
  } catch (error) {
    console.error('❌ Error backing up users:', error);
    throw error;
  }
}

// Run backup
backupUsers()
  .then(users => {
    console.log('\n🎉 Backup completed successfully!');
    console.log('You can now safely delete the problematic collections and rebuild.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  });