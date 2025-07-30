import { exec } from 'child_process';

// Run drizzle-kit push with auto-accept for new table creation
const child = exec('npx drizzle-kit push');

// Handle the interactive prompt
child.stdin?.write('1\n'); // Select "create table" for department_tabs
setTimeout(() => {
  child.stdin?.write('1\n'); // Select "create table" for departments
}, 1000);
setTimeout(() => {
  child.stdin?.write('1\n'); // Select "create table" for users
}, 2000);
setTimeout(() => {
  child.stdin?.write('1\n'); // Select "create table" for user_tab_permissions
}, 3000);

child.stdout?.on('data', (data) => {
  console.log(data.toString());
});

child.stderr?.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
  process.exit(code || 0);
});