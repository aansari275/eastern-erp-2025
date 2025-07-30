import fs from 'fs';
import path from 'path';

// Files to delete - old/duplicate audit components and routes
const filesToDelete = [
  // OLD AUDIT FORM COMPONENTS (keeping only FreshComplianceAuditForm.tsx)
  'client/src/components/ComplianceAuditForm.tsx',
  'client/src/components/ComplianceAuditForm.js',
  'client/src/components/ComplianceAuditFormClean.tsx', 
  'client/src/components/ComplianceAuditFormClean.js',
  'client/src/components/ComplianceAudit.tsx',
  'client/src/components/ComplianceAudit.js',
  'client/src/components/EnhancedComplianceAudit.tsx',
  'client/src/components/EnhancedComplianceAudit.js',
  'client/src/components/AuditFormV2.tsx',
  'client/src/components/AuditFormV2.js',
  'client/src/components/AuditSaveTest.tsx',
  'client/src/components/AuditSaveTest.js',
  
  // TEST PAGES
  'client/src/pages/AuditTestPage.tsx',
  'client/src/pages/AuditTestPage.js',
  
  // OLD AUDIT HOOKS (keeping only useCleanAudits.ts)
  'client/src/hooks/useComplianceAudit.tsx',
  'client/src/hooks/useComplianceAudit.js',
  'client/src/hooks/useAuditForms.tsx', 
  'client/src/hooks/useAuditForms.js',
  
  // OLD SERVER ROUTES (keeping only audits-clean-v2.ts)
  'server/routes/audits.ts',
  'server/routes/audits.js',
  'server/routes/audit.ts',
  'server/routes/audit.js',
  'server/routes/audits-clean.ts',
  'server/routes/audits-clean.js',
  'server/routes/auditForms.ts',
  'server/routes/auditForms.js',
  
  // OLD DASHBOARD COMPONENTS IF NOT USED
  'client/src/components/AuditFormsDashboard.js',
  'client/src/components/AuditFormEditor.js',
  'client/src/components/ComplianceDashboard.js',
  
  // TEST FILES
  'test-clean-audits.js',
  'test-compliance-api.mjs',
  'test-firebase-audit.js'
];

async function executeCodeCleanup() {
  try {
    console.log('🧹 Starting code cleanup...\n');
    
    let deletedCount = 0;
    let skippedCount = 0;
    const backupList = [];
    
    console.log('🗑️ Deleting duplicate/old files...');
    
    for (const filePath of filesToDelete) {
      const fullPath = path.join(process.cwd(), filePath);
      
      try {
        if (fs.existsSync(fullPath)) {
          // Check if it's a file (not directory)
          const stats = fs.statSync(fullPath);
          if (stats.isFile()) {
            // Backup file content for safety
            const content = fs.readFileSync(fullPath, 'utf8');
            backupList.push({
              path: filePath,
              content: content,
              size: stats.size
            });
            
            // Delete the file
            fs.unlinkSync(fullPath);
            console.log(`   ✅ Deleted: ${filePath}`);
            deletedCount++;
          } else {
            console.log(`   ⚠️ Skipped (not a file): ${filePath}`);
            skippedCount++;
          }
        } else {
          console.log(`   ✅ Already gone: ${filePath}`);
          skippedCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error deleting ${filePath}: ${error.message}`);
        skippedCount++;
      }
    }
    
    // Save backup of deleted files
    if (backupList.length > 0) {
      const backupData = {
        timestamp: new Date().toISOString(),
        deletedFiles: backupList.length,
        totalSize: backupList.reduce((sum, file) => sum + file.size, 0),
        files: backupList
      };
      
      fs.writeFileSync(`./backup-deleted-files-${Date.now()}.json`, JSON.stringify(backupData, null, 2));
      console.log(`\\n💾 Backed up ${backupList.length} deleted files`);
    }
    
    console.log('\\n🧹 CLEANUP SUMMARY:');
    console.log(`   ✅ Files deleted: ${deletedCount}`);
    console.log(`   ⚠️ Files skipped: ${skippedCount}`);
    console.log(`   📁 Total files processed: ${filesToDelete.length}`);
    
    // Verify remaining clean files
    console.log('\\n✅ REMAINING CLEAN FILES:');
    const keepFiles = [
      'client/src/components/FreshComplianceAuditForm.tsx',
      'server/routes/audits-clean-v2.ts',
      'client/src/hooks/useCleanAudits.ts'
    ];
    
    for (const filePath of keepFiles) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ KEPT: ${filePath}`);
      } else {
        console.log(`   ❌ MISSING: ${filePath} (This should exist!)`);
      }
    }
    
    console.log('\\n🎉 Code cleanup completed successfully!');
    console.log('\\n📋 NEXT STEPS:');
    console.log('   1. Update server/index.ts to remove old route imports');
    console.log('   2. Test compliance audit form');
    console.log('   3. Verify no broken imports in remaining files');
    
  } catch (error) {
    console.error('❌ Code cleanup failed:', error);
    throw error;
  }
}

// Run cleanup
executeCodeCleanup()
  .then(() => {
    console.log('\\n🚀 Code cleanup complete! Ready to update server routes.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });