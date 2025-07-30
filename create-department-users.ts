import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

// Firebase configuration (same as in client)
const firebaseConfig = {
  apiKey: "AIzaSyC8-HNYOXhBUYzWGZuK5M52Efu8T_oQ5qw",
  authDomain: "rugcraftpro.firebaseapp.com",
  projectId: "rugcraftpro",
  storageBucket: "rugcraftpro.firebasestorage.app",
  messagingSenderId: "242624137690",
  appId: "1:242624137690:web:60d60c8e47f8b3bcff32b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample users for different departments
const departmentUsers = [
  // Sampling Department
  {
    id: 'sampling_manager_001',
    username: 'Sampling Manager',
    email: 'sampling.manager@easternmills.com',
    role: 'Manager',
    departmentId: 'sampling',
    departments: ['Sampling'],
    tier: 'Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sampling_supervisor_001',
    username: 'Sampling Supervisor',
    email: 'sampling.supervisor@easternmills.com',
    role: 'Supervisor',
    departmentId: 'sampling',
    departments: ['Sampling'],
    tier: 'Supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sampling_staff_001',
    username: 'Sampling Staff 1',
    email: 'sampling.staff1@easternmills.com',
    role: 'Staff',
    departmentId: 'sampling',
    departments: ['Sampling'],
    tier: 'Staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sampling_staff_002',
    username: 'Sampling Staff 2',
    email: 'sampling.staff2@easternmills.com',
    role: 'Staff',
    departmentId: 'sampling',
    departments: ['Sampling'],
    tier: 'Staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Designing Department
  {
    id: 'designing_manager_001',
    username: 'Design Manager',
    email: 'design.manager@easternmills.com',
    role: 'Manager',
    departmentId: 'designing',
    departments: ['Designing'],
    tier: 'Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'designing_supervisor_001',
    username: 'Design Supervisor',
    email: 'design.supervisor@easternmills.com',
    role: 'Supervisor',
    departmentId: 'designing',
    departments: ['Designing'],
    tier: 'Supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'designing_staff_001',
    username: 'CAD Designer 1',
    email: 'cad.designer1@easternmills.com',
    role: 'Staff',
    departmentId: 'designing',
    departments: ['Designing'],
    tier: 'Staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'designing_staff_002',
    username: 'Pattern Designer',
    email: 'pattern.designer@easternmills.com',
    role: 'Staff',
    departmentId: 'designing',
    departments: ['Designing'],
    tier: 'Staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Production Department
  {
    id: 'production_manager_001',
    username: 'Production Manager',
    email: 'production.manager@easternmills.com',
    role: 'Manager',
    departmentId: 'production',
    departments: ['Production'],
    tier: 'Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'production_supervisor_001',
    username: 'Production Supervisor',
    email: 'production.supervisor@easternmills.com',
    role: 'Supervisor',
    departmentId: 'production',
    departments: ['Production'],
    tier: 'Supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Quality Department (additional users)
  {
    id: 'quality_manager_001',
    username: 'Quality Manager',
    email: 'quality.manager@easternmills.com',
    role: 'Manager',
    departmentId: 'quality',
    departments: ['Quality'],
    tier: 'Manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'quality_supervisor_001',
    username: 'Quality Supervisor',
    email: 'quality.supervisor@easternmills.com',
    role: 'Supervisor',
    departmentId: 'quality',
    departments: ['Quality'],
    tier: 'Supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function createDepartmentUsers() {
  console.log('Creating department users in Firebase...');
  
  try {
    for (const user of departmentUsers) {
      // Use setDoc with custom ID to avoid duplicates
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`✓ Created user: ${user.username} (${user.email}) - ${user.departmentId}`);
    }
    
    console.log(`\n✅ Successfully created ${departmentUsers.length} department users!`);
    console.log('\nUsers by Department:');
    
    // Group users by department for summary
    const groupedUsers = departmentUsers.reduce((acc, user) => {
      if (!acc[user.departmentId]) acc[user.departmentId] = [];
      acc[user.departmentId].push(`${user.username} (${user.tier})`);
      return acc;
    }, {} as Record<string, string[]>);
    
    Object.entries(groupedUsers).forEach(([dept, users]) => {
      console.log(`\n${dept.toUpperCase()}:`);
      users.forEach(user => console.log(`  - ${user}`));
    });
    
  } catch (error) {
    console.error('Error creating users:', error);
  }
}

// Run the script
createDepartmentUsers().then(() => {
  console.log('\nScript completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});