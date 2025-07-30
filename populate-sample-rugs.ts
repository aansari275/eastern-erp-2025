import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration (replace with your project config)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample rug data based on the Rug interface
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
    contractorType: "contractor" as const,
    contractorName: "Premium Weaving Co",
    submittedBy: "Mahmood Alam",
    washingContractor: "Clean Wash Services",
    reedNoQuality: "9/25",
    hasWashing: "yes" as const,
    warpIn6Inches: 54,
    weftIn6Inches: 25,
    pileHeightMM: 8.5,
    totalThicknessMM: 12.0,
    edgeLongerSide: "Loom Binding" as const,
    edgeShortSide: "Fringes" as const,
    fringesHemLength: "4 - 5 cm",
    fringesHemMaterial: "100% cotton",
    shadeCardNo: "SC-001-2025",
    materials: [
      {
        id: "mat1",
        name: "Wool - New Zealand",
        type: "warp" as const,
        consumption: 1200,
        rate: 850,
        dyeingCost: 50,
        handSpinningCost: 0,
        costPerSqM: 1080000,
        plyCount: 2,
        isDyed: true,
        hasHandSpinning: false
      },
      {
        id: "mat2", 
        name: "Cotton - Egyptian",
        type: "weft" as const,
        consumption: 800,
        rate: 450,
        dyeingCost: 30,
        handSpinningCost: 0,
        costPerSqM: 384000,
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
    unit: "PSM" as const,
    currency: "INR" as const,
    exchangeRate: 83,
    pileGSM: 900,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
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
    contractorType: "inhouse" as const,
    weaverName: "Skilled Weaver Team A",
    submittedBy: "Mahmood Alam",
    washingContractor: "",
    reedNoQuality: "Pick 16",
    hasWashing: "no" as const,
    warpIn6Inches: 48,
    weftIn6Inches: 16,
    pileHeightMM: 12.0,
    totalThicknessMM: 18.5,
    edgeLongerSide: "Binding" as const,
    edgeShortSide: "Binding" as const,
    fringesHemLength: "",
    fringesHemMaterial: "",
    shadeCardNo: "SC-002-2025",
    materials: [
      {
        id: "mat3",
        name: "Viscose - Premium",
        type: "warp" as const,
        consumption: 1000,
        rate: 650,
        dyeingCost: 80,
        handSpinningCost: 0,
        costPerSqM: 730000,
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
    unit: "PSM" as const,
    currency: "INR" as const,
    exchangeRate: 83,
    pileGSM: 800,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
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
    contractorType: "contractor" as const,
    contractorName: "Heritage Looms Ltd",
    submittedBy: "Mahmood Alam",
    washingContractor: "Vintage Wash Co",
    reedNoQuality: "Reed No. 12",
    hasWashing: "yes" as const,
    warpIn6Inches: 36,
    weftIn6Inches: 12,
    pileHeightMM: 6.0,
    totalThicknessMM: 9.5,
    edgeLongerSide: "Loom Binding" as const,
    edgeShortSide: "Hem" as const,
    fringesHemLength: "3 - 4 cm",
    fringesHemMaterial: "100% cotton",
    shadeCardNo: "SC-003-2025",
    materials: [
      {
        id: "mat4",
        name: "Jute - Natural",
        type: "warp" as const,
        consumption: 800,
        rate: 280,
        dyeingCost: 40,
        handSpinningCost: 20,
        costPerSqM: 272000,
        plyCount: 3,
        isDyed: true,
        hasHandSpinning: true
      },
      {
        id: "mat5",
        name: "Cotton - Indian",
        type: "weft" as const,
        consumption: 600,
        rate: 350,
        dyeingCost: 25,
        handSpinningCost: 15,
        costPerSqM: 234000,
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
    unit: "PSM" as const,
    currency: "INR" as const,
    exchangeRate: 83,
    pileGSM: 600,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Function to populate sample rugs
async function populateSampleRugs() {
  console.log('🔄 Starting sample rug population...');
  
  try {
    // Use the same collection path as the useRugs hook
    const userId = 'sample-user-id'; // You can replace with actual user ID
    const appId = 'rug-tracker';
    const rugsRef = collection(db, `artifacts/${appId}/users/${userId}/rug_creations`);
    
    for (let i = 0; i < sampleRugs.length; i++) {
      const rugData = sampleRugs[i];
      console.log(`Adding rug ${i + 1}: ${rugData.designName}`);
      
      await addDoc(rugsRef, rugData);
      console.log(`✅ Successfully added: ${rugData.designName}`);
    }
    
    console.log(`🎉 Successfully populated ${sampleRugs.length} sample rugs!`);
    
  } catch (error) {
    console.error('❌ Error populating sample rugs:', error);
  }
}

// Run the population script
if (require.main === module) {
  populateSampleRugs()
    .then(() => {
      console.log('Sample rug population completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to populate sample rugs:', error);
      process.exit(1);
    });
}

export { populateSampleRugs, sampleRugs };