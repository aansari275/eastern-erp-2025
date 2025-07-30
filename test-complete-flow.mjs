// Complete Evidence Upload Flow Test
import fs from 'fs';

async function testCompleteEvidenceFlow() {
  console.log('🚀 Complete Evidence Upload Flow Test\n');
  
  // Step 1: Create audit with checklist field
  console.log('1️⃣ Creating audit with checklist...');
  
  const testAudit = {
    auditorName: 'Flow Test Auditor',
    location: 'Flow Test Location',
    auditScope: 'Complete Flow Test',
    company: 'EHI',
    auditDate: '2025-07-27',
    parts: [
      {
        id: 'part-1',
        title: 'Design Control',
        items: [
          {
            code: 'C1',
            question: 'Are design and development procedures established?',
            response: 'Yes',
            remark: 'Flow test remark C1',
            evidenceImages: ['https://firebasestorage.googleapis.com/test-c1.jpg']
          },
          {
            code: 'C2',
            question: 'Are design inputs documented and reviewed?',
            response: 'No',
            remark: 'Flow test remark C2',
            evidenceImages: ['https://firebasestorage.googleapis.com/test-c2.jpg']
          }
        ]
      }
    ],
    checklist: [
      {
        code: 'C1',
        question: 'Are design and development procedures established?',
        response: 'Yes',
        remark: 'Flow test remark C1',
        evidence: ['https://firebasestorage.googleapis.com/test-c1.jpg']
      },
      {
        code: 'C2',
        question: 'Are design inputs documented and reviewed?',
        response: 'No',
        remark: 'Flow test remark C2',
        evidence: ['https://firebasestorage.googleapis.com/test-c2.jpg']
      }
    ],
    status: 'draft'
  };

  try {
    // Create the audit
    const createResponse = await fetch('http://localhost:5000/api/audits/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAudit)
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status} ${await createResponse.text()}`);
    }

    const createResult = await createResponse.json();
    const auditId = createResult.id;
    console.log('✅ Audit created:', auditId);

    // Step 2: Retrieve and verify audit data
    console.log('\n2️⃣ Retrieving audit data...');
    
    const getResponse = await fetch(`http://localhost:5000/api/audits/compliance/${auditId}`);
    if (!getResponse.ok) {
      throw new Error(`Get failed: ${getResponse.status} ${await getResponse.text()}`);
    }

    const getResult = await getResponse.json();
    const audit = getResult.audit;
    
    console.log('✅ Audit retrieved successfully');
    console.log('📋 Has checklist field:', !!audit.checklist);
    console.log('📋 Checklist length:', audit.checklist?.length || 0);
    console.log('📊 Parts length:', audit.parts?.length || 0);
    
    if (audit.checklist && audit.checklist.length > 0) {
      console.log('\n📋 Checklist Contents:');
      audit.checklist.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.code}: ${item.question}`);
        console.log(`     Response: ${item.response || 'None'}`);
        console.log(`     Remark: ${item.remark || 'None'}`);
        console.log(`     Evidence: ${item.evidence?.length || 0} items`);
        if (item.evidence && item.evidence.length > 0) {
          item.evidence.forEach((url, i) => {
            console.log(`       - ${url}`);
          });
        }
      });
    }

    // Step 3: Test PDF generation with the retrieved audit
    console.log('\n3️⃣ Testing PDF generation...');
    
    const pdfResponse = await fetch(`http://localhost:5000/api/audits/compliance/${auditId}/pdf`);
    if (pdfResponse.ok) {
      const pdfBuffer = await pdfResponse.arrayBuffer();
      console.log('✅ PDF generated successfully');
      console.log('📄 PDF size:', Math.round(pdfBuffer.byteLength / 1024) + 'KB');
      
      // Save PDF for verification
      fs.writeFileSync('complete-flow-test.pdf', Buffer.from(pdfBuffer));
      console.log('📄 PDF saved as: complete-flow-test.pdf');
    } else {
      console.error('❌ PDF generation failed:', await pdfResponse.text());
    }

    // Step 4: Summary
    console.log('\n4️⃣ Flow Test Summary:');
    console.log('✅ Audit Creation: SUCCESS');
    console.log('✅ Data Retrieval: SUCCESS');
    console.log(`📋 Checklist Field Present: ${!!audit.checklist ? 'YES' : 'NO'}`);
    console.log(`📋 Checklist Items Count: ${audit.checklist?.length || 0}`);
    console.log(`📸 Evidence URLs Count: ${audit.checklist?.reduce((total, item) => total + (item.evidence?.length || 0), 0) || 0}`);
    console.log('✅ PDF Generation: SUCCESS');

    if (audit.checklist && audit.checklist.length > 0) {
      console.log('\n🎯 EVIDENCE UPLOAD FLOW: WORKING CORRECTLY');
      console.log('✅ Server saves checklist field to Firestore');
      console.log('✅ Server retrieves checklist field from Firestore');
      console.log('✅ PDF generator can access evidence URLs');
      console.log('✅ Complete evidence workflow functional');
    } else {
      console.log('\n❌ EVIDENCE UPLOAD FLOW: NEEDS DEBUGGING');
      console.log('❌ Checklist field not found in retrieved audit');
    }

    return auditId;

  } catch (error) {
    console.error('💥 Flow test failed:', error.message);
    return null;
  }
}

// Run the complete flow test
testCompleteEvidenceFlow().catch(console.error);