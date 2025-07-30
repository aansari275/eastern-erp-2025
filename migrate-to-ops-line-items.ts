import { opsLineItems } from '@shared/schema';
import { importArticleNumbersFromERP } from './server/erpDatabase';
import sql from 'mssql';
import { FirebaseStorage } from './server/firebaseStorage';

interface ERPOrderData {
  b_code: string;
  quality: string;
  design: string;
  colour: string;
  Fs5: string;
}

interface Buyer {
  id: number;
  name: string;
  code: string;
}

async function migrateToOpsLineItems() {
  console.log('🚀 Starting migration to OPS Line Items table...\n');

  try {
    // Step 1: Get all buyers from Firebase
    console.log('📊 Fetching buyers from Firebase...');
    const firebaseStorage = new FirebaseStorage();
    const buyers = await firebaseStorage.getBuyers();
    console.log(`Found ${buyers.length} buyers in Firebase\n`);

    // Step 2: Connect to ERP database and get article data
    console.log('🔗 Connecting to ERP database...');
    
    const config = {
      server: '167.71.239.104',
      database: 'empl_data19',
      user: 'sa',
      password: 'Empl@786',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      connectionTimeout: 30000,
      requestTimeout: 30000,
    };

    const pool = await sql.connect(config);
    
    const query = `
      SELECT DISTINCT 
        b_code, 
        quality, 
        design, 
        colour, 
        Fs5
      FROM vopslistdtl 
      WHERE bo_id > 1614 
        AND design IS NOT NULL 
        AND design != ''
        AND colour IS NOT NULL 
        AND colour != ''
        AND Fs5 IS NOT NULL 
        AND Fs5 != ''
      ORDER BY b_code, design, colour, Fs5
    `;

    console.log('📋 Fetching article data from ERP...');
    const result = await pool.request().query(query);
    const erpData: ERPOrderData[] = result.recordset;
    console.log(`Found ${erpData.length} article records from ERP\n`);
    
    // Close the connection
    await pool.close();

    // Step 3: Create buyer mapping for quick lookup (with trimming for ERP compatibility)
    console.log('🗂️  Creating buyer code mapping...');
    const buyerMap = new Map<string, any>();
    buyers.forEach(buyer => {
      // Firebase getBuyers returns 'code' field, not 'buyerCode'
      const buyerCode = (buyer as any).code || buyer.buyerCode;
      if (buyerCode && buyerCode.trim() !== '' && buyerCode !== 'undefined') {
        // Store with multiple variations to handle ERP format inconsistencies
        buyerMap.set(buyerCode, buyer);
        buyerMap.set(buyerCode.trim(), buyer);
        
        // Also try the buyer name as a fallback
        if (buyer.name) {
          buyerMap.set(buyer.name, buyer);
          buyerMap.set(buyer.name.trim(), buyer);
        }
      }
    });
    console.log(`Created mapping for ${buyerMap.size} buyer codes\n`);
    
    // Debug: Show sample mappings and check for ERP matches
    console.log('📋 Sample buyer code mappings:');
    const sampleMappings = Array.from(buyerMap.keys()).slice(0, 10);
    sampleMappings.forEach(code => {
      console.log(`   "${code}"`);
    });
    
    // Check if any ERP codes match our buyer codes
    console.log('\n🔍 Checking ERP code matches:');
    const erpSample = erpData.slice(0, 5);
    erpSample.forEach(record => {
      const trimmedCode = record.b_code.trim();
      const hasMatch = buyerMap.has(record.b_code) || buyerMap.has(trimmedCode);
      console.log(`   ERP: "${record.b_code}" (trimmed: "${trimmedCode}") → Match: ${hasMatch}`);
    });
    console.log('');

    // Step 4: Process and deduplicate data
    console.log('🔄 Processing and deduplicating data...');
    const uniqueLineItems = new Map<string, any>();
    let processed = 0;
    let skipped = 0;

    for (const record of erpData) {
      // Try to find buyer using multiple matching strategies
      const buyer = buyerMap.get(record.b_code) || buyerMap.get(record.b_code.trim());
      
      if (!buyer) {
        skipped++;
        continue;
      }

      // Create unique key for deduplication
      const buyerCode = (buyer as any).code || buyer.buyerCode;
      const uniqueKey = `${buyerCode}-${record.design}-${record.colour}-${record.Fs5}-${record.quality}`;
      
      if (!uniqueLineItems.has(uniqueKey)) {
        uniqueLineItems.set(uniqueKey, {
          buyerArticleNumber: '', // Empty for manual entry
          designName: record.design.trim(),
          color: record.colour.trim(),
          size: record.Fs5.trim(),
          buyerName: buyer.name,
          buyerDesignCode: buyerCode,
          construction: record.quality ? record.quality.trim() : '',
          quality: record.quality ? record.quality.trim() : '',
          currency: 'USD',
          isActive: true
        });
        processed++;
      }
    }

    console.log(`✅ Processed ${processed} unique line items`);
    console.log(`⚠️  Skipped ${skipped} records (buyer not found)\n`);

    // Step 5: Insert into Firebase (OPS Line Items collection)
    console.log('💾 Inserting line items into Firebase...');
    const lineItemsArray = Array.from(uniqueLineItems.values());
    
    let inserted = 0;
    const batchSize = 50;
    
    for (let i = 0; i < lineItemsArray.length; i += batchSize) {
      const batch = lineItemsArray.slice(i, i + batchSize);
      
      for (const lineItem of batch) {
        try {
          await firebaseStorage.createOpsLineItem(lineItem);
          inserted++;
        } catch (error) {
          console.error(`Error inserting line item:`, error);
        }
      }
      
      console.log(`Inserted ${Math.min(i + batchSize, lineItemsArray.length)} / ${lineItemsArray.length} line items`);
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total ERP records: ${erpData.length}`);
    console.log(`   - Unique line items created: ${processed}`);
    console.log(`   - Successfully inserted: ${inserted}`);
    console.log(`   - Skipped (no buyer): ${skipped}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration automatically
migrateToOpsLineItems()
  .then(() => {
    console.log('\n🎉 Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });

export { migrateToOpsLineItems };