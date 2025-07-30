import { adminDb } from './server/firebaseAdmin';

async function directFirestoreUpdate() {
  console.log('🔧 Direct Firestore buyer code updates...\n');

  try {
    // Get all buyers from Firestore directly
    const buyersSnapshot = await adminDb.collection('buyers').get();
    const buyers = buyersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${buyers.length} buyers in Firestore\n`);

    // Show current state
    console.log('📋 Current buyer codes:');
    buyers.slice(0, 10).forEach(buyer => {
      console.log(`   "${buyer.name}": "${buyer.buyerCode}"`);
    });

    // Update specific buyers that should match ERP codes
    const updates = [
      { name: 'A-07', newCode: 'A-07' },
      { name: 'C-04', newCode: 'C-04' },
      { name: 'C-05', newCode: 'C-05' },
      { name: 'CASA', newCode: 'CASA' },
      { name: 'ROMO', newCode: 'ROMO' },
    ];

    console.log('\n🔄 Performing direct Firestore updates...');
    
    for (const update of updates) {
      const buyer = buyers.find(b => b.name === update.name);
      if (buyer) {
        try {
          await adminDb.collection('buyers').doc(buyer.id).update({
            buyerCode: update.newCode
          });
          console.log(`✅ Updated buyer "${buyer.name}" with code "${update.newCode}"`);
        } catch (error) {
          console.error(`❌ Failed to update buyer "${buyer.name}":`, error);
        }
      }
    }

    // Verify updates by re-fetching
    console.log('\n🔍 Verifying updates...');
    const updatedSnapshot = await adminDb.collection('buyers').get();
    const updatedBuyers = updatedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    for (const update of updates) {
      const buyer = updatedBuyers.find(b => b.name === update.name);
      if (buyer) {
        console.log(`   "${buyer.name}": buyerCode = "${buyer.buyerCode}"`);
      }
    }

  } catch (error) {
    console.error('❌ Direct update failed:', error);
    throw error;
  }
}

// Run update automatically
directFirestoreUpdate()
  .then(() => {
    console.log('\n🎉 Direct Firestore updates completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Update failed:', error);
    process.exit(1);
  });

export { directFirestoreUpdate };