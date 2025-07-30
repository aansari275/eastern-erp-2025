// Quick test of ERP database connection
import { getMaterials } from './server/erpDatabase';

async function testERP() {
  try {
    console.log('Testing ERP database connection...');
    const materials = await getMaterials();
    console.log(`Found ${materials.length} materials`);
    console.log('First 5 materials:', materials.slice(0, 5));
  } catch (error) {
    console.error('ERP test failed:', error);
  }
}

testERP();