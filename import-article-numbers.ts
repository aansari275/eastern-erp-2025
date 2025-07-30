// Script to import article numbers from Microsoft SQL Database
// Run this with: npm run import-articles

import { importArticleNumbersFromERP } from './server/erpDatabase';
import { storage } from './server/db';

async function importArticleNumbers() {
  console.log('🚀 Starting Article Numbers Import Process...');
  console.log('📋 Source: Microsoft SQL Database (vopslistdtl table, bo_id > 1614)');
  console.log('🎯 Target: Firebase article_numbers collection');
  console.log('');
  
  try {
    // Step 1: Fetch data from ERP database
    console.log('📡 Step 1: Connecting to Microsoft SQL Database...');
    const erpData = await importArticleNumbersFromERP();
    console.log(`✅ Found ${erpData.length} unique article number records`);
    
    if (erpData.length === 0) {
      console.log('⚠️  No data found. Import process complete.');
      return;
    }
    
    // Show sample data
    console.log('\n📋 Sample data preview (first 3 records):');
    erpData.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. Buyer: ${item.buyerCode} | Design: ${item.designName} | Color: ${item.color} | Size: ${item.size} | Construction: ${item.construction}`);
    });
    console.log('');
    
    // Step 2: Get existing buyers
    console.log('👥 Step 2: Loading existing buyers from database...');
    const existingBuyers = await storage.getBuyers();
    const buyerMap = new Map();
    existingBuyers.forEach(buyer => {
      buyerMap.set(buyer.code, buyer.id);
    });
    console.log(`✅ Found ${existingBuyers.length} existing buyers`);
    
    // Step 3: Process and import data
    console.log('\n⚙️  Step 3: Processing and importing article numbers...');
    let importedCount = 0;
    let createdBuyersCount = 0;
    let skippedCount = 0;
    
    // Group by buyer code to track unique combinations
    const seenCombinations = new Set();
    const buyerCounts = new Map();
    
    for (const item of erpData) {
      try {
        const { buyerCode, construction, designName, color, size } = item;
        
        // Skip EMPL buyer code as requested
        if (buyerCode === 'EMPL') {
          skippedCount++;
          continue;
        }
        
        // Create unique key to avoid duplicates
        const uniqueKey = `${buyerCode}-${construction}-${designName}-${color}-${size}`;
        if (seenCombinations.has(uniqueKey)) {
          skippedCount++;
          continue;
        }
        seenCombinations.add(uniqueKey);
        
        // Check if buyer exists, create if not
        let buyerId = buyerMap.get(buyerCode);
        
        if (!buyerId) {
          console.log(`   👤 Creating new buyer: ${buyerCode}`);
          const newBuyer = await storage.createBuyer({
            name: buyerCode, // Will be updated manually later
            code: buyerCode,
            merchantId: 'import@easternmills.com', // Default merchant
            currency: 'USD',
            isActive: true
          });
          buyerId = newBuyer.id;
          buyerMap.set(buyerCode, buyerId);
          createdBuyersCount++;
        }
        
        // Track articles per buyer
        buyerCounts.set(buyerCode, (buyerCounts.get(buyerCode) || 0) + 1);
        
        // Create article number with empty article_number field for manual entry
        await storage.createArticleNumber({
          buyerId: buyerId,
          rugId: null, // Will be linked manually later
          articleNumber: '', // Left blank for manual entry as requested
          buyerArticleCode: '',
          designName: designName,
          color: color,
          size: size,
          construction: construction,
          quality: '', // Can be filled manually
          unitPrice: null,
          currency: 'USD',
          leadTime: '',
          minimumOrder: null,
          notes: `Imported from ERP - Original buyer code: ${buyerCode}`,
          isActive: true
        });
        
        importedCount++;
        
        if (importedCount % 100 === 0) {
          console.log(`   📈 Progress: ${importedCount} article numbers imported...`);
        }
        
      } catch (itemError) {
        console.error(`   ❌ Error processing item ${item.buyerCode}:`, itemError);
        skippedCount++;
      }
    }
    
    // Step 4: Show results
    console.log('\n🎉 Import Process Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 SUMMARY:`);
    console.log(`   • Total records found: ${erpData.length}`);
    console.log(`   • Article numbers imported: ${importedCount}`);
    console.log(`   • New buyers created: ${createdBuyersCount}`);
    console.log(`   • Records skipped (duplicates/EMPL): ${skippedCount}`);
    console.log('');
    
    // Show buyer breakdown
    console.log('👥 BUYER BREAKDOWN:');
    Array.from(buyerCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([buyerCode, count]) => {
        console.log(`   • ${buyerCode}: ${count} article numbers`);
      });
    
    if (buyerCounts.size > 10) {
      console.log(`   • ... and ${buyerCounts.size - 10} more buyers`);
    }
    
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Review imported buyers in Buyer Management');
    console.log('   2. Update buyer names and merchant assignments');
    console.log('   3. Fill in article number codes manually for each SKU');
    console.log('   4. Link article numbers to existing rug designs where applicable');
    console.log('   5. Add pricing, quality, and delivery information');
    console.log('');
    console.log('✅ All article numbers are ready for OPS auto-population workflow!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the import
importArticleNumbers()
  .then(() => {
    console.log('🏁 Import script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import script failed:', error);
    process.exit(1);
  });