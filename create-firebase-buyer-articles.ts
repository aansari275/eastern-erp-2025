import { adminDb } from './server/firebaseAdmin';

async function createBuyerArticlesInFirebase() {
  try {
    console.log('🚀 Creating Buyer Articles No. collection in Firebase...');
    
    // Sample buyer articles data based on the structure
    const sampleBuyerArticles = [
      {
        buyerArticleNumber: 'A-01-001',
        designName: 'EM-25-MA-2502',
        color: 'IVORY',
        size: '8x10',
        buyerName: 'LOLOI',
        buyerDesignCode: 'A-01',
        construction: 'HAND KNOTTED',
        quality: '100 KNOTS',
        currency: 'USD',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        buyerArticleNumber: 'A-01-002',
        designName: 'EM-25-MA-2503',
        color: 'CHARCOAL',
        size: '9x12',
        buyerName: 'LOLOI',
        buyerDesignCode: 'A-01',
        construction: 'HAND KNOTTED',
        quality: '120 KNOTS',
        currency: 'USD',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        buyerArticleNumber: 'A-02-001',
        designName: 'EM-25-MA-3402',
        color: 'NAVY',
        size: '6x9',
        buyerName: 'ATELIER TORTIL',
        buyerDesignCode: 'A-02',
        construction: 'HANDLOOM',
        quality: 'REED 12',
        currency: 'EUR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        buyerArticleNumber: 'A-07-001',
        designName: 'BH-19-MA-487-V3',
        color: 'TAIGA',
        size: '30x40',
        buyerName: 'ARSIN RIG',
        buyerDesignCode: 'A-07',
        construction: 'HAND KNOTTED',
        quality: '80 KNOTS',
        currency: 'USD',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        buyerArticleNumber: 'A-07-002',
        designName: 'BH-19-MA-487-V3',
        color: 'LICHEN',
        size: '330x600',
        buyerName: 'ARSIN RIG',
        buyerDesignCode: 'A-07',
        construction: 'HAND KNOTTED',
        quality: '80 KNOTS',
        currency: 'USD',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        buyerArticleNumber: 'A-07-003',
        designName: 'BH-19-MA-487-V3',
        color: 'MOSS',
        size: '30x40',
        buyerName: 'ARSIN RIG',
        buyerDesignCode: 'A-07',
        construction: 'HAND KNOTTED',
        quality: '80 KNOTS',
        currency: 'USD',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Create the collection with sample data
    const buyerArticlesRef = adminDb.collection('buyerArticlesNo');
    
    for (let i = 0; i < sampleBuyerArticles.length; i++) {
      const docRef = buyerArticlesRef.doc((i + 1).toString());
      await docRef.set(sampleBuyerArticles[i]);
      console.log(`✅ Created buyer article: ${sampleBuyerArticles[i].buyerArticleNumber}`);
    }

    console.log('✅ Successfully created Buyer Articles No. collection in Firebase!');
    console.log(`📊 Summary:`);
    console.log(`   - Collection: buyerArticlesNo`);
    console.log(`   - Documents: ${sampleBuyerArticles.length}`);
    console.log(`   - Buyers: A-01 (LOLOI), A-02 (ATELIER TORTIL), A-07 (ARSIN RIG)`);

    // Verify the creation
    console.log('🔍 Verifying collection...');
    const snapshot = await buyerArticlesRef.get();
    console.log(`✅ Verified: ${snapshot.size} documents in Firebase collection`);

    return true;
  } catch (error) {
    console.error('❌ Failed to create buyer articles:', error);
    throw error;
  }
}

// Run creation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createBuyerArticlesInFirebase()
    .then(() => {
      console.log('🎉 Collection created successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Creation failed:', error);
      process.exit(1);
    });
}

export { createBuyerArticlesInFirebase };