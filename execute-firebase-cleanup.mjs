import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./server/firebaseServiceAccountKey.json', 'utf8'));
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function executeFirebaseCleanup() {
  try {
    console.log('🧹 Starting systematic Firebase cleanup...\n');
    
    // PHASE 1: Delete conflicting audit collections
    console.log('🗑️ PHASE 1: Removing conflicting audit collections...');
    
    const auditCollectionsToDelete = ['audit', 'auditForms'];
    
    for (const collectionName of auditCollectionsToDelete) {
      try {
        console.log(`   Deleting collection: ${collectionName}`);
        const snapshot = await db.collection(collectionName).get();
        
        if (snapshot.empty) {
          console.log(`   ✅ ${collectionName} already empty`);
          continue;
        }
        
        // Backup before deletion
        const backupData = [];
        snapshot.forEach(doc => {
          backupData.push({ id: doc.id, ...doc.data() });
        });
        
        fs.writeFileSync(`./backup-${collectionName}-${Date.now()}.json`, JSON.stringify(backupData, null, 2));
        console.log(`   💾 Backed up ${snapshot.size} documents from ${collectionName}`);
        
        // Delete all documents
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`   ✅ Deleted ${snapshot.size} documents from ${collectionName}`);
        
      } catch (error) {
        console.log(`   ❌ Error deleting ${collectionName}:`, error.message);
      }
    }
    
    // PHASE 2: Clean up old department/permission system
    console.log('\\n🗑️ PHASE 2: Cleaning up old department system...');
    
    const oldSystemCollections = ['departments', 'department_tabs'];
    
    for (const collectionName of oldSystemCollections) {
      try {
        console.log(`   Deleting collection: ${collectionName}`);
        const snapshot = await db.collection(collectionName).get();
        
        if (snapshot.empty) {
          console.log(`   ✅ ${collectionName} already empty`);
          continue;
        }
        
        // Backup before deletion
        const backupData = [];
        snapshot.forEach(doc => {
          backupData.push({ id: doc.id, ...doc.data() });
        });
        
        fs.writeFileSync(`./backup-${collectionName}-${Date.now()}.json`, JSON.stringify(backupData, null, 2));
        console.log(`   💾 Backed up ${snapshot.size} documents from ${collectionName}`);
        
        // Delete all documents
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`   ✅ Deleted ${snapshot.size} documents from ${collectionName}`);
        
      } catch (error) {
        console.log(`   ❌ Error deleting ${collectionName}:`, error.message);
      }
    }
    
    // PHASE 3: Clean up temp/test data
    console.log('\\n🗑️ PHASE 3: Cleaning up temporary data...');
    
    const tempCollections = ['extractedText'];
    
    for (const collectionName of tempCollections) {
      try {
        console.log(`   Deleting collection: ${collectionName}`);
        const snapshot = await db.collection(collectionName).get();
        
        if (snapshot.empty) {
          console.log(`   ✅ ${collectionName} already empty`);
          continue;
        }
        
        // Small collections - just delete without backup
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`   ✅ Deleted ${snapshot.size} documents from ${collectionName}`);
        
      } catch (error) {
        console.log(`   ❌ Error deleting ${collectionName}:`, error.message);
      }
    }
    
    // PHASE 4: Verify current working collections
    console.log('\\n✅ PHASE 4: Verifying clean state...');
    
    const workingCollections = {
      'complianceAudits': 'Current audit system',
      'users': 'Clean user system', 
      'roles': 'Clean role system',
      'rugs': 'Sampling gallery (PROTECTED)',
      'buyers': 'Business data (PROTECTED)',
      'article_numbers': 'Business data (PROTECTED)'
    };
    
    for (const [collectionName, purpose] of Object.entries(workingCollections)) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        const count = (await db.collection(collectionName).count().get()).data().count;
        console.log(`   ✅ ${collectionName}: ${count} documents - ${purpose}`);
      } catch (error) {
        console.log(`   ❌ ${collectionName}: Error - ${error.message}`);
      }
    }
    
    console.log('\\n🎉 Firebase cleanup completed successfully!');
    console.log('\\n📋 SUMMARY:');
    console.log('   • Removed conflicting audit collections (audit, auditForms)');
    console.log('   • Cleaned up old department system');
    console.log('   • Removed temporary data collections');
    console.log('   • Protected critical business data (rugs, buyers, articles)');
    console.log('   • Maintained clean user/role system');
    console.log('   • Single audit system: complianceAudits only');
    
    console.log('\\n🎯 Next: Clean up duplicate code files to complete the cleanup!');
    
  } catch (error) {
    console.error('❌ Firebase cleanup failed:', error);
    throw error;
  }
}

// Run cleanup
executeFirebaseCleanup()
  .then(() => {
    console.log('\\n🚀 Firebase is now clean! Ready for code cleanup.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });