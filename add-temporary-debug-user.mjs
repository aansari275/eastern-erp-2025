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

  async function createDebugOverride() {
    console.log('🔧 Creating temporary debug user override...');
    
    // Create a debug user with full access for testing
    const debugUserEmail = 'abdulansari@easternmills.com';
    
    try {
      // Check if user already exists
      const existingQuery = await db.collection('users')
        .where('email', '==', debugUserEmail)
        .get();
      
      if (!existingQuery.empty) {
        console.log('📝 Updating existing user...');
        const userDoc = existingQuery.docs[0];
        
        const updateData = {
          email: debugUserEmail,
          Email: debugUserEmail,
          role: 'super_admin',
          Role: 'super_admin',
          department: 'admin',
          DepartmentId: 'admin',
          departments: ['admin', 'quality', 'sampling', 'merchandising', 'production'],
          roles: ['super_admin', 'admin'],
          tabs: ['dashboard', 'compliance', 'create', 'gallery', 'buyers', 'pdoc', 'lab', 'final', 'bazaar', 'admin', 'users'],
          permissions: [
            'all', 'manage_users', 'manage_permissions',
            'view_dashboard', 'edit_dashboard', 'manage_dashboard',
            'view_compliance', 'edit_compliance', 'manage_compliance',
            'view_create', 'edit_create', 'manage_create',
            'view_gallery', 'edit_gallery', 'manage_gallery',
            'view_buyers', 'edit_buyers', 'manage_buyers',
            'view_pdoc', 'edit_pdoc', 'manage_pdoc',
            'view_lab', 'edit_lab', 'manage_lab',
            'view_final', 'edit_final', 'manage_final',
            'view_bazaar', 'edit_bazaar', 'manage_bazaar'
          ],
          isActive: true,
          isAuthorized: true,
          updatedAt: new Date().toISOString()
        };
        
        await userDoc.ref.update(updateData);
        console.log('✅ User updated successfully');
        
      } else {
        console.log('📝 Creating new user...');
        
        const newUserData = {
          email: debugUserEmail,
          Email: debugUserEmail,
          uid: 'debug-admin-user',
          role: 'super_admin',
          Role: 'super_admin',
          department: 'admin',
          DepartmentId: 'admin',
          departments: ['admin', 'quality', 'sampling', 'merchandising', 'production'],
          roles: ['super_admin', 'admin'],
          tabs: ['dashboard', 'compliance', 'create', 'gallery', 'buyers', 'pdoc', 'lab', 'final', 'bazaar', 'admin', 'users'],
          permissions: [
            'all', 'manage_users', 'manage_permissions',
            'view_dashboard', 'edit_dashboard', 'manage_dashboard',
            'view_compliance', 'edit_compliance', 'manage_compliance',
            'view_create', 'edit_create', 'manage_create',
            'view_gallery', 'edit_gallery', 'manage_gallery',
            'view_buyers', 'edit_buyers', 'manage_buyers',
            'view_pdoc', 'edit_pdoc', 'manage_pdoc',
            'view_lab', 'edit_lab', 'manage_lab',
            'view_final', 'edit_final', 'manage_final',
            'view_bazaar', 'edit_bazaar', 'manage_bazaar'
          ],
          isActive: true,
          isAuthorized: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await db.collection('users').add(newUserData);
        console.log('✅ Debug user created successfully');
      }
      
      // Also create a document with the Firebase Auth UID if we can determine it
      console.log('📝 Attempting to create user document by UID...');
      
      // Get all users to find the one with matching email
      const allUsers = await db.collection('users').get();
      allUsers.forEach(async (doc) => {
        const data = doc.data();
        if ((data.email === debugUserEmail || data.Email === debugUserEmail) && data.uid) {
          console.log(`Found user with UID: ${data.uid}`);
          
          // Create/update document with UID as document ID
          await db.collection('users').doc(data.uid).set({
            ...data,
            email: debugUserEmail,
            Email: debugUserEmail,
            role: 'super_admin',
            Role: 'super_admin',
            department: 'admin',
            DepartmentId: 'admin',
            departments: ['admin', 'quality', 'sampling', 'merchandising', 'production'],
            roles: ['super_admin', 'admin'],
            tabs: ['dashboard', 'compliance', 'create', 'gallery', 'buyers', 'pdoc', 'lab', 'final', 'bazaar', 'admin', 'users'],
            permissions: [
              'all', 'manage_users', 'manage_permissions',
              'view_dashboard', 'edit_dashboard', 'manage_dashboard',
              'view_compliance', 'edit_compliance', 'manage_compliance',
              'view_create', 'edit_create', 'manage_create',
              'view_gallery', 'edit_gallery', 'manage_gallery',
              'view_buyers', 'edit_buyers', 'manage_buyers',
              'view_pdoc', 'edit_pdoc', 'manage_pdoc',
              'view_lab', 'edit_lab', 'manage_lab',
              'view_final', 'edit_final', 'manage_final',
              'view_bazaar', 'edit_bazaar', 'manage_bazaar'
            ],
            isActive: true,
            isAuthorized: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      });
      
    } catch (error) {
      console.error('❌ Error creating debug user:', error);
    }
  }

  createDebugOverride().then(() => {
    console.log('\n🎉 Debug user override complete!');
    console.log('Your email should now have full access to all departments.');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Debug override failed:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}