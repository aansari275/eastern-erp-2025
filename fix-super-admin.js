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

  async function fixSuperAdmin() {
    console.log('🔧 Setting abdulansari@easternmills.com as SUPER_ADMIN...');
    
    try {
      // Update the user document to use SUPER_ADMIN role
      const userDoc1 = 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2';
      console.log('🔧 Updating user document with SUPER_ADMIN role:', userDoc1);
      
      await db.collection('users').doc(userDoc1).update({
        // RBAC System - use SUPER_ADMIN role
        roles: ['super_admin'], // This gives ALL permissions
        departments: ['quality', 'sampling', 'merchandising', 'production', 'admin'],
        customPermissions: [], // No need for custom permissions with super_admin
        
        // Legacy fields for backward compatibility  
        role: 'admin',
        Role: 'admin',
        department: 'admin',
        DepartmentId: 'admin',
        
        // Status
        isActive: true,
        isAuthorized: true,
        
        // Update timestamp
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Updated user document with SUPER_ADMIN role');
      
      // Verify the update
      const updatedDoc = await db.collection('users').doc(userDoc1).get();
      const data = updatedDoc.data();
      console.log('✅ Verification - Updated user data:');
      console.log(`  Roles (RBAC): ${JSON.stringify(data.roles)}`);
      console.log(`  Departments: ${JSON.stringify(data.departments)}`);
      console.log(`  IsActive: ${data.isActive}`);
      console.log(`  IsAuthorized: ${data.isAuthorized}`);
      
      console.log('\n🎉 With SUPER_ADMIN role, you now have:');
      console.log('  ✅ Complete system access');
      console.log('  ✅ All department permissions');
      console.log('  ✅ All feature permissions');
      console.log('  ✅ User management abilities');
      
    } catch (error) {
      console.error('❌ Error updating to SUPER_ADMIN:', error);
    }
  }

  fixSuperAdmin().then(() => {
    console.log('\n✅ SUPER_ADMIN setup complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error setting up SUPER_ADMIN:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}