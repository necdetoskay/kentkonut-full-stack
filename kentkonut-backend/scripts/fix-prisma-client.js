#!/usr/bin/env node

/**
 * Fix Prisma client generation issues on Windows
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function fixPrismaClient() {
  console.log('🔧 Fixing Prisma Client Generation Issues...\n');

  try {
    // Step 1: Check if .prisma directory exists
    const prismaDir = path.join(__dirname, '..', 'node_modules', '.prisma');
    console.log('1️⃣ Checking .prisma directory...');
    console.log('   Path:', prismaDir);
    console.log('   Exists:', fs.existsSync(prismaDir));

    // Step 2: Try to remove .prisma directory if it exists
    if (fs.existsSync(prismaDir)) {
      console.log('\n2️⃣ Removing existing .prisma directory...');
      try {
        fs.rmSync(prismaDir, { recursive: true, force: true });
        console.log('   ✅ Removed successfully');
      } catch (error) {
        console.log('   ⚠️ Could not remove:', error.message);
      }
    }

    // Step 3: Try to generate Prisma client with different methods
    console.log('\n3️⃣ Attempting Prisma client generation...');
    
    const methods = [
      'npx prisma generate',
      'npm run postinstall',
      'npx prisma generate --schema=./prisma/schema.prisma'
    ];

    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      console.log(`\n   Method ${i + 1}: ${method}`);
      
      try {
        execSync(method, { 
          cwd: path.join(__dirname, '..'),
          stdio: 'pipe',
          timeout: 60000
        });
        console.log('   ✅ Success!');
        break;
      } catch (error) {
        console.log('   ❌ Failed:', error.message.split('\n')[0]);
        if (i === methods.length - 1) {
          console.log('\n⚠️ All generation methods failed. Trying manual approach...');
        }
      }
    }

    // Step 4: Check if client was generated
    console.log('\n4️⃣ Checking if client was generated...');
    const clientPath = path.join(prismaDir, 'client');
    const indexPath = path.join(clientPath, 'index.js');
    
    console.log('   Client path:', clientPath);
    console.log('   Client exists:', fs.existsSync(clientPath));
    console.log('   Index.js exists:', fs.existsSync(indexPath));

    if (fs.existsSync(indexPath)) {
      console.log('\n✅ Prisma client generated successfully!');
      
      // Step 5: Test the client
      console.log('\n5️⃣ Testing Prisma client...');
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        console.log('   ✅ PrismaClient imported successfully');
        console.log('   ✅ PrismaClient instantiated successfully');
        console.log('   corporateCard model exists:', !!prisma.corporateCard);
        
        if (prisma.corporateCard) {
          console.log('   ✅ corporateCard model is available');
          console.log('   findMany method exists:', typeof prisma.corporateCard.findMany);
        }
        
        await prisma.$disconnect();
        console.log('   ✅ Database connection test successful');
        
      } catch (error) {
        console.log('   ❌ Client test failed:', error.message);
      }
      
    } else {
      console.log('\n❌ Prisma client generation failed completely');
      console.log('\n🔧 Manual fix required:');
      console.log('   1. Close VS Code and all terminals');
      console.log('   2. Run Command Prompt as Administrator');
      console.log('   3. Navigate to project directory');
      console.log('   4. Run: npx prisma generate');
      console.log('   5. Restart development server');
    }

  } catch (error) {
    console.error('\n❌ Fix script failed:', error.message);
  }
}

// Run the fix
fixPrismaClient();
