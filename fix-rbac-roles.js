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

  async function fixRBACRoles() {
    console.log('🔧 Fixing RBAC roles for abdulansari@easternmills.com...');
    
    try {
      // Update the user document to use the proper RBAC structure
      const userDoc1 = 'Ag9zUVpvbtdRhOEyY6iccP4bbmu2';
      console.log('🔧 Updating user document with RBAC structure:', userDoc1);
      
      await db.collection('users').doc(userDoc1).update({
        // RBAC System - use proper roles array
        roles: ['admin'], // This is what the RBAC system looks for
        departments: ['quality', 'sampling', 'merchandising', 'production', 'admin'],
        customPermissions: [], // Additional custom permissions if needed
        
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
      
      console.log('✅ Updated user document with proper RBAC roles');
      
      // Verify the update
      const updatedDoc = await db.collection('users').doc(userDoc1).get();
      const data = updatedDoc.data();
      console.log('✅ Verification - Updated user data:');
      console.log(`  Roles (RBAC): ${JSON.stringify(data.roles)}`);
      console.log(`  Departments: ${JSON.stringify(data.departments)}`);
      console.log(`  Role (Legacy): ${data.role}`);
      console.log(`  IsActive: ${data.isActive}`);
      console.log(`  IsAuthorized: ${data.isAuthorized}`);
      
    } catch (error) {
      console.error('❌ Error updating RBAC roles:', error);
    }
  }

  fixRBACRoles().then(() => {
    console.log('\n✅ RBAC roles fix complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fixing RBAC roles:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}