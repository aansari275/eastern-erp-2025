import { adminDb } from './server/firebaseAdmin';

async function checkImportedPDOCs() {
  try {
    console.log('🔍 Checking imported PDOCs...');
    
    // Get PDOCs created in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const pdocsSnapshot = await adminDb.collection('pdocs')
      .where('pdocCreationDate', '>=', fiveMinutesAgo)
      .get();
    
    console.log(`📊 Found ${pdocsSnapshot.size} recently created PDOCs`);
    
    // Group by buyer
    const buyerStats = new Map();
    const designStats = new Map();
    
    pdocsSnapshot.forEach(doc => {
      const data = doc.data();
      const buyerCode = data.buyerProductDesignCode?.split('/')[0];
      const designName = data.buyerArticleName;
      
      if (buyerCode) {
        buyerStats.set(buyerCode, (buyerStats.get(buyerCode) || 0) + 1);
      }
      
      if (designName) {
        designStats.set(designName, (designStats.get(designName) || 0) + 1);
      }
    });
    
    console.log('\n📈 PDOCs created by buyer:');
    Array.from(buyerStats.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([buyerCode, count]) => {
        console.log(`  - ${buyerCode}: ${count} PDOCs`);
      });
    
    console.log('\n🎨 Top 10 design names:');
    Array.from(designStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([designName, count]) => {
        console.log(`  - ${designName}: ${count} variants`);
      });
    
    // Show a few sample PDOCs
    console.log('\n📋 Sample PDOCs created:');
    let count = 0;
    pdocsSnapshot.forEach(doc => {
      if (count < 5) {
        const data = doc.data();
        console.log(`  ${count + 1}. ${data.buyerProductDesignCode} - ${data.buyerArticleName} (${data.construction}, ${data.color}, ${data.size})`);
        count++;
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking PDOCs:', error);
  }
}

checkImportedPDOCs();