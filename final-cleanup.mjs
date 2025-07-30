import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./server/firebaseServiceAccountKey.json', 'utf8'));
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function finalCleanup() {
  try {
    console.log('🧹 Final cleanup of Firebase collections...\n');
    
    // Step 1: Clean up users collection - remove duplicates and invalid entries
    console.log('1️⃣ Cleaning up users collection...');
    const usersSnapshot = await db.collection('users').get();
    const validEmails = new Set();
    const docsToDelete = [];
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      
      // Mark for deletion if: no email, duplicate email, or invalid data
      if (!data.email || 
          data.email === 'undefined' || 
          validEmails.has(data.email) || 
          !data.role ||
          data.role === 'undefined' ||
          data.role === 'user') {
        
        console.log(`   🗑️ Marking for deletion: ${data.email || 'No email'} (${data.role || 'No role'})`);
        docsToDelete.push(doc.ref);
      } else {
        validEmails.add(data.email);
        console.log(`   ✅ Keeping: ${data.email} (${data.role})`);
      }
    }
    
    // Delete invalid users
    for (const docRef of docsToDelete) {
      await docRef.delete();
    }
    console.log(`✅ Deleted ${docsToDelete.length} invalid user documents`);
    
    // Step 2: Clean up roles collection - remove old/invalid roles
    console.log('\n2️⃣ Cleaning up roles collection...');
    const rolesSnapshot = await db.collection('roles').get();
    const validRoles = ['admin', 'quality_manager', 'quality_team', 'sampling_team', 'viewer'];
    
    for (const doc of rolesSnapshot.docs) {
      if (!validRoles.includes(doc.id)) {
        console.log(`   🗑️ Deleting invalid role: ${doc.id}`);
        await doc.ref.delete();
      } else {
        console.log(`   ✅ Keeping valid role: ${doc.id}`);
      }
    }
    
    // Step 3: Verify final state
    console.log('\n3️⃣ Verifying final state...');
    const finalUsersSnapshot = await db.collection('users').get();
    console.log(`✅ Final user count: ${finalUsersSnapshot.size}`);
    
    finalUsersSnapshot.forEach(doc => {
      const user = doc.data();
      console.log(`   👤 ${user.email} | ${user.role} | ${user.departments?.join(', ') || 'No departments'}`);
    });
    
    const finalRolesSnapshot = await db.collection('roles').get();
    console.log(`✅ Final role count: ${finalRolesSnapshot.size}`);
    
    console.log('\n🎉 Final cleanup completed!');
    console.log('✅ Your Firebase authentication system is now clean and ready to use.');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

// Run cleanup
finalCleanup()
  .then(() => {
    console.log('\n🚀 System is ready! Try logging in now.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });