import admin from 'firebase-admin';
import { Pool } from 'pg';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const db = admin.firestore();

// Initialize PostgreSQL connection
const pgClient = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateBuyers() {
  try {
    console.log('🔄 Starting buyer migration from PostgreSQL to Firebase...');
    
    // Get buyers from PostgreSQL
    const pgResult = await pgClient.query('SELECT name, code FROM buyers ORDER BY name');
    console.log(`📊 Found ${pgResult.rows.length} buyers in PostgreSQL`);
    
    // Clear existing Firebase buyers first
    const existingSnapshot = await db.collection('buyers').get();
    const batch = db.batch();
    existingSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`🗑️ Cleared ${existingSnapshot.docs.length} existing Firebase buyers`);
    
    let created = 0;
    
    // Create all buyers fresh
    for (const row of pgResult.rows) {
      const { name, code } = row;
      const buyerId = Date.now() + Math.floor(Math.random() * 10000);
      
      await db.collection('buyers').doc(buyerId.toString()).set({
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
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      created++;
      
      console.log(`✅ Created buyer: ${name} (${code})`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`🎉 Migration complete: ${created} buyers created in Firebase`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pgClient.end();
    process.exit(0);
  }
}

migrateBuyers();