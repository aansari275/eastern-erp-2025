// Direct Firebase script to populate sample rugs
const admin = require('firebase-admin');
const fs = require('fs');

// Check if service account exists
const serviceAccountPath = './server/serviceAccountKey.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at:', serviceAccountPath);
  process.exit(1);
}

// Load service account
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const db = admin.firestore();

// Sample rug data
const sampleRugs = [
  {
    designName: "Persian Classic",
    construction: "Hand Knotted",
    quality: "9/25",
    color: "Ivory + Sand + Grey",
    selectedColors: ["Ivory", "Sand", "Grey"],
    orderType: "Sample",
    buyerName: "JOHN LEWIS",
    opsNo: "OP-2025-001",
    carpetNo: "JL-PC-001",
    finishedGSM: 2800,
    unfinishedGSM: 2650,
    size: "8x10 ft",
    typeOfDyeing: "Solid/Plain",
    contractorType: "contractor",
    contractorName: "Premium Weaving Co",
    submittedBy: "Mahmood Alam",
    washingContractor: "Clean Wash Services",
    reedNoQuality: "9/25", 
    hasWashing: "yes",
    warpIn6Inches: 54,
    weftIn6Inches: 25,
    pileHeightMM: 8.5,
    totalThicknessMM: 12.0,
    edgeLongerSide: "Loom Binding",
    edgeShortSide: "Fringes",
    fringesHemLength: "4 - 5 cm",
    fringesHemMaterial: "100% cotton",
    shadeCardNo: "SC-001-2025",
    materials: [
      {
        id: "mat1",
        name: "Wool - New Zealand",
        type: "warp",
        consumption: 1.2,
        rate: 850,
        dyeingCost: 50,
        handSpinningCost: 0,
        costPerSqM: 1080,
        plyCount: 2,
        isDyed: true,
        hasHandSpinning: false
      },
      {
        id: "mat2", 
        name: "Cotton - Egyptian",
        type: "weft",
        consumption: 0.8,
        rate: 450,
        dyeingCost: 30,
        handSpinningCost: 0,
        costPerSqM: 384,
        plyCount: 1,
        isDyed: true,
        hasHandSpinning: false
      }
    ],
    weavingCost: 1200,
    finishingCost: 800,
    packingCost: 125,
    overheadPercentage: 5,
    profitPercentage: 15,
    processFlow: [
      { process: "Raw Material Purchase", step: 1 },
      { process: "Dyeing", step: 2 },  
      { process: "Weaving", step: 3 },
      { process: "Washing", step: 4 },
      { process: "Clipping", step: 5 },
      { process: "Stretching", step: 6 },
      { process: "Binding", step: 7 },
      { process: "Packing", step: 8 }
    ],
    images: {
      rugPhoto: "",
      shadeCard: "",
      backPhoto: "",
      masterHank: "",
      masterSample: ""
    },
    totalMaterialCost: 1464,
    totalDirectCost: 3589,
    finalCostPSM: 4738.35,
    totalRugCost: 35190.6,
    area: 7.43,
    unit: "PSM",
    currency: "INR",
    exchangeRate: 83,
    pileGSM: 900,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    designName: "Modern Geometric",
    construction: "Tufted",  
    quality: "Pick 16",
    color: "Charcoal + Beige",
    selectedColors: ["Charcoal", "Beige"],
    orderType: "Custom",
    buyerName: "RH",
    opsNo: "OP-2025-002",
    carpetNo: "RH-MG-002",
    finishedGSM: 2200,
    unfinishedGSM: 2050,
    size: "6x9 ft",
    typeOfDyeing: "Space Dyed",
    contractorType: "inhouse",
    weaverName: "Skilled Weaver Team A",
    submittedBy: "Mahmood Alam",
    washingContractor: "",
    reedNoQuality: "Pick 16",
    hasWashing: "no",
    warpIn6Inches: 48,
    weftIn6Inches: 16,
    pileHeightMM: 12.0,
    totalThicknessMM: 18.5,
    edgeLongerSide: "Binding",
    edgeShortSide: "Binding",
    fringesHemLength: "",
    fringesHemMaterial: "",
    shadeCardNo: "SC-002-2025",
    materials: [
      {
        id: "mat3",
        name: "Viscose - Premium",
        type: "warp",
        consumption: 1.0,
        rate: 650,
        dyeingCost: 80,
        handSpinningCost: 0,
        costPerSqM: 730,
        plyCount: 1,
        isDyed: true,
        hasHandSpinning: false
      }
    ],
    weavingCost: 900,
    finishingCost: 600,
    packingCost: 125,
    overheadPercentage: 5,
    profitPercentage: 12,
    processFlow: [
      { process: "Raw Material Purchase", step: 1 },
      { process: "Dyeing", step: 2 },
      { process: "Weaving", step: 3 },
      { process: "Clipping", step: 4 },
      { process: "Stretching", step: 5 },
      { process: "Binding", step: 6 },
      { process: "Packing", step: 7 }
    ],
    images: {
      rugPhoto: "",
      shadeCard: "",
      backPhoto: "",
      masterHank: "",
      masterSample: ""
    },
    totalMaterialCost: 730,
    totalDirectCost: 2355,
    finalCostPSM: 2932.44,
    totalRugCost: 14662.2,
    area: 5.0,
    unit: "PSM",
    currency: "INR",
    exchangeRate: 83,
    pileGSM: 800,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    designName: "Vintage Distressed",
    construction: "Handloom",
    quality: "Reed No. 12", 
    color: "Multi + Olive",
    selectedColors: ["Multi", "Olive"],
    orderType: "Buyer PD",
    buyerName: "COURISTAN",
    opsNo: "OP-2025-003",
    carpetNo: "CT-VD-003",
    finishedGSM: 1800,
    unfinishedGSM: 1650,
    size: "9x12 ft",
    typeOfDyeing: "Abrash",
    contractorType: "contractor",
    contractorName: "Heritage Looms Ltd",
    submittedBy: "Mahmood Alam",
    washingContractor: "Vintage Wash Co",
    reedNoQuality: "Reed No. 12",
    hasWashing: "yes",
    warpIn6Inches: 36,
    weftIn6Inches: 12,
    pileHeightMM: 6.0,
    totalThicknessMM: 9.5,
    edgeLongerSide: "Loom Binding",
    edgeShortSide: "Hem",
    fringesHemLength: "3 - 4 cm",
    fringesHemMaterial: "100% cotton",
    shadeCardNo: "SC-003-2025",
    materials: [
      {
        id: "mat4",
        name: "Jute - Natural",
        type: "warp",
        consumption: 0.8,
        rate: 280,
        dyeingCost: 40,
        handSpinningCost: 20,
        costPerSqM: 272,
        plyCount: 3,
        isDyed: true,
        hasHandSpinning: true
      },
      {
        id: "mat5",
        name: "Cotton - Indian",
        type: "weft",
        consumption: 0.6,
        rate: 350,
        dyeingCost: 25,
        handSpinningCost: 15,
        costPerSqM: 234,
        plyCount: 2,
        isDyed: true,
        hasHandSpinning: true
      }
    ],
    weavingCost: 800,
    finishingCost: 500,
    packingCost: 125,
    overheadPercentage: 5,
    profitPercentage: 10,
    processFlow: [
      { process: "Raw Material Purchase", step: 1 },
      { process: "Dyeing", step: 2 },
      { process: "Weaving", step: 3 },
      { process: "Washing", step: 4 },
      { process: "Clipping", step: 5 },
      { process: "Faafi (Final Clipping)", step: 6 },
      { process: "Stretching", step: 7 },
      { process: "Binding", step: 8 },
      { process: "Packing", step: 9 }
    ],
    images: {
      rugPhoto: "",
      shadeCard: "",
      backPhoto: "",
      masterHank: "",
      masterSample: ""
    },
    totalMaterialCost: 506,
    totalDirectCost: 1931,
    finalCostPSM: 2344.71,
    totalRugCost: 23447.1,
    area: 10.0,
    unit: "PSM",
    currency: "INR",
    exchangeRate: 83,
    pileGSM: 600,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

async function populateRugsDirectly() {
  console.log('🔄 Starting direct Firebase rug population...');
  
  try {
    // Use the same collection path as the app
    const userId = 'demo-user-123'; // You can replace with actual user ID
    const appId = 'rug-tracker';
    
    // Check if we need to create a users subcollection structure
    console.log(`Using collection path: artifacts/${appId}/users/${userId}/rug_creations`);
    
    for (let i = 0; i < sampleRugs.length; i++) {
      const rugData = sampleRugs[i];
      console.log(`Adding rug ${i + 1}: ${rugData.designName}`);
      
      const docRef = await db
        .collection('artifacts')
        .doc(appId)
        .collection('users')
        .doc(userId)
        .collection('rug_creations')
        .add(rugData);
      
      console.log(`✅ Successfully added: ${rugData.designName} (ID: ${docRef.id})`);
    }
    
    console.log(`🎉 Successfully populated ${sampleRugs.length} sample rugs!`);
    
    // Verify the data was added
    const snapshot = await db
      .collection('artifacts')
      .doc(appId)
      .collection('users')
      .doc(userId)
      .collection('rug_creations')
      .get();
    
    console.log(`📊 Total rugs in collection: ${snapshot.docs.length}`);
    
    // List all rugs
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.designName} (${data.construction}, ${data.size})`);
    });
    
  } catch (error) {
    console.error('❌ Error populating rugs:', error);
  }
}

// Run the population script
populateRugsDirectly()
  .then(() => {
    console.log('✅ Rug population completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to populate rugs:', error);
    process.exit(1);
  });