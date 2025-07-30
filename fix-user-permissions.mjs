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

  // User permission configurations
  const userConfigs = {
    'abdulansari@easternmills.com': {
      role: 'admin',
      Role: 'admin',
      department: 'admin',
      DepartmentId: 'admin',
      departments: ['quality', 'sampling', 'merchandising', 'production', 'admin'],
      roles: ['super_admin', 'admin'],
      tabs: ['dashboard', 'compliance', 'create', 'gallery', 'buyers', 'pdoc', 'lab', 'final', 'bazaar'],
      permissions: [
        'view_dashboard', 'edit_dashboard', 'manage_dashboard',
        'view_compliance', 'edit_compliance', 'manage_compliance',
        'view_create', 'edit_create', 'manage_create',
        'view_gallery', 'edit_gallery', 'manage_gallery',
        'view_buyers', 'edit_buyers', 'manage_buyers',
        'view_pdoc', 'edit_pdoc', 'manage_pdoc',
        'view_lab', 'edit_lab', 'manage_lab',
        'view_final', 'edit_final', 'manage_final',
        'view_bazaar', 'edit_bazaar', 'manage_bazaar',
        'manage_users', 'all'
      ],
      isActive: true,
      isAuthorized: true
    },
    'quality.manager@easternmills.com': {
      role: 'manager',
      Role: 'manager',
      department: 'quality',
      DepartmentId: 'quality',
      departments: ['quality'],
      roles: ['quality_manager'],
      tabs: ['dashboard', 'compliance', 'lab', 'final', 'bazaar'],
      permissions: [
        'view_dashboard', 'edit_dashboard', 'manage_dashboard',
        'view_compliance', 'edit_compliance', 'manage_compliance',
        'view_lab', 'edit_lab', 'manage_lab',
        'view_final', 'edit_final', 'manage_final',
        'view_bazaar', 'edit_bazaar', 'manage_bazaar'
      ],
      isActive: true,
      isAuthorized: true
    },
    'lab.easternmills@gmail.com': {
      role: 'supervisor',
      Role: 'supervisor',
      department: 'quality',
      DepartmentId: 'quality',
      departments: ['quality'],
      roles: ['quality_supervisor'],
      tabs: ['dashboard', 'lab', 'compliance'],
      permissions: [
        'view_dashboard', 'edit_dashboard',
        'view_lab', 'edit_lab',
        'view_compliance', 'edit_compliance'
      ],
      isActive: true,
      isAuthorized: true
    },
    'faizan.easternmills@gmail.com': {
      role: 'admin',
      Role: 'admin', 
      department: 'sampling',
      DepartmentId: 'sampling',
      departments: ['sampling', 'merchandising'],
      roles: ['sampling_manager'],
      tabs: ['create', 'gallery', 'buyers', 'pdoc', 'costing', 'quotes'],
      permissions: [
        'view_create', 'edit_create', 'manage_create',
        'view_gallery', 'edit_gallery', 'manage_gallery',
        'view_buyers', 'edit_buyers', 'manage_buyers',
        'view_pdoc', 'edit_pdoc', 'manage_pdoc',
        'view_costing', 'edit_costing',
        'view_quotes', 'edit_quotes'
      ],
      isActive: true,
      isAuthorized: true
    },
    'studio@easternmills.com': {
      role: 'user',
      Role: 'user',
      department: 'sampling',
      DepartmentId: 'sampling',
      departments: ['sampling'],
      roles: ['sampling_staff'],
      tabs: ['create', 'gallery'],
      permissions: [
        'view_create', 'edit_create',
        'view_gallery', 'edit_gallery'
      ],
      isActive: true,
      isAuthorized: true
    },
    'faizanansari05100@gmail.com': {
      role: 'user',
      Role: 'user',
      department: 'sampling',
      DepartmentId: 'sampling',
      departments: ['sampling'],
      roles: ['sampling_staff'],
      tabs: ['create', 'gallery'],
      permissions: [
        'view_create', 'edit_create',
        'view_gallery', 'edit_gallery'
      ],
      isActive: true,
      isAuthorized: true
    },
    'danishsampling.eastern@gmail.com': {
      role: 'user',
      Role: 'user',
      department: 'sampling',
      DepartmentId: 'sampling',
      departments: ['sampling'],
      roles: ['sampling_staff'],
      tabs: ['create', 'gallery', 'costing', 'quotes'],
      permissions: [
        'view_create', 'edit_create',
        'view_gallery', 'edit_gallery',
        'view_costing', 'edit_costing',
        'view_quotes', 'edit_quotes'
      ],
      isActive: true,
      isAuthorized: true
    }
  };

  async function fixUserPermissions() {
    console.log('🔧 Starting user permissions fix...');
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users to update`);
    
    const batch = db.batch();
    let updatedCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const email = data.email || data.Email;
      
      if (email && userConfigs[email]) {
        console.log(`\n📝 Updating user: ${email}`);
        const config = userConfigs[email];
        
        // Merge existing data with new config
        const updateData = {
          ...data,
          ...config,
          email: email,
          Email: email,
          uid: data.uid || doc.id,
          updatedAt: new Date().toISOString()
        };
        
        console.log(`  Setting role: ${config.role}`);
        console.log(`  Setting departments: ${config.departments.join(', ')}`);
        console.log(`  Setting tabs: ${config.tabs.join(', ')}`);
        console.log(`  Setting ${config.permissions.length} permissions`);
        
        batch.update(doc.ref, updateData);
        updatedCount++;
      } else if (email) {
        console.log(`\n⚠️  Skipping user with no config: ${email}`);
      }
    }
    
    if (updatedCount > 0) {
      console.log(`\n💾 Committing ${updatedCount} user updates...`);
      await batch.commit();
      console.log('✅ User permissions fixed successfully!');
    } else {
      console.log('❌ No users to update');
    }
  }

  fixUserPermissions().then(() => {
    console.log('\n🎉 User permission fix complete!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fixing user permissions:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}