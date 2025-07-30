import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./server/firebaseServiceAccountKey.json', 'utf8'));
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function analyzeFirebaseCollections() {
  try {
    console.log('🔍 Analyzing Firebase collections for cleanup opportunities...\n');
    
    // Get all collections
    const collections = await db.listCollections();
    console.log(`📊 Found ${collections.length} collections total\n`);
    
    const collectionAnalysis = {};
    
    for (const collection of collections) {
      const collectionName = collection.id;
      console.log(`📁 Analyzing collection: ${collectionName}`);
      
      try {
        const snapshot = await collection.limit(5).get(); // Sample first 5 docs
        const docCount = (await collection.count().get()).data().count;
        
        collectionAnalysis[collectionName] = {
          documentCount: docCount,
          sampleDocs: [],
          purpose: 'Unknown'
        };
        
        // Analyze sample documents
        snapshot.forEach(doc => {
          const data = doc.data();
          collectionAnalysis[collectionName].sampleDocs.push({
            id: doc.id,
            fields: Object.keys(data),
            sampleData: Object.keys(data).reduce((sample, key) => {
              // Show first few chars of string values, or type for objects
              const value = data[key];
              if (typeof value === 'string') {
                sample[key] = value.length > 50 ? `${value.substring(0, 50)}...` : value;
              } else if (typeof value === 'object' && value !== null) {
                sample[key] = Array.isArray(value) ? `[Array: ${value.length} items]` : '[Object]';
              } else {
                sample[key] = value;
              }
              return sample;
            }, {})
          });
        });
        
        // Determine purpose based on collection name and content
        if (collectionName.includes('audit')) {
          collectionAnalysis[collectionName].purpose = 'Audit System';
        } else if (collectionName.includes('user')) {
          collectionAnalysis[collectionName].purpose = 'User Management';
        } else if (collectionName.includes('rug')) {
          collectionAnalysis[collectionName].purpose = 'Sampling/Gallery (KEEP)';
        } else if (collectionName.includes('material')) {
          collectionAnalysis[collectionName].purpose = 'Sampling/Gallery (KEEP)';
        } else if (collectionName.includes('buyer')) {
          collectionAnalysis[collectionName].purpose = 'Business Data (KEEP)';
        } else if (['roles', 'permissions', 'departments'].includes(collectionName)) {
          collectionAnalysis[collectionName].purpose = 'System Configuration';
        }
        
        console.log(`   📊 ${docCount} documents | Purpose: ${collectionAnalysis[collectionName].purpose}`);
        
        if (docCount > 0 && collectionAnalysis[collectionName].sampleDocs.length > 0) {
          const sampleFields = collectionAnalysis[collectionName].sampleDocs[0].fields;
          console.log(`   🏷️ Sample fields: ${sampleFields.join(', ')}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error analyzing ${collectionName}:`, error.message);
        collectionAnalysis[collectionName] = {
          documentCount: 'Error',
          error: error.message,
          purpose: 'Error - Needs Investigation'
        };
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Generate cleanup recommendations
    console.log('🧹 CLEANUP RECOMMENDATIONS:\n');
    
    const keepCollections = [];
    const cleanupCollections = [];
    const investigateCollections = [];
    
    for (const [name, analysis] of Object.entries(collectionAnalysis)) {
      if (analysis.purpose.includes('KEEP')) {
        keepCollections.push({ name, ...analysis });
      } else if (analysis.purpose === 'Error - Needs Investigation') {
        investigateCollections.push({ name, ...analysis });
      } else if (analysis.documentCount === 0) {
        cleanupCollections.push({ name, reason: 'Empty collection', ...analysis });
      } else if (name.includes('test') || name.includes('temp')) {
        cleanupCollections.push({ name, reason: 'Test/temporary collection', ...analysis });
      } else if (analysis.purpose === 'Unknown' && analysis.documentCount < 10) {
        investigateCollections.push({ name, ...analysis });
      } else {
        // Keep by default, but flag for review
        keepCollections.push({ name, ...analysis });
      }
    }
    
    console.log('✅ KEEP THESE COLLECTIONS:');
    keepCollections.forEach(collection => {
      console.log(`   📁 ${collection.name} (${collection.documentCount} docs) - ${collection.purpose}`);
    });
    
    console.log('\n🗑️ SAFE TO DELETE:');
    cleanupCollections.forEach(collection => {
      console.log(`   🗑️ ${collection.name} (${collection.documentCount} docs) - ${collection.reason}`);
    });
    
    console.log('\n🔍 INVESTIGATE FURTHER:');
    investigateCollections.forEach(collection => {
      console.log(`   ❓ ${collection.name} (${collection.documentCount} docs) - ${collection.purpose}`);
      if (collection.sampleDocs && collection.sampleDocs.length > 0) {
        console.log(`      Sample fields: ${collection.sampleDocs[0].fields.join(', ')}`);
      }
    });
    
    // Save detailed analysis to file
    fs.writeFileSync('./firebase-collections-analysis.json', JSON.stringify(collectionAnalysis, null, 2));
    console.log('\n💾 Detailed analysis saved to firebase-collections-analysis.json');
    
    return {
      total: collections.length,
      keep: keepCollections.length,
      cleanup: cleanupCollections.length,
      investigate: investigateCollections.length,
      analysis: collectionAnalysis
    };
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Run analysis
analyzeFirebaseCollections()
  .then((summary) => {
    console.log('\n📈 SUMMARY:');
    console.log(`   Total collections: ${summary.total}`);
    console.log(`   Keep: ${summary.keep}`);
    console.log(`   Safe to delete: ${summary.cleanup}`);
    console.log(`   Need investigation: ${summary.investigate}`);
    console.log('\n🎯 Ready for systematic cleanup!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });