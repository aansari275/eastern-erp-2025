import sql from 'mssql';
import { FirebaseStorage } from './server/firebaseStorage';

async function debugBuyerCodes() {
  console.log('🔍 Debugging buyer code mismatches...\n');

  try {
    // Step 1: Get buyers from Firebase
    console.log('📊 Fetching buyers from Firebase...');
    const firebaseStorage = new FirebaseStorage();
    const buyers = await firebaseStorage.getBuyers();
    const firebaseBuyerCodes = buyers.map(b => b.buyerCode).sort();
    console.log(`Found ${buyers.length} buyers in Firebase`);
    console.log('Firebase buyer codes:', firebaseBuyerCodes.slice(0, 10).join(', '), '...\n');

    // Step 2: Get buyer codes from ERP
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
      SELECT DISTINCT b_code 
      FROM vopslistdtl 
      WHERE bo_id > 1614 
        AND b_code IS NOT NULL 
        AND b_code != ''
      ORDER BY b_code
    `;

    console.log('📋 Fetching buyer codes from ERP...');
    const result = await pool.request().query(query);
    const erpBuyerCodes = result.recordset.map((row: any) => row.b_code).sort();
    console.log(`Found ${erpBuyerCodes.length} unique buyer codes in ERP`);
    console.log('ERP buyer codes:', erpBuyerCodes.slice(0, 10).join(', '), '...\n');
    
    await pool.close();

    // Step 3: Compare codes
    console.log('🔄 Comparing buyer codes...');
    const firebaseCodes = new Set(firebaseBuyerCodes);
    const erpCodes = new Set(erpBuyerCodes);
    
    const matchingCodes = erpBuyerCodes.filter(code => firebaseCodes.has(code));
    const unmatchedERPCodes = erpBuyerCodes.filter(code => !firebaseCodes.has(code));
    const unmatchedFirebaseCodes = firebaseBuyerCodes.filter(code => !erpCodes.has(code));

    console.log(`\n📊 Summary:`);
    console.log(`   - Firebase buyer codes: ${firebaseBuyerCodes.length}`);
    console.log(`   - ERP buyer codes: ${erpBuyerCodes.length}`);
    console.log(`   - Matching codes: ${matchingCodes.length}`);
    console.log(`   - Unmatched ERP codes: ${unmatchedERPCodes.length}`);
    console.log(`   - Unmatched Firebase codes: ${unmatchedFirebaseCodes.length}`);

    if (matchingCodes.length > 0) {
      console.log(`\n✅ Matching codes (first 10):`, matchingCodes.slice(0, 10).join(', '));
    }

    if (unmatchedERPCodes.length > 0) {
      console.log(`\n❌ Unmatched ERP codes (first 10):`, unmatchedERPCodes.slice(0, 10).join(', '));
    }

    if (unmatchedFirebaseCodes.length > 0) {
      console.log(`\n⚠️  Unmatched Firebase codes (first 10):`, unmatchedFirebaseCodes.slice(0, 10).join(', '));
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    throw error;
  }
}

// Run debug automatically
debugBuyerCodes()
  .then(() => {
    console.log('\n🎉 Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error);
    process.exit(1);
  });

export { debugBuyerCodes };