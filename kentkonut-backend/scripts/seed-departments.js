/**
 * Department Seeding Script Runner
 * 
 * This script runs the TypeScript seeding file using tsx
 * Run: node scripts/seed-departments.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🌱 Running Department Seeding Script...\n');

// Run the TypeScript seeding file
const seedProcess = spawn('npx', ['tsx', 'prisma/seed-departments.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

seedProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Seeding process completed successfully!');
  } else {
    console.log(`\n❌ Seeding process failed with exit code ${code}`);
    process.exit(code);
  }
});

seedProcess.on('error', (error) => {
  console.error('❌ Failed to start seeding process:', error);
  process.exit(1);
});
