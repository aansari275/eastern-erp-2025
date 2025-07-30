import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

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

  async function backupSamplingData() {
    console.log('📦 Creating complete backup of sampling data...');
    
    const backupData = {
      timestamp: new Date().toISOString(),
      collections: {}
    };
    
    try {
      // Define all collections that might contain sampling data
      const collectionsToBackup = [
        'rugs',              // Main sampling products
        'rugGallery',        // Gallery items
        'materials',         // Materials/yarn data
        'costings',          // Costing information
        'buyers',            // Buyer information
        'sampleInspections', // Sample inspections
        'users',             // User data (for reference)
        'quotes',            // Quotes
        'pdocs',             // Product documents
        'buyerArticlesNo',   // Buyer article numbers
      ];
      
      for (const collectionName of collectionsToBackup) {
        console.log(`📁 Backing up collection: ${collectionName}`);
        
        try {
          const snapshot = await db.collection(collectionName).get();
          const documents = [];
          
          snapshot.forEach(doc => {
            const data = doc.data();
            
            // Convert Firestore timestamps to ISO strings
            const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
              if (value && typeof value === 'object' && value._seconds) {
                return new Date(value._seconds * 1000).toISOString();
              }
              return value;
            }));
            
            documents.push({
              id: doc.id,
              data: cleanData
            });
          });
          
          backupData.collections[collectionName] = {
            count: documents.length,
            documents: documents
          };
          
          console.log(`✅ ${collectionName}: ${documents.length} documents backed up`);
          
        } catch (error) {
          console.error(`❌ Error backing up ${collectionName}:`, error.message);
          backupData.collections[collectionName] = {
            error: error.message,
            count: 0,
            documents: []
          };
        }
      }
      
      // Create backup directory
      const backupDir = './backups';
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      // Save backup to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `sampling-backup-${timestamp}.json`);
      
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
      
      // Create summary report
      const summary = {
        backupFile: backupFile,
        timestamp: backupData.timestamp,
        totalCollections: Object.keys(backupData.collections).length,
        collectionSummary: {}
      };
      
      let totalDocuments = 0;
      for (const [collectionName, collection] of Object.entries(backupData.collections)) {
        summary.collectionSummary[collectionName] = collection.count;
        totalDocuments += collection.count;
      }
      
      summary.totalDocuments = totalDocuments;
      
      console.log('\n🎉 BACKUP COMPLETE!');
      console.log('📄 Backup Summary:');
      console.log(`   📁 File: ${backupFile}`);
      console.log(`   📊 Total Collections: ${summary.totalCollections}`);
      console.log(`   📄 Total Documents: ${summary.totalDocuments}`);
      console.log('\n📋 Collection Breakdown:');
      
      for (const [name, count] of Object.entries(summary.collectionSummary)) {
        console.log(`   ${name}: ${count} documents`);
      }
      
      // Save summary report
      const summaryFile = path.join(backupDir, `backup-summary-${timestamp}.json`);
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
      
      console.log(`\n📋 Summary saved to: ${summaryFile}`);
      
      return summary;
      
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  backupSamplingData().then((summary) => {
    console.log('\n✅ Backup operation completed successfully');
    console.log('🔄 You can now safely start fresh with a new app/database');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Backup operation failed:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}