#!/usr/bin/env tsx

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccountData from './server/firebaseServiceAccountKey.json' assert { type: 'json' };

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccountData as any),
  projectId: "rugcraftpro"
});

const db = getFirestore(app);

async function showDatabaseInterface() {
  console.log('\n🔥 Firebase Database Interface for Replit\n');
  console.log('='.repeat(50));
  
  try {
    // Get all collections
    const collections = await db.listCollections();
    console.log(`\n📊 Available Collections (${collections.length}):`);
    
    for (const collection of collections) {
      const snapshot = await collection.limit(1).get();
      const docCount = snapshot.empty ? 0 : await collection.count().get().then(result => result.data().count);
      console.log(`  • ${collection.id}: ${docCount} documents`);
    }
    
    console.log('\n📋 Collection Details:\n');
    
    // Show detailed info for each collection
    for (const collection of collections) {
      const snapshot = await collection.limit(3).get();
      console.log(`\n🗂️  Collection: ${collection.id}`);
      console.log('-'.repeat(30));
      
      if (snapshot.empty) {
        console.log('   (Empty collection)');
        continue;
      }
      
      const docs = snapshot.docs;
      console.log(`   Documents found: ${docs.length} (showing max 3)`);
      
      docs.forEach((doc, index) => {
        console.log(`\n   Document ${index + 1}: ${doc.id}`);
        const data = doc.data();
        
        // Show first few fields to avoid clutter
        const fields = Object.keys(data).slice(0, 5);
        fields.forEach(field => {
          let value = data[field];
          if (typeof value === 'string' && value.length > 50) {
            value = value.substring(0, 50) + '...';
          } else if (typeof value === 'object' && value !== null) {
            value = Array.isArray(value) ? `[Array: ${value.length} items]` : '[Object]';
          }
          console.log(`     ${field}: ${value}`);
        });
        
        if (Object.keys(data).length > 5) {
          console.log(`     ... and ${Object.keys(data).length - 5} more fields`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 Firebase Database is accessible and showing data');
    console.log('💡 You can now see your Firebase data in Replit');
    console.log('🔄 Run this script anytime: npx tsx firebase-db-interface.ts');
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Error accessing Firebase:', error);
  }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  showDatabaseInterface();
}

export { showDatabaseInterface };