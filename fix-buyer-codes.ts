import { FirebaseStorage } from './server/firebaseStorage';

async function fixBuyerCodes() {
  console.log('🔧 Fixing Firebase buyer codes to match ERP format...\n');

  try {
    const firebaseStorage = new FirebaseStorage();
    const buyers = await firebaseStorage.getBuyers();
    
    console.log(`Found ${buyers.length} buyers in Firebase\n`);

    // Mapping from buyer names to proper buyer codes (based on ERP data)
    const buyerCodeMapping: { [key: string]: string } = {
      // Core buyers from ERP
      'A-02': 'A-02',
      'A-03': 'A-03', 
      'A-05': 'A-05',
      'A-07': 'A-07',
      'B-02': 'B-02',
      'C-01': 'C-01',
      'C-02': 'C-02',
      'C-03': 'C-03',
      'C-04': 'C-04',
      'C-05': 'C-05',
      'C-06': 'C-06',
      'C-07': 'C-07',
      'C-08': 'C-08',
      'C-09': 'C-09',
      'CASA': 'CASA',
      'CH-01': 'CH-01',
      'ROMO': 'ROMO',
      // Add more as needed
    };

    let updated = 0;
    let failed = 0;

    console.log('🔄 Updating buyer codes...');
    
    for (const buyer of buyers) {
      try {
        let newBuyerCode = buyer.name; // Use name as default
        
        // Check if buyer name matches a code in our mapping
        if (buyerCodeMapping[buyer.name]) {
          newBuyerCode = buyerCodeMapping[buyer.name];
        }
        // If name looks like a buyer code (A-XX format), use it directly
        else if (buyer.name.match(/^[A-Z]+-\d+$/)) {
          newBuyerCode = buyer.name;
        }
        // For other names, try to extract a reasonable code
        else {
          // Convert name to a reasonable buyer code format
          newBuyerCode = buyer.name
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 10); // Limit length
        }

        // Update if different
        if (newBuyerCode !== buyer.buyerCode) {
          const updatedBuyer = await firebaseStorage.updateBuyer(buyer.id, {
            buyerCode: newBuyerCode
          });

          if (updatedBuyer) {
            console.log(`✅ Updated buyer "${buyer.name}": "${buyer.buyerCode}" → "${newBuyerCode}"`);
            updated++;
          } else {
            console.log(`❌ Failed to update buyer "${buyer.name}"`);
            failed++;
          }
        } else {
          console.log(`⚪ Buyer "${buyer.name}" already has correct code: "${newBuyerCode}"`);
        }
      } catch (error) {
        console.error(`❌ Error updating buyer "${buyer.name}":`, error);
        failed++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Total buyers: ${buyers.length}`);
    console.log(`   - Successfully updated: ${updated}`);
    console.log(`   - Failed updates: ${failed}`);
    console.log(`   - No change needed: ${buyers.length - updated - failed}`);

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  }
}

// Run fix automatically
fixBuyerCodes()
  .then(() => {
    console.log('\n🎉 Buyer codes fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error);
    process.exit(1);
  });

export { fixBuyerCodes };