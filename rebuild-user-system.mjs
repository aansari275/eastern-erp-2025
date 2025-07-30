import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./server/firebaseServiceAccountKey.json', 'utf8'));
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function deleteOldCollections() {
  console.log('🗑️  Deleting old user management collections...');
  
  try {
    // Delete users collection
    const usersSnapshot = await db.collection('users').get();
    const userDeletePromises = usersSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(userDeletePromises);
    console.log(`✅ Deleted ${usersSnapshot.size} documents from users collection`);
    
    // Delete permissions collection
    try {
      const permissionsSnapshot = await db.collection('permissions').get();
      const permDeletePromises = permissionsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(permDeletePromises);
      console.log(`✅ Deleted ${permissionsSnapshot.size} documents from permissions collection`);
    } catch (e) {
      console.log('📝 No permissions collection to delete');
    }
    
    // Delete user_tab_permissions collection
    try {
      const tabPermsSnapshot = await db.collection('user_tab_permissions').get();
      const tabDeletePromises = tabPermsSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(tabDeletePromises);
      console.log(`✅ Deleted ${tabPermsSnapshot.size} documents from user_tab_permissions collection`);
    } catch (e) {
      console.log('📝 No user_tab_permissions collection to delete');
    }
    
  } catch (error) {
    console.error('❌ Error deleting collections:', error);
    throw error;
  }
}

async function createCleanUsers() {
  console.log('👥 Creating clean user system...');
  
  const cleanUsers = [
    {
      email: 'abdulansari@easternmills.com',
      name: 'Abdul Ansari',
      role: 'admin',
      departments: ['Products', 'Production', 'Quality', 'Compliance'],
      isActive: true
    },
    {
      email: 'quality.manager@easternmills.com', 
      name: 'Quality Manager',
      role: 'quality_manager',
      departments: ['Quality', 'Compliance'],
      isActive: true
    },
    {
      email: 'faizan.easternmills@gmail.com',
      name: 'Faizan Eastern',
      role: 'sampling_team', 
      departments: ['Products', 'Production'],
      isActive: true
    },
    {
      email: 'lab.easternmills@gmail.com',
      name: 'Lab Eastern',
      role: 'quality_team',
      departments: ['Quality', 'Compliance'], 
      isActive: true
    },
    {
      email: 'studio@easternmills.com',
      name: 'Studio Eastern',
      role: 'sampling_team',
      departments: ['Products', 'Production'],
      isActive: true
    },
    {
      email: 'danishsampling.eastern@gmail.com',
      name: 'Danish Sampling',
      role: 'sampling_team',
      departments: ['Products', 'Production'],
      isActive: true
    },
    {
      email: 'faizanansari05100@gmail.com', 
      name: 'Faizan Ansari',
      role: 'sampling_team',
      departments: ['Products', 'Production'],
      isActive: true
    }
  ];
  
  try {
    // Add each user to Firebase
    for (const user of cleanUsers) {
      const userData = {
        ...user,
        createdAt: new Date(),
        lastLogin: null
      };
      
      const docRef = await db.collection('users').add(userData);
      console.log(`✅ Added user: ${user.email} (${user.role}) - ID: ${docRef.id}`);
    }
    
    console.log(`🎉 Successfully created ${cleanUsers.length} clean users!`);
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
}

async function createRoleDefinitions() {
  console.log('🏷️  Creating role definitions...');
  
  const roles = {
    admin: {
      name: 'Administrator',
      description: 'Full system access',
      departments: ['Products', 'Production', 'Quality', 'Compliance'],
      canEdit: true,
      canManageUsers: true
    },
    quality_manager: {
      name: 'Quality Manager', 
      description: 'Manages quality and compliance',
      departments: ['Quality', 'Compliance'],
      canEdit: true,
      canManageUsers: false
    },
    quality_team: {
      name: 'Quality Team',
      description: 'Quality and compliance operations', 
      departments: ['Quality', 'Compliance'],
      canEdit: true,
      canManageUsers: false
    },
    sampling_team: {
      name: 'Sampling Team',
      description: 'Product development and production',
      departments: ['Products', 'Production'], 
      canEdit: true,
      canManageUsers: false
    },
    viewer: {
      name: 'Viewer',
      description: 'Read-only access',
      departments: ['Products', 'Production', 'Quality', 'Compliance'],
      canEdit: false, 
      canManageUsers: false
    }
  };
  
  try {
    for (const [roleId, roleData] of Object.entries(roles)) {
      await db.collection('roles').doc(roleId).set(roleData);
      console.log(`✅ Created role: ${roleId}`);
    }
    
    console.log('🎉 Role definitions created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating roles:', error);
    throw error;
  }
}

async function rebuildUserSystem() {
  try {
    console.log('🚀 Starting Firebase user system rebuild...\n');
    
    // Step 1: Delete old collections
    await deleteOldCollections();
    console.log();
    
    // Step 2: Create clean users
    await createCleanUsers();
    console.log();
    
    // Step 3: Create role definitions
    await createRoleDefinitions();
    console.log();
    
    console.log('🎉 Firebase user system rebuild completed successfully!');
    console.log('✅ Ready to update authentication code.');
    
  } catch (error) {
    console.error('❌ Rebuild failed:', error);
    throw error;
  }
}

// Run rebuild
rebuildUserSystem()
  .then(() => {
    console.log('\n🎊 All done! Your Firebase user system is clean and ready.');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Rebuild failed:', error);
    process.exit(1);
  });