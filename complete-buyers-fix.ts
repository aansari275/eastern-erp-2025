import { adminDb } from './server/firebaseAdmin';

async function completeBuyersFix() {
  try {
    console.log('🔧 Completing buyers data fix...');
    
    // Add the missing A-07 buyer
    const a07Buyer = {
      id: 'A-07',
      name: 'ARSIN RIG',
      code: 'A-07',
      buyerName: 'ARSIN RIG',
      buyerCode: 'A-07',
      merchantId: 'israr@easternmills.com',
      merchantName: 'Israr Ansari',
      merchantEmail: 'israr@easternmills.com',
      reference: 'ARS-001',
      currency: 'USD',
      paymentTerms: '30 days',
      deliveryAddress: 'ARSIN RIG Delivery Address',
      invoiceAddress: 'ARSIN RIG Invoice Address',
      shipmentMethod: 'Sea freight',
      notes: 'Specialized rug manufacturer',
      isActive: true,
      accessLevel: 'viewer',
      assignedBuyers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Adding buyer A-07: ARSIN RIG');
    await adminDb.collection('buyers').doc('A-07').set(a07Buyer);
    
    // Update existing A-01 and A-02 buyers to have consistent schema
    console.log('Updating A-01 buyer schema...');
    await adminDb.collection('buyers').doc('A-01').update({
      buyerName: 'LOLOI',
      buyerCode: 'A-01',
      merchantName: 'Israr Ansari',
      merchantEmail: 'israr@easternmills.com',
      accessLevel: 'viewer',
      assignedBuyers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Updating A-02 buyer schema...');
    await adminDb.collection('buyers').doc('A-02').update({
      buyerName: 'ATELIER TORTIL',
      buyerCode: 'A-02',
      merchantName: 'Israr Ansari',
      merchantEmail: 'israr@easternmills.com',
      accessLevel: 'viewer',
      assignedBuyers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ All buyers updated!');
    
    // Verify the data
    console.log('\n🔍 Final verification...');
    const articleBuyerCodes = ['A-01', 'A-02', 'A-07'];
    
    for (const buyerCode of articleBuyerCodes) {
      const buyerDoc = await adminDb.collection('buyers').doc(buyerCode).get();
      if (buyerDoc.exists) {
        const buyerData = buyerDoc.data();
        console.log(`✓ Buyer ${buyerCode}: ${buyerData.buyerName || buyerData.name} exists`);
        
        // Count articles for this buyer
        const articlesSnapshot = await adminDb.collection('buyerArticlesNo')
          .where('buyerDesignCode', '==', buyerCode)
          .get();
        console.log(`  └─ ${articlesSnapshot.size} articles found`);
      } else {
        console.log(`❌ Buyer ${buyerCode}: not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error completing buyers fix:', error);
  }
}

completeBuyersFix();