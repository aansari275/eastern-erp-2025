import { adminDb } from './server/firebaseAdmin';
import { storage } from './server/storage';

interface BuyerArticleRecord {
  id: number;
  buyerArticleNumber: string;
  designName: string;
  color: string;
  size: string;
  buyerName: string;
  buyerDesignCode: string;
  construction: string;
  quality: string;
  currency: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

async function migrateBuyerArticlesToFirebase() {
  try {
    console.log('🚀 Starting migration of Buyer Articles No. to Firebase...');
    
    // Fetch all records from storage (which reads from PostgreSQL)
    console.log('📊 Fetching buyer articles from storage...');
    const buyerArticles = await storage.getOpsLineItems();

    console.log(`📋 Found ${buyerArticles.length} buyer articles to migrate`);

    if (buyerArticles.length === 0) {
      console.log('⚠️ No buyer articles found to migrate');
      return;
    }

    // Prepare Firebase batch operations
    const batch = adminDb.batch();
    const buyerArticlesRef = adminDb.collection('buyerArticlesNo');
    
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firebase batch limit

    for (const article of buyerArticles) {
      const articleData = {
        buyerArticleNumber: article.buyerArticleNumber || '',
        designName: article.designName || '',
        color: article.color || '',
        size: article.size || '',
        buyerName: article.buyerName || '',
        buyerDesignCode: article.buyerDesignCode || '',
        construction: article.construction || '',
        quality: article.quality || '',
        currency: article.currency || 'USD',
        isActive: article.isActive ?? true,
        createdAt: article.createdAt || new Date(),
        updatedAt: article.updatedAt || new Date(),
      };

      // Use original ID as document ID for consistency
      const docRef = buyerArticlesRef.doc(article.id.toString());
      batch.set(docRef, articleData);
      
      batchCount++;

      // Commit batch when reaching limit
      if (batchCount >= BATCH_SIZE) {
        console.log(`💾 Committing batch of ${batchCount} records...`);
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining records
    if (batchCount > 0) {
      console.log(`💾 Committing final batch of ${batchCount} records...`);
      await batch.commit();
    }

    console.log('✅ Successfully migrated all buyer articles to Firebase!');
    console.log(`📊 Migration Summary:`);
    console.log(`   - Total Records: ${buyerArticles.length}`);
    console.log(`   - Firebase Collection: buyerArticlesNo`);
    console.log(`   - Status: Complete`);

    // Verify the migration
    console.log('🔍 Verifying migration...');
    const snapshot = await buyerArticlesRef.get();
    console.log(`✅ Verified: ${snapshot.size} documents in Firebase collection`);

    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateBuyerArticlesToFirebase()
    .then(() => {
      console.log('🎉 Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export { migrateBuyerArticlesToFirebase };