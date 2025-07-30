// Quick test to see what article number data was imported
import { storage } from './server/storage';

async function checkImportedData() {
  console.log('🔍 Checking imported article number data...\n');
  
  try {
    // Get a few buyers to check their article numbers
    const buyers = await storage.getBuyers();
    console.log(`Found ${buyers.length} total buyers\n`);
    
    // Check specific imported buyers
    const importedBuyers = buyers.filter(b => 
      ['A-02', 'A-07', 'C-04', 'C-05', 'CASA', 'CH-01'].includes(b.code)
    );
    
    console.log('Checking article numbers for imported buyers:');
    
    for (const buyer of importedBuyers.slice(0, 3)) {
      console.log(`\n📋 Buyer: ${buyer.name} (${buyer.code})`);
      
      const articleNumbers = await storage.getArticleNumbers({ buyerId: buyer.id });
      console.log(`   Found ${articleNumbers.length} article numbers`);
      
      if (articleNumbers.length > 0) {
        console.log('   Sample article numbers:');
        articleNumbers.slice(0, 3).forEach((article, index) => {
          console.log(`   ${index + 1}. Design: "${article.designName}"`);
          console.log(`      Color: "${article.color}"`);
          console.log(`      Size: "${article.size}"`);
          console.log(`      Construction: "${article.construction}"`);
          console.log(`      Article Code: "${article.articleNumber}"`);
          console.log('');
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

checkImportedData();