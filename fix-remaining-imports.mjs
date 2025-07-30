import fs from 'fs';
import path from 'path';

// Files that need import fixes
const importFixes = [
  {
    file: 'client/src/components/AuditFormsDashboard.tsx',
    fixes: [
      {
        from: "import { ComplianceAuditForm } from './ComplianceAuditForm';",
        to: "import FreshComplianceAuditForm from './FreshComplianceAuditForm';"
      },
      {
        from: "import { useComplianceAudit } from '../hooks/useComplianceAudit';",
        to: "import { useCleanAudits } from '../hooks/useCleanAudits';"
      },
      {
        from: "<ComplianceAuditForm",
        to: "<FreshComplianceAuditForm"
      },
      {
        from: "useComplianceAudit()",
        to: "useCleanAudits()"
      }
    ]
  },
  {
    file: 'client/src/components/AuditDashboard.tsx',
    fixes: [
      {
        from: "import { ComplianceAuditForm } from './ComplianceAuditForm';",
        to: "import FreshComplianceAuditForm from './FreshComplianceAuditForm';"
      },
      {
        from: "import { useComplianceAudit } from '../hooks/useComplianceAudit';",
        to: "import { useCleanAudits } from '../hooks/useCleanAudits';"
      },
      {
        from: "<ComplianceAuditForm",
        to: "<FreshComplianceAuditForm"
      }
    ]
  }
];

async function fixRemainingImports() {
  try {
    console.log('🔧 Fixing remaining broken imports...\n');
    
    for (const fileConfig of importFixes) {
      const filePath = path.join(process.cwd(), fileConfig.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${fileConfig.file}`);
        continue;
      }
      
      console.log(`📝 Fixing: ${fileConfig.file}`);
      let content = fs.readFileSync(filePath, 'utf8');
      let fixCount = 0;
      
      for (const fix of fileConfig.fixes) {
        if (content.includes(fix.from)) {
          content = content.replace(new RegExp(escapeRegex(fix.from), 'g'), fix.to);
          fixCount++;
          console.log(`   ✅ ${fix.from} → ${fix.to}`);
        }
      }
      
      if (fixCount > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`   💾 Applied ${fixCount} fixes to ${fileConfig.file}`);
      } else {
        console.log(`   ✅ No fixes needed for ${fileConfig.file}`);
      }
      
      console.log('');
    }
    
    console.log('🎉 All import fixes applied!');
    console.log('Ready to try build again.');
    
  } catch (error) {
    console.error('❌ Error fixing imports:', error);
    throw error;
  }
}

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}

// Run fixes
fixRemainingImports()
  .then(() => {
    console.log('\\n🚀 Import fixes complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Failed to fix imports:', error);
    process.exit(1);
  });