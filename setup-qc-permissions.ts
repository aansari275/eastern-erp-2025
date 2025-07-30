// Setup script to create sample QC permissions for testing
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const admin = initializeApp({
  credential: cert('./attached_assets/rugcraftpro-firebase-adminsdk-fbsvc-87c6412e74_1752861348411.json'),
  databaseURL: 'https://rugcraftpro-default-rtdb.firebaseio.com'
});

const db = getFirestore();

interface QCPermission {
  userId: string;
  email: string;
  name: string;
  assignedStages: string[];
  isActive: boolean;
}

// Sample QC inspectors based on your system requirements
const sampleQCInspectors: QCPermission[] = [
  {
    userId: 'qc_ehsan_001',
    email: 'ehsan@easternmills.com',
    name: 'Ehsan Ahmed',
    assignedStages: ['Bazaar', 'Binding', 'Clipping', 'Finishing'], // Broadloom specialist
    isActive: true
  },
  {
    userId: 'qc_irfan_001', 
    email: 'irfan@easternmills.com',
    name: 'Irfan Khan',
    assignedStages: ['Lab', 'On Loom', 'Washing', 'Stretching'], // Custom orders specialist
    isActive: true
  },
  {
    userId: 'qc_abdul_001',
    email: 'abdulansari@easternmills.com',
    name: 'Abdul Ansari',
    assignedStages: ['Lab', 'On Loom', 'Bazaar', 'Washing', 'Stretching', 'Binding', '100% Finished QC', 'Final Inspection'], // Area Rugs - all stages
    isActive: true
  },
  {
    userId: 'qc_danish_001',
    email: 'danishsampling.eastern@gmail.com',
    name: 'Danish Sampling',
    assignedStages: ['Lab', 'On Loom', 'Bazaar'], // Area Rugs - initial stages
    isActive: true
  },
  {
    userId: 'qc_faizan_001',
    email: 'faizanansari05100@gmail.com',
    name: 'Faizan Ansari',
    assignedStages: ['Washing', 'Stretching', 'Binding', '100% Finished QC', 'Final Inspection'], // Area Rugs - final stages
    isActive: true
  }
];

async function setupQCPermissions() {
  try {
    console.log('🔧 Setting up QC permissions...');
    
    // Clear existing QC permissions
    const existingSnapshot = await db.collection('qcPermissions').get();
    const batch = db.batch();
    
    existingSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Add sample QC inspectors
    sampleQCInspectors.forEach((inspector) => {
      const docRef = db.collection('qcPermissions').doc(inspector.userId);
      batch.set(docRef, inspector);
    });
    
    await batch.commit();
    
    console.log('✅ QC permissions setup completed!');
    console.log(`📊 Created ${sampleQCInspectors.length} QC inspector profiles:`);
    
    sampleQCInspectors.forEach(inspector => {
      console.log(`  - ${inspector.name} (${inspector.email}): ${inspector.assignedStages.length} stages assigned`);
    });
    
    console.log('\n🎯 QC Assignment Summary:');
    console.log('  • Broadloom Orders: Ehsan Ahmed');
    console.log('  • Custom Orders: Irfan Khan');
    console.log('  • Area Rugs: Abdul Ansari, Danish Sampling, Faizan Ansari');
    console.log('\n📧 Email Escalation Levels:');
    console.log('  • Minor: Quality team only');
    console.log('  • Major: Quality + Merchant + Managers');
    console.log('  • Critical: All above + Management');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up QC permissions:', error);
    process.exit(1);
  }
}

setupQCPermissions();