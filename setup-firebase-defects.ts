import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// Master defects data extracted from the provided image
const masterDefectsData = [
  // Pre Inspection defects
  { defectCode: 'P001', defectName: 'Stain', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
  { defectCode: 'P002', defectName: 'Wrong Color', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
  { defectCode: 'P003', defectName: 'Wrong Design', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
  { defectCode: 'P004', defectName: 'Foreign material', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
  { defectCode: 'P005', defectName: 'Contamination with different material', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
  { defectCode: 'P006', defectName: 'Color blotch on fabric, Color bleeding, Color stain due to wet cutting', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
  { defectCode: 'P007', defectName: 'Other', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
  { defectCode: 'P008', defectName: 'Insert Defect', process: 'Pre Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },

  // Binding defects
  { defectCode: 'B001', defectName: 'Color Enhancement', process: 'Binding', severity: 'Major', defectClassification: 'CRITICAL' },
  { defectCode: 'B002', defectName: 'Binding', process: 'Binding', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'B003', defectName: 'Shearing Not', process: 'Binding', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'B004', defectName: 'Knot', process: 'Binding', severity: 'Minor', defectClassification: 'MINOR' },

  // Clipping defects
  { defectCode: 'C001', defectName: 'Compressing and oil stain/spots', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'C002', defectName: 'Selvage', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'C003', defectName: 'Color variations', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'C004', defectName: 'Size off', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'C005', defectName: 'Shade Variation', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'C006', defectName: 'Design not central', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'C007', defectName: 'Missing Line', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'C008', defectName: 'Design not matching', process: 'Clipping', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'C009', defectName: 'Open Side', process: 'Clipping', severity: 'Minor', defectClassification: 'MINOR' },
  { defectCode: 'C010', defectName: 'Over shearing', process: 'Clipping', severity: 'Minor', defectClassification: 'MINOR' },
  { defectCode: 'C011', defectName: 'Latex Bleed', process: 'Clipping', severity: 'Minor', defectClassification: 'MINOR' },

  // Final Inspection defects
  { defectCode: 'F001', defectName: 'Stain Removal', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'F002', defectName: 'Brush Variation', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'F003', defectName: 'Size', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'F004', defectName: 'Denting and roll', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
  { defectCode: 'F005', defectName: 'Edge curling/roll edge', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
  { defectCode: 'F006', defectName: 'Crooked cut/cut edge', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
  { defectCode: 'F007', defectName: 'Crease/fold marks', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
  { defectCode: 'F008', defectName: 'Color bleeding', process: 'Final Inspection', severity: 'Critical', defectClassification: 'CRITICAL' },
  { defectCode: 'F009', defectName: 'Color fading', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'F010', defectName: 'Color staining due to water/wet cutting', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'F011', defectName: 'Color staining due to water/wet cutting', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'F012', defectName: 'Soiling', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
  { defectCode: 'F013', defectName: 'Abrasion (wearing off/thinning of surface)', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'F014', defectName: 'Weaving knots', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
  { defectCode: 'F015', defectName: 'Wrong dimensions', process: 'Final Inspection', severity: 'Major', defectClassification: 'MAJOR' },
  { defectCode: 'F016', defectName: 'Surface defects', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
  { defectCode: 'F017', defectName: 'Back Pile', process: 'Final Inspection', severity: 'Minor', defectClassification: 'MINOR' },
];

async function setupFirebaseDefects() {
  try {
    console.log('🚀 Setting up master defects in Firebase...');
    
    const defectsCollection = db.collection('masterDefects');
    
    // Clear existing defects
    console.log('🗑️ Clearing existing master defects...');
    const existingDefects = await defectsCollection.get();
    const batch = db.batch();
    existingDefects.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    // Insert master defects data
    console.log(`📝 Inserting ${masterDefectsData.length} master defects...`);
    
    for (const defect of masterDefectsData) {
      await defectsCollection.doc(defect.defectCode).set({
        ...defect,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Added: ${defect.defectCode} - ${defect.defectName} (${defect.process})`);
    }
    
    console.log('✅ Master defects setup completed successfully!');
    
    // Show summary by process
    const processes = [...new Set(masterDefectsData.map(d => d.process))];
    console.log('\n📊 Defects by process:');
    for (const process of processes) {
      const count = masterDefectsData.filter(d => d.process === process).length;
      console.log(`  ${process}: ${count} defects`);
    }
    
  } catch (error) {
    console.error('❌ Error setting up master defects:', error);
    throw error;
  }
}

// Run the setup
setupFirebaseDefects()
  .then(() => {
    console.log('🎉 Master defects Firebase setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });