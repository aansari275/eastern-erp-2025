// Firebase Collections Cleanup and Analysis Script
import admin from 'firebase-admin';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./server/serviceAccountKey.json', 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'rugcraftpro'
  });
}

const db = admin.firestore();

async function analyzeCollections() {
  console.log('🔍 Analyzing Firebase collections...');
  
  // Analyze complianceAudits collection
  try {
    const complianceSnapshot = await db.collection('complianceAudits').get();
    console.log(`\n📊 complianceAudits collection: ${complianceSnapshot.size} documents`);
    
    if (complianceSnapshot.size > 0) {
      console.log('📋 Sample compliance audit structure:');
      const sampleDoc = complianceSnapshot.docs[0];
      const data = sampleDoc.data();
      console.log('  - ID:', sampleDoc.id);
      console.log('  - Status:', data.status);
      console.log('  - Company:', data.company);
      console.log('  - Fields:', Object.keys(data));
      
      // Count by status
      const statusCounts = {};
      complianceSnapshot.forEach(doc => {
        const status = doc.data().status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log('  - Status breakdown:', statusCounts);
    }
  } catch (error) {
    console.log('❌ complianceAudits collection not found or error:', error.message);
  }

  // Analyze labInspections collection
  try {
    const labSnapshot = await db.collection('labInspections').get();
    console.log(`\n📊 labInspections collection: ${labSnapshot.size} documents`);
    
    if (labSnapshot.size > 0) {
      console.log('📋 Sample lab inspection structure:');
      const sampleDoc = labSnapshot.docs[0];
      const data = sampleDoc.data();
      console.log('  - ID:', sampleDoc.id);
      console.log('  - Status:', data.status);
      console.log('  - Company:', data.company);
      console.log('  - Fields:', Object.keys(data));
      
      // Count by status
      const statusCounts = {};
      labSnapshot.forEach(doc => {
        const status = doc.data().status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log('  - Status breakdown:', statusCounts);
    }
  } catch (error) {
    console.log('❌ labInspections collection not found or error:', error.message);
  }

  // Check for other audit-related collections
  const possibleCollections = ['audits', 'inspections', 'qualityAudits', 'drafts'];
  for (const collectionName of possibleCollections) {
    try {
      const snapshot = await db.collection(collectionName).limit(1).get();
      if (snapshot.size > 0) {
        const fullSnapshot = await db.collection(collectionName).get();
        console.log(`\n📊 ${collectionName} collection: ${fullSnapshot.size} documents`);
      }
    } catch (error) {
      // Collection doesn't exist, skip
    }
  }
}

async function cleanupCollections() {
  console.log('\n🧹 Starting cleanup process...');
  
  const collections = ['complianceAudits', 'labInspections'];
  
  for (const collectionName of collections) {
    try {
      console.log(`\n🗑️ Cleaning ${collectionName} collection...`);
      const snapshot = await db.collection(collectionName).get();
      
      if (snapshot.size === 0) {
        console.log(`  ✅ ${collectionName} collection is already empty`);
        continue;
      }
      
      console.log(`  📋 Found ${snapshot.size} documents to delete`);
      
      // Delete in batches
      const batch = db.batch();
      let deleteCount = 0;
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        deleteCount++;
      });
      
      await batch.commit();
      console.log(`  ✅ Deleted ${deleteCount} documents from ${collectionName}`);
      
    } catch (error) {
      console.log(`  ❌ Error cleaning ${collectionName}:`, error.message);
    }
  }
  
  console.log('\n✅ Cleanup completed!');
}

async function main() {
  try {
    await analyzeCollections();
    
    // Check if cleanup flag is provided
    const shouldCleanup = process.argv.includes('--cleanup');
    
    if (shouldCleanup) {
      console.log('\n🚨 PROCEEDING WITH CLEANUP - All audit data will be deleted!');
      await cleanupCollections();
    } else {
      console.log('\n⚠️ Analysis only - run with --cleanup flag to delete data');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    process.exit(0);
  }
}

// Check if cleanup flag is provided
const shouldCleanup = process.argv.includes('--cleanup');

if (shouldCleanup) {
  console.log('🚨 CLEANUP MODE ACTIVATED - This will delete all audit data!');
} else {
  console.log('🔍 ANALYSIS MODE - Examining current data structure');
}

main();