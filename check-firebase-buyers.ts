import { FirebaseStorage } from './server/firebaseStorage';

async function checkFirebaseBuyers() {
  console.log('🔍 Checking Firebase buyers data...\n');

  try {
    const firebaseStorage = new FirebaseStorage();
    const buyers = await firebaseStorage.getBuyers();
    
    console.log(`Found ${buyers.length} buyers in Firebase\n`);
    
    // Show first 10 buyers with all their details
    console.log('📋 First 10 buyers with details:');
    buyers.slice(0, 10).forEach((buyer, index) => {
      console.log(`${index + 1}. ID: ${buyer.id}`);
      console.log(`   Name: "${buyer.name}"`);
      console.log(`   Buyer Code: "${buyer.buyerCode}"`);
      console.log(`   Merchant ID: "${buyer.merchantId}"`);
      console.log(`   Is Active: ${buyer.isActive}`);
      console.log('');
    });

    // Check for buyers with proper buyer codes
    const buyersWithCodes = buyers.filter(b => b.buyerCode && b.buyerCode.trim() !== '');
    console.log(`\n📊 Buyers with non-empty buyer codes: ${buyersWithCodes.length}`);
    
    if (buyersWithCodes.length > 0) {
      console.log('Sample buyer codes:', buyersWithCodes.slice(0, 10).map(b => `"${b.buyerCode}"`).join(', '));
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
    throw error;
  }
}

// Run check automatically
checkFirebaseBuyers()
  .then(() => {
    console.log('\n🎉 Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });

export { checkFirebaseBuyers };