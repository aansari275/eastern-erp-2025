import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// This script will help you migrate your data to a NEW Firebase project
// You'll need to update the Firebase config below when you create the new project

console.log('🚀 NEW DATABASE MIGRATION SCRIPT');
console.log('📋 This script will help you migrate to a fresh Firebase project');
console.log('');

// Instructions for user
console.log('📝 INSTRUCTIONS:');
console.log('1. Create a new Firebase project at https://console.firebase.google.com');
console.log('2. Enable Firestore Database');
console.log('3. Enable Authentication with Google provider');
console.log('4. Download the new service account key');
console.log('5. Update the config below');
console.log('6. Run this script to migrate your data');
console.log('');

async function migrateToNewDatabase() {
  console.log('🔍 Looking for backup file...');
  
  // Find the most recent backup file
  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) {
    console.error('❌ No backup directory found! Run backup-sampling-data.js first');
    return;
  }
  
  const backupFiles = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('sampling-backup-') && file.endsWith('.json'))
    .sort()
    .reverse();
  
  if (backupFiles.length === 0) {
    console.error('❌ No backup files found! Run backup-sampling-data.js first');
    return;
  }
  
  const latestBackup = backupFiles[0];
  const backupPath = path.join(backupDir, latestBackup);
  
  console.log(`📦 Found backup: ${latestBackup}`);
  
  // Load backup data
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log(`📊 Backup contains ${Object.keys(backupData.collections).length} collections`);
  
  // TODO: User needs to configure new Firebase project
  console.log('');
  console.log('⚠️  CONFIGURATION NEEDED:');
  console.log('');
  console.log('🔧 To complete the migration:');
  console.log('1. Create your new Firebase project');
  console.log('2. Replace OLD_serviceAccountKey.json with NEW_serviceAccountKey.json');
  console.log('3. Update the PROJECT_ID in this script');
  console.log('4. Run this script again');
  console.log('');
  
  // Preview what will be migrated
  console.log('📋 MIGRATION PREVIEW:');
  for (const [collectionName, collection] of Object.entries(backupData.collections)) {
    if (collection.count > 0) {
      console.log(`   ✅ ${collectionName}: ${collection.count} documents`);
    }
  }
  
  // Create migration template
  const migrationTemplate = {
    // User will need to update these
    NEW_PROJECT_ID: 'your-new-firebase-project-id',
    NEW_SERVICE_ACCOUNT_PATH: './server/NEW_serviceAccountKey.json',
    
    // Migration settings
    COLLECTIONS_TO_MIGRATE: ['rugs', 'buyers', 'pdocs', 'quotes'],
    SKIP_COLLECTIONS: ['users'], // We'll create fresh users
    
    // Admin user for new project
    ADMIN_USER: {
      uid: 'new-admin-uid', // Will be generated
      email: 'abdulansari@easternmills.com',
      displayName: 'Abdul Rahim Ansari',
      role: 'super_admin',
      department: 'admin',
      departments: ['quality', 'sampling', 'merchandising', 'production', 'admin'],
      permissions: [
        'manage_users', 'manage_permissions', 'view_all_data',
        'view_quality_dashboard', 'manage_quality_audits', 'view_compliance_reports',
        'edit_compliance_audits', 'view_lab_inspections', 'manage_lab_inspections',
        'view_bazaar_inspections', 'manage_bazaar_inspections', 'view_sampling_dashboard',
        'manage_rug_creation', 'view_gallery', 'manage_gallery', 'view_costing',
        'manage_costing', 'view_merchandising_dashboard', 'manage_buyers',
        'view_orders', 'manage_orders', 'view_production_dashboard', 'manage_production'
      ],
      isActive: true,
      isAuthorized: true,
      preventAutoUpdate: true,
      isManuallyConfigured: true
    }
  };
  
  // Save migration template
  const templatePath = './migration-config.json';
  fs.writeFileSync(templatePath, JSON.stringify(migrationTemplate, null, 2));
  
  console.log('');
  console.log(`📝 Migration template created: ${templatePath}`);
  console.log('');
  console.log('🚀 NEXT STEPS:');
  console.log('1. Create new Firebase project');
  console.log('2. Download new service account key');
  console.log('3. Update migration-config.json with your new project details');
  console.log('4. Run: node migrate-to-new-database.js --execute');
  console.log('');
}

// Check if user wants to execute migration
const args = process.argv.slice(2);
if (args.includes('--execute')) {
  console.log('🚨 EXECUTE MODE - Not implemented yet');
  console.log('👆 First complete the setup steps above');
} else {
  migrateToNewDatabase().then(() => {
    console.log('✅ Migration preparation complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Migration preparation failed:', error);
    process.exit(1);
  });
}