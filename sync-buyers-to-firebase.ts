import { adminDb } from './server/firebaseAdmin';
import { Pool } from 'pg';

// PostgreSQL connection
const pgClient = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function syncBuyersToFirebase() {
  try {
    console.log('🔄 Syncing buyers from PostgreSQL to Firebase...');
    
    // Get all buyers from PostgreSQL
    const pgResult = await pgClient.query('SELECT name, code FROM buyers ORDER BY name');
    console.log(`📊 Found ${pgResult.rows.length} buyers in PostgreSQL`);
    
    // Clear existing Firebase buyers
    const existingSnapshot = await adminDb.collection('buyers').get();
    const batch = adminDb.batch();
    existingSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    if (existingSnapshot.docs.length > 0) {
      await batch.commit();
      console.log(`🗑️ Cleared ${existingSnapshot.docs.length} existing Firebase buyers`);
    }
    
    // Add all buyers to Firebase
    let created = 0;
    for (const row of pgResult.rows) {
      const { name, code } = row;
      const buyerId = Date.now() + Math.floor(Math.random() * 10000);
      
      const buyerDoc = adminDb.collection('buyers').doc(buyerId.toString());
      await buyerDoc.set({
        id: buyerId,
        buyerName: name,
        buyerCode: code,
        name: name,
        code: code,
        merchantId: '',
        reference: '',
        currency: 'USD',
        paymentTerms: '',
        deliveryAddress: '',
        invoiceAddress: '',
        shipmentMethod: '',
        articleNumbers: [],
        notes: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      created++;
      console.log(`✅ Created: ${name} (${code})`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`🎉 Successfully synced ${created} buyers to Firebase`);
    
    // Verify the sync
    const verifySnapshot = await adminDb.collection('buyers').get();
    console.log(`✅ Verification: ${verifySnapshot.docs.length} buyers now in Firebase`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await pgClient.end();
    process.exit(0);
  }
}

syncBuyersToFirebase();