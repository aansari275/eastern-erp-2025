// Script to create sample rugs through the API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

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
        type: "weft",
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
    unit: "PSM",
    currency: "INR",
    exchangeRate: 83,
    pileGSM: 900
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
    unit: "PSM",
    currency: "INR",
    exchangeRate: 83,
    pileGSM: 800
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
        type: "weft",
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
    unit: "PSM",
    currency: "INR",
    exchangeRate: 83,
    pileGSM: 600
  }
];

async function createSampleRugs() {
  console.log('🔄 Creating sample rugs via API...');
  
  try {
    // Test if API is available
    console.log('Testing API connection...');
    const testResponse = await fetch(`${API_BASE}/api/rugs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });
    
    if (!testResponse.ok) {
      throw new Error(`API test failed with status: ${testResponse.status}`);
    }
    
    console.log('✅ API connection successful');
    const existingRugs = await testResponse.json();
    console.log(`Found ${existingRugs.length} existing rugs`);
    
    // Create new rugs
    for (let i = 0; i < sampleRugs.length; i++) {
      const rugData = sampleRugs[i];
      console.log(`Creating rug ${i + 1}: ${rugData.designName}`);
      
      const response = await fetch(`${API_BASE}/api/rugs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rugData),
        timeout: 10000
      });
      
      if (response.ok) {
        const createdRug = await response.json();
        console.log(`✅ Successfully created: ${rugData.designName} (ID: ${createdRug.id})`);
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to create ${rugData.designName}: ${response.status} - ${errorText}`);
      }
    }
    
    console.log(`🎉 Sample rug creation completed!`);
    
    // Get final count
    const finalResponse = await fetch(`${API_BASE}/api/rugs`);
    const finalRugs = await finalResponse.json();
    console.log(`📊 Total rugs now: ${finalRugs.length}`);
    
  } catch (error) {
    console.error('❌ Error creating sample rugs:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
      console.log('💡 Run: npm run dev');
    }
  }
}

// Run the script
if (require.main === module) {
  createSampleRugs()
    .then(() => {
      console.log('Sample rug creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create sample rugs:', error);
      process.exit(1);
    });
}

export { createSampleRugs };