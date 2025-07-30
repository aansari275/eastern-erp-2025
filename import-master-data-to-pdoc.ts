import { adminDb } from './server/firebaseAdmin';
import * as fs from 'fs';
import * as path from 'path';

interface MasterDataRow {
  buyerCode: string;
  construction: string;
  designName: string;
  colour: string;
  size: string;
}

async function importMasterDataToPDOC() {
  try {
    console.log('🚀 Starting master data import to PDOC table...');
    
    // Read the CSV file
    const csvPath = './attached_assets/Master Data list - Sheet16 (1)_1752998958827.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    console.log('📋 CSV Headers:', headers);
    console.log(`📊 Total rows to process: ${lines.length - 1}`);
    
    // Get existing buyers for mapping
    const buyersSnapshot = await adminDb.collection('buyers').get();
    const buyersMap = new Map();
    buyersSnapshot.forEach(doc => {
      const data = doc.data();
      const code = data.code || data.buyerCode;
      if (code) {
        buyersMap.set(code, { id: doc.id, ...data });
      }
    });
    
    console.log(`👥 Found ${buyersMap.size} buyers in database`);
    
    // Process each row
    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',');
      if (columns.length < 5) continue;
      
      const row: MasterDataRow = {
        buyerCode: columns[0]?.trim(),
        construction: columns[1]?.trim(),
        designName: columns[2]?.trim(),
        colour: columns[3]?.trim(),
        size: columns[4]?.trim()
      };
      
      if (!row.buyerCode || !row.designName) {
        skipCount++;
        continue;
      }
      
      try {
        // Find buyer
        const buyer = buyersMap.get(row.buyerCode);
        if (!buyer) {
          console.log(`⚠️  Buyer ${row.buyerCode} not found, skipping row ${i}`);
          skipCount++;
          continue;
        }
        
        // Create PDOC entry
        const pdocData = {
          buyerId: buyer.id,
          rugId: 1, // Using placeholder rugId
          pdocNumber: `PDOC-${row.buyerCode}-${Date.now()}-${i}`,
          buyerProductDesignCode: `${row.buyerCode}/${row.designName}`,
          productType: 'Rug',
          pdocStatus: 'draft',
          buyerArticleName: row.designName,
          ted: `${row.construction} rug in ${row.colour} color, size ${row.size}`,
          articleNumber: `${row.buyerCode}-${row.designName.replace(/[^a-zA-Z0-9]/g, '')}-${row.colour.replace(/[^a-zA-Z0-9]/g, '')}`,
          pdocCreationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          // Additional metadata
          construction: row.construction,
          color: row.colour,
          size: row.size
        };
        
        // Add to Firestore
        await adminDb.collection('pdocs').add(pdocData);
        successCount++;
        
        if (successCount % 50 === 0) {
          console.log(`✅ Processed ${successCount} PDOCs so far...`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing row ${i}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully created: ${successCount} PDOCs`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    
    // Show some statistics
    console.log('\n📈 Import summary by buyer:');
    const buyerStats = new Map();
    const pdocsSnapshot = await adminDb.collection('pdocs')
      .where('pdocCreationDate', '>=', new Date(Date.now() - 60000)) // Last minute
      .get();
    
    pdocsSnapshot.forEach(doc => {
      const data = doc.data();
      const buyerCode = data.buyerProductDesignCode?.split('/')[0];
      if (buyerCode) {
        buyerStats.set(buyerCode, (buyerStats.get(buyerCode) || 0) + 1);
      }
    });
    
    buyerStats.forEach((count, buyerCode) => {
      console.log(`  - ${buyerCode}: ${count} PDOCs`);
    });
    
  } catch (error) {
    console.error('❌ Fatal error during import:', error);
  }
}

importMasterDataToPDOC();