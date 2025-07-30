import admin from 'firebase-admin';
import fs from 'fs';

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

  async function checkLabInspections() {
    console.log('🔬 Checking lab inspections collection...');
    
    try {
      // Get all lab inspections
      const snapshot = await db.collection('labInspections').orderBy('createdAt', 'desc').limit(20).get();
      console.log(`Found ${snapshot.size} lab inspections:`);
      
      if (snapshot.empty) {
        console.log('❌ No lab inspections found');
        return;
      }
      
      let draftCount = 0;
      let submittedCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`\n🔍 Inspection: ${doc.id}`);
        console.log(`  Status: ${data.status}`);
        console.log(`  Company: ${data.company}`);
        console.log(`  Supplier: ${data.supplierName}`);
        console.log(`  Material Type: ${data.materialType || data.inspectionType}`);
        console.log(`  Created: ${data.createdAt?.toDate?.()?.toISOString() || data.createdAt}`);
        
        if (data.status === 'draft') {
          draftCount++;
        } else if (data.status === 'submitted') {
          submittedCount++;
        }
      });
      
      console.log(`\n📊 Summary:`);
      console.log(`  Total: ${snapshot.size}`);
      console.log(`  Drafts: ${draftCount}`);
      console.log(`  Submitted: ${submittedCount}`);
      
      // Check compliance audits too
      console.log('\n🔍 Checking compliance audits...');
      const complianceSnapshot = await db.collection('complianceAudits').orderBy('created_at', 'desc').limit(10).get();
      console.log(`Found ${complianceSnapshot.size} compliance audits`);
      
      let complianceDrafts = 0;
      let complianceSubmitted = 0;
      
      complianceSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`\n🔍 Audit: ${doc.id}`);
        console.log(`  Status: ${data.status}`);
        console.log(`  Company: ${data.company_name}`);
        
        if (data.status === 'draft') {
          complianceDrafts++;
        } else if (data.status === 'submitted') {
          complianceSubmitted++;
        }
      });
      
      console.log(`\n📊 Compliance Summary:`);
      console.log(`  Total: ${complianceSnapshot.size}`);
      console.log(`  Drafts: ${complianceDrafts}`);
      console.log(`  Submitted: ${complianceSubmitted}`);
      
    } catch (error) {
      console.error('❌ Error checking collections:', error);
    }
  }

  checkLabInspections().then(() => {
    console.log('\n✅ Inspection check complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}