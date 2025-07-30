// Check Firestore extractedText collection
import { adminDb } from './server/firebaseAdmin';

async function checkFirestoreExtractedText() {
  try {
    console.log('🔍 Checking Firestore extractedText collection...');
    
    // Get all documents in extractedText collection
    const extractedTextRef = adminDb.collection('extractedText');
    const allDocs = await extractedTextRef.limit(20).get();
    
    console.log(`📊 Found ${allDocs.size} documents in extractedText collection`);
    
    if (!allDocs.empty) {
      allDocs.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`📄 Document ${index + 1} (${doc.id}):`);
        console.log('   - Keys:', Object.keys(data));
        if (data.input) {
          console.log('   - Input source:', data.input.source || 'no source');
          console.log('   - Input bucket:', data.input.bucket || 'no bucket');
        }
        if (data.output) {
          console.log('   - Output text length:', data.output.text?.length || 0);
        }
        console.log('   - CreateTime:', data.createTime || 'no createTime');
        console.log('---');
      });
    } else {
      console.log('⚠️ No documents found in extractedText collection');
      console.log('This suggests either:');
      console.log('1. The Firebase extension is not properly installed/enabled');
      console.log('2. The trigger path configuration doesn\'t match our uploads');
      console.log('3. The extension is configured for a different collection name');
    }
    
    // Also check what paths are being used in Firebase Storage
    console.log('\n🗂️ Checking recent Firebase Storage paths...');
    const { adminStorage } = require('./server/firebaseAdmin');
    const bucket = adminStorage.bucket();
    
    try {
      const [files] = await bucket.getFiles({ 
        prefix: 'ocr-processing',
        maxResults: 10 
      });
      console.log(`📁 Found ${files.length} files in ocr-processing folder:`);
      files.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata.timeCreated})`);
      });
    } catch (storageError) {
      console.log('⚠️ Error checking storage:', storageError.message);
    }
    
    try {
      const [imagesFiles] = await bucket.getFiles({ 
        prefix: 'images',
        maxResults: 10 
      });
      console.log(`📁 Found ${imagesFiles.length} files in images folder:`);
      imagesFiles.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata.timeCreated})`);
      });
    } catch (storageError) {
      console.log('⚠️ Error checking images storage:', storageError.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
  }
}

checkFirestoreExtractedText();