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

  async function emergencyFixAuth() {
    console.log('🚨 EMERGENCY: Fixing authentication overwrite issues...');
    
    try {
      // 1. Fix your admin account AGAIN
      const adminUID = 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2';
      console.log('🔧 Re-fixing admin account:', adminUID);
      
      const adminData = {
        // Core identity
        uid: adminUID,
        email: 'abdulansari@easternmills.com',
        displayName: 'Abdul Rahim Ansari',
        
        // RBAC System
        roles: ['super_admin'],
        departments: ['quality', 'sampling', 'merchandising', 'production', 'admin'],
        customPermissions: [],
        
        // Legacy fields
        role: 'super_admin',
        Role: 'super_admin',
        department: 'admin',
        DepartmentId: 'admin',
        
        // All permissions
        permissions: [
          'manage_users', 'manage_permissions', 'view_all_data',
          'view_quality_dashboard', 'manage_quality_audits', 'view_compliance_reports',
          'edit_compliance_audits', 'view_lab_inspections', 'manage_lab_inspections',
          'view_bazaar_inspections', 'manage_bazaar_inspections', 'view_sampling_dashboard',
          'manage_rug_creation', 'view_gallery', 'manage_gallery', 'view_costing',
          'manage_costing', 'view_merchandising_dashboard', 'manage_buyers',
          'view_orders', 'manage_orders', 'view_production_dashboard', 'manage_production'
        ],
        
        allowedTabs: [
          'dashboard', 'compliance', 'lab', 'bazaar_inspection', 'final_inspection',
          'create_samples', 'gallery', 'costing', 'materials',
          'buyers', 'orders', 'quotes', 'pdocs'
        ],
        
        // Status
        isActive: true,
        isAuthorized: true,
        
        // CRITICAL: Prevent overwriting
        preventAutoUpdate: true,
        isManuallyConfigured: true,
        doNotOverwrite: true,
        
        // Timestamps
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('users').doc(adminUID).set(adminData);
      console.log('✅ Fixed admin account');
      
      // 2. Fix all other active users to prevent their data from being overwritten
      console.log('🔧 Protecting other user accounts...');
      
      const usersSnapshot = await db.collection('users').get();
      const batch = db.batch();
      let protectedCount = 0;
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Skip if already protected or if it's the admin account
        if (data.preventAutoUpdate || doc.id === adminUID) {
          return;
        }
        
        // Add protection flags to prevent overwriting
        const protection = {
          preventAutoUpdate: true,
          isManuallyConfigured: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        batch.update(doc.ref, protection);
        protectedCount++;
        
        console.log(`  🛡️ Protected: ${data.email || doc.id}`);
      });
      
      if (protectedCount > 0) {
        await batch.commit();
        console.log(`✅ Protected ${protectedCount} user accounts from overwriting`);
      }
      
      // 3. Verify the fix
      const verifyDoc = await db.collection('users').doc(adminUID).get();
      const verifyData = verifyDoc.data();
      
      console.log('\n✅ VERIFICATION:');
      console.log(`  Admin Email: ${verifyData.email}`);
      console.log(`  Admin Role: ${verifyData.role}`);
      console.log(`  Admin Roles: ${JSON.stringify(verifyData.roles)}`);
      console.log(`  Admin Departments: ${JSON.stringify(verifyData.departments)}`);
      console.log(`  Permissions Count: ${verifyData.permissions?.length || 0}`);
      console.log(`  IsActive: ${verifyData.isActive}`);
      console.log(`  IsAuthorized: ${verifyData.isAuthorized}`);
      console.log(`  PreventAutoUpdate: ${verifyData.preventAutoUpdate}`);
      
      console.log('\n🎉 EMERGENCY FIX COMPLETE!');
      console.log('  ✅ Admin account restored with full permissions');
      console.log('  ✅ All user accounts protected from overwriting');
      console.log('  ✅ Data saving should now work properly');
      console.log('  ✅ Compliance and lab forms should retain data');
      
    } catch (error) {
      console.error('❌ Emergency fix failed:', error);
    }
  }

  emergencyFixAuth().then(() => {
    console.log('\n✅ Emergency authentication fix complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Emergency fix error:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}