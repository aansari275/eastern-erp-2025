import { FirebaseStorage } from './server/firebaseStorage';

async function debugGetBuyers() {
  console.log('🔍 Debugging getBuyers method...\n');

  try {
    const firebaseStorage = new FirebaseStorage();
    const buyers = await firebaseStorage.getBuyers();
    
    console.log(`Found ${buyers.length} buyers\n`);
    
    // Show detailed buyer information
    console.log('📋 Detailed buyer information (first 5):');
    buyers.slice(0, 5).forEach((buyer, index) => {
      console.log(`${index + 1}. Buyer:`, JSON.stringify(buyer, null, 2));
    });

    // Count buyers with actual buyer codes
    const buyersWithValidCodes = buyers.filter(b => 
      b.buyerCode && 
      b.buyerCode.trim() !== '' && 
      b.buyerCode !== 'undefined'
    );
    
    console.log(`\n📊 Buyers with valid codes: ${buyersWithValidCodes.length}`);
    
    if (buyersWithValidCodes.length > 0) {
      console.log('Valid buyer codes:', buyersWithValidCodes.map(b => `"${b.buyerCode}"`).slice(0, 10).join(', '));
    }

    // Check the exact structure returned by getBuyers
    console.log('\n🔍 Checking buyer object structure:');
    if (buyers.length > 0) {
      const sampleBuyer = buyers[0];
      console.log('Sample buyer keys:', Object.keys(sampleBuyer));
      console.log('buyerCode type:', typeof sampleBuyer.buyerCode);
      console.log('buyerCode value:', JSON.stringify(sampleBuyer.buyerCode));
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    throw error;
  }
}

// Run debug automatically
debugGetBuyers()
  .then(() => {
    console.log('\n🎉 Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  });

export { debugGetBuyers };