import { adminDb } from './server/firebaseAdmin';

async function fixBuyersData() {
  try {
    console.log('🔧 Fixing buyers data...');
    
    // Check the structure of a few buyer documents
    const buyersSnapshot = await adminDb.collection('buyers').limit(5).get();
    console.log('📊 Sample buyer document structure:');
    buyersSnapshot.forEach(doc => {
      console.log(`Document ${doc.id}:`, doc.data());
    });
    
    // Let's add the missing buyers that have articles
    const requiredBuyers = [
      {
        id: 'A-01',
        name: 'LOLOI',
        code: 'A-01',
        merchantId: 'israr@easternmills.com',
        reference: 'LOL-001',
        currency: 'USD',
        paymentTerms: '30 days',
        deliveryAddress: 'LOLOI Delivery Address',
        invoiceAddress: 'LOLOI Invoice Address',
        shipmentMethod: 'Sea freight',
        notes: 'Premium rug manufacturer',
        isActive: true
      },
      {
        id: 'A-02',
        name: 'ATELIER TORTIL',
        code: 'A-02',
        merchantId: 'israr@easternmills.com',
        reference: 'ATL-001',
        currency: 'EUR',
        paymentTerms: '45 days',
        deliveryAddress: 'ATELIER TORTIL Delivery Address',
        invoiceAddress: 'ATELIER TORTIL Invoice Address',
        shipmentMethod: 'Air freight',
        notes: 'European luxury brand',
        isActive: true
      }
    ];
    
    // Add the missing buyers
    for (const buyer of requiredBuyers) {
      console.log(`Adding buyer: ${buyer.name} (${buyer.code})`);
      await adminDb.collection('buyers').doc(buyer.id).set(buyer);
    }
    
    console.log('✅ Buyers data fixed!');
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const articlesSnapshot = await adminDb.collection('buyerArticlesNo').get();
    const articleBuyerCodes = new Set();
    articlesSnapshot.forEach(doc => {
      articleBuyerCodes.add(doc.data().buyerDesignCode);
    });
    
    console.log('Article buyer codes:', Array.from(articleBuyerCodes));
    
    for (const buyerCode of articleBuyerCodes) {
      const buyerDoc = await adminDb.collection('buyers').doc(buyerCode).get();
      if (buyerDoc.exists) {
        const buyerData = buyerDoc.data();
        console.log(`✓ Buyer ${buyerCode}: ${buyerData.name} exists`);
      } else {
        console.log(`❌ Buyer ${buyerCode}: not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing buyers data:', error);
  }
}

fixBuyersData();