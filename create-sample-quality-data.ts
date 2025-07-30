import admin from 'firebase-admin';
import serviceAccount from './server/firebaseServiceAccountKey.json' assert { type: 'json' };

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: 'https://rugcraftpro-default-rtdb.firebaseio.com/'
  });
}

const db = admin.firestore();

async function createSampleQualityData() {
  console.log('Creating sample quality inspection data...');
  
  const sampleInspections = [
    {
      opsNumber: 'OPS-2025-001',
      carpetNumber: 'EM-25-MA-9134',
      inspectionType: 'Bazaar',
      orderType: 'Regular',
      inspector: 'Ahmad Khan',
      status: 'Passed',
      defects: [
        { type: 'Color Variation', severity: 'Minor', location: 'Corner', description: 'Slight color difference in corner area' }
      ],
      inspectionDate: admin.firestore.Timestamp.now(),
      notes: 'Overall good quality, minor issues noted',
      contractor: 'Contractor A',
      construction: 'Hand Knotted',
      color: 'Ivory',
      size: '8x10',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      opsNumber: 'OPS-2025-002',
      carpetNumber: 'EM-25-MA-9135',
      inspectionType: 'Binding',
      orderType: 'Express',
      inspector: 'Sarah Ahmed',
      status: 'Failed',
      defects: [
        { type: 'Loose Binding', severity: 'Major', location: 'Left Edge', description: 'Binding is coming loose on left side' },
        { type: 'Uneven Edge', severity: 'Minor', location: 'Top Edge', description: 'Edge not perfectly straight' }
      ],
      inspectionDate: admin.firestore.Timestamp.now(),
      notes: 'Requires rebinding before approval',
      contractor: 'Contractor B',
      construction: 'Hand Woven',
      color: 'Beige',
      size: '6x9',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      opsNumber: 'OPS-2025-003',
      carpetNumber: 'EM-25-MA-9136',
      inspectionType: 'Clipping',
      orderType: 'Regular',
      inspector: 'Mohammad Ali',
      status: 'Passed',
      defects: [],
      inspectionDate: admin.firestore.Timestamp.now(),
      notes: 'Excellent clipping quality',
      contractor: 'Contractor C',
      construction: 'Tufted',
      color: 'Grey',
      size: '9x12',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    },
    {
      opsNumber: 'OPS-2025-004',
      carpetNumber: 'EM-25-MA-9137',
      inspectionType: 'Finishing',
      orderType: 'Regular',
      inspector: 'Fatima Sheikh',
      status: 'Review',
      defects: [
        { type: 'Surface Irregularity', severity: 'Minor', location: 'Center', description: 'Small bump in center area' }
      ],
      inspectionDate: admin.firestore.Timestamp.now(),
      notes: 'Requires supervisor review',
      contractor: 'Contractor A',
      construction: 'Hand Knotted',
      color: 'Blue',
      size: '5x8',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ];

  try {
    for (const inspection of sampleInspections) {
      await db.collection('qualityInspections').add(inspection);
      console.log(`Created inspection for ${inspection.carpetNumber}`);
    }
    
    console.log('✅ Sample quality inspection data created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

createSampleQualityData();