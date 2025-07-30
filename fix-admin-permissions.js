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

  async function fixAdminPermissions() {
    console.log('🔧 Fixing admin permissions for abdulansari@easternmills.com...');
    
    try {
      // First, update the limited user document to have proper admin permissions
      const userDoc1 = 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2';
      console.log('🔧 Updating user document:', userDoc1);
      
      await db.collection('users').doc(userDoc1).update({
        role: 'admin',
        Role: 'admin',
        department: 'admin',
        DepartmentId: 'admin',
        departments: ['admin', 'quality', 'sampling', 'merchandising', 'production'],
        permissions: [
          'manage_users',
          'manage_permissions', 
          'view_all_data',
          'view_quality',
          'edit_quality',
          'view_compliance',
          'edit_compliance',
          'view_sampling',
          'edit_sampling',
          'view_production',
          'edit_production'
        ],
        tabs: ['dashboard', 'compliance', 'lab', 'create_samples', 'gallery', 'costing', 'buyers', 'pdoc'],
        isActive: true,
        isAuthorized: true,
        canAccessDepartments: ['admin', 'quality', 'sampling', 'merchandising', 'production'],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Updated user document with admin permissions');
      
      // Verify the update
      const updatedDoc = await db.collection('users').doc(userDoc1).get();
      const data = updatedDoc.data();
      console.log('✅ Verification - Updated user data:');
      console.log(`  Role: ${data.role}`);
      console.log(`  Department: ${data.department}`);
      console.log(`  Departments: ${JSON.stringify(data.departments)}`);
      console.log(`  Permissions: ${JSON.stringify(data.permissions)}`);
      console.log(`  IsActive: ${data.isActive}`);
      console.log(`  IsAuthorized: ${data.isAuthorized}`);
      
    } catch (error) {
      console.error('❌ Error updating admin permissions:', error);
    }
  }

  fixAdminPermissions().then(() => {
    console.log('\n✅ Admin permissions fix complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fixing permissions:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}