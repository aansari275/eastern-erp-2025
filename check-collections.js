// Check what collections exist in Firebase
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

async function listAllCollections() {
  try {
    console.log('📚 Checking all Firebase collections...');
    
    // List of known collection names to check
    const possibleCollections = [
      'complianceAudits',
      'labInspections', 
      'sampling',
      'samples',
      'samplingRequests',
      'samplingDashboard',
      'buyers',
      'articles',
      'users',
      'departments',
      'permissions',
      'audits',
      'inspections',
      'qualityAudits'
    ];
    
    for (const collectionName of possibleCollections) {
      try {
        const snapshot = await db.collection(collectionName).limit(5).get();
        if (snapshot.size > 0) {
          const fullSnapshot = await db.collection(collectionName).get();
          console.log(`\n📊 ${collectionName}: ${fullSnapshot.size} documents`);
          
          // Show sample document structure
          const sampleDoc = snapshot.docs[0];
          const data = sampleDoc.data();
          console.log(`   Sample fields: ${Object.keys(data).slice(0, 8).join(', ')}${Object.keys(data).length > 8 ? '...' : ''}`);
        }
      } catch (error) {
        // Collection doesn't exist or no permission, skip silently
      }
    }
    
    console.log('\n✅ Collection check complete');
    
  } catch (error) {
    console.error('❌ Error checking collections:', error);
  } finally {
    process.exit(0);
  }
}

listAllCollections();