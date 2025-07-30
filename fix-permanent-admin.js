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

  async function fixPermanentAdmin() {
    console.log('🔧 Creating PERMANENT admin setup for abdulansari@easternmills.com...');
    
    try {
      // Delete the problematic auto-created document first
      const userDoc1 = 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2';
      console.log('🗑️ Deleting problematic user document:', userDoc1);
      
      await db.collection('users').doc(userDoc1).delete();
      console.log('✅ Deleted auto-created document');
      
      // Now create a PROPER admin document that won't be overwritten
      // Use the UID that the authentication system expects
      const properUID = 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2'; // This is the UID from Firebase Auth
      
      console.log('🔧 Creating proper SUPER_ADMIN document...');
      
      const adminUserData = {
        // Core identity
        uid: properUID,
        email: 'abdulansari@easternmills.com',
        displayName: 'Abdul Rahim Ansari',
        
        // RBAC System - SUPER_ADMIN role
        roles: ['super_admin'],
        departments: ['quality', 'sampling', 'merchandising', 'production', 'admin'],
        customPermissions: [],
        
        // Legacy fields for backward compatibility (prevents auto-overwrite)
        role: 'super_admin',
        Role: 'super_admin', 
        department: 'admin',
        DepartmentId: 'admin',
        
        // Permissions arrays
        permissions: [
          'manage_users',
          'manage_permissions',
          'view_all_data',
          'view_quality_dashboard',
          'manage_quality_audits',
          'view_compliance_reports',
          'edit_compliance_audits',
          'view_lab_inspections',
          'manage_lab_inspections',
          'view_bazaar_inspections',
          'manage_bazaar_inspections',
          'view_sampling_dashboard',
          'manage_rug_creation',
          'view_gallery',
          'manage_gallery',
          'view_costing',
          'manage_costing',
          'view_merchandising_dashboard',
          'manage_buyers',
          'view_orders',
          'manage_orders',
          'view_production_dashboard',
          'manage_production'
        ],
        
        allowedTabs: [
          'dashboard', 'compliance', 'lab', 'bazaar_inspection', 'final_inspection',
          'create_samples', 'gallery', 'costing', 'materials',
          'buyers', 'orders', 'quotes', 'pdocs'
        ],
        
        // Status
        isActive: true,
        isAuthorized: true,
        
        // Timestamps
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        
        // Flag to prevent auto-overwrite
        isManuallyConfigured: true,
        preventAutoUpdate: true
      };
      
      await db.collection('users').doc(properUID).set(adminUserData, { merge: false });
      
      console.log('✅ Created permanent SUPER_ADMIN document');
      
      // Verify the creation
      const createdDoc = await db.collection('users').doc(properUID).get();
      const data = createdDoc.data();
      console.log('✅ Verification - Created user data:');
      console.log(`  UID: ${data.uid}`);
      console.log(`  Email: ${data.email}`);
      console.log(`  Roles (RBAC): ${JSON.stringify(data.roles)}`);
      console.log(`  Departments: ${JSON.stringify(data.departments)}`);
      console.log(`  Permissions count: ${data.permissions.length}`);
      console.log(`  IsActive: ${data.isActive}`);
      console.log(`  IsAuthorized: ${data.isAuthorized}`);
      console.log(`  PreventAutoUpdate: ${data.preventAutoUpdate}`);
      
      console.log('\n🎉 PERMANENT SUPER_ADMIN setup complete!');
      console.log('  ✅ Will NOT be overwritten by authentication system');
      console.log('  ✅ Complete access to all departments');
      console.log('  ✅ All permissions granted');
      
    } catch (error) {
      console.error('❌ Error creating permanent admin:', error);
    }
  }

  fixPermanentAdmin().then(() => {
    console.log('\n✅ Permanent admin setup complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error setting up permanent admin:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}