import admin from 'firebase-admin';
import fs from 'fs';

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(fs.readFileSync('./server/serviceAccountKey.json', 'utf8'));
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'rugcraftpro'
    });
  }
  
  const db = admin.firestore();

  async function deleteAndRecreateAdmin() {
    console.log('🗂️ CLEAN SLATE: Deleting and recreating admin user...');
    
    try {
      const adminUID = 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2';
      
      // 1. DELETE the problematic user document completely
      console.log('🗑️ Deleting existing user document:', adminUID);
      await db.collection('users').doc(adminUID).delete();
      console.log('✅ User document deleted successfully');
      
      // 2. Wait a moment to ensure deletion is complete
      console.log('⏳ Waiting 2 seconds for deletion to complete...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. CREATE a completely fresh admin document
      console.log('🆕 Creating fresh admin document...');
      
      const cleanAdminData = {
        // Core Firebase Auth data
        uid: adminUID,
        email: 'abdulansari@easternmills.com',
        displayName: 'Abdul Rahim Ansari',
        
        // RBAC System (what the frontend expects)
        roles: ['super_admin'],
        departments: ['quality', 'sampling', 'merchandising', 'production', 'admin'],
        customPermissions: [],
        
        // Legacy compatibility (for old systems)
        role: 'super_admin',
        Role: 'super_admin',
        department: 'admin',
        DepartmentId: 'admin',
        
        // Complete permissions list
        permissions: [
          'manage_users', 'manage_permissions', 'view_all_data',
          'view_quality_dashboard', 'manage_quality_audits', 'view_compliance_reports',
          'edit_compliance_audits', 'view_lab_inspections', 'manage_lab_inspections',
          'view_bazaar_inspections', 'manage_bazaar_inspections', 'view_sampling_dashboard',
          'manage_rug_creation', 'view_gallery', 'manage_gallery', 'view_costing',
          'manage_costing', 'view_merchandising_dashboard', 'manage_buyers',
          'view_orders', 'manage_orders', 'view_production_dashboard', 'manage_production'
        ],
        
        // All available tabs
        allowedTabs: [
          'dashboard', 'compliance', 'lab', 'bazaar_inspection', 'final_inspection',
          'create_samples', 'gallery', 'costing', 'materials',
          'buyers', 'orders', 'quotes', 'pdocs'
        ],
        
        // Status flags
        isActive: true,
        isAuthorized: true,
        
        // Protection flags (prevent future overwrites)
        preventAutoUpdate: true,
        isManuallyConfigured: true,
        doNotOverwrite: true,
        adminCreated: true,
        
        // Timestamps
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Additional metadata
        createdBy: 'admin-script',
        lastModifiedBy: 'admin-script',
        version: '2.0-clean'
      };
      
      // Create the document
      await db.collection('users').doc(adminUID).set(cleanAdminData);
      console.log('✅ Fresh admin document created successfully');
      
      // 4. Verify the creation
      console.log('🔍 Verifying new admin document...');
      const verifyDoc = await db.collection('users').doc(adminUID).get();
      
      if (verifyDoc.exists()) {
        const data = verifyDoc.data();
        console.log('✅ VERIFICATION SUCCESSFUL:');
        console.log(`  📧 Email: ${data.email}`);
        console.log(`  🎭 Role: ${data.role}`);
        console.log(`  🎭 Roles Array: ${JSON.stringify(data.roles)}`);
        console.log(`  🏢 Department: ${data.department}`);
        console.log(`  🏢 Departments: ${JSON.stringify(data.departments)}`);
        console.log(`  🔑 Permissions: ${data.permissions.length} total`);
        console.log(`  📋 Allowed Tabs: ${data.allowedTabs.length} total`);
        console.log(`  ✅ Is Active: ${data.isActive}`);
        console.log(`  ✅ Is Authorized: ${data.isAuthorized}`);
        console.log(`  🛡️ Protected: ${data.preventAutoUpdate}`);
        console.log(`  📅 Version: ${data.version}`);
        
        console.log('\n🎉 CLEAN ADMIN ACCOUNT CREATED SUCCESSFULLY!');
        console.log('🎉 This account has:');
        console.log('  ✅ SUPER_ADMIN role with all permissions');
        console.log('  ✅ Access to ALL departments');
        console.log('  ✅ ALL 23 system permissions');
        console.log('  ✅ ALL available tabs and features');
        console.log('  ✅ Multiple protection flags to prevent overwrites');
        console.log('  ✅ Clean document with no conflicting legacy data');
        
      } else {
        console.error('❌ VERIFICATION FAILED: Document was not created');
      }
      
    } catch (error) {
      console.error('❌ Error during delete and recreate:', error);
    }
  }

  deleteAndRecreateAdmin().then(() => {
    console.log('\n✅ Delete and recreate operation complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}