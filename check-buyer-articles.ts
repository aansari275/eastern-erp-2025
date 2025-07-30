import { adminDb } from './server/firebaseAdmin';

async function checkBuyerArticles() {
  try {
    console.log('🔍 Checking buyerArticlesNo collection...');
    
    // Get all documents from buyerArticlesNo collection
    const snapshot = await adminDb.collection('buyerArticlesNo').get();
    
    console.log(`📊 Found ${snapshot.size} documents in buyerArticlesNo collection`);
    
    if (snapshot.size === 0) {
      console.log('❌ No data found in buyerArticlesNo collection');
      return;
    }
    
    // Show first 5 documents
    let count = 0;
    snapshot.forEach(doc => {
      if (count < 5) {
        console.log(`  - Document ${doc.id}:`, {
          buyerArticleNumber: doc.data().buyerArticleNumber,
          designName: doc.data().designName,
          color: doc.data().color,
          size: doc.data().size,
          buyerDesignCode: doc.data().buyerDesignCode,
          construction: doc.data().construction
        });
        count++;
      }
    });
    
    // Group by buyer codes
    const buyerCounts = {};
    snapshot.forEach(doc => {
      const buyerCode = doc.data().buyerDesignCode;
      buyerCounts[buyerCode] = (buyerCounts[buyerCode] || 0) + 1;
    });
    
    console.log('\n📈 Articles per buyer:');
    Object.entries(buyerCounts).forEach(([buyerCode, count]) => {
      console.log(`  - ${buyerCode}: ${count} articles`);
    });
    
  } catch (error) {
    console.error('❌ Error checking buyerArticlesNo collection:', error);
  }
}

checkBuyerArticles();